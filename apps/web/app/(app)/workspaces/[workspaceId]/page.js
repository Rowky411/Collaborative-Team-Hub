"use client";

import { useWorkspaceStore } from "../../../../lib/stores/workspaceStore";
import { usePresenceStore } from "../../../../lib/stores/presenceStore";

export default function WorkspaceOverviewPage() {
  const workspace = useWorkspaceStore((s) => s.currentWorkspace);
  const members = useWorkspaceStore((s) => s.members);
  const onlineUserIds = usePresenceStore((s) => s.onlineUserIds);

  if (!workspace) return null;

  return (
    <div>
      <div className="flex items-center gap-3">
        <span
          className="h-4 w-4 rounded-full"
          style={{ backgroundColor: workspace.accentColor }}
        />
        <h1 className="text-2xl font-semibold">{workspace.name}</h1>
        <span className="rounded-full bg-[color:var(--border)]/40 px-2 py-0.5 text-xs">
          {workspace.role}
        </span>
      </div>
      {workspace.description ? (
        <p className="mt-2 text-sm text-[color:var(--muted)]">{workspace.description}</p>
      ) : null}

      <section className="mt-8">
        <h2 className="text-sm font-medium uppercase tracking-wide text-[color:var(--muted)]">
          Members ({members.length})
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {members.map((m) => {
            const online = onlineUserIds.has(m.userId);
            return (
              <li
                key={m.userId}
                className="flex items-center gap-3 rounded-md border border-[color:var(--border)] px-3 py-2"
              >
                <div className="relative h-8 w-8 overflow-hidden rounded-full bg-[color:var(--border)]">
                  {m.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.avatarUrl} alt={m.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-[color:var(--muted)]">
                      {m.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span
                    className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[color:var(--background)] ${
                      online ? "bg-emerald-500" : "bg-[color:var(--muted)]/40"
                    }`}
                    title={online ? "Online" : "Offline"}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{m.name}</p>
                  <p className="truncate text-xs text-[color:var(--muted)]">{m.email}</p>
                </div>
                <span className="text-xs text-[color:var(--muted)]">{m.role}</span>
              </li>
            );
          })}
        </ul>
      </section>

    </div>
  );
}
