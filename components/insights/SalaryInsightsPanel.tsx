"use client";

import type { SalaryInsights } from "@/types";

interface Props {
  insights: SalaryInsights;
}

export default function SalaryInsightsPanel({ insights }: Props) {
  const { employee_count, min_salary, max_salary, avg_salary, breakdowns } =
    insights.insights;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium uppercase text-gray-500">Employees</p>
          <p className="mt-1 text-2xl font-bold">{employee_count}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium uppercase text-gray-500">Avg Salary</p>
          <p className="mt-1 text-2xl font-bold">{avg_salary}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium uppercase text-gray-500">Min Salary</p>
          <p className="mt-1 text-2xl font-bold">{min_salary}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium uppercase text-gray-500">Max Salary</p>
          <p className="mt-1 text-2xl font-bold">{max_salary}</p>
        </div>
      </div>

      {breakdowns.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-700">
            Breakdown by Job Title
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="py-1.5 pr-4 font-medium">Job Title</th>
                <th className="py-1.5 font-medium">Avg Salary</th>
              </tr>
            </thead>
            <tbody>
              {breakdowns.map((row) => (
                <tr key={row.job_title} className="border-b">
                  <td className="py-1.5 pr-4">{row.job_title}</td>
                  <td className="py-1.5">{row.avg_salary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
