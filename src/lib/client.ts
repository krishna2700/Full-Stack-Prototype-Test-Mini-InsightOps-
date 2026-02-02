"use client";

import type { Role } from "@/lib/types";

export type AuthState = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
};

const STORAGE_KEY = "insightops-auth";

export const authStore = {
  get(): AuthState | null {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthState;
    } catch {
      return null;
    }
  },
  set(state: AuthState) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },
  clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
  },
};

export const apiFetch = async <T>(
  path: string,
  options: RequestInit = {}
): Promise<T> => {
  const auth = authStore.get();
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (auth?.token) {
    headers.set("Authorization", `Bearer ${auth.token}`);
  }
  const response = await fetch(path, { ...options, headers });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "Request failed");
  }
  return response.json() as Promise<T>;
};

export const buildQuery = (params: Record<string, string | number | undefined>) => {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined);
  const search = new URLSearchParams();
  entries.forEach(([key, value]) => {
    search.set(key, String(value));
  });
  return search.toString();
};
