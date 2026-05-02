"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "../../../../../lib/apiClient";
import { useWorkspaceStore } from "../../../../../lib/stores/workspaceStore";
import { GoalCompletionChart } from "../../../../../components/analytics/GoalCompletionChart";
import { ExportButton } from "../../../../../components/analytics/ExportButton";

// ─── StatCard matching screenshot exactly ──────────────────────────────────

function StatCard({ icon, label, value, valueColor, tag, style = {} }) {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "18px 20px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        position: "relative",
        minHeight: 130,
        ...style,
      }}
    >
      {/* Top row: icon left, optional tag right */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
        {tag && (
          <span style={{
            fontSize: 9,
            fontWeight: 600,
            color: "var(--muted)",
            letterSpacing: "0.06em",
            background: "color-mix(in srgb, var(--muted) 12%, transparent)",
            borderRadius: 6,
            padding: "2px 7px",
          }}>
            {tag}
          </span>
        )}
      </div>

      {/* Big number */}
      <p style={{
        fontSize: 36,
        fontWeight: 800,
        letterSpacing: "-0.04em",
        lineHeight: 1,
        color: valueColor || "var(--text)",
        margin: 0,
      }}>
        {value ?? "—"}
      </p>

      {/* Label */}
      <p style={{
        marginTop: 6,
        fontSize: 12,
        color: "var(--muted)",
        fontWeight: 400,
        lineHeight: 1.3,
      }}>
        {label}
      </p>
    </div>
  );
}

// ─── Skeleton card ──────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{
      height: 130, borderRadius: 14,
      background: "var(--card)", border: "1px solid var(--border)", opacity: 0.5,
    }} />
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { workspaceId } = useParams();
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const isAdmin = currentWorkspace?.role === "ADMIN";
  const accentColor = currentWorkspace?.accentColor || "#7c5cfc";

  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    Promise.all([
      apiClient.get(`/workspaces/${workspaceId}/analytics/summary`),
      apiClient.get(`/workspaces/${workspaceId}/analytics/goal-completion`),
    ])
      .then(([s, c]) => {
        setSummary(s.data.data);
        setChartData(c.data.data);
      })
      .catch((err) => setError(err?.response?.data?.error?.message ?? "Failed to load analytics."))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  return (
    <div className="flex flex-col gap-4">

      {/* Section label */}
      <div style={{
        fontSize: 10, fontWeight: 700, color: "var(--muted)",
        letterSpacing: "0.09em", textTransform: "uppercase",
      }}>
        Overview
      </div>

      {error && (
        <div style={{
          borderRadius: 12, padding: "12px 16px",
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
          fontSize: 13, color: "#ef4444",
        }}>
          {error}
        </div>
      )}

      {/* ── Row 1: 4 equal-width stat cards ──────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {loading ? (
          [1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              icon="🎯"
              label="Total Goals"
              value={summary?.totalGoals}
              valueColor={accentColor}
            />
            <StatCard
              icon="✅"
              label="Items Completed This Week"
              value={summary?.actionItemsCompletedThisWeek}
              valueColor="#22c55e"
              tag="action items"
            />
            <StatCard
              icon="⚠️"
              label="Overdue Goals"
              value={summary?.overdueCount}
              valueColor="#f97316"
            />
            <StatCard
              icon="👥"
              label="Active Members"
              value={summary?.activeMembers}
              valueColor="#a78bfa"
              tag="past 7 days"
            />
          </>
        )}
      </div>

      {/* ── Row 2: 2 half-width cards ─────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {loading ? (
          [1, 2].map((i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              icon="📋"
              label="Total Action Items"
              value={summary?.totalActionItems}
              valueColor="var(--text)"
            />
            <StatCard
              icon="🏆"
              label="Goals Completed This Week"
              value={summary?.completedThisWeek}
              valueColor="#f97316"
              tag="goals"
            />
          </>
        )}
      </div>

      {/* ── Chart ─────────────────────────────────────────────────── */}
      <div style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "20px 22px",
      }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 18 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
            Goal Completion — Last 12 Weeks
          </span>
          {isAdmin && <ExportButton workspaceId={workspaceId} />}
        </div>
        {loading ? (
          <div style={{ height: 160, borderRadius: 10, background: "color-mix(in srgb, var(--muted) 10%, transparent)" }} />
        ) : (
          <GoalCompletionChart data={chartData} accentColor={accentColor} />
        )}
      </div>

    </div>
  );
}
