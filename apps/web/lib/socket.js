"use client";

import { io } from "socket.io-client";
import { useAuthStore } from "./stores/authStore";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

let socket = null;

export function getSocket() {
  if (socket) return socket;
  const token = useAuthStore.getState().accessToken;
  socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: true,
    transports: ["websocket", "polling"],
    auth: token ? { token } : undefined,
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
