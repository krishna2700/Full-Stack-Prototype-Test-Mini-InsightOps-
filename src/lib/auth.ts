import type { NextRequest } from "next/server";
import type { Role, User } from "@/lib/types";
import { dataStore } from "@/lib/data";

type Session = {
  token: string;
  user: Omit<User, "password">;
  createdAt: number;
};

const sessions = new Map<string, Session>();

const sanitizeUser = (user: User) => {
  const { password, ...rest } = user;
  return rest;
};

export const authService = {
  login: (email: string, password: string) => {
    const user = dataStore.findUserByEmail(email);
    if (!user || user.password !== password) return null;
    const token = Buffer.from(
      `${user.email}:${user.role}:${Date.now()}`,
      "utf8"
    ).toString("base64url");
    const session: Session = {
      token,
      user: sanitizeUser(user),
      createdAt: Date.now(),
    };
    sessions.set(token, session);
    return session;
  },
  getUserFromRequest: (req: NextRequest) => {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return null;
    const [, token] = authHeader.split(" ");
    if (!token) return null;
    const session = sessions.get(token);
    return session?.user ?? null;
  },
  requireRole: (user: { role: Role } | null, allowed: Role[]) => {
    if (!user) return false;
    return allowed.includes(user.role);
  },
};
