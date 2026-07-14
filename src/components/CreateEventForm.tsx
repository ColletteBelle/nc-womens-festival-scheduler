"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEvent, NewPreselectedSlot } from "@/lib/actions";
import { MonthCalendar } from "./MonthCalendar";
import { formatDateShort } from "@/lib/format";

export function CreateEventForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"preselected" | "open">("preselected");
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [pickedSlots, setPickedSlots] = useState<NewPreselectedSlot[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function addPickedDate(date: string) {
    if (pickedSlots.some((slot) => slot.date === date)) return;
    setPickedSlots((prev) =>
      [...prev, { date, start_time: "18:00", end_time: "20:00" }].sort((a, b) =>
        a.date.localeCompare(b.date)
      )
    );
  }

  function updatePickedSlot(
    date: string,
    field: "start_time" | "end_time",
    value: string
  ) {
    setPickedSlots((prev) =>
      prev.map((slot) => (slot.date === date ? { ...slot, [field]: value } : slot))
    );
  }

  function removePickedSlot(date: string) {
    setPickedSlots((prev) => prev.filter((slot) => slot.date !== date));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage("Title is required.");
      return;
    }
    if (type === "preselected" && pickedSlots.length === 0) {
      setErrorMessage("Pick at least one date and time.");
      return;
    }
    if (type === "open" && (!durationMinutes || durationMinutes <= 0)) {
      setErrorMessage("Duration must be a positive number of minutes.");
      return;
    }

    setSubmitting(true);
    try {
      const { id } = await createEvent({
        title: title.trim(),
        description: description.trim(),
        type,
        durationMinutes: type === "open" ? durationMinutes : null,
        preselectedSlots: type === "preselected" ? pickedSlots : [],
      });
      router.push(`/events/${id}`);
    } catch (err) {
      setSubmitting(false);
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="Planning meeting"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <div className="mt-2 flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={type === "preselected"}
              onChange={() => setType("preselected")}
            />
            Preselected — I&rsquo;ll pick specific date/times
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={type === "open"}
              onChange={() => setType("open")}
            />
            Open — let people mark availability
          </label>
        </div>
      </div>

      {type === "open" && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Duration (minutes)
          </label>
          <input
            type="number"
            min={15}
            step={15}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            className="mt-1 w-32 rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-gray-400">e.g. 120 for a 2-hour meeting</p>
        </div>
      )}

      {type === "preselected" && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Pick dates
          </label>
          <p className="mb-2 mt-1 text-xs text-gray-400">
            Click a date to add it as an option.
          </p>
          <MonthCalendar
            month={month}
            onMonthChange={setMonth}
            onDayClick={addPickedDate}
            getDayContent={(key) =>
              pickedSlots.some((slot) => slot.date === key)
                ? { colorClass: "bg-blue-100 border-blue-300", lines: ["picked"] }
                : null
            }
          />

          {pickedSlots.length > 0 && (
            <div className="mt-4 space-y-2">
              {pickedSlots.map((slot) => (
                <div
                  key={slot.date}
                  className="flex items-center gap-3 rounded-md border border-gray-200 p-2 text-sm"
                >
                  <span className="w-28 font-medium text-gray-700">
                    {formatDateShort(slot.date)}
                  </span>
                  <input
                    type="time"
                    value={slot.start_time}
                    onChange={(e) =>
                      updatePickedSlot(slot.date, "start_time", e.target.value)
                    }
                    className="rounded-md border border-gray-300 px-2 py-1"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="time"
                    value={slot.end_time}
                    onChange={(e) =>
                      updatePickedSlot(slot.date, "end_time", e.target.value)
                    }
                    className="rounded-md border border-gray-300 px-2 py-1"
                  />
                  <button
                    type="button"
                    onClick={() => removePickedSlot(slot.date)}
                    className="ml-auto text-xs text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {submitting ? "Creating…" : "Create event"}
      </button>
    </form>
  );
}
