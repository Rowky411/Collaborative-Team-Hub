"use client";

import { create } from "zustand";
import { apiClient } from "../apiClient";

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,

  async fetch() {
    try {
      const { data } = await apiClient.get("/notifications");
      set({ notifications: data.data, unreadCount: data.meta.unreadCount });
    } catch (_err) {
      // silent — bell just won't show count
    }
  },

  async markRead(id) {
    await apiClient.patch(`/notifications/${id}/read`);
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }));
  },

  async markAllRead() {
    await apiClient.patch("/notifications/read-all");
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  // Socket handler
  addNotification(notification) {
    set((s) => ({
      notifications: [notification, ...s.notifications].slice(0, 30),
      unreadCount: s.unreadCount + 1,
    }));
  },
}));
