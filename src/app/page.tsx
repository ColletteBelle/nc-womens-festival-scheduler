import { getEvents } from "@/lib/queries";
import { EventCard } from "@/components/EventCard";
import { NewEventModal } from "@/components/NewEventModal";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const events = await getEvents();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-gray-900">
            North Coast Women&rsquo;s Festival Event Planning
          </h1>
          <p className="mt-1 text-sm text-gray-500">Upcoming events</p>
        </div>
        <NewEventModal />
      </div>

      {events.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-200 p-6 text-sm text-gray-500">
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
