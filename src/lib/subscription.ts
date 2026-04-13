import type { PlanSlug } from "@/types";

export const PLAN_TIERS: Record<PlanSlug, number> = {
  free: 0,
  pro: 1,
  vip: 2,
};

export function getPlanTier(planSlug: string): number {
  return PLAN_TIERS[planSlug as PlanSlug] ?? 0;
}

export function hasAccess(userPlan: string, requiredPlan: string): boolean {
  return getPlanTier(userPlan) >= getPlanTier(requiredPlan);
}
