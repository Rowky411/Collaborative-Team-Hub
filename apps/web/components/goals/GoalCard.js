"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useGoalStore } from "../../lib/stores/goalStore";
import { StatusBadge, STATUS_OPTIONS } from "./StatusBadge";
import { ProgressRing } from "./ProgressRing";

function avgProgress(milestones) {
  if (!milestones?.length) return 0;
  return Math.round(milestones.reduce((s, m) => s + m.progress, 0) / milestones.length);
}

function OwnerAvatar({ owner, accentColor }) {
  if (!owner) return null;
  if (owner.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={owner.avatarUrl}
        alt={owner.name}
        style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />
    );
  }
  return (
    <span style={{
      width: 22, height: 22, borderRadius: "50%",
      background: accentColor,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0,
    }}>
      {owner.name?.[0]?.toUpperCase()}
    </span>
  );
}

export function GoalCard({ goal, accentColor = "#7c5cfc" }) {
  const { workspaceId } = useParams();
  const router = useRouter();
  const updateGoal = useGoalStore((s) => s.updateGoal);
  const [statusOpen, setStatusOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [hovered, setHovered] = useState(false);

  const progress = avgProgress(goal.milestones);
  const milestoneCount = goal._count?.milestones ?? goal.milestones?.length ?? 0;
  const dueDate = goal.dueDate
    ? new Date(goal.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : null;
  const href = `/workspaces/${workspaceId}/goals/${goal.id}`;

  async function handleStatusChange(e, newStatus) {
    e.preventDefault();
    e.stopPropagation();
    setStatusOpen(false);
    try {
      await updateGoal(workspaceId, goal.id, { status: newStatus });
    } catch {
      setToast("Failed to update status");
      setTimeout(() => setToast(null), 3000);
    }
  }

  function handleStatusToggle(e) {
    e.preventDefault();
    e.stopPropagation();
    setStatusOpen((o) => !o);
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setStatusOpen(false); }}
      onClick={() => router.push(href)}
      style={{
        position: "relative",
        background: "var(--card)",
        border: `1px solid ${hovered ? `color-mix(in srgb, ${accentColor} 45%, transparent)` : "var(--border)"}`,
        borderRadius: 14,
        overflow: "hidden",
        transition: "border-color 0.18s, box-shadow 0.18s, transform 0.18s",
        boxShadow: hovered
          ? `0 8px 28px rgba(0,0,0,0.18), 0 0 0 1px color-mix(in srgb, ${accentColor} 20%, transparent)`
          : "none",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Accent progress bar at top */}
      <div style={{ height: 3, background: "var(--border)", position: "relative" }}>
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: `${Math.max(2, progress)}%`,
          background: accentColor,
          borderRadius: "0 2px 2px 0",
          transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
        }} />
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "absolute", top: 10, right: 10, zIndex: 10,
          borderRadius: 6, background: "#ef4444", padding: "2px 8px", fontSize: 11, color: "#fff",
        }}>
          {toast}
        </div>
      )}

      {/* Card body */}
      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 0, flex: 1 }}>

        {/* Title + description + ring */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: 15, fontWeight: 700, color: "var(--text)",
              letterSpacing: "-0.01em",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              margin: 0,
            }}>
              {goal.title}
            </p>
            {goal.description && (
              <p style={{
                marginTop: 5, fontSize: 12, color: "var(--muted)",
                display: "-webkit-box", WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.5,
              }}>
                {goal.description}
              </p>
            )}
          </div>

          {/* Ring + % number */}
          <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
            <ProgressRing progress={progress} size={44} stroke={3} />
            <span style={{
              fontSize: 22, fontWeight: 800, color: "var(--text)",
              letterSpacing: "-0.04em", lineHeight: 1,
            }}>
              {progress}
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--muted)" }}>%</span>
            </span>
          </div>
        </div>

        {/* Status badge + milestone count */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, position: "relative" }}>
          <div style={{ position: "relative" }}>
            {/* Stop propagation so clicking badge doesn't navigate */}
            <div onClick={handleStatusToggle}>
              <StatusBadge status={goal.status} onClick={handleStatusToggle} />
            </div>
            {statusOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: "absolute", left: 0, top: "calc(100% + 4px)", zIndex: 30,
                  background: "var(--card)", border: "1px solid var(--border)",
                  borderRadius: 10, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                  minWidth: 140,
                }}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={(e) => handleStatusChange(e, opt.value)}
                    style={{
                      display: "block", width: "100%", padding: "8px 14px",
                      textAlign: "left", fontSize: 12, color: "var(--text)",
                      background: "none", border: 0, cursor: "pointer",
                    }}
                    className="hover:bg-[color:var(--border)]"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {milestoneCount > 0 && (
            <span style={{ fontSize: 11, color: "var(--muted)" }}>
              {milestoneCount} milestone{milestoneCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Owner + due date row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
          {goal.owner && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <OwnerAvatar owner={goal.owner} accentColor={accentColor} />
              <span style={{ fontSize: 12, color: "var(--muted)" }}>{goal.owner.name}</span>
            </div>
          )}
          {dueDate && (
            <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: "auto" }}>
              Due {dueDate}
            </span>
          )}
        </div>
      </div>

      {/* Subtle glow overlay on hover */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", borderRadius: 14,
        background: `radial-gradient(ellipse at 30% 0%, ${accentColor}0d 0%, transparent 70%)`,
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.2s",
      }} />
    </div>
  );
}
