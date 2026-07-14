import Link from "next/link";
import { getEvents } from "@/lib/queries";
import { EventCard } from "@/components/EventCard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const events = await getEvents();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Events</h1>
        <Link
          href="/new"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          New Event
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-gray-500">
          No events yet. Create one to get started.
        </p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </main>
  );
}
