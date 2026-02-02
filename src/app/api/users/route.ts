import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/auth";
import { dataStore } from "@/lib/data";

export async function GET(request: NextRequest) {
  const user = authService.getUserFromRequest(request);
  if (!authService.requireRole(user, ["admin"])) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  return NextResponse.json({ data: dataStore.listUsers() });
}
