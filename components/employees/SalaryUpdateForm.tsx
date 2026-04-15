"use client";

import { useState } from "react";
import type { SalaryUpdateData } from "@/types";

interface Props {
  currentSalary: string;
  currentCurrency: string;
  onSubmit: (data: SalaryUpdateData) => Promise<void>;
}

export default function SalaryUpdateForm({
  currentSalary,
  currentCurrency,
  onSubmit,
}: Props) {
  const [salary, setSalary] = useState(currentSalary);
  const [currency, setCurrency] = useState(currentCurrency);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      await onSubmit({ salary, currency });
    } catch (err: unknown) {
      const e = err as { errors?: Record<string, string[]> };
      if (e?.errors) setErrors(e.errors);
    } finally {
      setSubmitting(false);
    }
  }

  const allErrors = Object.values(errors).flat();

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {allErrors.length > 0 && (
        <ul role="alert" className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {allErrors.map((msg, i) => (
            <li key={i}>{msg}</li>
          ))}
        </ul>
      )}

      <label className="flex flex-col gap-1 text-sm">
        <span>Salary</span>
        <input
          aria-label="Salary"
          type="text"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          className="rounded border px-3 py-1.5"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span>Currency</span>
        <input
          aria-label="Currency"
          type="text"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="rounded border px-3 py-1.5"
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {submitting ? "Updating…" : "Update Salary"}
      </button>
    </form>
  );
}
