"use client";

import { useState } from "react";
import type { Department, JobTitle } from "@/types";
import type { EmployeeFilters as Filters } from "@/lib/api";

interface Props {
  filters: Filters;
  jobTitles: JobTitle[];
  departments: Department[];
  onChange: (filters: Filters) => void;
}

export default function EmployeeFilters({
  filters,
  jobTitles,
  departments,
  onChange,
}: Props) {
  const [internal, setInternal] = useState<Filters>(filters);

  function update(patch: Partial<Filters>) {
    const updated = { ...internal, ...patch };
    setInternal(updated);
    onChange(updated);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <label className="flex flex-col gap-1 text-sm">
        <span className="sr-only">Search</span>
        <input
          role="searchbox"
          type="search"
          placeholder="Search employees…"
          value={internal.q ?? ""}
          onChange={(e) => update({ q: e.target.value })}
          className="rounded border px-3 py-1.5 text-sm"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span>Employment Type</span>
        <select
          aria-label="Employment Type"
          value={internal.employment_type ?? ""}
          onChange={(e) => update({ employment_type: e.target.value || undefined })}
          className="rounded border px-3 py-1.5 text-sm"
        >
          <option value="">All</option>
          <option value="full_time">Full Time</option>
          <option value="part_time">Part Time</option>
          <option value="contract">Contract</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span>Department</span>
        <select
          aria-label="Department"
          value={internal.department_id ?? ""}
          onChange={(e) =>
            update({
              department_id: e.target.value ? parseInt(e.target.value, 10) : undefined,
            })
          }
          className="rounded border px-3 py-1.5 text-sm"
        >
          <option value="">All</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span>Job Title</span>
        <select
          aria-label="Job Title"
          value={internal.job_title_id ?? ""}
          onChange={(e) =>
            update({
              job_title_id: e.target.value ? parseInt(e.target.value, 10) : undefined,
            })
          }
          className="rounded border px-3 py-1.5 text-sm"
        >
          <option value="">All</option>
          {jobTitles.map((jt) => (
            <option key={jt.id} value={jt.id}>
              {jt.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
