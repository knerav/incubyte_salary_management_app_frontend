"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  listEmployees,
  listJobTitles,
  listDepartments,
  deleteEmployee,
} from "@/lib/api";
import type { Department, Employee, JobTitle, PaginationMeta } from "@/types";
import type { EmployeeFilters } from "@/lib/api";
import EmployeeTable from "@/components/employees/EmployeeTable";
import EmployeeFiltersComponent from "@/components/employees/EmployeeFilters";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    per_page: 25,
    total_pages: 1,
  });
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filters, setFilters] = useState<EmployeeFilters>({});
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchEmployees(f: EmployeeFilters = filters) {
    const data = await listEmployees(f);
    setEmployees(data.employees);
    setMeta(data.meta);
  }

  useEffect(() => {
    fetchEmployees(filters);
    listJobTitles().then(setJobTitles);
    listDepartments().then(setDepartments);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleFiltersChange(updated: EmployeeFilters) {
    setFilters(updated);
    fetchEmployees(updated);
  }

  async function handleConfirmDelete() {
    if (pendingDeleteId == null) return;
    setDeleting(true);
    try {
      await deleteEmployee(pendingDeleteId);
      await fetchEmployees();
    } finally {
      setDeleting(false);
      setPendingDeleteId(null);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Employees</h1>
        <Link
          href="/employees/new"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white"
        >
          Add Employee
        </Link>
      </div>

      <div className="mb-4">
        <EmployeeFiltersComponent
          filters={filters}
          jobTitles={jobTitles}
          departments={departments}
          onChange={handleFiltersChange}
        />
      </div>

      <EmployeeTable
        employees={employees}
        meta={meta}
        onDelete={(id) => setPendingDeleteId(id)}
      />

      {pendingDeleteId != null && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <p className="mb-4 text-sm">Are you sure you want to delete this employee?</p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Confirm"}
              </button>
              <button
                onClick={() => setPendingDeleteId(null)}
                className="rounded border px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
