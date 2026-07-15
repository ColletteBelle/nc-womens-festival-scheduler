"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { archiveEvent } from "@/lib/actions";
import { ConfirmDialog } from "./ConfirmDialog";

export function EventCardMenu({
  eventId,
  eventTitle,
}: {
  eventId: string;
  eventTitle: string;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleArchive() {
    setBusy(true);
    try {
      await archiveEvent({ eventId });
      router.refresh();
    } finally {
      setBusy(false);
      setConfirmOpen(false);
    }
  }

  return (
    <div className="relative z-10">
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        aria-label="Event options"
      >
        ⋮
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-xl border border-gray-100 bg-white p-1 shadow-lg">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setConfirmOpen(true);
              }}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              Archive
            </button>
          </div>
        </>
      )}

      {confirmOpen && (
        <ConfirmDialog
          title="Archive this event?"
          message={`"${eventTitle}" will be hidden from the dashboard. You won't be able to un-archive it from here.`}
          confirmLabel="Archive"
          confirmVariant="danger"
          busy={busy}
          onConfirm={handleArchive}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
}
