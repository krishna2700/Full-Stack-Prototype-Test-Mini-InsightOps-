"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { authStore } from "@/lib/client";
import { useAuthState } from "@/components/useAuthState";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/map", label: "Map" },
  { href: "/events", label: "Event Table" },
  { href: "/users", label: "Users", adminOnly: true },
];

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { auth } = useAuthState();

  const onLogout = () => {
    authStore.clear();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside className="hidden w-64 flex-col border-r border-slate-800/80 bg-slate-950 px-6 py-8 md:flex">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 via-cyan-400 to-amber-300" />
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                Mini InsightOps
              </p>
              <p className="text-lg font-semibold text-white">Signal Console</p>
            </div>
          </div>
          <nav className="mt-10 flex flex-1 flex-col gap-2">
            {navItems.map((item) => {
              if (item.adminOnly && auth?.user.role !== "admin") return null;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "rounded-xl px-4 py-3 text-sm transition",
                    pathname === item.href
                      ? "bg-slate-800 text-white"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
            <p className="text-slate-400">Signed in</p>
            <p className="mt-1 text-sm font-medium text-white">
              {auth?.user.name ?? "Loading..."}
            </p>
            <p className="text-slate-400">{auth?.user.role ?? ""}</p>
            <button
              onClick={onLogout}
              className="mt-4 w-full rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:border-slate-500 hover:bg-slate-800"
            >
              Log out
            </button>
          </div>
        </aside>
        <main className="flex-1 px-6 py-8 md:px-10">
          <div className="md:hidden">
            <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Mini InsightOps
                </p>
                <p className="text-sm font-semibold text-white">Signal Console</p>
              </div>
              <button
                onClick={onLogout}
                className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-200"
              >
                Log out
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                if (item.adminOnly && auth?.user.role !== "admin") return null;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      "rounded-xl px-3 py-2 text-xs",
                      pathname === item.href
                        ? "bg-slate-800 text-white"
                        : "border border-slate-800 text-slate-300"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="mt-8 md:mt-0">{children}</div>
        </main>
      </div>
    </div>
  );
};
