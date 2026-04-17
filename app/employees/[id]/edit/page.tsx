"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getEmployee, listJobTitles, listDepartments, updateEmployee, updateSalary } from "@/lib/api";
import type { Department, Employee, EmployeeFormData, JobTitle } from "@/types";
import EmployeeForm from "@/components/employees/EmployeeForm";

export default function EditEmployeePage() {
  const { id } = useParams<{ id: string }>();
  const numId = parseInt(id, 10);
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    Promise.all([
      getEmployee(numId),
      listJobTitles(),
      listDepartments(),
    ]).then(([emp, jts, depts]) => {
      setEmployee(emp);
      setJobTitles(jts);
      setDepartments(depts);
    });
  }, [numId]);

  async function handleSubmit(data: EmployeeFormData) {
    const { salary, currency, ...rest } = data;
    await updateEmployee(numId, rest);
    if (employee && (salary !== employee.salary || currency !== employee.currency)) {
      await updateSalary(numId, { salary, currency });
    }
    router.push(`/employees/${numId}`);
  }

  if (!employee) {
    return <main className="mx-auto max-w-2xl px-4 py-8"><p>Loading…</p></main>;
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Edit Employee</h1>
      <EmployeeForm
        jobTitles={jobTitles}
        departments={departments}
        employee={employee}
        onSubmit={handleSubmit}
      />
    </main>
  );
}
