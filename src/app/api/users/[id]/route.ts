import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/auth";
import { dataStore } from "@/lib/data";
import type { Role } from "@/lib/types";

type RouteParams = { params: Promise<{ id: string }> };

const roles: Role[] = ["admin", "analyst", "viewer"];

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const user = authService.getUserFromRequest(request);
  if (!authService.requireRole(user, ["admin"])) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  if (!body || typeof body.role !== "string" || !roles.includes(body.role)) {
    return NextResponse.json(
      { error: "Role must be admin, analyst, or viewer." },
      { status: 400 }
    );
  }
  const updated = dataStore.updateUserRole(id, body.role);
  if (!updated) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }
  return NextResponse.json({ user: updated });
}
