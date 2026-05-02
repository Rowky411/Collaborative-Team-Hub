"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, StatusBadge } from "../ui/flux";
import { usePresenceStore } from "../../lib/stores/presenceStore";
import { useWorkspaceStore } from "../../lib/stores/workspaceStore";

const TABS = [
  { href: "", icon: "⊞", label: "Overview", exact: true },
  { href: "/dashboard", icon: "◉", label: "Dashboard" },
  { href: "/goals", icon: "◎", label: "Goals" },
  { href: "/announcements", icon: "◈", label: "Announcements" },
  { href: "/action-items", icon: "◻", label: "Action Items" },
  { href: "/settings", icon: "⊛", label: "Settings", exact: true },
  { href: "/settings/audit-log", icon: "◑", label: "Audit Log", adminOnly: true },
];

export function WorkspaceCover({ workspace }) {
  const pathname = usePathname();
  const onlineSet = usePresenceStore((s) => s.onlineUserIds);
  const members = useWorkspaceStore((s) => s.members);
  if (!workspace) return null;

  const wsColor = workspace.accentColor || "#7c5cfc";
  const base = `/workspaces/${workspace.id}`;
  const isAdmin = workspace.role === "ADMIN";

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${wsColor}22 0%, ${wsColor}08 60%, transparent 100%)`,
        borderBottom: `1px solid ${wsColor}28`,
        flexShrink: 0,
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between" style={{ padding: "18px 28px 0" }}>
        <div className="flex items-center gap-3.5">
          <div
            className="flex items-center justify-center text-white"
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              background: wsColor,
              fontSize: 20,
              fontWeight: 800,
              boxShadow: `0 4px 18px ${wsColor}50`,
            }}
          >
            {(workspace.name || "?")[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.025em" }}>
                {workspace.name}
              </div>
              <StatusBadge status={workspace.role} />
            </div>
            {workspace.description ? (
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                {workspace.description}
              </div>
            ) : null}
          </div>
        </div>

        {/* Member stack */}
        <div className="flex items-center gap-2.5">
          <div className="flex">
            {members.slice(0, 4).map((m, i) => {
              const userId = m.userId || m.user?.id || m.id;
              const name = m.user?.name || m.name || "?";
              const online = onlineSet?.has?.(userId);
              return (
                <div
                  key={userId || i}
                  className="relative"
                  style={{ marginLeft: i > 0 ? -8 : 0, zIndex: 4 - i }}
                >
                  <Avatar
                    name={name}
                    size={28}
                    style={{ border: "2px solid var(--bg)" }}
                  />
                  {online ? (
                    <span
                      style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "var(--green)",
                        border: "1.5px solid var(--bg)",
                      }}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>
            {members.length} {members.length === 1 ? "member" : "members"}
          </span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex" style={{ padding: "12px 20px 0", marginTop: 4 }}>
        {TABS.filter((tab) => !tab.adminOnly || isAdmin).map((tab) => {
          const href = `${base}${tab.href}`;
          const isActive = tab.exact
            ? pathname === href
            : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={tab.href}
              href={href}
              className="flex items-center gap-1.5"
              style={{
                padding: "7px 14px",
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? wsColor : "var(--muted)",
                borderBottom: isActive ? `2px solid ${wsColor}` : "2px solid transparent",
                transition: "all 0.15s",
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
