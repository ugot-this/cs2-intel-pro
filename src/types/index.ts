import type { User, Subscription, SubscriptionPlan } from "@prisma/client";

export type UserWithSubscription = User & {
  subscription:
    | (Subscription & {
        plan: SubscriptionPlan;
      })
    | null;
};

export type PlanSlug = "free" | "pro" | "vip";

export type SessionUser = {
  userId: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  planSlug: PlanSlug;
};

export type ApiResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };
