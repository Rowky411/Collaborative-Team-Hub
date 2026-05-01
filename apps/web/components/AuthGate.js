"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "../lib/stores/authStore";

const PUBLIC_ROUTES = ["/login", "/register"];

export default function AuthGate({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const status = useAuthStore((s) => s.status);
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    if (status === "idle") hydrate();
  }, [status, hydrate]);

  useEffect(() => {
    if (status === "unauthenticated" && !PUBLIC_ROUTES.includes(pathname)) {
      router.replace("/login");
    }
  }, [status, pathname, router]);

  if (status === "idle" || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-[color:var(--muted)]">Loading…</p>
      </div>
    );
  }

  return children;
}
