"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../lib/stores/authStore";
import { useTheme } from "../theme/ThemeProvider";
import { useWorkspaceStore } from "../../lib/stores/workspaceStore";
import { usePresenceStore } from "../../lib/stores/presenceStore";
import { Avatar } from "../ui/flux";
import { NotificationBell } from "../NotificationBell";

export function FluxTopNav() {
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const ws = useWorkspaceStore((s) => s.currentWorkspace);
  const onlineCount = usePresenceStore((s) => s.onlineUserIds?.size || 0);

  const [cmdOpen, setCmdOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      } else if (e.key === "Escape") {
        setCmdOpen(false);
        setMenuOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <div
      className="flex items-center gap-3 px-5 flex-shrink-0 relative z-10"
      style={{
        height: 48,
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Logo */}
      <Link href="/workspaces" className="flex items-center gap-2 flex-shrink-0">
        <span
          className="flex items-center justify-center text-white font-extrabold"
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "var(--purple)",
            fontSize: 13,
            letterSpacing: "-0.02em",
          }}
        >
          T
        </span>
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
          Team Hub
        </span>
      </Link>

      {/* Workspace breadcrumb */}
      {ws ? (
        <>
          <span style={{ width: 1, height: 18, background: "var(--border)" }} />
          <span style={{ fontSize: 13, color: "var(--muted)" }}>›</span>
          <Link
            href={`/workspaces/${ws.id}`}
            style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}
          >
            {ws.name}
          </Link>
        </>
      ) : null}

      <div className="flex-1" />


      {/* Online pill */}
      {ws ? (
        <div
          className="flex items-center gap-1.5"
          style={{
            padding: "4px 10px",
            borderRadius: 999,
            background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.16)",
            fontSize: 11,
            color: "var(--green)",
            fontWeight: 600,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)" }} />
          {onlineCount} online
        </div>
      ) : null}

      {/* Notifications */}
      <NotificationBell />

      {/* Theme toggle */}
      <button
        onClick={toggle}
        title="Toggle theme"
        className="flex items-center justify-center"
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          border: "1px solid var(--border)",
          background: "var(--input-bg)",
          color: "var(--muted)",
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        {theme === "dark" ? "☀" : "◑"}
      </button>

      {/* Avatar + menu */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="relative cursor-pointer"
          style={{ background: "none", border: 0, padding: 0 }}
        >
          <Avatar name={user?.name || "?"} size={30} src={user?.avatarUrl || undefined} />
          <span
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--green)",
              border: "2px solid var(--surface)",
            }}
          />
        </button>
        {menuOpen ? (
          <div
            className="fade-in absolute right-0 top-full mt-2 z-50"
            style={{
              width: 200,
              background: "var(--surface)",
              border: "1px solid var(--border-strong)",
              borderRadius: 12,
              boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "10px 14px",
                borderBottom: "1px solid var(--border)",
                fontSize: 12,
                color: "var(--muted)",
              }}
            >
              <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 13 }}>{user?.name}</div>
              <div>{user?.email}</div>
            </div>
            <Link
              href="/profile"
              onClick={() => setMenuOpen(false)}
              className="block hover:bg-[color:var(--card-hover)]"
              style={{ padding: "8px 14px", fontSize: 13, color: "var(--text)" }}
            >
              Profile
            </Link>
            <Link
              href="/workspaces"
              onClick={() => setMenuOpen(false)}
              className="block hover:bg-[color:var(--card-hover)]"
              style={{ padding: "8px 14px", fontSize: 13, color: "var(--text)" }}
            >
              All workspaces
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left hover:bg-[color:var(--card-hover)]"
              style={{
                padding: "8px 14px",
                fontSize: 13,
                color: "var(--text)",
                background: "none",
                border: 0,
                borderTop: "1px solid var(--border)",
                cursor: "pointer",
              }}
            >
              Log out
            </button>
          </div>
        ) : null}
      </div>

      {/* Cmd palette overlay */}
      {cmdOpen ? (
        <div
          onClick={() => setCmdOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: 120,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="fade-in"
            style={{
              width: 560,
              background: "var(--surface)",
              borderRadius: 16,
              border: "1px solid var(--border-strong)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
              overflow: "hidden",
            }}
          >
            <div
              className="flex items-center gap-2.5"
              style={{
                padding: "14px 18px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span style={{ fontSize: 16, color: "var(--muted)" }}>⌕</span>
              <input
                autoFocus
                placeholder="Search goals, announcements, members…"
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: 15,
                  color: "var(--text)",
                }}
              />
              <kbd
                className="font-mono"
                style={{
                  padding: "2px 6px",
                  borderRadius: 5,
                  background: "var(--subtle)",
                  fontSize: 11,
                  color: "var(--muted)",
                }}
              >
                esc
              </kbd>
            </div>
            <div style={{ padding: "32px 18px", textAlign: "center", fontSize: 13, color: "var(--muted)" }}>
              Type to search…
            </div>
            <div
              className="flex gap-3.5"
              style={{ padding: "8px 18px", borderTop: "1px solid var(--border)" }}
            >
              {["↑↓ navigate", "↵ open", "esc close"].map((h, i) => (
                <span key={i} className="font-mono" style={{ fontSize: 10, color: "var(--muted)" }}>
                  {h}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
