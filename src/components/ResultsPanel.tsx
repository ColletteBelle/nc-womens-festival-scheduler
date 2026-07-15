"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EventRow, SlotWithVotes } from "@/lib/types";
import { confirmSlot, deleteSlot, unconfirmEvent, upsertVote } from "@/lib/actions";
import {
  formatDateShort,
  formatDuration,
  formatTimeRange,
  formatWeekday,
  formatMonthDay,
} from "@/lib/format";
import { computeSuggestedWindows } from "@/lib/overlap";
import { Button } from "./Button";
import { ConfirmDialog } from "./ConfirmDialog";

function yesCount(slot: SlotWithVotes) {
  return slot.votes.filter((v) => v.response === "yes").length;
}
function noCount(slot: SlotWithVotes) {
  return slot.votes.filter((v) => v.response === "no").length;
}

function sortByYesVotes(slots: SlotWithVotes[]) {
  return [...slots].sort((a, b) => yesCount(b) - yesCount(a));
}

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

interface PendingAction {
  slotId: string;
  kind: "confirm" | "delete";
  label: string;
}

export function ResultsPanel({
  event,
  slots,
  voterName,
}: {
  event: EventRow;
  slots: SlotWithVotes[];
  voterName: string;
}) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const confirmedSlot = slots.find((s) => s.id === event.confirmed_slot_id) ?? null;
  const preselectedSlots = sortByYesVotes(
    slots.filter((s) => s.source === "preselected")
  );
  const suggestedSlots = sortByYesVotes(
    slots.filter((s) => s.source === "user_added")
  );
  const participants = collectParticipants(slots);
  const distinctAvailabilityVoters = new Set(
    slots.filter((s) => s.source === "user_added" && s.added_by_name).map((s) => s.added_by_name)
  );
  const suggestedWindows =
    event.type === "open" && distinctAvailabilityVoters.size >= 2 && event.duration_minutes
      ? computeSuggestedWindows(slots, event.duration_minutes)
      : [];

  async function handleUnconfirm() {
    setBusy(true);
    try {
      await unconfirmEvent({ eventId: event.id });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function runPendingAction() {
    if (!pendingAction) return;
    setBusy(true);
    try {
      if (pendingAction.kind === "confirm") {
        await confirmSlot({ eventId: event.id, slotId: pendingAction.slotId });
      } else {
        await deleteSlot({ eventId: event.id, slotId: pendingAction.slotId });
      }
      router.refresh();
    } finally {
      setBusy(false);
      setPendingAction(null);
    }
  }

  if (event.status === "confirmed" && confirmedSlot) {
    return (
      <div className="relative rounded-2xl border border-emerald-200 bg-emerald-50 p-5 pr-10 shadow-sm">
        <OverflowMenu
          items={[{ label: "Unconfirm", onClick: handleUnconfirm }]}
          className="right-3 top-3"
        />
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
          Confirmed
        </p>
        <p className="mt-1.5 font-serif text-xl font-semibold text-emerald-900">
          {formatDateShort(confirmedSlot.date)}
        </p>
        <p className="text-sm text-emerald-800">
          {formatTimeRange(confirmedSlot.start_time, confirmedSlot.end_time)}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {event.type === "open" && distinctAvailabilityVoters.size >= 2 && (
        <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4 shadow-sm">
          <h2 className="font-serif text-xl font-semibold text-gray-900">Suggested Times</h2>
          <p className="mt-1 text-xs text-gray-500">
            Times where at least two people&rsquo;s availability overlaps for the full{" "}
            {event.duration_minutes ? formatDuration(event.duration_minutes) : ""} meeting.
          </p>
          {suggestedWindows.length === 0 ? (
            <p className="mt-3 text-sm text-gray-400">
              No overlapping windows long enough yet — check back as more people add their
              availability.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {suggestedWindows.map((window, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-violet-200 bg-white p-2.5 text-sm"
                >
                  <p className="font-bold text-gray-900">
                    {formatWeekday(window.date)} {formatMonthDay(window.date)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatTimeRange(window.start_time, window.end_time)} ·{" "}
                    {window.participantCount} people free
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="font-serif text-xl font-semibold text-gray-900">Summary</h2>
        <p className="mt-1 text-sm text-gray-500">
          {participants.length} people voted · {slots.length} option
          {slots.length === 1 ? "" : "s"}
        </p>
        <p className="mt-2 text-xs text-gray-400">
          These are the proposed dates. Use ✓ / ✗ to mark whether you&rsquo;re
          available, or suggest a new time on the calendar.
        </p>

        {slots.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-400">
            No slots yet. Click a date on the calendar to add one.
          </p>
        ) : (
          <div className="mt-3 space-y-4">
            <SlotSection
              title="Options"
              slots={preselectedSlots}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
              onRequestConfirm={(slotId, label) =>
                setPendingAction({ slotId, kind: "confirm", label })
              }
              onRequestDelete={(slotId, label) =>
                setPendingAction({ slotId, kind: "delete", label })
              }
              eventId={event.id}
              voterName={voterName}
            />
            <SlotSection
              title="Suggested"
              slots={suggestedSlots}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
              onRequestConfirm={(slotId, label) =>
                setPendingAction({ slotId, kind: "confirm", label })
              }
              onRequestDelete={(slotId, label) =>
                setPendingAction({ slotId, kind: "delete", label })
              }
              eventId={event.id}
              voterName={voterName}
            />
          </div>
        )}
      </div>

      {pendingAction && (
        <ConfirmDialog
          title={pendingAction.kind === "confirm" ? "Confirm this date?" : "Delete this time?"}
          message={
            pendingAction.kind === "confirm"
              ? `This will lock in ${pendingAction.label} as the final date and close voting.`
              : `${pendingAction.label} will be permanently removed, along with its votes.`
          }
          confirmLabel={pendingAction.kind === "confirm" ? "Confirm date" : "Delete"}
          confirmVariant={pendingAction.kind === "confirm" ? "success" : "danger"}
          busy={busy}
          onConfirm={runPendingAction}
          onCancel={() => setPendingAction(null)}
        />
      )}
    </div>
  );
}

function SlotSection({
  title,
  slots,
  expandedId,
  setExpandedId,
  onRequestConfirm,
  onRequestDelete,
  eventId,
  voterName,
}: {
  title: string;
  slots: SlotWithVotes[];
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  onRequestConfirm: (slotId: string, label: string) => void;
  onRequestDelete: (slotId: string, label: string) => void;
  eventId: string;
  voterName: string;
}) {
  if (slots.length === 0) return null;

  return (
    <div>
      <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
        {title}
      </h3>
      <div className="space-y-1.5">
        {slots.map((slot) => {
          const isExpanded = expandedId === slot.id;
          const label = `${formatDateShort(slot.date)} · ${formatTimeRange(slot.start_time, slot.end_time)}`;

          return (
            <div key={slot.id} className="relative rounded-lg border border-gray-200 p-2.5 pr-7 text-sm">
              <OverflowMenu
                items={[
                  { label: "Confirm this Date", onClick: () => onRequestConfirm(slot.id, label) },
                  { label: "Delete", onClick: () => onRequestDelete(slot.id, label), tone: "danger" },
                ]}
              />
              <div className="flex items-center justify-between gap-2">
                <div className="leading-tight">
                  <p className="font-bold text-gray-900">
                    {formatWeekday(slot.date)} {formatMonthDay(slot.date)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatTimeRange(slot.start_time, slot.end_time)}
                  </p>
                  {slot.source === "user_added" && (
                    <p className="text-xs text-fuchsia-600">
                      suggested by {slot.added_by_name}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button
                    variant="info"
                    size="icon"
                    onClick={() => setExpandedId(isExpanded ? null : slot.id)}
                    title={isExpanded ? "Hide voters" : "Show voters"}
                    aria-label={isExpanded ? "Hide voters" : "Show voters"}
                  >
                    👤
                  </Button>
                  <VoteButtons eventId={eventId} slot={slot} voterName={voterName} />
                </div>
              </div>

              {isExpanded && (
                <ul className="mt-2 space-y-1 border-t border-gray-100 pt-2">
                  {slot.votes.length === 0 && (
                    <li className="text-xs text-gray-400">No votes yet.</li>
                  )}
                  {slot.votes.map((vote) => (
                    <li key={vote.id} className="text-xs text-gray-600">
                      <span className={vote.response === "yes" ? "text-emerald-700" : "text-red-600"}>
                        {vote.response === "yes" ? "✓" : "✗"}
                      </span>{" "}
                      <span className="font-medium">{vote.voter_name}</span>
                      {vote.note && <span className="text-gray-400"> — {vote.note}</span>}
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

function VoteButtons({
  eventId,
  slot,
  voterName,
}: {
  eventId: string;
  slot: SlotWithVotes;
  voterName: string;
}) {
  const router = useRouter();
  const myVote = slot.votes.find((v) => v.voter_name === voterName);
  const [busy, setBusy] = useState(false);

  async function vote(response: "yes" | "no") {
    setBusy(true);
    try {
      await upsertVote({
        eventId,
        slotId: slot.id,
        voterName,
        response,
        note: myVote?.note ?? "",
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        variant="success"
        size="vote"
        disabled={busy}
        onClick={() => vote("yes")}
        title="Mark yourself as available for this time"
        aria-label="I'm available"
        className={myVote?.response === "yes" ? "bg-emerald-600 text-white hover:bg-emerald-600" : ""}
      >
        ✓ {yesCount(slot)}
      </Button>
      <Button
        variant="danger"
        size="vote"
        disabled={busy}
        onClick={() => vote("no")}
        title="Mark yourself as not available for this time"
        aria-label="I'm not available"
        className={myVote?.response === "no" ? "bg-red-600 text-white hover:bg-red-600" : ""}
      >
        ✗ {noCount(slot)}
      </Button>
    </>
  );
}

interface OverflowMenuItem {
  label: string;
  onClick: () => void;
  tone?: "default" | "danger";
}

function OverflowMenu({
  items,
  className = "right-1 top-1",
}: {
  items: OverflowMenuItem[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`absolute ${className}`}>
      <Button
        variant="bare"
        size="icon"
        onClick={() => setOpen((o) => !o)}
        title="More options"
        aria-label="More options"
      >
        ⋯
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-xl border border-gray-100 bg-white p-1 shadow-lg">
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                  item.tone === "danger" ? "text-red-600 hover:bg-red-50" : "text-gray-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
