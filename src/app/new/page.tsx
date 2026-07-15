import Link from "next/link";
import { redirect } from "next/navigation";
import { CreateEventForm } from "@/components/CreateEventForm";

export default function NewEventPage({
  searchParams,
}: {
  searchParams: { title?: string; description?: string };
}) {
  const title = searchParams.title?.trim();
  if (!title) {
    redirect("/");
  }

  const description = searchParams.description ?? "";

  return (
    <main className="mx-auto max-w-[1400px] px-6 py-10">
      <Link
        href="/"
        className="text-sm font-medium text-gray-500 hover:text-violet-600"
      >
        ← Back to events
      </Link>
      <div className="mb-6 mt-2">
        <h1 className="font-serif text-3xl font-semibold text-gray-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      <CreateEventForm title={title} description={description} />
    </main>
  );
}
