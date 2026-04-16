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
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">
          Search
        </span>
        <Input
          role="searchbox"
          type="search"
          placeholder="Search by name..."
          value={internal.q ?? ""}
          onChange={(e) => update({ q: e.target.value })}
          className="h-9 w-48"
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">
          Employment Type
        </span>
        <Select
          value={internal.employment_type ?? ALL}
          onValueChange={(v) =>
            update({ employment_type: v === ALL ? undefined : v })
          }
        >
          <SelectTrigger className="w-full" aria-label="Employment Type">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All</SelectItem>
            <SelectItem value="full_time">Full Time</SelectItem>
            <SelectItem value="part_time">Part Time</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">
          Department
        </span>
        <Select
          value={internal.department_id?.toString() ?? ALL}
          onValueChange={(v) =>
            update({ department_id: v === ALL ? undefined : parseInt(v, 10) })
          }
        >
          <SelectTrigger className="w-full" aria-label="Department">
            <SelectValue placeholder="All" />
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
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">
          Job Title
        </span>
        <Select
          value={internal.job_title_id?.toString() ?? ALL}
          onValueChange={(v) =>
            update({ job_title_id: v === ALL ? undefined : parseInt(v, 10) })
          }
        >
          <SelectTrigger className="w-full" aria-label="Job Title">
            <SelectValue placeholder="All" />
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
    </div>
  );
}
