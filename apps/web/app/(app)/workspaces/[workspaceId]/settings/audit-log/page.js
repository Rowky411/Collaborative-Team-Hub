"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "../../../../../../lib/apiClient";
import { useWorkspaceStore } from "../../../../../../lib/stores/workspaceStore";
import { AuditLogFilters } from "../../../../../../components/audit-log/AuditLogFilters";
import { AuditLogTimeline } from "../../../../../../components/audit-log/AuditLogTimeline";

const EMPTY_FILTERS = { entityType: "", actorId: "", from: "", to: "" };
const LIMIT = 100;

export default function AuditLogPage() {
  const { workspaceId } = useParams();
  const router = useRouter();
  const workspace = useWorkspaceStore((s) => s.currentWorkspace);
  const members = useWorkspaceStore((s) => s.members);

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [exportBusy, setExportBusy] = useState(false);

  // Redirect non-admins
  useEffect(() => {
    if (workspace && workspace.role !== "ADMIN") {
      router.replace(`/workspaces/${workspaceId}/settings`);
    }
  }, [workspace, workspaceId, router]);

  const fetchLogs = useCallback(async (currentFilters, currentPage) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage, limit: LIMIT });
      if (currentFilters.entityType) params.set("entityType", currentFilters.entityType);
      if (currentFilters.actorId) params.set("actorId", currentFilters.actorId);
      if (currentFilters.from) params.set("from", currentFilters.from);
      if (currentFilters.to) params.set("to", currentFilters.to);
      const { data } = await apiClient.get(`/workspaces/${workspaceId}/audit-log?${params}`);
      if (currentPage === 1) {
        setItems(data.data);
      } else {
        setItems((prev) => [...prev, ...data.data]);
      }
      setTotal(data.meta.total);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    setPage(1);
    setItems([]);
    setSelectedEntry(null);
    fetchLogs(filters, 1);
  }, [filters, fetchLogs]);

  async function handleLoadMore() {
    const next = page + 1;
    setPage(next);
    await fetchLogs(filters, next);
  }

  async function handleExport() {
    setExportBusy(true);
    try {
      const params = new URLSearchParams();
      if (filters.entityType) params.set("entityType", filters.entityType);
      if (filters.actorId) params.set("actorId", filters.actorId);
      if (filters.from) params.set("from", filters.from);
      if (filters.to) params.set("to", filters.to);
      const response = await apiClient.get(
        `/workspaces/${workspaceId}/audit-log/export?${params}`,
        { responseType: "blob" }
      );
      const url = URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExportBusy(false);
    }
  }

  const hasMore = items.length < total;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── Top bar: count + export ─────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <p style={{ fontSize: 12, color: "var(--muted)" }}>
          {loading && items.length === 0
            ? "Loading…"
            : `${total.toLocaleString()} ${total === 1 ? "entry" : "entries"} · admin only`}
        </p>
        <button
          onClick={handleExport}
          disabled={exportBusy}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 14px", borderRadius: 9,
            border: "1px solid var(--border)",
            background: "var(--card)",
            color: "var(--text)",
            fontSize: 12, fontWeight: 600, cursor: "pointer",
            opacity: exportBusy ? 0.6 : 1,
            transition: "background 0.12s",
          }}
          className="hover:bg-[color:var(--border)]"
        >
          ↓ Export CSV
        </button>
      </div>

      {/* ── Filters row ─────────────────────────────────────────── */}
      <AuditLogFilters
        filters={filters}
        members={members}
        onChange={(f) => setFilters(f)}
        onReset={() => setFilters(EMPTY_FILTERS)}
      />

      {/* ── Log entries card ────────────────────────────────────── */}
      <div style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        overflow: "hidden",
      }}>
        <AuditLogTimeline
          items={items}
          selectedId={selectedEntry?.id}
          onSelect={setSelectedEntry}
          loading={loading && page === 1}
        />

        {/* Load more */}
        {hasMore && !loading && (
          <div style={{ borderTop: "1px solid var(--border)", padding: "11px 18px" }}>
            <button
              onClick={handleLoadMore}
              style={{
                fontSize: 12, fontWeight: 600,
                color: "var(--accent, #7c5cfc)",
                background: "none", border: "none",
                cursor: "pointer", padding: 0,
              }}
            >
              Load more ({total - items.length} remaining)
            </button>
          </div>
        )}

        {/* Inline load more spinner */}
        {loading && page > 1 && (
          <div style={{ padding: "12px 18px", borderTop: "1px solid var(--border)" }}>
            <p style={{ fontSize: 12, color: "var(--muted)" }}>Loading…</p>
          </div>
        )}
      </div>

      {/* ── Diff detail panel ───────────────────────────────────── */}
      {selectedEntry && selectedEntry.diff && Object.keys(selectedEntry.diff).length > 0 && (
        <div style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "16px 18px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
              {selectedEntry.actor?.name ?? selectedEntry.actorId} · {selectedEntry.action}
            </p>
            <button
              onClick={() => setSelectedEntry(null)}
              style={{
                fontSize: 11, color: "var(--muted)",
                background: "none", border: "none", cursor: "pointer",
              }}
            >
              ✕ close
            </button>
          </div>
          <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>
            Entity: {selectedEntry.entityType}{" "}
            <code style={{ padding: "1px 5px", borderRadius: 4, background: "var(--border)", fontSize: 10 }}>
              {selectedEntry.entityId}
            </code>
          </p>
          <pre style={{
            maxHeight: 220, overflowY: "auto",
            borderRadius: 10, background: "color-mix(in srgb, var(--muted) 8%, transparent)",
            padding: "10px 14px", fontSize: 11, color: "var(--text)",
            lineHeight: 1.6,
          }}>
            {JSON.stringify(selectedEntry.diff, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
