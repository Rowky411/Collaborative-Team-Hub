"use client";

import { Droppable } from "@hello-pangea/dnd";
import { ActionItemCard } from "./ActionItemCard";

const COLUMN_STYLES = {
  TODO:        { label: "To Do",       color: "#8888a0" },
  IN_PROGRESS: { label: "In Progress", color: "#7c5cfc" },
  IN_REVIEW:   { label: "In Review",   color: "#f59e0b" },
  DONE:        { label: "Done",        color: "#22c55e" },
};

export function KanbanColumn({ status, items, onCardClick }) {
  const cfg = COLUMN_STYLES[status] || { label: status, color: "#8888a0" };

  return (
    <div className="flex flex-col gap-3 flex-1" style={{ minWidth: 240 }}>
      {/* Column header */}
      <div className="flex items-center gap-2 px-1">
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.color, display: "inline-block", flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--muted)" }}>
          {cfg.label}
        </span>
        <span
          style={{
            marginLeft: "auto",
            padding: "1px 7px",
            borderRadius: 999,
            background: "color-mix(in srgb, var(--muted) 12%, transparent)",
            fontSize: 11,
            fontWeight: 600,
            color: "var(--muted)",
          }}
        >
          {items.length}
        </span>
      </div>

      {/* Droppable zone */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              borderRadius: 12,
              padding: 8,
              minHeight: 120,
              background: snapshot.isDraggingOver
                ? "color-mix(in srgb, var(--accent) 6%, var(--subtle))"
                : "color-mix(in srgb, var(--muted) 6%, transparent)",
              outline: snapshot.isDraggingOver
                ? "2px solid color-mix(in srgb, var(--accent) 30%, transparent)"
                : "2px solid transparent",
              transition: "background 0.12s, outline 0.12s",
            }}
          >
            {items.map((item, index) => (
              <ActionItemCard
                key={item.id}
                item={item}
                index={index}
                onClick={onCardClick}
              />
            ))}
            {provided.placeholder}

            {items.length === 0 && !snapshot.isDraggingOver && (
              <p style={{ padding: "16px 0", textAlign: "center", fontSize: 11, color: "var(--muted)" }}>
                Drop cards here
              </p>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
