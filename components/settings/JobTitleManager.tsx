"use client";

import { useState } from "react";
import type { JobTitle } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
        <Input
          type="text"
          placeholder="New job title"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          aria-label="New job title"
        />
        <Button type="submit" size="sm">Add</Button>
      </form>

      <ul className="divide-y">
        {jobTitles.map((jt) => (
          <li key={jt.id} className="flex items-center gap-2 py-2">
            {editingId === jt.id ? (
              <>
                <Input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  aria-label="Edit job title"
                  className="flex-1"
                />
                <Button size="sm" onClick={() => handleSave(jt.id)}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm">{jt.name}</span>
                <Button size="sm" variant="outline" onClick={() => startEdit(jt)}>Edit</Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onDelete(jt.id)}
                >
                  Delete
                </Button>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
