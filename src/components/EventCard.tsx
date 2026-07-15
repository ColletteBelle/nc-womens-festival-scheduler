import Link from "next/link";
import { EventWithConfirmedSlot } from "@/lib/queries";
import { formatDateLong, formatTimeRange } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";
import { EventCardMenu } from "./EventCardMenu";

export function EventCard({ event }: { event: EventWithConfirmedSlot }) {
  return (
    <div className="relative rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link
        href={`/events/${event.id}`}
        className="absolute inset-0 rounded-2xl"
        aria-label={event.title}
      />
      <div className="flex items-start justify-between gap-3">
        <h3 className="pointer-events-none font-medium text-gray-900">{event.title}</h3>
        <div className="flex items-center gap-1.5">
          <span className="pointer-events-none">
            <StatusBadge status={event.status} />
          </span>
          <EventCardMenu eventId={event.id} eventTitle={event.title} />
        </div>
      </div>
      {event.description && (
        <p className="pointer-events-none mt-1.5 line-clamp-2 text-sm text-gray-500">
          {event.description}
        </p>
      )}
      {event.status === "confirmed" && event.confirmed_slot && (
        <p className="pointer-events-none mt-3 text-sm font-medium text-emerald-700">
          {formatDateLong(event.confirmed_slot.date)} ·{" "}
          {formatTimeRange(
            event.confirmed_slot.start_time,
            event.confirmed_slot.end_time
          )}
        </p>
      )}
    </div>
  );
}
