"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../lib/stores/authStore";

export default function AppLayout({ children }) {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const hydrate = useAuthStore((s) => s.hydrate);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (status === "idle") hydrate();
  }, [status, hydrate]);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-[color:var(--muted)]">Loading…</p>
      </main>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-[color:var(--border)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/workspaces" className="text-lg font-semibold">
            Team Hub
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/workspaces" className="hover:underline">
              Workspaces
            </Link>
            <Link href="/profile" className="hover:underline">
              {user?.name || "Profile"}
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-md border border-[color:var(--border)] px-3 py-1 text-xs hover:bg-[color:var(--border)]/30"
            >
              Log out
            </button>
          </nav>
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</div>
    </div>
  );
}
