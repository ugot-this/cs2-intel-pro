import { auth } from "./auth";
import { prisma } from "./db";
import type { SessionUser } from "@/types";

export function validateRegistration(data: {
  email: string;
  password: string;
  name: string;
}): { valid: true } | { valid: false; error: string } {
  if (!data.email || !data.email.includes("@")) {
    return { valid: false, error: "Valid email is required" };
  }
  if (!data.password || data.password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters" };
  }
  if (!data.name || data.name.trim().length === 0) {
    return { valid: false, error: "Name is required" };
  }
  return { valid: true };
}

export async function createFreeSubscription(userId: string): Promise<void> {
  const freePlan = await prisma.subscriptionPlan.findUnique({
    where: { slug: "free" },
  });
  if (freePlan) {
    await prisma.subscription.create({
      data: {
        userId,
        planId: freePlan.id,
        status: "ACTIVE",
        currentPeriodEnd: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000),
      },
    });
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user) return null;
  return session.user as unknown as SessionUser;
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireAuth();
  if (session.role !== "ADMIN") throw new Error("Forbidden");
  return session;
}
