"use client";

import { useState } from "react";
import { PriorityBadge } from "./PriorityBadge";

const STATUS_LABELS = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

const STATUS_CLS = {
  TODO:        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  IN_PROGRESS: "bg-blue-100  text-blue-700  dark:bg-blue-900/40 dark:text-blue-300",
  IN_REVIEW:   "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  DONE:        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
};

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function Th({ children, onClick, sorted }) {
  return (
    <th
      onClick={onClick}
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[color:var(--muted)] select-none ${onClick ? "cursor-pointer hover:text-[color:var(--foreground)]" : ""}`}
    >
      {children}
      {sorted === "asc" && " ↑"}
      {sorted === "desc" && " ↓"}
    </th>
  );
}

export function ActionItemList({ items, onRowClick, onRowEdit }) {
  const [sortKey, setSortKey] = useState("status");
  const [sortDir, setSortDir] = useState("asc");

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = [...items].sort((a, b) => {
    let av = a[sortKey] ?? "";
    let bv = b[sortKey] ?? "";
    if (sortKey === "dueDate") {
      av = av ? new Date(av).getTime() : Infinity;
      bv = bv ? new Date(bv).getTime() : Infinity;
    } else {
      av = String(av).toLowerCase();
      bv = String(bv).toLowerCase();
    }
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-[color:var(--muted)]">
        No action items found.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[color:var(--border)]">
      <table className="w-full text-sm">
        <thead className="border-b border-[color:var(--border)] bg-[color:var(--border)]/20">
          <tr>
            <Th onClick={() => toggleSort("title")} sorted={sortKey === "title" ? sortDir : null}>
              Title
            </Th>
            <Th onClick={() => toggleSort("status")} sorted={sortKey === "status" ? sortDir : null}>
              Status
            </Th>
            <Th onClick={() => toggleSort("priority")} sorted={sortKey === "priority" ? sortDir : null}>
              Priority
            </Th>
            <Th>Assignee</Th>
            <Th>Goal</Th>
            <Th onClick={() => toggleSort("dueDate")} sorted={sortKey === "dueDate" ? sortDir : null}>
              Due
            </Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[color:var(--border)]">
          {sorted.map((item) => {
            const overdue =
              item.dueDate && new Date(item.dueDate) < new Date() && item.status !== "DONE";
            return (
              <tr
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className="group cursor-pointer transition-colors hover:bg-[color:var(--accent)]/5"
              >
                <td className="max-w-xs truncate px-4 py-3 font-medium text-[color:var(--foreground)]">
                  <div className="flex items-center gap-2">
                    <span className="truncate">{item.title}</span>
                    {onRowEdit && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onRowEdit(item); }}
                        className="ml-auto shrink-0 rounded px-1.5 py-0.5 text-xs text-[color:var(--muted)] opacity-0 group-hover:opacity-100 hover:bg-[color:var(--border)] transition"
                        title="Edit"
                      >✏</button>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLS[item.status]}`}>
                    {STATUS_LABELS[item.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={item.priority} />
                </td>
                <td className="px-4 py-3 text-[color:var(--muted)]">
                  {item.assignee?.name ?? "—"}
                </td>
                <td className="max-w-[120px] truncate px-4 py-3 text-[color:var(--muted)]">
                  {item.goal?.title ?? "—"}
                </td>
                <td className={`px-4 py-3 ${overdue ? "font-medium text-red-500" : "text-[color:var(--muted)]"}`}>
                  {overdue ? "⚠ " : ""}{formatDate(item.dueDate)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
