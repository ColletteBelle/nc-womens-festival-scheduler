import Link from "next/link";
import { CreateEventForm } from "@/components/CreateEventForm";

export default function NewEventPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/" className="text-sm text-gray-500 hover:underline">
        ← Back to events
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-semibold text-gray-900">
        New event
      </h1>
      <CreateEventForm />
    </main>
  );
}
