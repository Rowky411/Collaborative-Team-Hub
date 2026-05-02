"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useWorkspaceStore } from "../../../lib/stores/workspaceStore";
import { useAuthStore } from "../../../lib/stores/authStore";
import { CreateWorkspaceModal } from "../../../components/workspace/CreateWorkspaceModal";
import { Avatar, Badge, ProgressBar } from "../../../components/ui/flux";

export default function WorkspacesPage() {
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const loading = useWorkspaceStore((s) => s.loading);
  const error = useWorkspaceStore((s) => s.error);
  const fetchWorkspaces = useWorkspaceStore((s) => s.fetchWorkspaces);
  const user = useAuthStore((s) => s.user);
  const [showCreate, setShowCreate] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 5) return "Working late";
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const firstName = (user?.name || "there").split(" ")[0];

  const filtered = workspaces.filter((w) =>
    w.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="flex-1 flex justify-center overflow-auto" style={{ padding: "40px 24px" }}>
      <div className="w-full" style={{ maxWidth: 680 }}>
        {/* Greeting */}
        <div className="mb-9 text-center">
          <div
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: "var(--text)",
              letterSpacing: "-0.035em",
              marginBottom: 8,
            }}
          >
            {greeting}, {firstName} <span style={{ color: "var(--purple)" }}>✦</span>
          </div>
          <div style={{ fontSize: 14, color: "var(--muted)" }}>
            Jump back into where you left off
          </div>
        </div>

        {/* Search */}
        <div
          className="flex items-center gap-2.5 mb-5"
          style={{
            padding: "11px 16px",
            borderRadius: 12,
            background: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--muted)",
            fontSize: 14,
          }}
        >
          <span style={{ fontSize: 16, opacity: 0.5 }}>⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or create a workspace…"
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: 13, color: "var(--text)" }}
          />
          <kbd
            className="font-mono"
            style={{
              padding: "2px 6px",
              borderRadius: 5,
              background: "var(--subtle)",
              fontSize: 11,
              color: "var(--muted)",
              border: "1px solid var(--border)",
            }}
          >
            ⌘K
          </kbd>
        </div>

        {error ? (
          <p
            className="mb-3 rounded-md px-3 py-2 text-sm"
            style={{
              border: "1px solid rgba(239,68,68,0.3)",
              background: "rgba(239,68,68,0.08)",
              color: "var(--red)",
            }}
          >
            {error}
          </p>
        ) : null}

        {/* Workspace list */}
        <div className="flex flex-col gap-2">
          {loading && workspaces.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Loading…
            </p>
          ) : filtered.length === 0 && !loading ? (
            <div
              className="rounded-2xl text-center"
              style={{
                border: "1.5px dashed var(--subtle)",
                padding: "32px 24px",
                color: "var(--muted)",
              }}
            >
              <p className="text-sm mb-3">
                {query
                  ? `No workspaces match "${query}"`
                  : "You don't belong to any workspaces yet."}
              </p>
              <button
                onClick={() => setShowCreate(true)}
                className="text-sm font-medium hover:underline"
                style={{ color: "var(--purple)" }}
              >
                Create your first workspace →
              </button>
            </div>
          ) : (
            filtered.map((w, i) => {
              const color = w.accentColor || "#7c5cfc";
              const pct = typeof w.goalCompletionPct === "number" ? w.goalCompletionPct : 0;
              const initials = (w.name || "?")
                .split(" ")
                .map((s) => s[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              return (
                <Link
                  key={w.id}
                  href={`/workspaces/${w.id}`}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  className="flex items-center gap-4"
                  style={{
                    padding: "16px 20px",
                    borderRadius: 14,
                    background: hovered === i ? "var(--card-hover)" : "var(--card)",
                    border: `1px solid ${hovered === i ? color + "44" : "var(--border)"}`,
                    transition: "all 0.15s",
                    boxShadow:
                      hovered === i
                        ? `0 4px 18px rgba(0,0,0,0.07), 0 0 0 1px ${color}22`
                        : "none",
                  }}
                >
                  {/* Icon */}
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 13,
                      background: color + "22",
                      border: `1.5px solid ${color}40`,
                      fontSize: 18,
                      fontWeight: 800,
                      color,
                    }}
                  >
                    {initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "var(--text)",
                          letterSpacing: "-0.015em",
                        }}
                      >
                        {w.name}
                      </div>
                      <Badge label={w.role} color={color} />
                    </div>
                    {w.description ? (
                      <div
                        className="line-clamp-1"
                        style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}
                      >
                        {w.description}
                      </div>
                    ) : null}
                    <div className="flex items-center gap-2.5">
                      <div className="flex-1" style={{ maxWidth: 200 }}>
                        <ProgressBar pct={pct} height={3} color={color} />
                      </div>
                      <span
                        className="font-mono"
                        style={{ fontSize: 11, color: "var(--muted)", flexShrink: 0 }}
                      >
                        {Math.round(pct)}% goals
                      </span>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>
                      {w.memberCount} {w.memberCount === 1 ? "member" : "members"}
                    </span>
                    <div className="flex">
                      {Array.from({ length: Math.min(w.memberCount || 0, 3) }).map((_, j) => (
                        <Avatar
                          key={j}
                          name={String.fromCharCode(65 + j)}
                          size={20}
                          style={{ marginLeft: j > 0 ? -6 : 0, border: "1.5px solid var(--card)" }}
                        />
                      ))}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 18,
                      color: "var(--muted)",
                      transition: "transform 0.15s",
                      transform: hovered === i ? "translateX(2px)" : "none",
                    }}
                  >
                    ›
                  </span>
                </Link>
              );
            })
          )}

          {/* Create new */}
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-4 text-left"
            style={{
              border: "1.5px dashed var(--subtle)",
              borderRadius: 14,
              padding: "16px 20px",
              background: "transparent",
              color: "var(--muted)",
              fontSize: 13,
              cursor: "pointer",
              transition: "border-color 0.15s",
            }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: 44,
                height: 44,
                borderRadius: 13,
                border: "1.5px dashed var(--subtle)",
                fontSize: 22,
                fontWeight: 300,
                color: "var(--muted)",
              }}
            >
              +
            </div>
            <span style={{ fontWeight: 500 }}>Create a new workspace</span>
          </button>
        </div>
      </div>

      <CreateWorkspaceModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
