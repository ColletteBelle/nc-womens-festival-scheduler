"use client";

import { Button } from "./Button";
import { formatDuration } from "@/lib/format";

const PRESETS = [
  { label: "Half day (4h)", minutes: 240 },
  { label: "Full day (8h)", minutes: 480 },
];

function buildCustomOptions(): number[] {
  const options: number[] = [];
  for (let minutes = 30; minutes <= 720; minutes += 30) {
    options.push(minutes);
  }
  return options;
}

const CUSTOM_OPTIONS = buildCustomOptions();

export function DurationPicker({
  minutes,
  onChange,
}: {
  minutes: number;
  onChange: (minutes: number) => void;
}) {
  const isPreset = PRESETS.some((preset) => preset.minutes === minutes);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((preset) => (
        <Button
          key={preset.minutes}
          variant={minutes === preset.minutes ? "primary" : "neutral"}
          size="sm"
          onClick={() => onChange(preset.minutes)}
        >
          {preset.label}
        </Button>
      ))}
      <Button
        variant={!isPreset ? "primary" : "neutral"}
        size="sm"
        onClick={() => {
          if (isPreset) onChange(120);
        }}
      >
        Custom
      </Button>
      {!isPreset && (
        <select
          value={minutes}
          onChange={(e) => onChange(Number(e.target.value))}
          className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
        >
          {CUSTOM_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {formatDuration(value)}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
