"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EventRow, SlotWithVotes } from "@/lib/types";
import { addSlot, upsertVote } from "@/lib/actions";
import { TimeSelect } from "./TimeSelect";
import { Button } from "./Button";
import { DurationPicker } from "./DurationPicker";
import { addMinutesToTime, formatDateLong, formatTime, formatTimeRange } from "@/lib/format";

interface PendingTime {
  id: string;
  start_time: string;
  end_time: string;
  durationMinutes: number;
}

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function defaultPendingTime(): PendingTime {
  return { id: newId(), start_time: "18:00", end_time: "20:00", durationMinutes: 240 };
}

interface DayModalProps {
  event: EventRow;
  date: string;
  slots: SlotWithVotes[];
  voterName: string;
  onClose: () => void;
}

export function DayModal({ event, date, slots, voterName, onClose }: DayModalProps) {
  const router = useRouter();
  const votingClosed = event.voting_closed;
  const [showAddForm, setShowAddForm] = useState(slots.length === 0 && !event.voting_closed);
  const [pendingTimes, setPendingTimes] = useState<PendingTime[]>(() => [
    defaultPendingTime(),
  ]);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function castVote(slotId: string, response: "yes" | "no", note: string) {
    setBusy(true);
    setErrorMessage(null);
    try {
      await upsertVote({
        eventId: event.id,
        slotId,
        voterName,
        response,
        note,
      });
      router.refresh();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function addPendingTime() {
    setPendingTimes((prev) => [...prev, defaultPendingTime()]);
  }

  function updatePendingTime(
    id: string,
    field: "start_time" | "end_time" | "durationMinutes",
    value: string | number
  ) {
    setPendingTimes((prev) =>
      prev.map((time) => (time.id === id ? { ...time, [field]: value } : time))
    );
  }

  function removePendingTime(id: string) {
    setPendingTimes((prev) => prev.filter((time) => time.id !== id));
  }

  async function submitPendingTimes(e: React.FormEvent) {
    e.preventDefault();
    if (pendingTimes.length === 0) return;
    setBusy(true);
    setErrorMessage(null);
    try {
      for (const time of pendingTimes) {
        const endTime =
          event.type === "open"
            ? addMinutesToTime(time.start_time, time.durationMinutes)
            : time.end_time;

        await addSlot({
          eventId: event.id,
          date,
          startTime: time.start_time,
          endTime,
          addedByName: voterName,
        });
      }
      router.refresh();
      setShowAddForm(false);
      setPendingTimes([defaultPendingTime()]);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal onClose={onClose} title={formatDateLong(date)}>
      <div className="space-y-4">
        {slots.map((slot) => (
          <SlotVoteRow
            key={slot.id}
            slot={slot}
            eventType={event.type}
            voterName={voterName}
            busy={busy}
            votingClosed={votingClosed}
            onVote={castVote}
          />
        ))}

        {votingClosed ? (
          <p className="rounded-xl border border-dashed border-gray-200 p-3.5 text-sm text-gray-400">
            Voting is closed for this event.
          </p>
        ) : showAddForm ? (
          <form
            onSubmit={submitPendingTimes}
            className="space-y-3 rounded-xl border border-dashed border-gray-300 p-3.5"
          >
            <p className="text-sm font-medium text-gray-700">
              {event.type === "open" ? "Add your availability" : "Suggest a time"}
            </p>

            <div className="space-y-2">
              {pendingTimes.map((time) =>
                event.type === "open" ? (
                  <div key={time.id} className="space-y-2 rounded-lg bg-gray-50 p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <TimeSelect
                        value={time.start_time}
                        onChange={(value) => updatePendingTime(time.id, "start_time", value)}
                      />
                      {pendingTimes.length > 1 && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => removePendingTime(time.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <DurationPicker
                      minutes={time.durationMinutes}
                      onChange={(value) => updatePendingTime(time.id, "durationMinutes", value)}
                    />
                    <p className="text-xs text-gray-400">
                      Ends at{" "}
                      {formatTime(addMinutesToTime(time.start_time, time.durationMinutes))}
                    </p>
                  </div>
                ) : (
                  <div key={time.id} className="flex items-center gap-2 text-sm">
                    <TimeSelect
                      value={time.start_time}
                      onChange={(value) => updatePendingTime(time.id, "start_time", value)}
                    />
                    <span className="text-gray-400">to</span>
                    <TimeSelect
                      value={time.end_time}
                      onChange={(value) => updatePendingTime(time.id, "end_time", value)}
                    />
                    {pendingTimes.length > 1 && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removePendingTime(time.id)}
                        className="ml-auto"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                )
              )}
            </div>

            <Button variant="info" size="sm" onClick={addPendingTime}>
              + Add another time
            </Button>

            <div className="flex gap-2 pt-1">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={busy || pendingTimes.length === 0}
              >
                Save
              </Button>
              {slots.length > 0 && (
                <Button variant="neutral" size="sm" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        ) : (
          <Button variant="info" size="sm" onClick={() => setShowAddForm(true)}>
            + Suggest another time for this day
          </Button>
        )}

        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
      </div>
    </Modal>
  );
}

function SlotVoteRow({
  slot,
  eventType,
  voterName,
  busy,
  votingClosed,
  onVote,
}: {
  slot: SlotWithVotes;
  eventType: EventRow["type"];
  voterName: string;
  busy: boolean;
  votingClosed: boolean;
  onVote: (slotId: string, response: "yes" | "no", note: string) => void;
}) {
  const myVote = slot.votes.find((v) => v.voter_name === voterName);
  const [note, setNote] = useState(myVote?.note ?? "");
  const yesCount = slot.votes.filter((v) => v.response === "yes").length;
  const noCount = slot.votes.filter((v) => v.response === "no").length;
  const showVoteButtons = eventType !== "open" && !votingClosed;

  return (
    <div className="rounded-xl border border-gray-200 p-3.5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">
            {formatTimeRange(slot.start_time, slot.end_time)}
          </p>
          {slot.source === "user_added" && (
            <p className="text-xs text-fuchsia-600">
              suggested by {slot.added_by_name}
            </p>
          )}
        </div>
        {!showVoteButtons && (
          <span className="flex shrink-0 items-center gap-2 text-xs">
            <span className="text-emerald-600">✓ {yesCount}</span>
            <span className="text-red-500">✗ {noCount}</span>
          </span>
        )}
      </div>

      {showVoteButtons && (
        <div className="mt-2.5 flex items-center gap-2">
          <Button
            variant="success"
            size="vote"
            disabled={busy}
            onClick={() => onVote(slot.id, "yes", note)}
            title="Mark yourself as available for this time"
            aria-label="I'm available"
            className={myVote?.response === "yes" ? "bg-emerald-600 text-white hover:bg-emerald-600" : ""}
          >
            ✓ {yesCount}
          </Button>
          <Button
            variant="danger"
            size="vote"
            disabled={busy}
            onClick={() => onVote(slot.id, "no", note)}
            title="Mark yourself as not available for this time"
            aria-label="I'm not available"
            className={myVote?.response === "no" ? "bg-red-600 text-white hover:bg-red-600" : ""}
          >
            ✗ {noCount}
          </Button>
        </div>
      )}

      {myVote && !votingClosed && (
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => onVote(slot.id, myVote.response, note)}
          placeholder="Add a note (optional)"
          className="mt-2.5 w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
        />
      )}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
