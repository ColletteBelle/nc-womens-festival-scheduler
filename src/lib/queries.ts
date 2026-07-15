import { supabase } from "./supabase";
import { EventRow, EventWithSlots, SlotRow, VoteRow } from "./types";

export interface EventWithConfirmedSlot extends EventRow {
  confirmed_slot: SlotRow | null;
}

export async function getEvents(): Promise<EventWithConfirmedSlot[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("archived", false)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  const events = data as EventRow[];
  console.log(
    "[DIAG] supabase host:",
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "event count:",
    events.length,
    "events:",
    JSON.stringify(
      events.map((e) => ({ id: e.id, title: e.title, description: e.description }))
    )
  );

  const confirmedSlotIds = events
    .map((e) => e.confirmed_slot_id)
    .filter((id): id is string => id !== null);

  let confirmedSlots: SlotRow[] = [];
  if (confirmedSlotIds.length > 0) {
    const { data: slotRows, error: slotsError } = await supabase
      .from("slots")
      .select("*")
      .in("id", confirmedSlotIds);
    if (slotsError) throw new Error(slotsError.message);
    confirmedSlots = slotRows as SlotRow[];
  }

  return events.map((event) => ({
    ...event,
    confirmed_slot:
      confirmedSlots.find((s) => s.id === event.confirmed_slot_id) ?? null,
  }));
}

export async function getEventWithSlots(
  eventId: string
): Promise<EventWithSlots | null> {
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .maybeSingle();

  if (eventError) throw new Error(eventError.message);
  if (!event) return null;

  const { data: slots, error: slotsError } = await supabase
    .from("slots")
    .select("*")
    .eq("event_id", eventId)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (slotsError) throw new Error(slotsError.message);

  const slotIds = (slots as SlotRow[]).map((s) => s.id);
  let votes: VoteRow[] = [];
  if (slotIds.length > 0) {
    const { data: voteRows, error: votesError } = await supabase
      .from("votes")
      .select("*")
      .in("slot_id", slotIds);

    if (votesError) throw new Error(votesError.message);
    votes = voteRows as VoteRow[];
  }

  const slotsWithVotes = (slots as SlotRow[]).map((slot) => ({
    ...slot,
    votes: votes.filter((v) => v.slot_id === slot.id),
  }));

  return {
    ...(event as EventRow),
    slots: slotsWithVotes,
  };
}
