"use client";

import { useState } from "react";
import { apiClient } from "../../lib/apiClient";

export function ExportButton({ workspaceId }) {
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    setBusy(true);
    try {
      const response = await apiClient.get(
        `/workspaces/${workspaceId}/analytics/export`,
        { responseType: "blob" }
      );
      const url = URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `workspace-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={busy}
      className="flex items-center gap-2 rounded-xl border border-[color:var(--border)] px-4 py-2 text-sm font-medium text-[color:var(--foreground)] hover:bg-[color:var(--border)]/30 disabled:opacity-50 transition"
    >
      {busy ? "Exporting…" : "⬇ Export CSV"}
    </button>
  );
}
