export type EventType = "preselected" | "open";
export type EventStatus = "open" | "confirmed";
export type SlotSource = "preselected" | "user_added";
export type VoteResponse = "yes" | "no";

export interface EventRow {
  id: string;
  title: string;
  description: string | null;
  type: EventType;
  duration_minutes: number | null;
  status: EventStatus;
  confirmed_slot_id: string | null;
  created_at: string;
}

export interface SlotRow {
  id: string;
  event_id: string;
  date: string;
  start_time: string;
  end_time: string;
  source: SlotSource;
  added_by_name: string | null;
  created_at: string;
}

export interface VoteRow {
  id: string;
  slot_id: string;
  voter_name: string;
  response: VoteResponse;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface SlotWithVotes extends SlotRow {
  votes: VoteRow[];
}

export interface EventWithSlots extends EventRow {
  slots: SlotWithVotes[];
}
