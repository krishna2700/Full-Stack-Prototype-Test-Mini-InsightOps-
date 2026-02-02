import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/auth";
import { dataStore } from "@/lib/data";
import { validateEventPayload } from "@/lib/validation";

type RouteParams = { params: { id: string } };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = authService.getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const event = dataStore.getEvent(params.id);
  if (!event) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }
  return NextResponse.json(event);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const user = authService.getUserFromRequest(request);
  if (!authService.requireRole(user, ["admin", "analyst"])) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }
  const validation = validateEventPayload(body, "update");
  if (!validation.valid) {
    return NextResponse.json(
      { error: "Validation failed.", details: validation.errors },
      { status: 400 }
    );
  }
  const { id, createdAt, ...patch } = body;
  const updated = dataStore.updateEvent(params.id, patch);
  if (!updated) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const user = authService.getUserFromRequest(request);
  if (!authService.requireRole(user, ["admin"])) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  const deleted = dataStore.deleteEvent(params.id);
  if (!deleted) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
