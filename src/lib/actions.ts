"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "./supabase";
import { EventType, VoteResponse } from "./types";

export interface NewPreselectedSlot {
  date: string;
  start_time: string;
  end_time: string;
}

export async function createEvent(input: {
  title: string;
  description: string;
  type: EventType;
  durationMinutes: number | null;
  preselectedSlots: NewPreselectedSlot[];
}) {
  const { data: event, error } = await supabase
    .from("events")
    .insert({
      title: input.title,
      description: input.description || null,
      type: input.type,
      duration_minutes: input.type === "open" ? input.durationMinutes : null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (input.type === "preselected" && input.preselectedSlots.length > 0) {
    const { error: slotsError } = await supabase.from("slots").insert(
      input.preselectedSlots.map((slot) => ({
        event_id: event.id,
        date: slot.date,
        start_time: slot.start_time,
        end_time: slot.end_time,
        source: "preselected" as const,
        added_by_name: null,
      }))
    );
    if (slotsError) throw new Error(slotsError.message);
  }

  revalidatePath("/");
  return { id: event.id as string };
}

export async function addSlot(input: {
  eventId: string;
  date: string;
  startTime: string;
  endTime: string;
  addedByName: string;
}) {
  const { data: slot, error } = await supabase
    .from("slots")
    .insert({
      event_id: input.eventId,
      date: input.date,
      start_time: input.startTime,
      end_time: input.endTime,
      source: "user_added" as const,
      added_by_name: input.addedByName,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  const { error: voteError } = await supabase.from("votes").insert({
    slot_id: slot.id,
    voter_name: input.addedByName,
    response: "yes" as const,
  });
  if (voteError) throw new Error(voteError.message);

  revalidatePath(`/events/${input.eventId}`);
}

export async function upsertVote(input: {
  eventId: string;
  slotId: string;
  voterName: string;
  response: VoteResponse;
  note: string;
}) {
  const { error } = await supabase.from("votes").upsert(
    {
      slot_id: input.slotId,
      voter_name: input.voterName,
      response: input.response,
      note: input.note || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "slot_id,voter_name" }
  );

  if (error) throw new Error(error.message);
  revalidatePath(`/events/${input.eventId}`);
}

export async function deleteSlot(input: { eventId: string; slotId: string }) {
  const { error } = await supabase
    .from("slots")
    .delete()
    .eq("id", input.slotId);

  if (error) throw new Error(error.message);
  revalidatePath(`/events/${input.eventId}`);
}

export async function confirmSlot(input: { eventId: string; slotId: string }) {
  const { error } = await supabase
    .from("events")
    .update({ status: "confirmed", confirmed_slot_id: input.slotId })
    .eq("id", input.eventId);

  if (error) throw new Error(error.message);
  revalidatePath(`/events/${input.eventId}`);
  revalidatePath("/");
}

export async function unconfirmEvent(input: { eventId: string }) {
  const { error } = await supabase
    .from("events")
    .update({ status: "open", confirmed_slot_id: null })
    .eq("id", input.eventId);

  if (error) throw new Error(error.message);
  revalidatePath(`/events/${input.eventId}`);
  revalidatePath("/");
}
