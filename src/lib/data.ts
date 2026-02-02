import { randomUUID } from "crypto";
import type { InsightEvent, Severity, User } from "@/lib/types";

type EventFilters = {
  categories?: string[];
  severities?: Severity[];
  minScore?: number;
  q?: string;
  from?: Date;
  to?: Date;
  lastDays?: number;
  sort?: "createdAt" | "severity" | "score";
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

const daysAgo = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

const baseEvents: Omit<InsightEvent, "id" | "createdAt">[] & {
  createdAt?: string;
}[] = [
  {
    title: "Card-Not-Present Spike",
    description:
      "Rapid increase in card-not-present transactions across east coast merchants.",
    category: "Fraud",
    severity: "High",
    createdAt: daysAgo(2),
    location: { lat: 40.7128, lng: -74.006 },
    metrics: { score: 92, confidence: 0.86, impact: 72000 },
    tags: ["payments", "anomaly", "card-not-present"],
  },
  {
    title: "Logistics Delay Cluster",
    description:
      "Distribution centers reporting late departures beyond threshold.",
    category: "Ops",
    severity: "Medium",
    createdAt: daysAgo(6),
    location: { lat: 41.8781, lng: -87.6298 },
    metrics: { score: 71, confidence: 0.74, impact: 18000 },
    tags: ["supply-chain", "delay", "distribution"],
  },
  {
    title: "Critical Equipment Overheat",
    description: "Temperature sensors exceeded safe limits for 12 minutes.",
    category: "Safety",
    severity: "High",
    createdAt: daysAgo(1),
    location: { lat: 34.0522, lng: -118.2437 },
    metrics: { score: 95, confidence: 0.9, impact: 95000 },
    tags: ["facility", "overheat", "sensor"],
  },
  {
    title: "Enrollment Drop-Off",
    description: "Week-over-week decline in premium plan signups.",
    category: "Sales",
    severity: "Medium",
    createdAt: daysAgo(9),
    location: { lat: 29.7604, lng: -95.3698 },
    metrics: { score: 63, confidence: 0.68, impact: 24000 },
    tags: ["conversion", "pipeline", "plans"],
  },
  {
    title: "Respiratory Alert",
    description: "ER visits trending above baseline in coastal region.",
    category: "Health",
    severity: "High",
    createdAt: daysAgo(5),
    location: { lat: 25.7617, lng: -80.1918 },
    metrics: { score: 89, confidence: 0.81, impact: 61000 },
    tags: ["public-health", "er", "respiratory"],
  },
  {
    title: "Store Footfall Surge",
    description: "Downtown store traffic exceeded forecast by 28%.",
    category: "Sales",
    severity: "Low",
    createdAt: daysAgo(3),
    location: { lat: 47.6062, lng: -122.3321 },
    metrics: { score: 58, confidence: 0.6, impact: 12000 },
    tags: ["retail", "footfall", "forecast"],
  },
  {
    title: "Sensor Calibration Drift",
    description: "Manufacturing sensors showing drift beyond tolerance.",
    category: "Ops",
    severity: "Medium",
    createdAt: daysAgo(12),
    location: { lat: 39.7392, lng: -104.9903 },
    metrics: { score: 69, confidence: 0.72, impact: 15000 },
    tags: ["manufacturing", "calibration", "quality"],
  },
  {
    title: "Payment Gateway Timeouts",
    description: "Timeout rate peaked at 4.2% during midday traffic.",
    category: "Ops",
    severity: "High",
    createdAt: daysAgo(4),
    location: { lat: 37.7749, lng: -122.4194 },
    metrics: { score: 88, confidence: 0.84, impact: 54000 },
    tags: ["payments", "latency", "gateway"],
  },
  {
    title: "Safety Training Lapse",
    description: "Two sites missing required safety refresh training.",
    category: "Safety",
    severity: "Medium",
    createdAt: daysAgo(18),
    location: { lat: 33.4484, lng: -112.074 },
    metrics: { score: 64, confidence: 0.7, impact: 11000 },
    tags: ["compliance", "training", "risk"],
  },
  {
    title: "Chargeback Pattern Shift",
    description: "New chargeback cluster tied to specific issuer.",
    category: "Fraud",
    severity: "High",
    createdAt: daysAgo(7),
    location: { lat: 32.7767, lng: -96.797 },
    metrics: { score: 91, confidence: 0.88, impact: 68000 },
    tags: ["chargeback", "issuer", "fraud"],
  },
  {
    title: "Inventory Stockout Risk",
    description: "High velocity SKUs expected to stock out in 48 hours.",
    category: "Ops",
    severity: "High",
    createdAt: daysAgo(8),
    location: { lat: 39.9526, lng: -75.1652 },
    metrics: { score: 84, confidence: 0.79, impact: 41000 },
    tags: ["inventory", "forecast", "sku"],
  },
  {
    title: "Temperature Excursion",
    description: "Cold chain temperature above threshold for 9 minutes.",
    category: "Safety",
    severity: "Medium",
    createdAt: daysAgo(11),
    location: { lat: 42.3601, lng: -71.0589 },
    metrics: { score: 73, confidence: 0.75, impact: 16000 },
    tags: ["cold-chain", "temperature", "logistics"],
  },
  {
    title: "Pipeline Stagnation",
    description: "Enterprise pipeline velocity down 15% vs prior month.",
    category: "Sales",
    severity: "Medium",
    createdAt: daysAgo(20),
    location: { lat: 38.9072, lng: -77.0369 },
    metrics: { score: 66, confidence: 0.7, impact: 27000 },
    tags: ["pipeline", "velocity", "enterprise"],
  },
  {
    title: "Facility Incident Near-Miss",
    description: "Near-miss reported in loading dock operations.",
    category: "Safety",
    severity: "High",
    createdAt: daysAgo(10),
    location: { lat: 36.1627, lng: -86.7816 },
    metrics: { score: 90, confidence: 0.82, impact: 45000 },
    tags: ["incident", "near-miss", "dock"],
  },
  {
    title: "Patient No-Show Increase",
    description: "Clinic no-show rate increased to 12.5%.",
    category: "Health",
    severity: "Low",
    createdAt: daysAgo(14),
    location: { lat: 39.7684, lng: -86.1581 },
    metrics: { score: 55, confidence: 0.62, impact: 8000 },
    tags: ["appointments", "no-show", "clinic"],
  },
  {
    title: "Unusual Refund Volume",
    description: "Refund requests doubled for digital goods category.",
    category: "Fraud",
    severity: "Medium",
    createdAt: daysAgo(13),
    location: { lat: 30.2672, lng: -97.7431 },
    metrics: { score: 77, confidence: 0.76, impact: 32000 },
    tags: ["refund", "digital", "anomaly"],
  },
  {
    title: "Branch Traffic Decline",
    description: "Foot traffic declined 19% in urban branch cluster.",
    category: "Sales",
    severity: "Low",
    createdAt: daysAgo(16),
    location: { lat: 35.2271, lng: -80.8431 },
    metrics: { score: 52, confidence: 0.6, impact: 9000 },
    tags: ["branch", "traffic", "urban"],
  },
  {
    title: "Pharmacy Stock Disruption",
    description: "Projected shortage for high-demand medications.",
    category: "Health",
    severity: "High",
    createdAt: daysAgo(4),
    location: { lat: 44.9778, lng: -93.265 },
    metrics: { score: 87, confidence: 0.8, impact: 52000 },
    tags: ["pharmacy", "shortage", "medication"],
  },
  {
    title: "Workforce Overtime Spike",
    description: "Overtime hours exceeded weekly budget by 22%.",
    category: "Ops",
    severity: "Medium",
    createdAt: daysAgo(15),
    location: { lat: 36.1699, lng: -115.1398 },
    metrics: { score: 70, confidence: 0.73, impact: 21000 },
    tags: ["workforce", "overtime", "budget"],
  },
  {
    title: "Field Device Offline",
    description: "Telemetry gaps detected in rural asset trackers.",
    category: "Ops",
    severity: "Low",
    createdAt: daysAgo(22),
    location: { lat: 43.0389, lng: -87.9065 },
    metrics: { score: 48, confidence: 0.58, impact: 6000 },
    tags: ["iot", "telemetry", "offline"],
  },
  {
    title: "Emergency Room Surge",
    description: "Unexpected surge in ER admissions overnight.",
    category: "Health",
    severity: "High",
    createdAt: daysAgo(2),
    location: { lat: 33.749, lng: -84.388 },
    metrics: { score: 93, confidence: 0.87, impact: 68000 },
    tags: ["er", "admissions", "surge"],
  },
  {
    title: "High-Risk Vendor Alert",
    description: "Vendor risk score exceeded contractual threshold.",
    category: "Ops",
    severity: "High",
    createdAt: daysAgo(19),
    location: { lat: 45.5152, lng: -122.6784 },
    metrics: { score: 82, confidence: 0.78, impact: 39000 },
    tags: ["vendor", "risk", "contract"],
  },
  {
    title: "Upsell Conversion Lift",
    description: "Upsell conversion improved after targeted campaign.",
    category: "Sales",
    severity: "Low",
    createdAt: daysAgo(8),
    location: { lat: 39.9612, lng: -82.9988 },
    metrics: { score: 60, confidence: 0.67, impact: 14000 },
    tags: ["campaign", "upsell", "conversion"],
  },
  {
    title: "Anomalous Claims Velocity",
    description: "Claims filed 2.3x higher in midwest region.",
    category: "Fraud",
    severity: "High",
    createdAt: daysAgo(3),
    location: { lat: 41.2565, lng: -95.9345 },
    metrics: { score: 90, confidence: 0.85, impact: 64000 },
    tags: ["claims", "velocity", "midwest"],
  },
  {
    title: "Service Desk Backlog",
    description: "Ticket backlog crossed 7-day SLA in two queues.",
    category: "Ops",
    severity: "Medium",
    createdAt: daysAgo(7),
    location: { lat: 33.4484, lng: -111.9941 },
    metrics: { score: 74, confidence: 0.76, impact: 23000 },
    tags: ["service-desk", "sla", "backlog"],
  },
  {
    title: "Store Safety Audit",
    description: "Audit flagged 3 critical items in north region.",
    category: "Safety",
    severity: "High",
    createdAt: daysAgo(21),
    location: { lat: 44.9537, lng: -93.09 },
    metrics: { score: 85, confidence: 0.8, impact: 36000 },
    tags: ["audit", "safety", "compliance"],
  },
  {
    title: "Churn Risk Climb",
    description: "At-risk accounts increased following price change.",
    category: "Sales",
    severity: "Medium",
    createdAt: daysAgo(13),
    location: { lat: 32.7157, lng: -117.1611 },
    metrics: { score: 72, confidence: 0.71, impact: 28000 },
    tags: ["churn", "pricing", "accounts"],
  },
  {
    title: "Call Center Hold Time",
    description: "Average hold time exceeded 6 minutes.",
    category: "Ops",
    severity: "Medium",
    createdAt: daysAgo(5),
    location: { lat: 27.9506, lng: -82.4572 },
    metrics: { score: 68, confidence: 0.69, impact: 17000 },
    tags: ["call-center", "sla", "experience"],
  },
  {
    title: "Adverse Reaction Signal",
    description: "Signal detected for higher adverse reactions.",
    category: "Health",
    severity: "High",
    createdAt: daysAgo(17),
    location: { lat: 40.4406, lng: -79.9959 },
    metrics: { score: 88, confidence: 0.83, impact: 47000 },
    tags: ["pharma", "reaction", "signal"],
  },
  {
    title: "VIP Account Escalation",
    description: "Multiple escalations from top-tier accounts.",
    category: "Sales",
    severity: "High",
    createdAt: daysAgo(6),
    location: { lat: 39.0997, lng: -94.5786 },
    metrics: { score: 86, confidence: 0.8, impact: 52000 },
    tags: ["vip", "escalation", "accounts"],
  },
  {
    title: "Warehouse Picking Error",
    description: "Picking error rate above 3% for two shifts.",
    category: "Ops",
    severity: "Low",
    createdAt: daysAgo(9),
    location: { lat: 35.1495, lng: -90.049 },
    metrics: { score: 57, confidence: 0.63, impact: 9000 },
    tags: ["warehouse", "quality", "picking"],
  },
  {
    title: "Network Intrusion Attempt",
    description: "Spike in blocked intrusion attempts in perimeter.",
    category: "Fraud",
    severity: "High",
    createdAt: daysAgo(1),
    location: { lat: 47.6062, lng: -122.3352 },
    metrics: { score: 96, confidence: 0.9, impact: 76000 },
    tags: ["security", "intrusion", "network"],
  },
  {
    title: "Construction Safety Near Miss",
    description: "Reported near miss on urban construction site.",
    category: "Safety",
    severity: "Medium",
    createdAt: daysAgo(23),
    location: { lat: 29.9511, lng: -90.0715 },
    metrics: { score: 67, confidence: 0.72, impact: 19000 },
    tags: ["construction", "near-miss", "site"],
  },
  {
    title: "Diagnostic Test Bottleneck",
    description: "Diagnostics backlog increased in outpatient labs.",
    category: "Health",
    severity: "Medium",
    createdAt: daysAgo(10),
    location: { lat: 32.0835, lng: -81.0998 },
    metrics: { score: 71, confidence: 0.7, impact: 22000 },
    tags: ["diagnostics", "lab", "backlog"],
  },
  {
    title: "Premium Renewal Dip",
    description: "Renewal rate down by 6 points in northeast region.",
    category: "Sales",
    severity: "Low",
    createdAt: daysAgo(25),
    location: { lat: 42.8864, lng: -78.8784 },
    metrics: { score: 49, confidence: 0.58, impact: 7000 },
    tags: ["renewal", "northeast", "retention"],
  },
  {
    title: "Emergency Response Lag",
    description: "Average response time exceeded target by 18%.",
    category: "Safety",
    severity: "High",
    createdAt: daysAgo(3),
    location: { lat: 39.2904, lng: -76.6122 },
    metrics: { score: 89, confidence: 0.84, impact: 43000 },
    tags: ["response", "sla", "emergency"],
  },
  {
    title: "Revenue Leakage Signal",
    description: "Usage not billed for 2.1% of accounts.",
    category: "Sales",
    severity: "Medium",
    createdAt: daysAgo(12),
    location: { lat: 37.3382, lng: -121.8863 },
    metrics: { score: 78, confidence: 0.77, impact: 33000 },
    tags: ["billing", "leakage", "usage"],
  },
  {
    title: "Safety PPE Non-Compliance",
    description: "PPE compliance dropped to 92% for night shift.",
    category: "Safety",
    severity: "Medium",
    createdAt: daysAgo(6),
    location: { lat: 40.7608, lng: -111.891 },
    metrics: { score: 65, confidence: 0.7, impact: 14000 },
    tags: ["ppe", "compliance", "shift"],
  },
];

const users: User[] = [
  {
    id: "u-admin",
    name: "Avery Admin",
    email: "admin@test.com",
    role: "admin",
    password: "password",
  },
  {
    id: "u-analyst",
    name: "Nina Analyst",
    email: "analyst@test.com",
    role: "analyst",
    password: "password",
  },
  {
    id: "u-viewer",
    name: "Victor Viewer",
    email: "viewer@test.com",
    role: "viewer",
    password: "password",
  },
];

const seedEvents = baseEvents.map((event) => ({
  id: randomUUID(),
  createdAt: event.createdAt ?? daysAgo(14),
  ...event,
}));

let events: InsightEvent[] = [...seedEvents];

const severityRank: Record<Severity, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
};

const applyFilters = (data: InsightEvent[], filters: EventFilters) => {
  let filtered = [...data];
  if (filters.lastDays) {
    const cutoff = new Date(Date.now() - filters.lastDays * 86400000);
    filtered = filtered.filter((event) => new Date(event.createdAt) >= cutoff);
  }
  if (filters.from) {
    filtered = filtered.filter(
      (event) => new Date(event.createdAt) >= filters.from!
    );
  }
  if (filters.to) {
    filtered = filtered.filter(
      (event) => new Date(event.createdAt) <= filters.to!
    );
  }
  if (filters.categories?.length) {
    filtered = filtered.filter((event) =>
      filters.categories!.includes(event.category)
    );
  }
  if (filters.severities?.length) {
    filtered = filtered.filter((event) =>
      filters.severities!.includes(event.severity)
    );
  }
  if (typeof filters.minScore === "number") {
    filtered = filtered.filter((event) => event.metrics.score >= filters.minScore!);
  }
  if (filters.q) {
    const q = filters.q.toLowerCase();
    filtered = filtered.filter(
      (event) =>
        event.title.toLowerCase().includes(q) ||
        event.description.toLowerCase().includes(q) ||
        event.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }
  return filtered;
};

const applySort = (data: InsightEvent[], filters: EventFilters) => {
  const sortBy = filters.sort ?? "createdAt";
  const direction = filters.order ?? "desc";
  const sorted = [...data].sort((a, b) => {
    if (sortBy === "severity") {
      return severityRank[a.severity] - severityRank[b.severity];
    }
    if (sortBy === "score") {
      return a.metrics.score - b.metrics.score;
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
  return direction === "desc" ? sorted.reverse() : sorted;
};

export const dataStore = {
  listUsers: () => users.map(({ password, ...rest }) => rest),
  findUserByEmail: (email: string) => users.find((user) => user.email === email),
  updateUserRole: (id: string, role: User["role"]) => {
    const target = users.find((user) => user.id === id);
    if (!target) return null;
    target.role = role;
    const { password, ...rest } = target;
    return rest;
  },
  listEvents: (filters: EventFilters = {}) => {
    const filtered = applyFilters(events, filters);
    const sorted = applySort(filtered, filters);
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const total = sorted.length;
    const paged = sorted.slice((page - 1) * pageSize, page * pageSize);
    return {
      data: paged,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  },
  getEvent: (id: string) => events.find((event) => event.id === id) ?? null,
  createEvent: (payload: Omit<InsightEvent, "id" | "createdAt">) => {
    const newEvent: InsightEvent = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      ...payload,
    };
    events = [newEvent, ...events];
    return newEvent;
  },
  updateEvent: (id: string, patch: Partial<InsightEvent>) => {
    const idx = events.findIndex((event) => event.id === id);
    if (idx === -1) return null;
    events[idx] = { ...events[idx], ...patch };
    return events[idx];
  },
  deleteEvent: (id: string) => {
    const existing = events.find((event) => event.id === id);
    if (!existing) return null;
    events = events.filter((event) => event.id !== id);
    return existing;
  },
};

export type { EventFilters };
