"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient } from "../apiClient";

let _draining = false;

async function replayOp(op) {
  switch (op.type) {
    case "goal.update":
      return apiClient.patch(`/workspaces/${op.workspaceId}/goals/${op.goalId}`, op.patch);
    case "goal.delete":
      return apiClient.delete(`/workspaces/${op.workspaceId}/goals/${op.goalId}`);
    case "actionItem.update":
      return apiClient.patch(`/workspaces/${op.workspaceId}/action-items/${op.itemId}`, op.patch);
    case "actionItem.delete":
      return apiClient.delete(`/workspaces/${op.workspaceId}/action-items/${op.itemId}`);
    case "actionItem.reorder":
      return apiClient.patch(`/workspaces/${op.workspaceId}/action-items/reorder`, { items: op.updates });
    default:
      return;
  }
}

export const useOfflineQueueStore = create(
  persist(
    (set, get) => ({
      queue: [],

      enqueue(op) {
        const entry = {
          ...op,
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          enqueuedAt: new Date().toISOString(),
        };
        set((s) => ({ queue: [...s.queue, entry] }));
      },

      remove(id) {
        set((s) => ({ queue: s.queue.filter((q) => q.id !== id) }));
      },

      async drain() {
        if (_draining) return;
        _draining = true;
        try {
          const ops = [...get().queue];
          for (const op of ops) {
            try {
              await replayOp(op);
              get().remove(op.id);
            } catch (err) {
              if (!err.response) break; // still offline — stop
              get().remove(op.id);     // server error — discard, don't loop
            }
          }
        } finally {
          _draining = false;
        }
      },

      clear() {
        set({ queue: [] });
      },
    }),
    { name: "collab-offline-queue" }
  )
);
