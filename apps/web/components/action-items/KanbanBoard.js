"use client";

import { DragDropContext } from "@hello-pangea/dnd";
import { KanbanColumn } from "./KanbanColumn";
import { useCallback } from "react";

const STATUSES = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];

export function KanbanBoard({ items, onDragEnd, onCardClick }) {
  const grouped = useCallback(() => {
    const map = Object.fromEntries(STATUSES.map((s) => [s, []]));
    [...items]
      .sort((a, b) => a.position - b.position)
      .forEach((item) => {
        if (map[item.status]) map[item.status].push(item);
      });
    return map;
  }, [items])();

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            items={grouped[status]}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
