"use client";

import { useState } from "react";
import type { Department } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  departments: Department[];
  onCreate: (name: string) => Promise<void>;
  onUpdate: (id: number, name: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function DepartmentManager({
  departments,
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

  function startEdit(dept: Department) {
    setEditingId(dept.id);
    setEditingName(dept.name);
  }

  async function handleSave(id: number) {
    await onUpdate(id, editingName);
    setEditingId(null);
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Departments</h2>

      <form onSubmit={handleCreate} className="flex gap-2">
        <Input
          type="text"
          placeholder="New department"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          aria-label="New department"
        />
        <Button type="submit" size="sm">Add</Button>
      </form>

      <ul className="divide-y">
        {departments.map((dept) => (
          <li key={dept.id} className="flex items-center gap-2 py-2">
            {editingId === dept.id ? (
              <>
                <Input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  aria-label="Edit department"
                  className="flex-1"
                />
                <Button size="sm" onClick={() => handleSave(dept.id)}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm">{dept.name}</span>
                <Button size="sm" variant="outline" onClick={() => startEdit(dept)}>Edit</Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onDelete(dept.id)}
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
