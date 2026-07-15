import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventWithSlots } from "@/lib/queries";
import { EventDetailClient } from "@/components/EventDetailClient";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await getEventWithSlots(params.id);
  if (!event) notFound();

  return (
    <main className="mx-auto max-w-[1400px] px-6 py-10">
      <Link
        href="/"
        className="text-sm font-medium text-gray-500 hover:text-violet-600"
      >
        ← Back to events
      </Link>
      <EventDetailClient event={event} />
    </main>
  );
}
