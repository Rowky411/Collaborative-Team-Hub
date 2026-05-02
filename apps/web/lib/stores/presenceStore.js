"use client";

import { create } from "zustand";

export const usePresenceStore = create((set) => ({
  onlineUserIds: new Set(),

  setOnline(userId) {
    set((state) => {
      if (state.onlineUserIds.has(userId)) return state;
      const next = new Set(state.onlineUserIds);
      next.add(userId);
      return { onlineUserIds: next };
    });
  },

  setOffline(userId) {
    set((state) => {
      if (!state.onlineUserIds.has(userId)) return state;
      const next = new Set(state.onlineUserIds);
      next.delete(userId);
      return { onlineUserIds: next };
    });
  },

  setSnapshot(userIds) {
    set({ onlineUserIds: new Set(userIds) });
  },

  clear() {
    set({ onlineUserIds: new Set() });
  },
}));
