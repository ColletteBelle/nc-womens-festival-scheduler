"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createEvent } from "@/lib/actions";
import { MonthCalendar } from "./MonthCalendar";
import { TimeSelect } from "./TimeSelect";
import { DurationPicker } from "./DurationPicker";
import { Button } from "./Button";
import { addMinutesToTime, formatDateShort, formatTime } from "@/lib/format";

interface PickedSlot {
  id: string;
  date: string;
  start_time: string;
  durationMinutes: number;
}

function newSlotId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function CreateEventForm({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const router = useRouter();
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [pickedSlots, setPickedSlots] = useState<PickedSlot[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const slotsByDate = useMemo(() => {
    const map = new Map<string, PickedSlot[]>();
    for (const slot of pickedSlots) {
      const existing = map.get(slot.date) ?? [];
      existing.push(slot);
      map.set(slot.date, existing);
    }
    return new Map(
      Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
    );
  }, [pickedSlots]);

  function addPickedDate(date: string) {
    setPickedSlots((prev) => [
      ...prev,
      { id: newSlotId(), date, start_time: "09:00", durationMinutes: 240 },
    ]);
  }

  function updatePickedSlot(
    id: string,
    field: "start_time" | "durationMinutes",
    value: string | number
  ) {
    setPickedSlots((prev) =>
      prev.map((slot) => (slot.id === id ? { ...slot, [field]: value } : slot))
    );
  }

  function removePickedSlot(id: string) {
    setPickedSlots((prev) => prev.filter((slot) => slot.id !== id));
  }

  async function handleSubmit() {
    setErrorMessage(null);

    if (pickedSlots.length === 0) {
      setErrorMessage("Pick at least one date and time.");
      return;
    }

    setSubmitting(true);
    try {
      const { id } = await createEvent({
        title,
        description,
        type: "preselected",
        durationMinutes: null,
        preselectedSlots: pickedSlots.map((slot) => ({
          date: slot.date,
          start_time: slot.start_time,
          end_time: addMinutesToTime(slot.start_time, slot.durationMinutes),
        })),
      });
      router.push(`/events/${id}`);
    } catch (err) {
      console.error("createEvent failed:", err);
      setSubmitting(false);
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="mx-auto mb-3 max-w-2xl">
          <label className="block text-sm font-medium text-gray-700">Pick dates</label>
          <p className="mt-1 text-xs text-gray-400">
            Click a date to add a time. Click the same date again to add another time
            that day.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <MonthCalendar
              month={month}
              onMonthChange={setMonth}
              onDayClick={addPickedDate}
              getDayContent={(key) => {
                const count = slotsByDate.get(key)?.length ?? 0;
                if (count === 0) return null;
                return {
                  colorClass: "bg-violet-100 border-violet-300",
                  lines: [`${count} time${count > 1 ? "s" : ""}`],
                };
              }}
            />
          </div>
          <div className="lg:col-span-1">
            <div className="max-h-[600px] space-y-4 overflow-y-auto rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              {pickedSlots.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No times picked yet. Click a date on the calendar.
                </p>
              ) : (
                Array.from(slotsByDate.entries()).map(([date, slotsForDate]) => (
                  <div key={date} className="rounded-xl border border-gray-200 p-3 text-sm">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium text-gray-700">
                        {formatDateShort(date)}
                      </span>
                      <Button variant="info" size="sm" onClick={() => addPickedDate(date)}>
                        + Add time
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {slotsForDate.map((slot) => (
                        <div key={slot.id} className="space-y-2 rounded-lg bg-gray-50 p-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <TimeSelect
                              value={slot.start_time}
                              onChange={(value) =>
                                updatePickedSlot(slot.id, "start_time", value)
                              }
                            />
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => removePickedSlot(slot.id)}
                            >
                              Remove
                            </Button>
                          </div>
                          <DurationPicker
                            minutes={slot.durationMinutes}
                            onChange={(value) =>
                              updatePickedSlot(slot.id, "durationMinutes", value)
                            }
                          />
                          <p className="text-xs text-gray-400">
                            Ends at{" "}
                            {formatTime(
                              addMinutesToTime(slot.start_time, slot.durationMinutes)
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-3">
        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

        <Button variant="primary" disabled={submitting} onClick={handleSubmit}>
          {submitting ? "Creating…" : "Create event"}
        </Button>
      </div>
    </div>
  );
}
