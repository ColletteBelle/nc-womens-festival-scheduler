import { EventStatus } from "@/lib/types";

const STATE_STYLES = {
  confirmed: {
    label: "Confirmed",
    wrapper: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  closed: {
    label: "Closed",
    wrapper: "bg-gray-100 text-gray-600 ring-gray-300",
    dot: "bg-gray-400",
  },
  open: {
    label: "Open",
    wrapper: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
  },
} as const;

// Three states: confirmed (a date was chosen) > closed (voting ended, no date
// chosen yet) > open. Only a confirmed event shows a date alongside the badge.
export function StatusBadge({
  status,
  votingClosed = false,
}: {
  status: EventStatus;
  votingClosed?: boolean;
}) {
  const state =
    status === "confirmed" ? "confirmed" : votingClosed ? "closed" : "open";
  const style = STATE_STYLES[state];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${style.wrapper}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}
