"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AuthGate } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { SectionCard } from "@/components/SectionCard";
import { apiFetch } from "@/lib/client";
import type { InsightEvent } from "@/lib/types";
import { formatShortDate } from "@/lib/format";

type EventsResponse = { data: InsightEvent[] };

const rangeOptions = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 30 days", value: 30 },
  { label: "Last 60 days", value: 60 },
];

export default function DashboardPage() {
  const [events, setEvents] = useState<InsightEvent[]>([]);
  const [scopeDays, setScopeDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await apiFetch<EventsResponse>(
          "/api/events?page=1&pageSize=200&sort=createdAt&order=desc"
        );
        setEvents(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to load events.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const metrics = useMemo(() => {
    const now = new Date();
    const scopeCutoff = new Date(now.getTime() - scopeDays * 86400000);
    const prevCutoff = new Date(now.getTime() - scopeDays * 2 * 86400000);
    const scoped = events.filter(
      (event) => new Date(event.createdAt) >= scopeCutoff
    );
    const previous = events.filter((event) => {
      const date = new Date(event.createdAt);
      return date >= prevCutoff && date < scopeCutoff;
    });

    const categoryCounts = scoped.reduce<Record<string, number>>(
      (acc, event) => {
        acc[event.category] = (acc[event.category] ?? 0) + 1;
        return acc;
      },
      {}
    );

    const severityCounts = scoped.reduce<Record<string, number>>(
      (acc, event) => {
        acc[event.severity] = (acc[event.severity] ?? 0) + 1;
        return acc;
      },
      {}
    );

    const byCategory = Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value,
    }));
    const bySeverity = Object.entries(severityCounts).map(([name, value]) => ({
      name,
      value,
    }));

    const trendMap = new Map<string, number>();
    scoped.forEach((event) => {
      const day = new Date(event.createdAt).toISOString().slice(0, 10);
      trendMap.set(day, (trendMap.get(day) ?? 0) + 1);
    });
    const trend = Array.from(trendMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, value]) => ({
        day: formatShortDate(day),
        value,
      }));

    const highNow = scoped.filter((event) => event.severity === "High").length;
    const highPrev = previous.filter((event) => event.severity === "High").length;
    const highDelta =
      highPrev === 0 ? 100 : Math.round(((highNow - highPrev) / highPrev) * 100);

    const topCategory =
      byCategory.sort((a, b) => b.value - a.value)[0]?.name ?? "—";
    const topImpact = scoped.sort(
      (a, b) => b.metrics.impact - a.metrics.impact
    )[0];

    return {
      scoped,
      byCategory,
      bySeverity,
      trend,
      insights: [
        `High severity events ${highDelta >= 0 ? "up" : "down"} ${Math.abs(
          highDelta
        )}% vs previous ${scopeDays} days.`,
        `Top category this period: ${topCategory}.`,
        topImpact
          ? `Highest impact: ${topImpact.title} (${topImpact.metrics.impact.toLocaleString()} impact).`
          : "No impact leaders yet.",
      ],
    };
  }, [events, scopeDays]);

  return (
    <AuthGate>
      <AppShell>
        <div className="flex flex-col gap-6">
          <header className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Dashboard
              </p>
              <h2 className="mt-2 text-3xl text-white">Operational Pulse</h2>
              <p className="mt-2 text-sm text-slate-400">
                Monitor event flow, severity, and category mix in near real
                time.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {rangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setScopeDays(option.value)}
                  className={`rounded-full px-4 py-2 text-xs ${
                    scopeDays === option.value
                      ? "bg-emerald-400 text-slate-900"
                      : "border border-slate-700 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </header>

          {loading ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-10 text-center text-slate-400">
              Loading insights...
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-100">
              {error}
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="flex flex-col gap-6">
                <SectionCard title="Total events">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-5xl text-white">
                        {metrics.scoped.length}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-400">
                        In scope
                      </p>
                    </div>
                    <div className="text-right text-sm text-slate-400">
                      Filtered by last {scopeDays} days
                    </div>
                  </div>
                </SectionCard>
                <SectionCard title="Events by category">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={metrics.byCategory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip
                          contentStyle={{
                            background: "#0f172a",
                            border: "1px solid #334155",
                            borderRadius: "12px",
                            color: "#e2e8f0",
                          }}
                        />
                        <Bar dataKey="value" fill="#34d399" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>
                <SectionCard title="Trend over time">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={metrics.trend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                        <XAxis dataKey="day" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip
                          contentStyle={{
                            background: "#0f172a",
                            border: "1px solid #334155",
                            borderRadius: "12px",
                            color: "#e2e8f0",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#38bdf8"
                          strokeWidth={3}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>
              </div>
              <div className="flex flex-col gap-6">
                <SectionCard title="Events by severity">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={metrics.bySeverity}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip
                          contentStyle={{
                            background: "#0f172a",
                            border: "1px solid #334155",
                            borderRadius: "12px",
                            color: "#e2e8f0",
                          }}
                        />
                        <Bar dataKey="value" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>
                <SectionCard title="Insight highlights">
                  <ul className="space-y-3 text-sm text-slate-300">
                    {metrics.insights.map((insight) => (
                      <li
                        key={insight}
                        className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3"
                      >
                        {insight}
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </AuthGate>
  );
}
