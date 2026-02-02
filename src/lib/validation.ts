import type { InsightEvent, Severity } from "@/lib/types";

const severities: Severity[] = ["Low", "Medium", "High"];

const isNumber = (value: unknown) =>
  typeof value === "number" && !Number.isNaN(value);

type ValidationResult = { valid: true } | { valid: false; errors: string[] };

export const validateEventPayload = (
  payload: Partial<InsightEvent>,
  mode: "create" | "update"
): ValidationResult => {
  const errors: string[] = [];

  const requireField = (field: keyof InsightEvent) => {
    if (payload[field] === undefined || payload[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  };

  if (mode === "create") {
    requireField("title");
    requireField("description");
    requireField("category");
    requireField("severity");
    requireField("location");
    requireField("metrics");
    requireField("tags");
  }

  if (payload.title !== undefined && payload.title.trim().length < 3) {
    errors.push("Title must be at least 3 characters.");
  }
  if (
    payload.description !== undefined &&
    payload.description.trim().length < 8
  ) {
    errors.push("Description must be at least 8 characters.");
  }
  if (payload.category !== undefined && payload.category.trim().length < 3) {
    errors.push("Category must be at least 3 characters.");
  }
  if (payload.severity !== undefined && !severities.includes(payload.severity)) {
    errors.push("Severity must be Low, Medium, or High.");
  }
  if (payload.location !== undefined) {
    const { lat, lng } = payload.location;
    if (!isNumber(lat) || lat < -90 || lat > 90) {
      errors.push("Location.lat must be between -90 and 90.");
    }
    if (!isNumber(lng) || lng < -180 || lng > 180) {
      errors.push("Location.lng must be between -180 and 180.");
    }
  }
  if (payload.metrics !== undefined) {
    const { score, confidence, impact } = payload.metrics;
    if (!isNumber(score) || score < 0 || score > 100) {
      errors.push("Metrics.score must be between 0 and 100.");
    }
    if (!isNumber(confidence) || confidence < 0 || confidence > 1) {
      errors.push("Metrics.confidence must be between 0 and 1.");
    }
    if (!isNumber(impact) || impact < 0) {
      errors.push("Metrics.impact must be a positive number.");
    }
  }
  if (payload.tags !== undefined) {
    if (!Array.isArray(payload.tags)) {
      errors.push("Tags must be an array of strings.");
    } else if (payload.tags.some((tag) => typeof tag !== "string")) {
      errors.push("Tags must be an array of strings.");
    }
  }

  return errors.length ? { valid: false, errors } : { valid: true };
};
