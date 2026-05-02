"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useWorkspaceStore } from "../../../lib/stores/workspaceStore";
import { CreateWorkspaceModal } from "../../../components/workspace/CreateWorkspaceModal";
import { PrimaryButton } from "../../../components/ui/FormField";

export default function WorkspacesPage() {
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const loading = useWorkspaceStore((s) => s.loading);
  const error = useWorkspaceStore((s) => s.error);
  const fetchWorkspaces = useWorkspaceStore((s) => s.fetchWorkspaces);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Your workspaces</h1>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Pick a workspace or create a new one
          </p>
        </div>
        <PrimaryButton onClick={() => setShowCreate(true)}>+ New workspace</PrimaryButton>
      </div>

      {error ? (
        <p className="mt-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30">
          {error}
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && workspaces.length === 0 ? (
          <p className="text-sm text-[color:var(--muted)]">Loading…</p>
        ) : workspaces.length === 0 ? (
          <div className="col-span-full rounded-lg border border-dashed border-[color:var(--border)] p-8 text-center">
            <p className="text-sm text-[color:var(--muted)]">
              You don't belong to any workspaces yet.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-3 text-sm font-medium text-[color:var(--accent)] hover:underline"
            >
              Create your first workspace →
            </button>
          </div>
        ) : (
          workspaces.map((w) => (
            <Link
              key={w.id}
              href={`/workspaces/${w.id}`}
              className="group rounded-lg border border-[color:var(--border)] p-4 transition hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: w.accentColor }}
                />
                <h2 className="font-medium group-hover:underline">{w.name}</h2>
                <span className="ml-auto rounded-full bg-[color:var(--border)]/40 px-2 py-0.5 text-xs">
                  {w.role}
                </span>
              </div>
              {w.description ? (
                <p className="mt-2 line-clamp-2 text-sm text-[color:var(--muted)]">
                  {w.description}
                </p>
              ) : null}
              <p className="mt-3 text-xs text-[color:var(--muted)]">
                {w.memberCount} {w.memberCount === 1 ? "member" : "members"}
              </p>
            </Link>
          ))
        )}
      </div>

      <CreateWorkspaceModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </div>
  );
}
