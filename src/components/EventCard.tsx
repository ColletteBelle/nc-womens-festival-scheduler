import Link from "next/link";
import { EventWithConfirmedSlot } from "@/lib/queries";
import { formatDateLong, formatTimeRange } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";

export function EventCard({ event }: { event: EventWithConfirmedSlot }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300 hover:shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-medium text-gray-900">{event.title}</h3>
        <StatusBadge status={event.status} />
      </div>
      {event.description && (
        <p className="mt-1 line-clamp-2 text-sm text-gray-500">
          {event.description}
        </p>
      )}
      {event.status === "confirmed" && event.confirmed_slot && (
        <p className="mt-2 text-sm font-medium text-emerald-700">
          {formatDateLong(event.confirmed_slot.date)} ·{" "}
          {formatTimeRange(
            event.confirmed_slot.start_time,
            event.confirmed_slot.end_time
          )}
        </p>
      )}
    </Link>
  );
}
