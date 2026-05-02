"use client";

import { Draggable } from "@hello-pangea/dnd";
import { PriorityBadge } from "./PriorityBadge";

function Avatar({ user }) {
  if (!user) return null;
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.name}
        title={user.name}
        className="h-6 w-6 rounded-full object-cover ring-2 ring-white dark:ring-slate-800"
      />
    );
  }
  return (
    <span
      title={user.name}
      className="flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--accent)] text-[10px] font-semibold text-white ring-2 ring-white dark:ring-slate-800"
    >
      {user.name?.[0]?.toUpperCase()}
    </span>
  );
}

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function isOverdue(iso) {
  if (!iso) return false;
  return new Date(iso) < new Date();
}

export function ActionItemCard({ item, index, onClick }) {
  const overdue = isOverdue(item.dueDate);

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick?.(item)}
          className={`
            group cursor-pointer select-none rounded-xl border p-3 shadow-sm transition-all
            bg-[color:var(--background)] border-[color:var(--border)]
            hover:shadow-md hover:border-[color:var(--accent)]/40
            ${snapshot.isDragging ? "rotate-1 shadow-xl opacity-95 ring-2 ring-[color:var(--accent)]/50" : ""}
          `}
        >
          {/* Title */}
          <p className="mb-2 text-sm font-medium leading-snug text-[color:var(--foreground)] line-clamp-2">
            {item.title}
          </p>

          {/* Goal link */}
          {item.goal && (
            <p className="mb-2 truncate text-xs text-[color:var(--muted)]">
              ⟶ {item.goal.title}
            </p>
          )}

          {/* Footer row */}
          <div className="flex items-center justify-between gap-2">
            <PriorityBadge priority={item.priority} />

            <div className="flex items-center gap-2">
              {item.dueDate && (
                <span
                  className={`text-xs ${
                    overdue && item.status !== "DONE"
                      ? "font-medium text-red-500"
                      : "text-[color:var(--muted)]"
                  }`}
                >
                  {overdue && item.status !== "DONE" ? "⚠ " : ""}
                  {formatDate(item.dueDate)}
                </span>
              )}
              <Avatar user={item.assignee} />
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
