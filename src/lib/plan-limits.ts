import type { SubscriptionLevel } from "@prisma/client";
import { getEffectiveSubscriptionLevel } from "./subscription";

export type PlanLimits = { monthLimit: number; saveLimit: number };

export const PLAN_LIMITS: Record<SubscriptionLevel, PlanLimits> = {
  Free: { monthLimit: 5, saveLimit: 1 },
  Pro: { monthLimit: 15, saveLimit: 5 },
  Premium: { monthLimit: 70, saveLimit: 50 },
  Vip: { monthLimit: Number.MAX_SAFE_INTEGER, saveLimit: Number.MAX_SAFE_INTEGER },
};

export const GENERATED_CERTIFICATE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export const GENERATE_INPUT_LIMITS = {
  nameMaxLength: 100,
  genderMaxLength: 20,
  gradeMaxLength: 10,
  maxSkills: 20,
  maxRoles: 10,
  itemMaxLength: 100,
} as const;

export function getPlanLimits(level: SubscriptionLevel): PlanLimits {
  return PLAN_LIMITS[level] ?? PLAN_LIMITS.Free;
}

export function getPlanLimitsForUser(user: {
  subscriptionLevel: SubscriptionLevel;
  subscriptionExpiresAt: Date | null;
}): PlanLimits {
  return getPlanLimits(getEffectiveSubscriptionLevel(user));
}

export function getMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => w.trim().length > 0).length;
}

export function sanitizeStringArray(
  value: unknown,
  maxItems: number,
  maxLength: number
): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().slice(0, maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
}
