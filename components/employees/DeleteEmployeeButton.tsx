"use client";

import { useState } from "react";

interface Props {
  employeeId: number;
  onDelete: (id: number) => Promise<void>;
}

export default function DeleteEmployeeButton({ employeeId, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleConfirm() {
    setDeleting(true);
    try {
      await onDelete(employeeId);
    } finally {
      setDeleting(false);
      setOpen(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
      >
        Delete
      </button>

      {open && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <p className="mb-4 text-sm">Are you sure you want to delete this employee?</p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                disabled={deleting}
                className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Confirm"}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded border px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
