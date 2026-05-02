"use client";

import { useEffect, useState } from "react";
import { Modal } from "../Modal";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const STATUSES = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "DONE", label: "Done" },
];

const EMPTY = {
  title: "",
  description: "",
  assigneeId: "",
  priority: "MEDIUM",
  status: "TODO",
  dueDate: "",
  goalId: "",
};

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-[color:var(--muted)]">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-2 text-sm text-[color:var(--foreground)] outline-none focus:ring-2 focus:ring-[color:var(--accent)]/40 transition";

export function CreateActionItemModal({ open, onClose, onSubmit, onDelete, members = [], goals = [], initialItem = null, defaultGoalId = "" }) {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialItem) {
      setForm({
        title: initialItem.title || "",
        description: initialItem.description || "",
        assigneeId: initialItem.assigneeId || "",
        priority: initialItem.priority || "MEDIUM",
        status: initialItem.status || "TODO",
        dueDate: initialItem.dueDate
          ? new Date(initialItem.dueDate).toISOString().slice(0, 10)
          : "",
        goalId: initialItem.goalId || "",
      });
    } else {
      setForm({ ...EMPTY, goalId: defaultGoalId });
    }
    setError("");
  }, [initialItem, open, defaultGoalId]);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        assigneeId: form.assigneeId || undefined,
        priority: form.priority,
        status: form.status,
        dueDate: form.dueDate || undefined,
        goalId: form.goalId || undefined,
      };
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error?.message || "Failed to save action item.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={initialItem ? "Edit Action Item" : "New Action Item"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </p>
        )}

        <Field label="Title *">
          <input
            className={inputCls}
            placeholder="Write a descriptive title…"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            maxLength={200}
            required
          />
        </Field>

        <Field label="Description">
          <textarea
            className={`${inputCls} resize-none`}
            rows={2}
            placeholder="Optional details…"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Priority">
            <select className={inputCls} value={form.priority} onChange={(e) => set("priority", e.target.value)}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p[0] + p.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </Field>

          <Field label="Status">
            <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Assignee">
            <select className={inputCls} value={form.assigneeId} onChange={(e) => set("assigneeId", e.target.value)}>
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>{m.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Due Date">
            <input
              type="date"
              className={inputCls}
              value={form.dueDate}
              onChange={(e) => set("dueDate", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Link to Goal">
          <select className={inputCls} value={form.goalId} onChange={(e) => set("goalId", e.target.value)}>
            <option value="">No goal</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </select>
        </Field>

        <div className="flex items-center justify-between gap-3 pt-2">
          {onDelete && initialItem ? (
            <button
              type="button"
              onClick={() => { onClose(); onDelete(initialItem.id); }}
              className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              Delete
            </button>
          ) : <span />}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[color:var(--border)] px-4 py-2 text-sm text-[color:var(--muted)] hover:bg-[color:var(--border)]/30 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-[color:var(--accent)] px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60 transition"
            >
              {busy ? "Saving…" : initialItem ? "Save Changes" : "Create"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
