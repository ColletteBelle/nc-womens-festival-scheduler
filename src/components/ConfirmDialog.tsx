"use client";

import { Button } from "./Button";
import { ButtonVariant } from "@/lib/buttonStyles";

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  confirmVariant = "primary",
  busy,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  confirmVariant?: ButtonVariant;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <p className="mt-1.5 text-sm text-gray-500">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="neutral" size="md" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button variant={confirmVariant} size="md" onClick={onConfirm} disabled={busy}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
