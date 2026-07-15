"use client";

import { useState } from "react";
import { Button } from "./Button";

export function VoterNameGate({
  onSubmit,
}: {
  onSubmit: (name: string) => void;
}) {
  const [nameInput, setNameInput] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-base font-semibold text-gray-900">
          What&rsquo;s your name?
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          You&rsquo;ll only need to enter it once for this event.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (nameInput.trim()) onSubmit(nameInput.trim());
          }}
          className="mt-4 flex gap-2"
        >
          <input
            autoFocus
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="flex-1 rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
            placeholder="Your name"
          />
          <Button type="submit" variant="primary" disabled={!nameInput.trim()}>
            Continue
          </Button>
        </form>
      </div>
    </div>
  );
}
