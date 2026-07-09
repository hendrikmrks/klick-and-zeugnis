import type { SubscriptionLevel } from "@prisma/client";

export const SUBSCRIPTION_LEVELS: SubscriptionLevel[] = ["Free", "Pro", "Premium", "Vip"];

export function getEffectiveSubscriptionLevel(user: {
  subscriptionLevel: SubscriptionLevel;
  subscriptionExpiresAt: Date | null;
}): SubscriptionLevel {
  if (user.subscriptionExpiresAt && user.subscriptionExpiresAt < new Date()) {
    return "Free";
  }
  return user.subscriptionLevel;
}

const PLAN_RANK: Record<SubscriptionLevel, number> = {
  Free: 0,
  Pro: 1,
  Premium: 2,
  Vip: 3,
};

export function isSubscriptionLevel(value: string): value is SubscriptionLevel {
  return SUBSCRIPTION_LEVELS.includes(value as SubscriptionLevel);
}

export function getPlanRank(level: string): number {
  return isSubscriptionLevel(level) ? PLAN_RANK[level] : 0;
}

export function isUpgrade(from: string, to: string): boolean {
  return getPlanRank(to) > getPlanRank(from);
}

export function isDowngrade(from: string, to: string): boolean {
  return getPlanRank(to) < getPlanRank(from);
}

export function hasClassOrganization(level: string): boolean {
  return level === "Premium" || level === "Vip";
}
