"use client";

import { useMemo, useState } from "react";
import { EventWithSlots, SlotWithVotes } from "@/lib/types";
import { MonthCalendar, DayContent } from "./MonthCalendar";
import { ResultsPanel } from "./ResultsPanel";
import { EventDetailsPanel } from "./EventDetailsPanel";
import { HowToVoteCard } from "./HowToVoteCard";
import { DayModal } from "./DayModal";
import { VoterNameGate } from "./VoterNameGate";
import { StatusBadge } from "./StatusBadge";
import { useVoterName } from "@/hooks/useVoterName";
import { formatTimeRange } from "@/lib/format";

export function EventDetailClient({ event }: { event: EventWithSlots }) {
  const { voterName, setVoterName, loaded } = useVoterName(event.id);
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
      ? "bg-violet-100 border-violet-300"
      : "bg-fuchsia-100 border-fuchsia-300";

    const lines = daySlots.map((s) => formatTimeRange(s.start_time, s.end_time));

    return { colorClass, lines };
  }

  const dayModalSlots = selectedDate ? slotsByDate.get(selectedDate) ?? [] : [];

  return (
    <>
      <div className="mb-6 mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="font-serif text-2xl font-semibold text-gray-900 sm:text-3xl">{event.title}</h1>
        <div className="flex flex-wrap items-center gap-3">
          {loaded && voterName && (
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-500 shadow-sm">
              Voting as <span className="text-gray-900">{voterName}</span>
            </span>
          )}
          <StatusBadge status={event.status} />
        </div>
      </div>

      {!loaded ? null : !voterName ? (
        <VoterNameGate onSubmit={setVoterName} />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
            <div className="lg:col-span-5">
              <EventDetailsPanel description={event.description} slots={event.slots} />
            </div>
            <div className="lg:col-span-2">
              <HowToVoteCard />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
            <div className="lg:col-span-5">
              <MonthCalendar
                month={month}
                onMonthChange={setMonth}
                getDayContent={getDayContent}
                onDayClick={setSelectedDate}
              />
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
                <Legend colorClass="bg-violet-100 border-violet-300" label="Preselected" />
                <Legend colorClass="bg-fuchsia-100 border-fuchsia-300" label="Suggested" />
                <Legend colorClass="bg-emerald-100 border-emerald-400" label="Confirmed" />
              </div>
            </div>
            <div className="lg:relative lg:col-span-2">
              <div className="lg:absolute lg:inset-0">
                <ResultsPanel event={event} slots={event.slots} voterName={voterName} />
              </div>
            </div>

            {selectedDate && (
              <DayModal
                event={event}
                date={selectedDate}
                slots={dayModalSlots}
                voterName={voterName}
                onClose={() => setSelectedDate(null)}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Legend({ colorClass, label }: { colorClass: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-gray-100 bg-white px-2.5 py-1 shadow-sm">
      <span className={`h-2.5 w-2.5 rounded-full border ${colorClass}`} />
      {label}
    </div>
  );
}
