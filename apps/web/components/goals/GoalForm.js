"use client";

import { useState } from "react";
import { Modal } from "../Modal";
import { useWorkspaceStore } from "../../lib/stores/workspaceStore";

const STATUSES = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "OVERDUE"];

export function GoalForm({ open, onClose, onSubmit, initial = {} }) {
  const members = useWorkspaceStore((s) => s.members);
  const [form, setForm] = useState({
    title: initial.title || "",
    description: initial.description || "",
    ownerId: initial.ownerId || "",
    dueDate: initial.dueDate ? initial.dueDate.slice(0, 10) : "",
    status: initial.status || "NOT_STARTED",
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  function set(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return setError("Title required");
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        title: form.title.trim(),
        description: form.description.trim() || null,
        ownerId: form.ownerId || undefined,
        dueDate: form.dueDate || null,
        status: form.status,
      });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error?.message || "Failed to save goal");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={initial.id ? "Edit Goal" : "New Goal"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {error && <p className="text-sm text-red-500">{error}</p>}

        <div>
          <label className="mb-1 block text-xs font-medium">Title *</label>
          <input
            className="w-full rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            maxLength={200}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">Description</label>
          <textarea
            className="w-full rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
            rows={3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium">Owner</label>
            <select
              className="w-full rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-2 text-sm"
              value={form.ownerId}
              onChange={(e) => set("ownerId", e.target.value)}
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>{m.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium">Status</label>
            <select
              className="w-full rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-2 text-sm"
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace("_", " ")}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">Due Date</label>
          <input
            type="date"
            className="w-full rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-2 text-sm"
            value={form.dueDate}
            onChange={(e) => set("dueDate", e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-sm border border-[color:var(--border)]">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-[color:var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : initial.id ? "Save" : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
