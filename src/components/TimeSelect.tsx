"use client";

import { formatTime } from "@/lib/format";

function buildTimeOptions(stepMinutes: number): string[] {
  const options: string[] = [];
  for (let minutes = 0; minutes < 24 * 60; minutes += stepMinutes) {
    const hours = Math.floor(minutes / 60)
      .toString()
      .padStart(2, "0");
    const mins = (minutes % 60).toString().padStart(2, "0");
    options.push(`${hours}:${mins}`);
  }
  return options;
}

const TIME_OPTIONS = buildTimeOptions(15);

export function TimeSelect({
  value,
  onChange,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 ${className}`}
    >
      {TIME_OPTIONS.map((time) => (
        <option key={time} value={time}>
          {formatTime(time)}
        </option>
      ))}
    </select>
  );
}
