"use client";

import { useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { apiFetch } from "@/lib/client";
import type { Role } from "@/lib/types";

type UserRecord = { id: string; name: string; email: string; role: Role };

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiFetch<{ data: UserRecord[] }>("/api/users");
      setUsers(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const updateRole = async (id: string, role: Role) => {
    setError("");
    try {
      await apiFetch(`/api/users/${id}`, {
        method: "PUT",
        body: JSON.stringify({ role }),
      });
      await loadUsers();
    } catch (err: any) {
      setError(err.message || "Failed to update user.");
    }
  };

  return (
    <AuthGate allowedRoles={["admin"]}>
      <AppShell>
        <div className="flex flex-col gap-6">
          <header className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              User Management
            </p>
            <h2 className="mt-2 text-3xl text-white">RBAC Controls</h2>
            <p className="mt-2 text-sm text-slate-400">
              Admins can change roles for active users.
            </p>
          </header>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            {error && (
              <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            )}
            {loading ? (
              <div className="text-sm text-slate-400">Loading users...</div>
            ) : (
              <table className="w-full text-left text-sm text-slate-200">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3 text-right">Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-4 py-3 text-white">{user.name}</td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3">{user.role}</td>
                      <td className="px-4 py-3 text-right">
                        <select
                          value={user.role}
                          onChange={(event) =>
                            updateRole(user.id, event.target.value as Role)
                          }
                          className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                        >
                          <option value="admin">admin</option>
                          <option value="analyst">analyst</option>
                          <option value="viewer">viewer</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </AppShell>
    </AuthGate>
  );
}
