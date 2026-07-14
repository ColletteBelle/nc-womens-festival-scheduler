"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EventRow, SlotWithVotes } from "@/lib/types";
import { confirmSlot, deleteSlot, unconfirmEvent } from "@/lib/actions";
import { formatDateShort, formatTimeRange } from "@/lib/format";

function yesCount(slot: SlotWithVotes) {
  return slot.votes.filter((v) => v.response === "yes").length;
}
function noCount(slot: SlotWithVotes) {
  return slot.votes.filter((v) => v.response === "no").length;
}

function sortByYesVotes(slots: SlotWithVotes[]) {
  return [...slots].sort((a, b) => yesCount(b) - yesCount(a));
}

export function ResultsPanel({
  event,
  slots,
}: {
  event: EventRow;
  slots: SlotWithVotes[];
}) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const confirmedSlot = slots.find((s) => s.id === event.confirmed_slot_id) ?? null;
  const preselectedSlots = sortByYesVotes(
    slots.filter((s) => s.source === "preselected")
  );
  const suggestedSlots = sortByYesVotes(
    slots.filter((s) => s.source === "user_added")
  );

  async function handleConfirm(slotId: string) {
    setBusy(true);
    try {
      await confirmSlot({ eventId: event.id, slotId });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleUnconfirm() {
    setBusy(true);
    try {
      await unconfirmEvent({ eventId: event.id });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(slotId: string) {
    setBusy(true);
    try {
      await deleteSlot({ eventId: event.id, slotId });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (event.status === "confirmed" && confirmedSlot) {
    return (
      <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
          Confirmed
        </p>
        <p className="mt-1 text-lg font-semibold text-emerald-900">
          {formatDateShort(confirmedSlot.date)}
        </p>
        <p className="text-sm text-emerald-800">
          {formatTimeRange(confirmedSlot.start_time, confirmedSlot.end_time)}
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={handleUnconfirm}
          className="mt-3 text-sm text-emerald-700 underline hover:text-emerald-900 disabled:opacity-50"
        >
          Unconfirm
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SlotSection
        title="Options"
        slots={preselectedSlots}
        expandedId={expandedId}
        setExpandedId={setExpandedId}
        busy={busy}
        onConfirm={handleConfirm}
        onDelete={handleDelete}
      />
      <SlotSection
        title="Suggested"
        slots={suggestedSlots}
        expandedId={expandedId}
        setExpandedId={setExpandedId}
        busy={busy}
        onConfirm={handleConfirm}
        onDelete={handleDelete}
      />
      {slots.length === 0 && (
        <p className="text-sm text-gray-400">
          No slots yet. Click a date on the calendar to add one.
        </p>
      )}
    </div>
  );
}

function SlotSection({
  title,
  slots,
  expandedId,
  setExpandedId,
  busy,
  onConfirm,
  onDelete,
}: {
  title: string;
  slots: SlotWithVotes[];
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  busy: boolean;
  onConfirm: (slotId: string) => void;
  onDelete: (slotId: string) => void;
}) {
  if (slots.length === 0) return null;

  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
        {title}
      </h3>
      <div className="space-y-2">
        {slots.map((slot) => {
          const isExpanded = expandedId === slot.id;
          return (
            <div
              key={slot.id}
              className="rounded-md border border-gray-200 p-3 text-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-gray-900">
                    {formatDateShort(slot.date)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatTimeRange(slot.start_time, slot.end_time)}
                  </p>
                  {slot.source === "user_added" && (
                    <p className="text-xs text-purple-600">
                      suggested by {slot.added_by_name}
                    </p>
                  )}
                </div>
                <p className="whitespace-nowrap text-xs text-gray-400">
                  {yesCount(slot)} yes · {noCount(slot)} no
                </p>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : slot.id)}
                  className="text-blue-600 hover:underline"
                >
                  {isExpanded ? "Hide voters" : "Show voters"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onConfirm(slot.id)}
                  className="text-emerald-700 hover:underline disabled:opacity-50"
                >
                  Confirm this slot
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onDelete(slot.id)}
                  className="text-red-500 hover:underline disabled:opacity-50"
                >
                  Delete
                </button>
              </div>

              {isExpanded && (
                <ul className="mt-2 space-y-1 border-t border-gray-100 pt-2">
                  {slot.votes.length === 0 && (
                    <li className="text-xs text-gray-400">No votes yet.</li>
                  )}
                  {slot.votes.map((vote) => (
                    <li key={vote.id} className="text-xs text-gray-600">
                      <span className={vote.response === "yes" ? "text-emerald-700" : "text-red-600"}>
                        {vote.response === "yes" ? "👍" : "👎"}
                      </span>{" "}
                      <span className="font-medium">{vote.voter_name}</span>
                      {vote.note && (
                        <span className="text-gray-400"> — {vote.note}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
