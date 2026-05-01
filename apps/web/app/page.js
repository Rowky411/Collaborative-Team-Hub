"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../lib/stores/authStore";

export default function Home() {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    if (status === "idle") hydrate();
  }, [status, hydrate]);

  useEffect(() => {
    if (status === "authenticated") router.replace("/workspaces");
    else if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-[color:var(--muted)]">Loading Team Hub…</p>
    </main>
  );
}
