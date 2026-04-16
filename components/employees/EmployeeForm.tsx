"use client";

import { useState } from "react";
import type { Department, Employee, EmployeeFormData, JobTitle } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const [formData, setFormData] = useState({
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

  function textField(name: keyof typeof formData) {
    return {
      value: formData[name],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setFormData((prev) => ({ ...prev, [name]: e.target.value })),
    };
  }

  function selectField(name: keyof typeof formData) {
    return {
      value: formData[name] || undefined,
      onValueChange: (v: string) =>
        setFormData((prev) => ({ ...prev, [name]: v })),
    };
  }

  const allErrors = Object.values(errors).flat();

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {allErrors.length > 0 && (
        <ul
          role="alert"
          className="rounded border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {allErrors.map((msg, i) => (
            <li key={i}>{msg}</li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">First Name</span>
          <Input aria-label="First Name" type="text" {...textField("first_name")} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Last Name</span>
          <Input aria-label="Last Name" type="text" {...textField("last_name")} />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Email</span>
        <Input aria-label="Email" type="email" {...textField("email")} />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Job Title</span>
          <Select {...selectField("job_title_id")}>
            <SelectTrigger aria-label="Job Title">
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              {jobTitles.map((jt) => (
                <SelectItem key={jt.id} value={String(jt.id)}>
                  {jt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Department</span>
          <Select {...selectField("department_id")}>
            <SelectTrigger aria-label="Department">
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((d) => (
                <SelectItem key={d.id} value={String(d.id)}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Country</span>
        <Input aria-label="Country" type="text" {...textField("country")} />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Salary</span>
          <Input aria-label="Salary" type="text" {...textField("salary")} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Currency</span>
          <Input aria-label="Currency" type="text" {...textField("currency")} />
        </label>
      </div>

      <div className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Employment Type</span>
        <Select {...selectField("employment_type")}>
          <SelectTrigger aria-label="Employment Type">
            <SelectValue placeholder="Select…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full_time">Full Time</SelectItem>
            <SelectItem value="part_time">Part Time</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Hired On</span>
        <Input aria-label="Hired On" type="date" {...textField("hired_on")} />
      </label>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
