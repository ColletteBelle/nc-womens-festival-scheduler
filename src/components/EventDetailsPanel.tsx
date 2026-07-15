"use client";

import { SlotWithVotes } from "@/lib/types";

function collectParticipants(slots: SlotWithVotes[]) {
  const tally = new Map<string, { yes: number; no: number }>();
  for (const slot of slots) {
    for (const vote of slot.votes) {
      const existing = tally.get(vote.voter_name) ?? { yes: 0, no: 0 };
      if (vote.response === "yes") existing.yes += 1;
      else existing.no += 1;
      tally.set(vote.voter_name, existing);
    }
  }
  return Array.from(tally.entries())
    .map(([name, counts]) => ({ name, ...counts }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function EventDetailsPanel({
  description,
  slots,
}: {
  description: string | null;
  slots: SlotWithVotes[];
}) {
  const participants = collectParticipants(slots);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <h2 className="font-serif text-xl font-semibold text-gray-900">Event Details</h2>
      {description && <p className="mt-2 text-sm text-gray-600">{description}</p>}

      <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Participants
      </h3>
      {participants.length === 0 ? (
        <p className="mt-2 text-sm text-gray-400">No votes yet. Be the first!</p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
          {participants.map((person) => (
            <div
              key={person.name}
              className="flex shrink-0 items-center gap-2 whitespace-nowrap text-sm text-gray-700"
            >
              <span className="font-medium">{person.name}</span>
              <span className="flex items-center gap-1.5 text-xs">
                <span className="text-emerald-600">✓ {person.yes}</span>
                <span className="text-red-500">✗ {person.no}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
