"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EventRow, SlotWithVotes } from "@/lib/types";
import { addSlot, upsertVote } from "@/lib/actions";
import { useVoterName } from "@/hooks/useVoterName";
import {
  addMinutesToTime,
  formatDateLong,
  formatTime,
  formatTimeRange,
} from "@/lib/format";

interface DayModalProps {
  event: EventRow;
  date: string;
  slots: SlotWithVotes[];
  onClose: () => void;
}

export function DayModal({ event, date, slots, onClose }: DayModalProps) {
  const router = useRouter();
  const { voterName, setVoterName, loaded } = useVoterName(event.id);
  const [nameInput, setNameInput] = useState("");
  const [showAddForm, setShowAddForm] = useState(slots.length === 0);
  const [newStartTime, setNewStartTime] = useState("18:00");
  const [newEndTime, setNewEndTime] = useState("20:00");
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!loaded) return null;

  if (!voterName) {
    return (
      <Modal onClose={onClose} title={formatDateLong(date)}>
        <p className="mb-3 text-sm text-gray-500">
          What&rsquo;s your name? You&rsquo;ll only need to enter it once for this event.
        </p>
        <div className="flex gap-2">
          <input
            autoFocus
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Your name"
          />
          <button
            type="button"
            disabled={!nameInput.trim()}
            onClick={() => setVoterName(nameInput.trim())}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      </Modal>
    );
  }

  async function castVote(slotId: string, response: "yes" | "no", note: string) {
    setBusy(true);
    setErrorMessage(null);
    try {
      await upsertVote({
        eventId: event.id,
        slotId,
        voterName: voterName as string,
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

  async function submitNewSlot(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrorMessage(null);
    try {
      const endTime =
        event.type === "open" && event.duration_minutes
          ? addMinutesToTime(newStartTime, event.duration_minutes)
          : newEndTime;

      await addSlot({
        eventId: event.id,
        date,
        startTime: newStartTime,
        endTime,
        addedByName: voterName as string,
      });
      router.refresh();
      setShowAddForm(false);
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
            voterName={voterName as string}
            busy={busy}
            onVote={castVote}
          />
        ))}

        {showAddForm ? (
          <form
            onSubmit={submitNewSlot}
            className="space-y-3 rounded-md border border-dashed border-gray-300 p-3"
          >
            <p className="text-sm font-medium text-gray-700">
              {event.type === "open" ? "Add your availability" : "Suggest a time"}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <input
                type="time"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                className="rounded-md border border-gray-300 px-2 py-1"
              />
              {event.type === "preselected" && (
                <>
                  <span className="text-gray-400">to</span>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="rounded-md border border-gray-300 px-2 py-1"
                  />
                </>
              )}
              {event.type === "open" && event.duration_minutes && (
                <span className="text-gray-400">
                  ends {formatTime(addMinutesToTime(newStartTime, event.duration_minutes))}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={busy}
                className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
              >
                Save
              </button>
              {slots.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-sm text-gray-500 hover:underline"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="text-sm text-blue-600 hover:underline"
          >
            + Suggest another time for this day
          </button>
        )}

        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
      </div>
    </Modal>
  );
}

function SlotVoteRow({
  slot,
  voterName,
  busy,
  onVote,
}: {
  slot: SlotWithVotes;
  voterName: string;
  busy: boolean;
  onVote: (slotId: string, response: "yes" | "no", note: string) => void;
}) {
  const myVote = slot.votes.find((v) => v.voter_name === voterName);
  const [note, setNote] = useState(myVote?.note ?? "");
  const yesCount = slot.votes.filter((v) => v.response === "yes").length;
  const noCount = slot.votes.filter((v) => v.response === "no").length;

  return (
    <div className="rounded-md border border-gray-200 p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">
            {formatTimeRange(slot.start_time, slot.end_time)}
          </p>
          {slot.source === "user_added" && (
            <p className="text-xs text-purple-600">
              suggested by {slot.added_by_name}
            </p>
          )}
        </div>
        <p className="text-xs text-gray-400">
          {yesCount} yes · {noCount} no
        </p>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => onVote(slot.id, "yes", note)}
          className={`rounded-md px-3 py-1 text-sm ${
            myVote?.response === "yes"
              ? "bg-emerald-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          👍 Yes
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onVote(slot.id, "no", note)}
          className={`rounded-md px-3 py-1 text-sm ${
            myVote?.response === "no"
              ? "bg-red-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          👎 No
        </button>
      </div>

      {myVote && (
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => onVote(slot.id, myVote.response, note)}
          placeholder="Add a note (optional)"
          className="mt-2 w-full rounded-md border border-gray-200 px-2 py-1 text-xs"
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
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
