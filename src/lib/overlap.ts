import { SlotWithVotes } from "./types";

type Interval = [number, number];

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

function mergeIntervals(intervals: Interval[]): Interval[] {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const merged: Interval[] = [];
  for (const [start, end] of sorted) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) {
      last[1] = Math.max(last[1], end);
    } else {
      merged.push([start, end]);
    }
  }
  return merged;
}

function intersectIntervalSets(a: Interval[], b: Interval[]): Interval[] {
  const result: Interval[] = [];
  for (const [aStart, aEnd] of a) {
    for (const [bStart, bEnd] of b) {
      const start = Math.max(aStart, bStart);
      const end = Math.min(aEnd, bEnd);
      if (start < end) result.push([start, end]);
    }
  }
  return result;
}

export interface SuggestedWindow {
  date: string;
  start_time: string;
  end_time: string;
  participantCount: number;
}

export function computeSuggestedWindows(
  slots: SlotWithVotes[],
  durationMinutes: number
): SuggestedWindow[] {
  const byDate = new Map<string, Map<string, Interval[]>>();

  for (const slot of slots) {
    if (slot.source !== "user_added" || !slot.added_by_name) continue;
    const dateMap = byDate.get(slot.date) ?? new Map<string, Interval[]>();
    const existing = dateMap.get(slot.added_by_name) ?? [];
    existing.push([timeToMinutes(slot.start_time), timeToMinutes(slot.end_time)]);
    dateMap.set(slot.added_by_name, existing);
    byDate.set(slot.date, dateMap);
  }

  const results: SuggestedWindow[] = [];

  for (const [date, voterMap] of Array.from(byDate.entries())) {
    const voters = Array.from(voterMap.keys());
    if (voters.length < 2) continue;

    let common = mergeIntervals(voterMap.get(voters[0])!);
    for (let i = 1; i < voters.length && common.length > 0; i++) {
      common = intersectIntervalSets(common, mergeIntervals(voterMap.get(voters[i])!));
    }

    for (const [start, end] of common) {
      if (end - start >= durationMinutes) {
        results.push({
          date,
          start_time: minutesToTime(start),
          end_time: minutesToTime(end),
          participantCount: voters.length,
        });
      }
    }
  }

  return results.sort((a, b) => a.date.localeCompare(b.date));
}
