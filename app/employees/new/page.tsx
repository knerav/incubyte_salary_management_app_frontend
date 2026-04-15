"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listJobTitles, listDepartments, createEmployee } from "@/lib/api";
import type { Department, EmployeeFormData, JobTitle } from "@/types";
import EmployeeForm from "@/components/employees/EmployeeForm";

export default function NewEmployeePage() {
  const router = useRouter();
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    listJobTitles().then(setJobTitles);
    listDepartments().then(setDepartments);
  }, []);

  async function handleSubmit(data: EmployeeFormData) {
    await createEmployee(data);
    router.push("/employees");
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">New Employee</h1>
      <EmployeeForm
        jobTitles={jobTitles}
        departments={departments}
        onSubmit={handleSubmit}
      />
    </main>
  );
}
