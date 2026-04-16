"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import type { Employee, PaginationMeta } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  employees: Employee[];
  meta: PaginationMeta;
  onDelete: (id: number) => void;
}

export default function EmployeeTable({ employees, meta, onDelete }: Props) {
  if (employees.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <Users className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-semibold">No employees found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your filters or add a new employee.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">{meta.total} employees</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Job Title</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Country</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell>
                <Link
                  href={`/employees/${employee.id}`}
                  className="font-medium hover:underline"
                >
                  {employee.first_name} {employee.last_name}
                </Link>
              </TableCell>
              <TableCell>{employee.job_title}</TableCell>
              <TableCell>{employee.department}</TableCell>
              <TableCell>{employee.country}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(employee.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
