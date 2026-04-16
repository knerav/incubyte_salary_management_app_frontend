"use client";

import { useEffect, useState } from "react";
import {
  listEmployees,
  listJobTitles,
  listDepartments,
  deleteEmployee,
  createEmployee,
} from "@/lib/api";
import type { Department, Employee, EmployeeFormData, JobTitle, PaginationMeta } from "@/types";
import type { EmployeeFilters } from "@/lib/api";
import EmployeeTable from "@/components/employees/EmployeeTable";
import EmployeeFiltersComponent from "@/components/employees/EmployeeFilters";
import EmployeeForm from "@/components/employees/EmployeeForm";
import Pagination from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, Plus, XCircle } from "lucide-react";

type AddDialogView = "form" | "success" | "error";

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
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addDialogView, setAddDialogView] = useState<AddDialogView>("form");

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

  function openAddDialog() {
    setAddDialogView("form");
    setAddDialogOpen(true);
  }

  async function handleAddEmployee(data: EmployeeFormData) {
    try {
      await createEmployee(data);
      setAddDialogView("success");
      fetchEmployees();
    } catch (err: unknown) {
      const e = err as { errors?: Record<string, string[]> };
      if (e?.errors) {
        throw err; // validation errors — re-throw for EmployeeForm to display inline
      } else {
        setAddDialogView("error");
      }
    }
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
    <main className="mx-auto max-w-6xl px-6 py-8 w-full flex-1 flex flex-col">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Employees</h1>
          <Button size="icon-sm" aria-label="Add Employee" onClick={openAddDialog}>
            <Plus />
          </Button>
        </div>
        <div>
          <EmployeeFiltersComponent
            filters={filters}
            jobTitles={jobTitles}
            departments={departments}
            onChange={handleFiltersChange}
          />
        </div>
      </div>

      <EmployeeTable
        employees={employees}
        meta={meta}
        onDelete={(id) => setPendingDeleteId(id)}
      />

      <Pagination
        page={meta.page}
        totalPages={meta.total_pages}
        onPageChange={(page) => {
          const updated = { ...filters, page };
          setFilters(updated);
          fetchEmployees(updated);
        }}
      />

      {/* Add Employee Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {addDialogView === "form" && (
            <>
              <DialogHeader>
                <DialogTitle>Add Employee</DialogTitle>
                <DialogDescription>
                  Fill in the details below to add a new employee.
                </DialogDescription>
              </DialogHeader>
              <EmployeeForm
                jobTitles={jobTitles}
                departments={departments}
                onSubmit={handleAddEmployee}
              />
            </>
          )}

          {addDialogView === "success" && (
            <>
              <DialogHeader>
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                  <DialogTitle className="text-lg">Employee added!</DialogTitle>
                  <DialogDescription>
                    The new employee has been added successfully.
                  </DialogDescription>
                </div>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={() => setAddDialogOpen(false)}>Done</Button>
              </DialogFooter>
            </>
          )}

          {addDialogView === "error" && (
            <>
              <DialogHeader>
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <XCircle className="h-12 w-12 text-destructive" />
                  <DialogTitle className="text-lg">Something went wrong</DialogTitle>
                  <DialogDescription>
                    Failed to save the employee. Please try again.
                  </DialogDescription>
                </div>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setAddDialogView("form")}>Try again</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={pendingDeleteId != null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete employee?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
