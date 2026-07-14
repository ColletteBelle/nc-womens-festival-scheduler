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
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() =>
            onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))
          }
          className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
        >
          ← Prev
        </button>
        <h2 className="text-sm font-semibold text-gray-900">{monthLabel}</h2>
        <button
          type="button"
          onClick={() =>
            onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))
          }
          className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
        >
          Next →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-400">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
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
                className={`min-h-16 rounded-md border p-1 text-left text-xs transition ${
                  inMonth
                    ? "border-gray-100"
                    : "border-transparent text-gray-300"
                } ${content ? content.colorClass : "hover:bg-gray-50"}`}
              >
                <div className={inMonth ? "font-medium text-gray-700" : "font-medium"}>
                  {day.getDate()}
                </div>
                {content?.lines.map((line, i) => (
                  <div key={i} className="mt-0.5 truncate text-[11px] leading-tight">
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
