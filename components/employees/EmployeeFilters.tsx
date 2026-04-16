"use client";

import { useState } from "react";
import type { Department, JobTitle } from "@/types";
import type { EmployeeFilters as Filters } from "@/lib/api";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  filters: Filters;
  jobTitles: JobTitle[];
  departments: Department[];
  onChange: (filters: Filters) => void;
}

const ALL = "all";

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
    <div className="flex flex-wrap items-center gap-2">
      <Input
        role="searchbox"
        type="search"
        placeholder="Search employees…"
        value={internal.q ?? ""}
        onChange={(e) => update({ q: e.target.value })}
        className="h-9 w-48"
      />

      <Select
        value={internal.employment_type ?? ALL}
        onValueChange={(v) =>
          update({ employment_type: v === ALL ? undefined : v })
        }
      >
        <SelectTrigger aria-label="Employment Type">
          <SelectValue placeholder="Employment Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All</SelectItem>
          <SelectItem value="full_time">Full Time</SelectItem>
          <SelectItem value="part_time">Part Time</SelectItem>
          <SelectItem value="contract">Contract</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={internal.department_id?.toString() ?? ALL}
        onValueChange={(v) =>
          update({ department_id: v === ALL ? undefined : parseInt(v, 10) })
        }
      >
        <SelectTrigger aria-label="Department">
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All</SelectItem>
          {departments.map((d) => (
            <SelectItem key={d.id} value={d.id.toString()}>
              {d.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={internal.job_title_id?.toString() ?? ALL}
        onValueChange={(v) =>
          update({ job_title_id: v === ALL ? undefined : parseInt(v, 10) })
        }
      >
        <SelectTrigger aria-label="Job Title">
          <SelectValue placeholder="Job Title" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All</SelectItem>
          {jobTitles.map((jt) => (
            <SelectItem key={jt.id} value={jt.id.toString()}>
              {jt.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
