"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEvent } from "@/lib/actions";
import { Button } from "./Button";
import { buttonClasses } from "@/lib/buttonStyles";

export function NewEventModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"preselected" | "open">("preselected");
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage("Title is required.");
      return;
    }
    if (type === "open" && (!durationMinutes || durationMinutes <= 0)) {
      setErrorMessage("Duration must be a positive number of minutes.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      const { id } = await createEvent({
        title: title.trim(),
        description: description.trim(),
        type,
        durationMinutes: type === "open" ? durationMinutes : null,
        preselectedSlots: [],
      });
      router.push(type === "open" ? `/events/${id}` : `/new/${id}`);
    } catch (err) {
      console.error("createEvent failed:", err);
      setSubmitting(false);
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <>
      <button type="button" className={buttonClasses("primary", "md")} onClick={() => setIsOpen(true)}>
        New Event
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleContinue}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h3 className="font-serif text-xl font-semibold text-gray-900">New event</h3>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                autoFocus
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                placeholder="Planning meeting"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Description <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="mt-1.5 w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <TypeOption
                  label="Preselected"
                  description="I'll pick specific date/times"
                  selected={type === "preselected"}
                  onSelect={() => setType("preselected")}
                />
                <TypeOption
                  label="Open"
                  description="Let people mark availability"
                  selected={type === "open"}
                  onSelect={() => setType("open")}
                />
              </div>
            </div>

            {type === "open" && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Target meeting length (minutes)
                </label>
                <input
                  type="number"
                  min={15}
                  step={15}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="mt-1.5 w-32 rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                />
                <p className="mt-1.5 text-xs text-gray-400">
                  Used to suggest times once people mark their availability — they can still mark
                  any days/times they&rsquo;re free.
                </p>
              </div>
            )}

            {errorMessage && <p className="mt-3 text-sm text-red-600">{errorMessage}</p>}

            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="neutral"
                size="md"
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit" disabled={submitting}>
                {submitting ? "Creating…" : "Continue"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function TypeOption({
  label,
  description,
  selected,
  onSelect,
}: {
  label: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-xl border p-3.5 text-left text-sm transition ${
        selected
          ? "border-violet-400 bg-violet-50 ring-1 ring-violet-200"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <p className={`font-medium ${selected ? "text-violet-700" : "text-gray-800"}`}>{label}</p>
      <p className="mt-0.5 text-xs text-gray-500">{description}</p>
    </button>
  );
}
