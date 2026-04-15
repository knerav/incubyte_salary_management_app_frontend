"use client";

import { useState } from "react";
import type { Department, Employee, EmployeeFormData, JobTitle } from "@/types";

interface Props {
  jobTitles: JobTitle[];
  departments: Department[];
  employee?: Employee;
  onSubmit: (data: EmployeeFormData) => Promise<void>;
}

export default function EmployeeForm({
  jobTitles,
  departments,
  employee,
  onSubmit,
}: Props) {
  const matchJobTitle = employee
    ? jobTitles.find((jt) => jt.name === employee.job_title)
    : undefined;
  const matchDepartment = employee
    ? departments.find((d) => d.name === employee.department)
    : undefined;

  const [formData, setFormData] = useState<{
    first_name: string;
    last_name: string;
    email: string;
    job_title_id: string;
    department_id: string;
    country: string;
    salary: string;
    currency: string;
    employment_type: string;
    hired_on: string;
  }>({
    first_name: employee?.first_name ?? "",
    last_name: employee?.last_name ?? "",
    email: employee?.email ?? "",
    job_title_id: matchJobTitle ? String(matchJobTitle.id) : "",
    department_id: matchDepartment ? String(matchDepartment.id) : "",
    country: employee?.country ?? "",
    salary: employee?.salary ?? "",
    currency: employee?.currency ?? "",
    employment_type: employee?.employment_type ?? "",
    hired_on: employee?.hired_on ?? "",
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      await onSubmit({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        job_title_id: parseInt(formData.job_title_id, 10),
        department_id: parseInt(formData.department_id, 10),
        country: formData.country,
        salary: formData.salary,
        currency: formData.currency,
        employment_type: formData.employment_type as EmployeeFormData["employment_type"],
        hired_on: formData.hired_on,
      });
    } catch (err: unknown) {
      const e = err as { errors?: Record<string, string[]> };
      if (e?.errors) setErrors(e.errors);
    } finally {
      setSubmitting(false);
    }
  }

  function field(name: keyof typeof formData) {
    return {
      value: formData[name],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setFormData((prev) => ({ ...prev, [name]: e.target.value })),
    };
  }

  const allErrors = Object.values(errors).flat();

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {allErrors.length > 0 && (
        <ul role="alert" className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {allErrors.map((msg, i) => (
            <li key={i}>{msg}</li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span>First Name</span>
          <input
            aria-label="First Name"
            type="text"
            className="rounded border px-3 py-1.5"
            {...field("first_name")}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>Last Name</span>
          <input
            aria-label="Last Name"
            type="text"
            className="rounded border px-3 py-1.5"
            {...field("last_name")}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span>Email</span>
        <input
          aria-label="Email"
          type="email"
          className="rounded border px-3 py-1.5"
          {...field("email")}
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span>Job Title</span>
          <select
            aria-label="Job Title"
            className="rounded border px-3 py-1.5"
            {...field("job_title_id")}
          >
            <option value="">Select…</option>
            {jobTitles.map((jt) => (
              <option key={jt.id} value={jt.id}>
                {jt.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>Department</span>
          <select
            aria-label="Department"
            className="rounded border px-3 py-1.5"
            {...field("department_id")}
          >
            <option value="">Select…</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span>Country</span>
        <input
          aria-label="Country"
          type="text"
          className="rounded border px-3 py-1.5"
          {...field("country")}
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span>Salary</span>
          <input
            aria-label="Salary"
            type="text"
            className="rounded border px-3 py-1.5"
            {...field("salary")}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>Currency</span>
          <input
            aria-label="Currency"
            type="text"
            className="rounded border px-3 py-1.5"
            {...field("currency")}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span>Employment Type</span>
        <select
          aria-label="Employment Type"
          className="rounded border px-3 py-1.5"
          {...field("employment_type")}
        >
          <option value="">Select…</option>
          <option value="full_time">Full Time</option>
          <option value="part_time">Part Time</option>
          <option value="contract">Contract</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span>Hired On</span>
        <input
          aria-label="Hired On"
          type="date"
          className="rounded border px-3 py-1.5"
          {...field("hired_on")}
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {submitting ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
