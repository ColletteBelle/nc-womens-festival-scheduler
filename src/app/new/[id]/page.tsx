import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventWithSlots } from "@/lib/queries";
import { CreateEventForm } from "@/components/CreateEventForm";

export const dynamic = "force-dynamic";

export default async function NewEventDatesPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await getEventWithSlots(params.id);
  if (!event) notFound();

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10">
      <Link
        href="/"
        className="text-sm font-medium text-gray-500 hover:text-violet-600"
      >
        ← Back to events
      </Link>
      <div className="mb-6 mt-2">
        <h1 className="font-serif text-2xl font-semibold text-gray-900 sm:text-3xl">{event.title}</h1>
        {event.description && (
          <p className="mt-1 text-sm text-gray-500">{event.description}</p>
        )}
      </div>
      <CreateEventForm eventId={event.id} />
    </main>
  );
}
