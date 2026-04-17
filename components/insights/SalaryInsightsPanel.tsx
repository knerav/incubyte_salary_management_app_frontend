"use client";

import type { SalaryInsights } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  insights: SalaryInsights;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

export default function SalaryInsightsPanel({ insights }: Props) {
  const {
    employee_count,
    min_salary,
    max_salary,
    avg_salary,
    currency_symbol,
    breakdowns,
  } = insights.insights;

  const fmt = (value: string) => `${currency_symbol}${value}`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Employees" value={employee_count} />
        <StatCard label="Avg Salary" value={fmt(avg_salary)} />
        <StatCard label="Min Salary" value={fmt(min_salary)} />
        <StatCard label="Max Salary" value={fmt(max_salary)} />
      </div>

      {breakdowns.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Breakdown by Job Title</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Avg Salary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {breakdowns.map((row) => (
                <TableRow key={row.job_title}>
                  <TableCell>{row.job_title}</TableCell>
                  <TableCell>{fmt(row.avg_salary)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
