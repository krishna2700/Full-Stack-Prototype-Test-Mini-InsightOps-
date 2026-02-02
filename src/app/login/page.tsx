"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, authStore } from "@/lib/client";

const quickUsers = [
  { label: "Admin", email: "admin@test.com" },
  { label: "Analyst", email: "analyst@test.com" },
  { label: "Viewer", email: "viewer@test.com" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@test.com");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = await apiFetch<{ token: string; user: any }>(
        "/api/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        }
      );
      authStore.set(payload);
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-16">
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
            Mini InsightOps
          </p>
          <h1 className="mt-4 text-4xl text-white md:text-5xl">
            Signal Operations Console
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            Explore AI-driven insight events across map, dashboard, and detail
            views.
          </p>
        </div>

        <div className="grid w-full gap-10 md:grid-cols-[1.2fr_0.8fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-800 bg-slate-900/60 p-10 shadow-[0_25px_80px_-60px_rgba(56,189,248,0.6)]"
          >
            <h2 className="text-2xl text-white">Sign in</h2>
            <p className="mt-2 text-sm text-slate-400">
              Use any of the test accounts to access the console.
            </p>
            <div className="mt-8 space-y-5">
              <label className="block text-xs uppercase tracking-[0.3em] text-slate-400">
                Email
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
                  placeholder="you@example.com"
                />
              </label>
              <label className="block text-xs uppercase tracking-[0.3em] text-slate-400">
                Password
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
                />
              </label>
            </div>
            {error && (
              <div className="mt-6 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="mt-8 w-full rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Enter Console"}
            </button>
          </form>

          <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
            <h3 className="text-lg text-white">Test users</h3>
            <p className="mt-2 text-sm text-slate-400">
              Tap to autofill credentials. All accounts use password{" "}
              <span className="text-white">password</span>.
            </p>
            <div className="mt-6 space-y-3">
              {quickUsers.map((user) => (
                <button
                  key={user.email}
                  type="button"
                  onClick={() => {
                    setEmail(user.email);
                    setPassword("password");
                  }}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4 text-left text-sm text-slate-200 transition hover:border-slate-600"
                >
                  <span>{user.label}</span>
                  <span className="text-xs text-slate-500">{user.email}</span>
                </button>
              ))}
            </div>
            <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4 text-xs text-slate-400">
              <p className="text-slate-200">Prototype notes</p>
              <ul className="mt-2 space-y-1">
                <li>RBAC enforced on API routes.</li>
                <li>In-memory data store with 30+ seeded events.</li>
                <li>Map + dashboard views for rapid insights.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
