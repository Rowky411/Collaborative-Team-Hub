"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "../../../../../lib/apiClient";
import { useWorkspaceStore } from "../../../../../lib/stores/workspaceStore";
import { StatCard } from "../../../../../components/analytics/StatCard";
import { GoalCompletionChart } from "../../../../../components/analytics/GoalCompletionChart";
import { ExportButton } from "../../../../../components/analytics/ExportButton";

export default function DashboardPage() {
  const { workspaceId } = useParams();
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const isAdmin = currentWorkspace?.role === "ADMIN";

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
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        {isAdmin && <ExportButton workspaceId={workspaceId} />}
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Stat cards */}
      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">
          Overview
        </h2>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl border border-[color:var(--border)] bg-[color:var(--border)]/20" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon="🎯"
              label="Total Goals"
              value={summary?.totalGoals}
              accent
            />
            <StatCard
              icon="✅"
              label="Items Completed This Week"
              value={summary?.actionItemsCompletedThisWeek}
              sub="action items"
            />
            <StatCard
              icon="⚠️"
              label="Overdue Goals"
              value={summary?.overdueCount}
            />
            <StatCard
              icon="👥"
              label="Active Members"
              value={summary?.activeMembers}
              sub="past 7 days"
            />
          </div>
        )}
      </section>

      {/* Secondary stats row */}
      {!loading && summary && (
        <section>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              icon="📋"
              label="Total Action Items"
              value={summary.totalActionItems}
            />
            <StatCard
              icon="🏆"
              label="Goals Completed This Week"
              value={summary.completedThisWeek}
              sub="goals"
              accent
            />
          </div>
        </section>
      )}

      {/* Goal completion chart */}
      <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] p-5 shadow-sm">
        <h2 className="mb-6 text-sm font-semibold">Goal Completion — Last 12 Weeks</h2>
        {loading ? (
          <div className="h-64 animate-pulse rounded-xl bg-[color:var(--border)]/20" />
        ) : (
          <GoalCompletionChart
            data={chartData}
            accentColor={currentWorkspace?.accentColor ?? "#6366f1"}
          />
        )}
      </section>
    </div>
  );
}
