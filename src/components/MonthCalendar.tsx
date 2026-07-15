"use client";

import { dateKey } from "@/lib/format";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface DayContent {
  colorClass: string;
  lines: string[];
}

interface MonthCalendarProps {
  month: Date;
  onMonthChange: (newMonth: Date) => void;
  getDayContent: (key: string) => DayContent | null;
  onDayClick: (key: string) => void;
}

function buildWeeks(month: Date): Date[][] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstOfMonth = new Date(year, monthIndex, 1);
  const startOffset = firstOfMonth.getDay();
  const gridStart = new Date(year, monthIndex, 1 - startOffset);

  const weeks: Date[][] = [];
  let cursor = gridStart;
  for (let week = 0; week < 6; week++) {
    const days: Date[] = [];
    for (let day = 0; day < 7; day++) {
      days.push(cursor);
      cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1);
    }
    weeks.push(days);
  }
  return weeks;
}

export function MonthCalendar({
  month,
  onMonthChange,
  getDayContent,
  onDayClick,
}: MonthCalendarProps) {
  const weeks = buildWeeks(month);
  const monthLabel = month.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() =>
            onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))
          }
          className="rounded-full p-2 text-sm text-gray-500 hover:bg-violet-50 hover:text-violet-700"
          aria-label="Previous month"
        >
          ←
        </button>
        <h2 className="font-serif text-lg font-semibold text-gray-900">{monthLabel}</h2>
        <button
          type="button"
          onClick={() =>
            onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))
          }
          className="rounded-full p-2 text-sm text-gray-500 hover:bg-violet-50 hover:text-violet-700"
          aria-label="Next month"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-gray-400">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weeks.map((week) =>
          week.map((day) => {
            const key = dateKey(day);
            const inMonth = day.getMonth() === month.getMonth();
            const content = getDayContent(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => onDayClick(key)}
                className={`min-h-24 rounded-xl border p-2 text-left text-xs transition ${
                  inMonth
                    ? "border-gray-100"
                    : "border-transparent text-gray-300"
                } ${content ? content.colorClass : "hover:bg-gray-50"}`}
              >
                <div className={inMonth ? "font-medium text-gray-700" : "font-medium"}>
                  {day.getDate()}
                </div>
                {content?.lines.map((line, i) => (
                  <div key={i} className="mt-1 truncate text-[11px] font-medium leading-tight">
                    {line}
                  </div>
                ))}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
