import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventWithSlots } from "@/lib/queries";
import { EventDetailClient } from "@/components/EventDetailClient";
import { StatusBadge } from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await getEventWithSlots(params.id);
  if (!event) notFound();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Link href="/" className="text-sm text-gray-500 hover:underline">
        ← Back to events
      </Link>
      <div className="mb-6 mt-2 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{event.title}</h1>
          {event.description && (
            <p className="mt-1 text-sm text-gray-500">{event.description}</p>
          )}
        </div>
        <StatusBadge status={event.status} />
      </div>

      <EventDetailClient event={event} />
    </main>
  );
}
