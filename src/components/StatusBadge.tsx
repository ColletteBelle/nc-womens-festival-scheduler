import { EventStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: EventStatus }) {
  const isConfirmed = status === "confirmed";
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isConfirmed
          ? "bg-emerald-100 text-emerald-800"
          : "bg-amber-100 text-amber-800"
      }`}
    >
      {isConfirmed ? "Confirmed" : "Open"}
    </span>
  );
}
