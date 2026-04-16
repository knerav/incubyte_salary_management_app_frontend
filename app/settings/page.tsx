"use client";

import { useEffect, useState } from "react";
import {
  listJobTitles,
  listDepartments,
  createJobTitle,
  updateJobTitle,
  deleteJobTitle,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "@/lib/api";
import type { Department, JobTitle } from "@/types";
import JobTitleManager from "@/components/settings/JobTitleManager";
import DepartmentManager from "@/components/settings/DepartmentManager";

export default function SettingsPage() {
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  async function fetchJobTitles() {
    const data = await listJobTitles();
    setJobTitles(data);
  }

  async function fetchDepartments() {
    const data = await listDepartments();
    setDepartments(data);
  }

  useEffect(() => {
    fetchJobTitles();
    fetchDepartments();
  }, []);

  async function handleCreateJobTitle(name: string) {
    await createJobTitle(name);
    await fetchJobTitles();
  }

  async function handleUpdateJobTitle(id: number, name: string) {
    await updateJobTitle(id, name);
    await fetchJobTitles();
  }

  async function handleDeleteJobTitle(id: number) {
    await deleteJobTitle(id);
    await fetchJobTitles();
  }

  async function handleCreateDepartment(name: string) {
    await createDepartment(name);
    await fetchDepartments();
  }

  async function handleUpdateDepartment(id: number, name: string) {
    await updateDepartment(id, name);
    await fetchDepartments();
  }

  async function handleDeleteDepartment(id: number) {
    await deleteDepartment(id);
    await fetchDepartments();
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-8 w-full">
      <h1 className="mb-8 text-2xl font-bold">Settings</h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <JobTitleManager
          jobTitles={jobTitles}
          onCreate={handleCreateJobTitle}
          onUpdate={handleUpdateJobTitle}
          onDelete={handleDeleteJobTitle}
        />

        <DepartmentManager
          departments={departments}
          onCreate={handleCreateDepartment}
          onUpdate={handleUpdateDepartment}
          onDelete={handleDeleteDepartment}
        />
      </div>
    </main>
  );
}
