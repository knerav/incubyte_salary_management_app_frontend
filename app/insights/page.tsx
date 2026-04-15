"use client";

import { useEffect, useState } from "react";
import {
  getSalaryInsights,
  getHistoricalSalaryInsights,
  listJobTitles,
  listDepartments,
} from "@/lib/api";
import type { Department, HistoricalSalaryInsights, JobTitle, SalaryInsights } from "@/types";
import type { InsightFilters } from "@/lib/api";
import SalaryInsightsPanel from "@/components/insights/SalaryInsightsPanel";
import SalaryHistoryChart from "@/components/insights/SalaryHistoryChart";

export default function InsightsPage() {
  const [insights, setInsights] = useState<SalaryInsights | null>(null);
  const [history, setHistory] = useState<HistoricalSalaryInsights | null>(null);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filters, setFilters] = useState<InsightFilters>({});

  async function fetchInsights(f: InsightFilters = filters) {
    const [ins, hist] = await Promise.all([
      getSalaryInsights(f),
      getHistoricalSalaryInsights(f),
    ]);
    setInsights(ins);
    setHistory(hist);
  }

  useEffect(() => {
    fetchInsights(filters);
    listJobTitles().then(setJobTitles);
    listDepartments().then(setDepartments);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleFilterChange(patch: Partial<InsightFilters>) {
    const updated = { ...filters, ...patch };
    setFilters(updated);
    fetchInsights(updated);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Insights</h1>

      <div className="mb-6 flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span>Department</span>
          <select
            aria-label="Department"
            value={filters.department_id ?? ""}
            onChange={(e) =>
              handleFilterChange({
                department_id: e.target.value
                  ? parseInt(e.target.value, 10)
                  : undefined,
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
            value={filters.job_title_id ?? ""}
            onChange={(e) =>
              handleFilterChange({
                job_title_id: e.target.value
                  ? parseInt(e.target.value, 10)
                  : undefined,
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

      {insights && (
        <div className="mb-8">
          <SalaryInsightsPanel insights={insights} />
        </div>
      )}

      {history && (
        <div className="rounded-lg border bg-white p-4">
          <h2 className="mb-4 text-lg font-semibold">Salary History</h2>
          <SalaryHistoryChart history={history} />
        </div>
      )}
    </main>
  );
}
