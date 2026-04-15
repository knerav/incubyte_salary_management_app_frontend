"use client";

import Link from "next/link";
import type { Employee, PaginationMeta } from "@/types";

interface Props {
  employees: Employee[];
  meta: PaginationMeta;
  onDelete: (id: number) => void;
}

export default function EmployeeTable({ employees, meta, onDelete }: Props) {
  if (employees.length === 0) {
    return (
      <p className="py-8 text-center text-gray-500">No employees found</p>
    );
  }

  return (
    <div>
      <p className="mb-2 text-sm text-gray-600">{meta.total} employees</p>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="py-2 pr-4 font-medium">Name</th>
            <th className="py-2 pr-4 font-medium">Job Title</th>
            <th className="py-2 pr-4 font-medium">Department</th>
            <th className="py-2 pr-4 font-medium">Country</th>
            <th className="py-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id} className="border-b hover:bg-gray-50">
              <td className="py-2 pr-4">
                <Link
                  href={`/employees/${employee.id}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {employee.first_name} {employee.last_name}
                </Link>
              </td>
              <td className="py-2 pr-4 text-gray-700">{employee.job_title}</td>
              <td className="py-2 pr-4 text-gray-700">{employee.department}</td>
              <td className="py-2 pr-4 text-gray-700">{employee.country}</td>
              <td className="py-2">
                <button
                  onClick={() => onDelete(employee.id)}
                  className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
