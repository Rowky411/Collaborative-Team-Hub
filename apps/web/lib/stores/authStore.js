"use client";

import { create } from "zustand";
import { apiClient } from "../apiClient";

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  status: "idle", // 'idle' | 'loading' | 'authenticated' | 'unauthenticated'
  error: null,

  async hydrate() {
    if (get().status === "loading") return;
    set({ status: "loading", error: null });
    try {
      const { data } = await apiClient.get("/auth/me");
      set({ user: data.data.user, status: "authenticated" });
    } catch (_err) {
      set({ user: null, status: "unauthenticated" });
    }
  },

  async login({ email, password }) {
    set({ status: "loading", error: null });
    try {
      const { data } = await apiClient.post("/auth/login", { email, password });
      set({ user: data.data.user, accessToken: data.data.accessToken, status: "authenticated" });
      return { ok: true };
    } catch (err) {
      const message = err?.response?.data?.error?.message || "Login failed";
      set({ status: "unauthenticated", error: message });
      return { ok: false, message };
    }
  },

  async register({ email, name, password }) {
    set({ status: "loading", error: null });
    try {
      const { data } = await apiClient.post("/auth/register", { email, name, password });
      set({ user: data.data.user, accessToken: data.data.accessToken, status: "authenticated" });
      return { ok: true };
    } catch (err) {
      const message = err?.response?.data?.error?.message || "Registration failed";
      set({ status: "unauthenticated", error: message });
      return { ok: false, message };
    }
  },

  async logout() {
    try {
      await apiClient.post("/auth/logout");
    } catch (_err) {
      /* ignore */
    }
    set({ user: null, status: "unauthenticated" });
  },

  async updateProfile(patch) {
    const { data } = await apiClient.patch("/auth/profile", patch);
    set({ user: data.data.user });
    return data.data.user;
  },
}));
