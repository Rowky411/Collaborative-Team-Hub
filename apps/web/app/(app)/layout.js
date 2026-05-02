"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../lib/stores/authStore";
import { useWorkspaceStore } from "../../lib/stores/workspaceStore";
import { getSocket } from "../../lib/socket";
import { FluxTopNav } from "../../components/layout/FluxTopNav";

export default function AppLayout({ children }) {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const hydrate = useAuthStore((s) => s.hydrate);
  const addWorkspace = useWorkspaceStore((s) => s.addWorkspace);

  useEffect(() => {
    if (status === "idle") hydrate();
  }, [status, hydrate]);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const socket = getSocket();
    const onInvited = ({ workspace }) => addWorkspace(workspace);
    socket.on("workspace:invited", onInvited);
    return () => { socket.off("workspace:invited", onInvited); };
  }, [status, addWorkspace]);

  if (status !== "authenticated") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Loading…
        </p>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <FluxTopNav />
      <div className="flex-1 flex flex-col min-h-0">{children}</div>
    </div>
  );
}
