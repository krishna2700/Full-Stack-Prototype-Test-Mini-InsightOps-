"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { apiFetch, buildQuery } from "@/lib/client";
import type { InsightEvent } from "@/lib/types";

const InsightMap = dynamic(
  () => import("@/components/InsightMap").then((mod) => mod.InsightMap),
  { ssr: false }
);

type EventsResponse = { data: InsightEvent[] };

export default function MapPage() {
  const [events, setEvents] = useState<InsightEvent[]>([]);
  const [selected, setSelected] = useState<InsightEvent | null>(null);
  const [category, setCategory] = useState<string>("all");
  const [severity, setSeverity] = useState<string>("all");
  const [lastDays, setLastDays] = useState<number>(30);
  const [minScore, setMinScore] = useState<number>(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const categories = useMemo(
    () => Array.from(new Set(events.map((event) => event.category))),
    [events]
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const query = buildQuery({
          page: 1,
          pageSize: 200,
          sort: "createdAt",
          order: "desc",
          lastDays,
          minScore: minScore || undefined,
          category: category === "all" ? undefined : category,
          severity: severity === "all" ? undefined : severity,
          q: search ? search : undefined,
        });
        const response = await apiFetch<EventsResponse>(`/api/events?${query}`);
        setEvents(response.data);
        setSelected((prev) => prev ?? response.data[0] ?? null);
      } catch (err: any) {
        setError(err.message || "Failed to load events.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [category, severity, lastDays, minScore, search]);

  return (
    <AuthGate>
      <AppShell>
        <div className="flex flex-col gap-6">
          <header className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Map View
            </p>
            <h2 className="mt-2 text-3xl text-white">Geo Signal Explorer</h2>
            <p className="mt-2 text-sm text-slate-400">
              Filter insight events and scan for geo-clusters or high impact
              signals.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-5">
              <div className="md:col-span-2">
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Search
                </label>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Title, tag, description..."
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                >
                  <option value="all">All</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Severity
                </label>
                <select
                  value={severity}
                  onChange={(event) => setSeverity(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                >
                  <option value="all">All</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Last days
                </label>
                <select
                  value={lastDays}
                  onChange={(event) => setLastDays(Number(event.target.value))}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                >
                  <option value={7}>7 days</option>
                  <option value={30}>30 days</option>
                  <option value={60}>60 days</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Minimum score: {minScore}
              </label>
              <input
                value={minScore}
                onChange={(event) => setMinScore(Number(event.target.value))}
                type="range"
                min={0}
                max={100}
                className="mt-2 w-full"
              />
            </div>
          </header>

          {loading ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-10 text-center text-slate-400">
              Loading map data...
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-100">
              {error}
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
              <InsightMap
                events={events}
                selectedId={selected?.id}
                onSelect={setSelected}
              />
              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Event focus
                </p>
                {selected ? (
                  <div className="mt-4 space-y-4">
                    <div>
                      <h3 className="text-2xl text-white">{selected.title}</h3>
                      <p className="mt-2 text-sm text-slate-400">
                        {selected.description}
                      </p>
                    </div>
                    <div className="grid gap-3 text-sm text-slate-300">
                      <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
                        <span>Category</span>
                        <span className="text-white">{selected.category}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
                        <span>Severity</span>
                        <span className="text-white">{selected.severity}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
                        <span>Score</span>
                        <span className="text-white">
                          {selected.metrics.score}
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
                        <span>Confidence</span>
                        <span className="text-white">
                          {Math.round(selected.metrics.confidence * 100)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
                        <span>Impact</span>
                        <span className="text-white">
                          {selected.metrics.impact.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selected.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 text-sm text-slate-400">
                    Select an event marker to see details.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </AuthGate>
  );
}
