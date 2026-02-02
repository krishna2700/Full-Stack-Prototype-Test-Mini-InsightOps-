"use client";

import { useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { useAuthState } from "@/components/useAuthState";
import { apiFetch, buildQuery } from "@/lib/client";
import type { InsightEvent } from "@/lib/types";

type EventsResponse = {
  data: InsightEvent[];
  meta: { total: number; page: number; pageSize: number; totalPages: number };
};

const categoryOptions = ["Fraud", "Ops", "Safety", "Sales", "Health"];

const emptyPayload = {
  title: "",
  description: "",
  category: "Ops",
  severity: "Medium",
  location: { lat: 40.7128, lng: -74.006 },
  metrics: { score: 70, confidence: 0.7, impact: 10000 },
  tags: "ops,signal",
};

export default function EventsPage() {
  const [events, setEvents] = useState<InsightEvent[]>([]);
  const [meta, setMeta] = useState<EventsResponse["meta"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<InsightEvent | null>(null);
  const [formState, setFormState] = useState(emptyPayload);
  const [saving, setSaving] = useState(false);
  const { auth } = useAuthState();
  const canEdit = auth?.user.role === "admin" || auth?.user.role === "analyst";
  const canDelete = auth?.user.role === "admin";

  const loadEvents = async () => {
    setLoading(true);
    setError("");
    try {
      const query = buildQuery({
        page,
        pageSize,
        sort,
        order,
        q: search || undefined,
        category: category === "all" ? undefined : category,
        severity: severity === "all" ? undefined : severity,
      });
      const response = await apiFetch<EventsResponse>(`/api/events?${query}`);
      setEvents(response.data);
      setMeta(response.meta);
    } catch (err: any) {
      setError(err.message || "Failed to load events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [page, pageSize, sort, order, search, category, severity]);

  const totalPages = meta?.totalPages ?? 1;

  const openCreate = () => {
    setEditing(null);
    setFormState(emptyPayload);
    setModalOpen(true);
  };

  const openEdit = (event: InsightEvent) => {
    setEditing(event);
    setFormState({
      title: event.title,
      description: event.description,
      category: event.category,
      severity: event.severity,
      location: event.location,
      metrics: event.metrics,
      tags: event.tags.join(", "),
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const payload = {
      title: formState.title,
      description: formState.description,
      category: formState.category,
      severity: formState.severity,
      location: {
        lat: Number(formState.location.lat),
        lng: Number(formState.location.lng),
      },
      metrics: {
        score: Number(formState.metrics.score),
        confidence: Number(formState.metrics.confidence),
        impact: Number(formState.metrics.impact),
      },
      tags: formState.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };
    try {
      if (editing) {
        await apiFetch(`/api/events/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch(`/api/events`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setModalOpen(false);
      await loadEvents();
    } catch (err: any) {
      setError(err.message || "Failed to save event.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError("");
    try {
      await apiFetch(`/api/events/${id}`, { method: "DELETE" });
      await loadEvents();
    } catch (err: any) {
      setError(err.message || "Failed to delete event.");
    }
  };

  const severityBadge = (value: string) => {
    if (value === "High") return "bg-rose-500/20 text-rose-200 border-rose-500/40";
    if (value === "Medium")
      return "bg-amber-500/20 text-amber-200 border-amber-500/40";
    return "bg-emerald-500/20 text-emerald-200 border-emerald-500/40";
  };

  return (
    <AuthGate>
      <AppShell>
        <div className="flex flex-col gap-6">
          <header className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Event Table
              </p>
              <h2 className="mt-2 text-3xl text-white">Insight Events</h2>
              <p className="mt-2 text-sm text-slate-400">
                Sort, filter, and manage the event registry.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {canEdit && (
                <button
                  onClick={openCreate}
                  className="rounded-full bg-emerald-400 px-4 py-2 text-xs font-semibold text-slate-900"
                >
                  New Event
                </button>
              )}
            </div>
          </header>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="grid gap-4 md:grid-cols-5">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, tags..."
                className="md:col-span-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
              />
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
              >
                <option value="all">All categories</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <select
                value={severity}
                onChange={(event) => setSeverity(event.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
              >
                <option value="all">All severities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <select
                value={`${sort}:${order}`}
                onChange={(event) => {
                  const [nextSort, nextOrder] = event.target.value.split(":");
                  setSort(nextSort);
                  setOrder(nextOrder as "asc" | "desc");
                }}
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
              >
                <option value="createdAt:desc">Newest</option>
                <option value="createdAt:asc">Oldest</option>
                <option value="severity:desc">Severity (high)</option>
                <option value="severity:asc">Severity (low)</option>
                <option value="score:desc">Score (high)</option>
                <option value="score:asc">Score (low)</option>
              </select>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            )}

            {loading ? (
              <div className="mt-6 text-sm text-slate-400">Loading events...</div>
            ) : (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-200">
                  <thead className="text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Severity</th>
                      <th className="px-4 py-3">Score</th>
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {events.map((event) => (
                      <tr key={event.id} className="hover:bg-slate-950/60">
                        <td className="px-4 py-3">
                          <div className="font-medium text-white">
                            {event.title}
                          </div>
                          <div className="text-xs text-slate-500">
                            {event.tags.join(", ")}
                          </div>
                        </td>
                        <td className="px-4 py-3">{event.category}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs ${severityBadge(
                              event.severity
                            )}`}
                          >
                            {event.severity}
                          </span>
                        </td>
                        <td className="px-4 py-3">{event.metrics.score}</td>
                        <td className="px-4 py-3">
                          {new Date(event.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            {canEdit && (
                              <button
                                onClick={() => openEdit(event)}
                                className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-slate-500"
                              >
                                Edit
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleDelete(event.id)}
                                className="rounded-lg border border-rose-500/40 px-3 py-1 text-xs text-rose-200 hover:border-rose-400"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between text-xs text-slate-400">
              <span>
                Page {meta?.page ?? 1} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="rounded-lg border border-slate-700 px-3 py-1 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  className="rounded-lg border border-slate-700 px-3 py-1 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
              <div className="w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-950 p-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl text-white">
                    {editing ? "Edit event" : "Create event"}
                  </h3>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="text-sm text-slate-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Title
                    <input
                      value={formState.title}
                      onChange={(event) =>
                        setFormState({ ...formState, title: event.target.value })
                      }
                      className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                    />
                  </label>
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Category
                    <select
                      value={formState.category}
                      onChange={(event) =>
                        setFormState({
                          ...formState,
                          category: event.target.value,
                        })
                      }
                      className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                    >
                      {categoryOptions.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="md:col-span-2 text-xs uppercase tracking-[0.3em] text-slate-400">
                    Description
                    <textarea
                      value={formState.description}
                      onChange={(event) =>
                        setFormState({
                          ...formState,
                          description: event.target.value,
                        })
                      }
                      rows={3}
                      className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                    />
                  </label>
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Severity
                    <select
                      value={formState.severity}
                      onChange={(event) =>
                        setFormState({
                          ...formState,
                          severity: event.target.value,
                        })
                      }
                      className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </label>
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Score
                    <input
                      type="number"
                      value={formState.metrics.score}
                      onChange={(event) =>
                        setFormState({
                          ...formState,
                          metrics: {
                            ...formState.metrics,
                            score: Number(event.target.value),
                          },
                        })
                      }
                      className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                    />
                  </label>
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Confidence
                    <input
                      type="number"
                      step="0.01"
                      value={formState.metrics.confidence}
                      onChange={(event) =>
                        setFormState({
                          ...formState,
                          metrics: {
                            ...formState.metrics,
                            confidence: Number(event.target.value),
                          },
                        })
                      }
                      className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                    />
                  </label>
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Impact
                    <input
                      type="number"
                      value={formState.metrics.impact}
                      onChange={(event) =>
                        setFormState({
                          ...formState,
                          metrics: {
                            ...formState.metrics,
                            impact: Number(event.target.value),
                          },
                        })
                      }
                      className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                    />
                  </label>
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Latitude
                    <input
                      type="number"
                      value={formState.location.lat}
                      onChange={(event) =>
                        setFormState({
                          ...formState,
                          location: {
                            ...formState.location,
                            lat: Number(event.target.value),
                          },
                        })
                      }
                      className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                    />
                  </label>
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Longitude
                    <input
                      type="number"
                      value={formState.location.lng}
                      onChange={(event) =>
                        setFormState({
                          ...formState,
                          location: {
                            ...formState.location,
                            lng: Number(event.target.value),
                          },
                        })
                      }
                      className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                    />
                  </label>
                  <label className="md:col-span-2 text-xs uppercase tracking-[0.3em] text-slate-400">
                    Tags (comma separated)
                    <input
                      value={formState.tags}
                      onChange={(event) =>
                        setFormState({ ...formState, tags: event.target.value })
                      }
                      className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                    />
                  </label>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="rounded-xl border border-slate-700 px-4 py-2 text-xs text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-xl bg-emerald-400 px-4 py-2 text-xs font-semibold text-slate-900 disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save event"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </AuthGate>
  );
}
