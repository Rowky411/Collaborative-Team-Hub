"use client";

import { Droppable } from "@hello-pangea/dnd";
import { ActionItemCard } from "./ActionItemCard";

const COLUMN_STYLES = {
  TODO:        { label: "To Do",      dot: "bg-slate-400" },
  IN_PROGRESS: { label: "In Progress", dot: "bg-blue-500" },
  IN_REVIEW:   { label: "In Review",  dot: "bg-amber-500" },
  DONE:        { label: "Done",       dot: "bg-emerald-500" },
};

export function KanbanColumn({ status, items, onCardClick }) {
  const cfg = COLUMN_STYLES[status];

  return (
    <div className="flex flex-col gap-3 min-w-[240px] flex-1">
      {/* Column header */}
      <div className="flex items-center gap-2 px-1">
        <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
        <span className="text-xs font-semibold uppercase tracking-wider text-[color:var(--muted)]">
          {cfg.label}
        </span>
        <span className="ml-auto rounded-full bg-[color:var(--border)] px-2 py-0.5 text-xs font-medium text-[color:var(--muted)]">
          {items.length}
        </span>
      </div>

      {/* Droppable zone */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              flex flex-col gap-2 rounded-xl p-2 min-h-[120px] transition-colors
              ${snapshot.isDraggingOver
                ? "bg-[color:var(--accent)]/8 ring-2 ring-[color:var(--accent)]/30"
                : "bg-[color:var(--border)]/20"
              }
            `}
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
              <p className="py-4 text-center text-xs text-[color:var(--muted)]">
                Drop cards here
              </p>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
