"use client";

import { useState } from "react";
import type { JobTitle } from "@/types";

interface Props {
  jobTitles: JobTitle[];
  onCreate: (name: string) => Promise<void>;
  onUpdate: (id: number, name: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function JobTitleManager({
  jobTitles,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await onCreate(newName);
    setNewName("");
  }

  function startEdit(jt: JobTitle) {
    setEditingId(jt.id);
    setEditingName(jt.name);
  }

  async function handleSave(id: number) {
    await onUpdate(id, editingName);
    setEditingId(null);
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Job Titles</h2>

      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          type="text"
          placeholder="New job title"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 rounded border px-3 py-1.5 text-sm"
        />
        <button
          type="submit"
          className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white"
        >
          Add
        </button>
      </form>

      <ul className="divide-y">
        {jobTitles.map((jt) => (
          <li key={jt.id} className="flex items-center gap-2 py-2">
            {editingId === jt.id ? (
              <>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="flex-1 rounded border px-3 py-1 text-sm"
                />
                <button
                  onClick={() => handleSave(jt.id)}
                  className="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="rounded border px-3 py-1 text-xs font-medium"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm">{jt.name}</span>
                <button
                  onClick={() => startEdit(jt)}
                  className="rounded border px-2 py-1 text-xs"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(jt.id)}
                  className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
