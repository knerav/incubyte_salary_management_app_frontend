"use client";

import { useEffect, useState } from "react";
import {
  getSalaryInsights,
  getHistoricalSalaryInsights,
  listJobTitles,
  listDepartments,
} from "@/lib/api";
import type {
  Department,
  HistoricalSalaryInsights,
  JobTitle,
  SalaryInsights,
} from "@/types";
import type { InsightFilters } from "@/lib/api";
import SalaryInsightsPanel from "@/components/insights/SalaryInsightsPanel";
import SalaryHistoryChart from "@/components/insights/SalaryHistoryChart";
import { BarChart3 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL = "all";

export default function InsightsPage() {
  const [insights, setInsights] = useState<SalaryInsights | null>(null);
  const [history, setHistory] = useState<HistoricalSalaryInsights | null>(null);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filters, setFilters] = useState<InsightFilters>({});

  async function fetchInsights(f: InsightFilters = filters) {
    try {
      const [ins, hist] = await Promise.all([
        getSalaryInsights(f),
        getHistoricalSalaryInsights(f),
      ]);
      setInsights(ins);
      setHistory(hist);
    } catch {
      // leave insights null so the empty state renders
    }
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
    <main className="mx-auto max-w-6xl px-6 py-8 w-full flex-1 flex flex-col">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Insights</h1>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Department
            </span>
            <Select
              value={filters.department_id?.toString() ?? ALL}
              onValueChange={(v) =>
                handleFilterChange({
                  department_id: v === ALL ? undefined : parseInt(v, 10),
                })
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
              value={filters.job_title_id?.toString() ?? ALL}
              onValueChange={(v) =>
                handleFilterChange({
                  job_title_id: v === ALL ? undefined : parseInt(v, 10),
                })
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
      </div>

      {!insights || insights.insights.employee_count === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <BarChart3 className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No data to display</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your filters to see salary insights.
          </p>
        </div>
      ) : (
        <>
          {insights && (
            <div className="mb-8">
              <SalaryInsightsPanel insights={insights} />
            </div>
          )}

          {history && (
            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Salary History</h2>
              <SalaryHistoryChart history={history} />
            </div>
          )}
        </>
      )}
    </main>
  );
}
