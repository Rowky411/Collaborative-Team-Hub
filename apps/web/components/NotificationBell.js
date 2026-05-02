"use client";

import { useEffect, useRef, useState } from "react";
import { useNotificationStore } from "../lib/stores/notificationStore";

const TYPE_LABELS = {
  MENTION: "mentioned you",
  WORKSPACE_INVITE: "invited you to a workspace",
  GOAL_STATUS_CHANGE: "updated a goal status",
};

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function NotificationBell() {
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount   = useNotificationStore((s) => s.unreadCount);
  const markRead      = useNotificationStore((s) => s.markRead);
  const markAllRead   = useNotificationStore((s) => s.markAllRead);

  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--muted)] hover:bg-[color:var(--border)]/40 transition"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-strong)",
            borderRadius: 14,
            boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
          }}
          className="absolute right-0 top-10 z-50 w-80 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[color:var(--border)] px-4 py-3">
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-[color:var(--accent)] hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[color:var(--border)]">
            {notifications.length === 0 && (
              <p className="px-4 py-6 text-center text-sm" style={{ color: "var(--muted)" }}>
                No notifications yet
              </p>
            )}
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => { if (!n.isRead) markRead(n.id); }}
                className="w-full flex items-start gap-3 px-4 py-3 text-left transition hover:bg-[color:var(--border)]/20"
                style={!n.isRead ? { background: "color-mix(in srgb, var(--accent) 5%, transparent)" } : {}}
              >
                <span className="mt-0.5 text-base">
                  {n.type === "MENTION" ? "💬" : n.type === "WORKSPACE_INVITE" ? "✉️" : "🎯"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: "var(--text)" }}>
                    {TYPE_LABELS[n.type] || n.type}
                  </p>
                  <p className="text-xs text-[color:var(--muted)]">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.isRead && (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[color:var(--accent)]" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
