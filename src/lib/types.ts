export type Role = "admin" | "analyst" | "viewer";

export type Severity = "Low" | "Medium" | "High";

export type InsightEvent = {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: Severity;
  createdAt: string;
  location: {
    lat: number;
    lng: number;
  };
  metrics: {
    score: number;
    confidence: number;
    impact: number;
  };
  tags: string[];
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  password: string;
};
