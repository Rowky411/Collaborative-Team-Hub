"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useWorkspaceStore } from "../../lib/stores/workspaceStore";

export function WorkspaceSwitcher({ currentId }) {
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = workspaces.find((w) => w.id === currentId);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-[color:var(--border)] px-3 py-2 text-sm hover:bg-[color:var(--border)]/30"
      >
        <span className="flex items-center gap-2 truncate">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: current?.accentColor || "#6366f1" }}
          />
          <span className="truncate font-medium">{current?.name || "Select workspace"}</span>
        </span>
        <span className="text-xs text-[color:var(--muted)]">▾</span>
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-auto rounded-md border border-[color:var(--border)] bg-[color:var(--background)] shadow-lg">
          {workspaces.length === 0 ? (
            <div className="px-3 py-2 text-xs text-[color:var(--muted)]">No workspaces</div>
          ) : (
            workspaces.map((w) => (
              <Link
                key={w.id}
                href={`/workspaces/${w.id}`}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 text-sm hover:bg-[color:var(--border)]/30 ${
                  w.id === currentId ? "bg-[color:var(--border)]/20" : ""
                }`}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: w.accentColor }}
                />
                <span className="truncate">{w.name}</span>
                <span className="ml-auto text-xs text-[color:var(--muted)]">{w.role}</span>
              </Link>
            ))
          )}
          <Link
            href="/workspaces"
            onClick={() => setOpen(false)}
            className="block border-t border-[color:var(--border)] px-3 py-2 text-xs text-[color:var(--muted)] hover:bg-[color:var(--border)]/30"
          >
            ← Back to all workspaces
          </Link>
        </div>
      ) : null}
    </div>
  );
}
