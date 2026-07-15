import { supabase } from "./supabase";
import { EventRow, EventWithSlots, SlotRow, VoteRow } from "./types";

export interface EventWithConfirmedSlot extends EventRow {
  confirmed_slot: SlotRow | null;
}

function diagScan(label: string, val: string | undefined): string {
  if (!val) return `${label}=undefined/empty`;
  const bad: string[] = [];
  for (let i = 0; i < val.length; i++) {
    const code = val.charCodeAt(i);
    if (code > 255) bad.push(`idx${i}=${code}`);
  }
  return `${label}(len=${val.length},bad=[${bad.join(",")}])`;
}

export async function getEvents(): Promise<EventWithConfirmedSlot[]> {
  const diag =
    diagScan("URL", process.env.NEXT_PUBLIC_SUPABASE_URL) +
    " " +
    diagScan("KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  throw new Error(`[DIAG-ENV] ${diag}`);
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
