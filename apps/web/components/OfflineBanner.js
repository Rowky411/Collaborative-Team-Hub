"use client";

import { useOfflineQueueStore } from "../lib/stores/offlineQueueStore";
import { useOnlineStatus } from "../lib/hooks/useOnlineStatus";

export function OfflineBanner() {
  const online = useOnlineStatus();
  const queueLen = useOfflineQueueStore((s) => s.queue.length);

  if (online && queueLen === 0) return null;

  return (
    <div
      className={`rounded-lg px-3 py-2 text-xs font-medium ${
        online
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
          : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
      }`}
    >
      {online ? (
        <>↑ Back online — syncing {queueLen} pending change{queueLen !== 1 ? "s" : ""}…</>
      ) : (
        <>
          ⚡ Offline
          {queueLen > 0 && <> · {queueLen} change{queueLen !== 1 ? "s" : ""} queued</>}
        </>
      )}
    </div>
  );
}
