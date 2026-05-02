"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../lib/stores/authStore";
import { FluxTopNav } from "../../components/layout/FluxTopNav";

export default function AppLayout({ children }) {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    if (status === "idle") hydrate();
  }, [status, hydrate]);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

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
