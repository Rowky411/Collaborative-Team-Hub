"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "../../../../../../lib/apiClient";
import { useWorkspaceStore } from "../../../../../../lib/stores/workspaceStore";
import { AuditLogFilters } from "../../../../../../components/audit-log/AuditLogFilters";
import { AuditLogTimeline } from "../../../../../../components/audit-log/AuditLogTimeline";

const EMPTY_FILTERS = { entityType: '', actorId: '', from: '', to: '' };
const LIMIT = 100;

function DiffPanel({ entry, onClose }) {
  if (!entry) return null;
  const hasDiff = entry.diff && Object.keys(entry.diff).length > 0;
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold">
          {entry.actor?.name ?? entry.actorId} · {entry.action}
        </p>
        <button
          onClick={onClose}
          className="text-xs text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition"
        >
          ✕ close
        </button>
      </div>
      <p className="mb-2 text-xs text-[color:var(--muted)]">
        Entity: {entry.entityType} <code className="ml-1 rounded bg-[color:var(--border)]/40 px-1">{entry.entityId}</code>
      </p>
      {hasDiff ? (
        <pre className="max-h-64 overflow-auto rounded-lg bg-[color:var(--border)]/20 p-3 text-xs text-[color:var(--foreground)]">
          {JSON.stringify(entry.diff, null, 2)}
        </pre>
      ) : (
        <p className="text-xs text-[color:var(--muted)]">No diff recorded.</p>
      )}
    </div>
  );
}

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
    if (workspace && workspace.role !== 'ADMIN') {
      router.replace(`/workspaces/${workspaceId}/settings`);
    }
  }, [workspace, workspaceId, router]);

  const fetchLogs = useCallback(async (currentFilters, currentPage) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage, limit: LIMIT });
      if (currentFilters.entityType) params.set('entityType', currentFilters.entityType);
      if (currentFilters.actorId) params.set('actorId', currentFilters.actorId);
      if (currentFilters.from) params.set('from', currentFilters.from);
      if (currentFilters.to) params.set('to', currentFilters.to);

      const { data } = await apiClient.get(
        `/workspaces/${workspaceId}/audit-log?${params}`
      );

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
      if (filters.entityType) params.set('entityType', filters.entityType);
      if (filters.actorId) params.set('actorId', filters.actorId);
      if (filters.from) params.set('from', filters.from);
      if (filters.to) params.set('to', filters.to);

      const response = await apiClient.get(
        `/workspaces/${workspaceId}/audit-log/export?${params}`,
        { responseType: 'blob' }
      );
      const url = URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
      const a = document.createElement('a');
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
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">Audit Log</h1>
          <p className="text-sm text-[color:var(--muted)]">
            {total.toLocaleString()} entries · admin only
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exportBusy}
          className="flex items-center gap-2 rounded-xl border border-[color:var(--border)] px-4 py-2 text-sm font-medium hover:bg-[color:var(--border)]/30 disabled:opacity-50 transition"
        >
          {exportBusy ? 'Exporting…' : '⬇ Export CSV'}
        </button>
      </div>

      {/* Filters */}
      <AuditLogFilters
        filters={filters}
        members={members}
        onChange={(f) => setFilters(f)}
        onReset={() => setFilters(EMPTY_FILTERS)}
      />

      {/* Timeline */}
      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] overflow-hidden shadow-sm">
        <AuditLogTimeline
          items={items}
          selectedId={selectedEntry?.id}
          onSelect={setSelectedEntry}
          loading={loading && page === 1}
        />

        {hasMore && !loading && (
          <div className="border-t border-[color:var(--border)] px-4 py-3">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="text-sm font-medium text-[color:var(--accent)] hover:opacity-80 transition"
            >
              Load more ({total - items.length} remaining)
            </button>
          </div>
        )}
      </div>

      {/* Diff panel */}
      {selectedEntry && (
        <DiffPanel entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
      )}
    </div>
  );
}
