"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getEmployee, deleteEmployee, updateSalary, getSalaryHistory } from "@/lib/api";
import type { Employee, SalaryHistoryEntry, SalaryUpdateData } from "@/types";
import DeleteEmployeeButton from "@/components/employees/DeleteEmployeeButton";
import SalaryUpdateForm from "@/components/employees/SalaryUpdateForm";
import SalaryHistoryTable from "@/components/employees/SalaryHistoryTable";

export default function EmployeePage() {
  const { id } = useParams<{ id: string }>();
  const numId = parseInt(id, 10);
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [salaryHistory, setSalaryHistory] = useState<SalaryHistoryEntry[]>([]);

  useEffect(() => {
    getEmployee(numId).then(setEmployee);
    getSalaryHistory(numId).then(setSalaryHistory);
  }, [numId]);

  async function handleDelete(employeeId: number) {
    await deleteEmployee(employeeId);
    router.push("/employees");
  }

  async function handleSalaryUpdate(data: SalaryUpdateData) {
    const updated = await updateSalary(numId, data);
    setEmployee(updated);
  }

  if (!employee) {
    return <main className="mx-auto max-w-3xl px-4 py-8"><p>Loading…</p></main>;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-8">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-bold">
          {employee.first_name} {employee.last_name}
        </h1>
        <div className="flex gap-2">
          <Link
            href={`/employees/${numId}/edit`}
            className="rounded border px-3 py-1.5 text-sm font-medium"
          >
            Edit
          </Link>
          <DeleteEmployeeButton
            employeeId={numId}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="font-medium text-gray-500">Email</dt>
          <dd>{employee.email}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500">Job Title</dt>
          <dd>{employee.job_title}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500">Department</dt>
          <dd>{employee.department}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500">Country</dt>
          <dd>{employee.country}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500">Salary</dt>
          <dd>{employee.salary}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500">Currency</dt>
          <dd>{employee.currency}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500">Employment Type</dt>
          <dd>{employee.employment_type}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500">Hired On</dt>
          <dd>{employee.hired_on}</dd>
        </div>
      </dl>

      <div className="border-t pt-6">
        <h2 className="mb-4 text-lg font-semibold">Salary History</h2>
        <SalaryHistoryTable history={salaryHistory} />
      </div>

      <div className="border-t pt-6">
        <h2 className="mb-4 text-lg font-semibold">Update Salary</h2>
        <SalaryUpdateForm
          currentSalary={employee.salary}
          currentCurrency={employee.currency}
          onSubmit={handleSalaryUpdate}
        />
      </div>
    </main>
  );
}
