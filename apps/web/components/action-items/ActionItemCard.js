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

export function ActionItemCard({ item, index, onView, onEdit }) {
  const overdue = isOverdue(item.dueDate) && item.status !== "DONE";

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onView?.(item)}
          className="group relative"
          style={{
            background: "var(--card)",
            borderRadius: 12,
            padding: "12px 14px",
            userSelect: "none",
            cursor: snapshot.isDragging ? "grabbing" : "pointer",
            // Only apply visual transitions when NOT dragging — avoids lag
            ...(snapshot.isDragging
              ? {
                  border: "1px solid color-mix(in srgb, var(--accent) 50%, transparent)",
                  boxShadow: "0 12px 32px rgba(0,0,0,0.2)",
                  opacity: 0.96,
                }
              : {
                  border: "1px solid var(--border)",
                  boxShadow: "none",
                  transition: "border-color 0.12s, box-shadow 0.12s",
                }),
            ...provided.draggableProps.style,
          }}
        >
          {/* Edit button — shown on hover */}
          <button
            onClick={(e) => { e.stopPropagation(); onEdit?.(item); }}
            title="Edit"
            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "var(--card)",
              color: "var(--muted)",
              cursor: "pointer",
              fontSize: 11,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}
          >
            ✏
          </button>

          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", lineHeight: 1.45, marginBottom: 6, paddingRight: 24, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
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
              {item.attachments?.length > 0 && (
                <span style={{ fontSize: 10, color: "var(--muted)" }} title={`${item.attachments.length} attachment${item.attachments.length !== 1 ? "s" : ""}`}>
                  📎 {item.attachments.length}
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
