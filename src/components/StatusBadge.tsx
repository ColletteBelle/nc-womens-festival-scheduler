import { EventStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: EventStatus }) {
  const isConfirmed = status === "confirmed";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${
        isConfirmed
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
          : "bg-amber-50 text-amber-700 ring-amber-200"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isConfirmed ? "bg-emerald-500" : "bg-amber-500"
        }`}
      />
      {isConfirmed ? "Confirmed" : "Open"}
    </span>
  );
}
