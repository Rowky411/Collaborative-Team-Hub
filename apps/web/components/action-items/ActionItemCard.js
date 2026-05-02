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
        style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover" }}
      />
    );
  }
  return (
    <span
      title={user.name}
      style={{
        display: "inline-flex",
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: "var(--accent, #7c5cfc)",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 9,
        fontWeight: 700,
        color: "#fff",
        flexShrink: 0,
      }}
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
  const overdue = isOverdue(item.dueDate) && item.status !== "DONE";

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick?.(item)}
          style={{
            background: "var(--card)",
            border: `1px solid ${snapshot.isDragging ? "color-mix(in srgb, var(--accent) 40%, transparent)" : "var(--border)"}`,
            borderRadius: 12,
            padding: "12px 14px",
            cursor: "pointer",
            userSelect: "none",
            transform: snapshot.isDragging ? "rotate(1deg)" : "none",
            boxShadow: snapshot.isDragging ? "0 8px 24px rgba(0,0,0,0.15)" : "none",
            transition: "border-color 0.12s, box-shadow 0.12s",
            ...provided.draggableProps.style,
          }}
          className="hover:border-[color:var(--accent)]/30"
        >
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", lineHeight: 1.45, marginBottom: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {item.title}
          </p>

          {item.goal && (
            <p style={{ marginBottom: 8, fontSize: 11, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              ⟶ {item.goal.title}
            </p>
          )}

          <div className="flex items-center justify-between gap-2">
            <PriorityBadge priority={item.priority} />

            <div className="flex items-center gap-2">
              {item.dueDate && (
                <span
                  className="font-mono"
                  style={{
                    fontSize: 10,
                    color: overdue ? "var(--red)" : "var(--muted)",
                    fontWeight: overdue ? 600 : 400,
                  }}
                >
                  {overdue ? "⚠ " : ""}{formatDate(item.dueDate)}
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
