"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useWorkspaceStore } from "../../../../lib/stores/workspaceStore";
import { usePresenceStore } from "../../../../lib/stores/presenceStore";
import { useGoalStore } from "../../../../lib/stores/goalStore";
import { useActionItemStore } from "../../../../lib/stores/actionItemStore";
import { getSocket } from "../../../../lib/socket";
import { WorkspaceSwitcher } from "../../../../components/workspace/WorkspaceSwitcher";

const NAV = [
  { href: "", label: "Overview" },
  { href: "/goals", label: "Goals" },
  { href: "/announcements", label: "Announcements", disabled: true },
  { href: "/action-items", label: "Action items" },
  { href: "/settings", label: "Settings" },
];

export default function WorkspaceShellLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { workspaceId } = useParams();

  const workspace = useWorkspaceStore((s) => s.currentWorkspace);
  const loading = useWorkspaceStore((s) => s.loading);
  const error = useWorkspaceStore((s) => s.error);
  const loadWorkspace = useWorkspaceStore((s) => s.loadWorkspace);
  const fetchWorkspaces = useWorkspaceStore((s) => s.fetchWorkspaces);
  const reset = useWorkspaceStore((s) => s.reset);
  const applyMemberAdded = useWorkspaceStore((s) => s.applyMemberAdded);
  const applyMemberRemoved = useWorkspaceStore((s) => s.applyMemberRemoved);
  const applyWorkspaceUpdated = useWorkspaceStore((s) => s.applyWorkspaceUpdated);

  const applyGoalCreated = useGoalStore((s) => s.applyGoalCreated);
  const applyGoalUpdated = useGoalStore((s) => s.applyGoalUpdated);
  const applyGoalDeleted = useGoalStore((s) => s.applyGoalDeleted);
  const applyUpdatePosted = useGoalStore((s) => s.applyUpdatePosted);

  const applyItemCreated = useActionItemStore((s) => s.applyItemCreated);
  const applyStatusChanged = useActionItemStore((s) => s.applyStatusChanged);
  const applyItemUpdated = useActionItemStore((s) => s.applyItemUpdated);
  const applyItemDeleted = useActionItemStore((s) => s.applyItemDeleted);

  const setOnline = usePresenceStore((s) => s.setOnline);
  const setOffline = usePresenceStore((s) => s.setOffline);
  const setSnapshot = usePresenceStore((s) => s.setSnapshot);
  const clearPresence = usePresenceStore((s) => s.clear);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  useEffect(() => {
    if (!workspaceId) return;
    let cancelled = false;
    loadWorkspace(workspaceId).catch((err) => {
      if (cancelled) return;
      if (err?.response?.status === 403 || err?.response?.status === 404) {
        router.replace("/workspaces");
      }
    });
    return () => {
      cancelled = true;
      clearPresence();
      reset();
    };
  }, [workspaceId, loadWorkspace, reset, clearPresence, router]);

  useEffect(() => {
    if (!workspaceId) return;
    const socket = getSocket();

    const onMemberAdded = ({ member }) => applyMemberAdded(member);
    const onMemberRemoved = ({ userId }) => applyMemberRemoved(userId);
    const onWorkspaceUpdated = ({ workspace: ws }) => applyWorkspaceUpdated(ws);
    const onPresenceOnline = ({ userId }) => setOnline(userId);
    const onPresenceOffline = ({ userId }) => setOffline(userId);
    const onPresenceSnapshot = ({ workspaceId: wid, onlineUserIds }) => {
      if (wid === workspaceId) setSnapshot(onlineUserIds);
    };

    const onGoalCreated = ({ goal }) => applyGoalCreated(goal);
    const onGoalUpdated = ({ goal }) => applyGoalUpdated(goal);
    const onGoalDeleted = ({ goalId }) => applyGoalDeleted(goalId);
    const onUpdatePosted = ({ update }) => applyUpdatePosted(update);

    const onItemCreated = ({ actionItem }) => applyItemCreated(actionItem);
    const onStatusChanged = (data) => applyStatusChanged(data);
    const onItemUpdated = ({ actionItem }) => applyItemUpdated(actionItem);
    const onItemDeleted = ({ id }) => applyItemDeleted(id);

    socket.on("workspace:member_added", onMemberAdded);
    socket.on("workspace:member_removed", onMemberRemoved);
    socket.on("workspace:updated", onWorkspaceUpdated);
    socket.on("presence:online", onPresenceOnline);
    socket.on("presence:offline", onPresenceOffline);
    socket.on("presence:snapshot", onPresenceSnapshot);
    socket.on("goal:created", onGoalCreated);
    socket.on("goal:updated", onGoalUpdated);
    socket.on("goal:deleted", onGoalDeleted);
    socket.on("goal:update_posted", onUpdatePosted);
    socket.on("actionItem:created", onItemCreated);
    socket.on("actionItem:statusChanged", onStatusChanged);
    socket.on("actionItem:updated", onItemUpdated);
    socket.on("actionItem:deleted", onItemDeleted);

    const join = () => socket.emit("workspace:join", workspaceId);
    if (socket.connected) join();
    socket.on("connect", join);

    return () => {
      socket.emit("workspace:leave", workspaceId);
      socket.off("workspace:member_added", onMemberAdded);
      socket.off("workspace:member_removed", onMemberRemoved);
      socket.off("workspace:updated", onWorkspaceUpdated);
      socket.off("presence:online", onPresenceOnline);
      socket.off("presence:offline", onPresenceOffline);
      socket.off("presence:snapshot", onPresenceSnapshot);
      socket.off("goal:created", onGoalCreated);
      socket.off("goal:updated", onGoalUpdated);
      socket.off("goal:deleted", onGoalDeleted);
      socket.off("goal:update_posted", onUpdatePosted);
      socket.off("actionItem:created", onItemCreated);
      socket.off("actionItem:statusChanged", onStatusChanged);
      socket.off("actionItem:updated", onItemUpdated);
      socket.off("actionItem:deleted", onItemDeleted);
      socket.off("connect", join);
    };
  }, [
    workspaceId,
    applyMemberAdded,
    applyMemberRemoved,
    applyWorkspaceUpdated,
    setOnline,
    setOffline,
    setSnapshot,
    applyGoalCreated,
    applyGoalUpdated,
    applyGoalDeleted,
    applyUpdatePosted,
    applyItemCreated,
    applyStatusChanged,
    applyItemUpdated,
    applyItemDeleted,
  ]);

  if (loading && !workspace) {
    return <p className="text-sm text-[color:var(--muted)]">Loading workspace…</p>;
  }
  if (error && !workspace) {
    return <p className="text-sm text-red-600">{error}</p>;
  }
  if (!workspace) return null;

  const accentStyle = { "--accent": workspace.accentColor };
  const base = `/workspaces/${workspaceId}`;

  return (
    <div className="grid gap-6 md:grid-cols-[240px_1fr]" style={accentStyle}>
      <aside className="flex flex-col gap-4">
        <WorkspaceSwitcher currentId={workspaceId} />
        <nav className="flex flex-col gap-1 text-sm">
          {NAV.map((item) => {
            const href = `${base}${item.href}`;
            const isActive =
              item.href === ""
                ? pathname === base
                : pathname.startsWith(href);
            const cls = `rounded-md px-3 py-2 transition ${
              isActive
                ? "bg-[color:var(--accent)]/10 text-[color:var(--accent)] font-medium"
                : "text-[color:var(--foreground)] hover:bg-[color:var(--border)]/30"
            } ${item.disabled ? "cursor-not-allowed opacity-40" : ""}`;
            if (item.disabled) {
              return (
                <span key={item.label} className={cls}>
                  {item.label}
                </span>
              );
            }
            return (
              <Link key={item.label} href={href} className={cls}>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main>{children}</main>
    </div>
  );
}
