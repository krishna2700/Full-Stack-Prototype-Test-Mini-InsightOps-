import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/auth";
import { dataStore } from "@/lib/data";
import { validateEventPayload } from "@/lib/validation";
import type { Severity } from "@/lib/types";

const parseList = (value: string | null) =>
  value ? value.split(",").map((item) => item.trim()).filter(Boolean) : undefined;

const parseFilters = (request: NextRequest) => {
  const params = request.nextUrl.searchParams;
  const categories = parseList(params.get("category"));
  const severities = parseList(params.get("severity")) as Severity[] | undefined;
  const minScore = params.get("minScore");
  const q = params.get("q") ?? undefined;
  const lastDays = params.get("lastDays");
  const from = params.get("from");
  const to = params.get("to");
  const sort = params.get("sort") as "createdAt" | "severity" | "score" | null;
  const order = params.get("order") as "asc" | "desc" | null;
  const page = params.get("page");
  const pageSize = params.get("pageSize");

  const minScoreValue = minScore ? Number(minScore) : undefined;
  const lastDaysValue = lastDays ? Number(lastDays) : undefined;
  const pageValue = page ? Number(page) : undefined;
  const pageSizeValue = pageSize ? Number(pageSize) : undefined;

  return {
    categories,
    severities,
    minScore: Number.isNaN(minScoreValue) ? undefined : minScoreValue,
    q,
    lastDays: Number.isNaN(lastDaysValue) ? undefined : lastDaysValue,
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
    sort: sort ?? undefined,
    order: order ?? undefined,
    page: Number.isNaN(pageValue) ? undefined : pageValue,
    pageSize: Number.isNaN(pageSizeValue) ? undefined : pageSizeValue,
  };
};

export async function GET(request: NextRequest) {
  const user = authService.getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const filters = parseFilters(request);
  const result = dataStore.listEvents(filters);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const user = authService.getUserFromRequest(request);
  if (!authService.requireRole(user, ["admin", "analyst"])) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }
  const validation = validateEventPayload(body, "create");
  if (!validation.valid) {
    return NextResponse.json(
      { error: "Validation failed.", details: validation.errors },
      { status: 400 }
    );
  }
  const { id, createdAt, ...payload } = body;
  const created = dataStore.createEvent(payload);
  return NextResponse.json(created, { status: 201 });
}
