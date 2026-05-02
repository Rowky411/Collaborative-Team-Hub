"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "../../../../../lib/apiClient";
import { useWorkspaceStore } from "../../../../../lib/stores/workspaceStore";
import { GoalCompletionChart } from "../../../../../components/analytics/GoalCompletionChart";
import { ExportButton } from "../../../../../components/analytics/ExportButton";

const STAT_ICONS = {
  totalGoals: "◎",
  actionItemsCompletedThisWeek: "✓",
  overdueCount: "⚠",
  activeMembers: "◉",
  totalActionItems: "◻",
  completedThisWeek: "★",
};

function StatCard({ icon, label, value, color }) {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 18, color: "var(--muted)" }}>{icon}</span>
      </div>
      <div>
        <p style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1, color: color || "var(--text)" }}>
          {value ?? "—"}
        </p>
        <p style={{ marginTop: 4, fontSize: 12, color: "var(--muted)" }}>{label}</p>
      </div>
    </div>
  );
}

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

  const primaryStats = summary
    ? [
        { key: "totalGoals", label: "Total Goals", value: summary.totalGoals },
        { key: "actionItemsCompletedThisWeek", label: "Items Completed This Week", value: summary.actionItemsCompletedThisWeek },
        { key: "overdueCount", label: "Overdue Goals", value: summary.overdueCount },
        { key: "activeMembers", label: "Active Members", value: summary.activeMembers },
        { key: "totalActionItems", label: "Total Action Items", value: summary.totalActionItems },
        { key: "completedThisWeek", label: "Goals Completed This Week", value: summary.completedThisWeek },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>Dashboard</div>
        {isAdmin && <ExportButton workspaceId={workspaceId} />}
      </div>

      {error && (
        <div style={{ borderRadius: 12, padding: "12px 16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", fontSize: 13, color: "var(--red)" }}>
          {error}
        </div>
      )}

      {/* Stats grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ height: 110, borderRadius: 14, background: "var(--card)", border: "1px solid var(--border)" }} className="animate-pulse" />
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
          {primaryStats.map((s) => (
            <StatCard
              key={s.key}
              icon={STAT_ICONS[s.key] || "◉"}
              label={s.label}
              value={s.value}
              color={s.key === "totalGoals" || s.key === "completedThisWeek" ? accentColor : s.key === "overdueCount" ? "var(--red)" : undefined}
            />
          ))}
        </div>
      )}

      {/* Chart */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "20px 22px",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 18 }}>
          Goal Completion — Last 12 Weeks
        </div>
        {loading ? (
          <div style={{ height: 200, borderRadius: 10, background: "var(--subtle)" }} className="animate-pulse" />
        ) : (
          <GoalCompletionChart data={chartData} accentColor={accentColor} />
        )}
      </div>
    </div>
  );
}
