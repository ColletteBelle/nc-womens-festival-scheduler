"use client";

import { useMemo, useState } from "react";
import { EventWithSlots, SlotWithVotes } from "@/lib/types";
import { MonthCalendar, DayContent } from "./MonthCalendar";
import { ResultsPanel } from "./ResultsPanel";
import { DayModal } from "./DayModal";
import { formatTime } from "@/lib/format";

export function EventDetailClient({ event }: { event: EventWithSlots }) {
  const [month, setMonth] = useState(() => {
    const firstSlot = event.slots[0];
    if (firstSlot) {
      const [year, m] = firstSlot.date.split("-").map(Number);
      return new Date(year, m - 1, 1);
    }
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const slotsByDate = useMemo(() => {
    const map = new Map<string, SlotWithVotes[]>();
    for (const slot of event.slots) {
      const existing = map.get(slot.date) ?? [];
      existing.push(slot);
      map.set(slot.date, existing);
    }
    return map;
  }, [event.slots]);

  function getDayContent(key: string): DayContent | null {
    const daySlots = slotsByDate.get(key);
    if (!daySlots || daySlots.length === 0) return null;

    const isConfirmedDay = daySlots.some((s) => s.id === event.confirmed_slot_id);
    const hasPreselected = daySlots.some((s) => s.source === "preselected");

    const colorClass = isConfirmedDay
      ? "bg-emerald-100 border-emerald-400"
      : hasPreselected
      ? "bg-blue-100 border-blue-300"
      : "bg-purple-100 border-purple-300";

    const lines = daySlots.map((s) => formatTime(s.start_time));

    return { colorClass, lines };
  }

  const dayModalSlots = selectedDate ? slotsByDate.get(selectedDate) ?? [] : [];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
      <div className="lg:col-span-3">
        <MonthCalendar
          month={month}
          onMonthChange={setMonth}
          getDayContent={getDayContent}
          onDayClick={setSelectedDate}
        />
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
          <Legend colorClass="bg-blue-100 border-blue-300" label="Preselected" />
          <Legend colorClass="bg-purple-100 border-purple-300" label="Suggested" />
          <Legend colorClass="bg-emerald-100 border-emerald-400" label="Confirmed" />
        </div>
      </div>
      <div className="lg:col-span-1">
        <ResultsPanel event={event} slots={event.slots} />
      </div>

      {selectedDate && (
        <DayModal
          event={event}
          date={selectedDate}
          slots={dayModalSlots}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}

function Legend({ colorClass, label }: { colorClass: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded-sm border ${colorClass}`} />
      {label}
    </div>
  );
}
