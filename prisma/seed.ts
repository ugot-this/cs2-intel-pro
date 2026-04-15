import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create default subscription plans
  const freePlan = await prisma.subscriptionPlan.upsert({
    where: { slug: "free" },
    update: {},
    create: {
      name: "Free",
      slug: "free",
      price: 0,
      features: JSON.stringify([
        "3 predictions per day",
        "Basic team stats",
        "Match schedules",
      ]),
      isActive: true,
      sortOrder: 0,
    },
  });

  const proPlan = await prisma.subscriptionPlan.upsert({
    where: { slug: "pro" },
    update: {},
    create: {
      name: "Pro",
      slug: "pro",
      price: 14.99,
      features: JSON.stringify([
        "Unlimited predictions",
        "AI win probabilities",
        "Advanced player analytics",
        "Map pool analysis",
        "Head-to-head history",
      ]),
      isActive: true,
      sortOrder: 1,
    },
  });

  const vipPlan = await prisma.subscriptionPlan.upsert({
    where: { slug: "vip" },
    update: {},
    create: {
      name: "VIP",
      slug: "vip",
      price: 29.99,
      features: JSON.stringify([
        "Everything in Pro",
        "Model confidence scores",
        "Real-time alerts",
        "Discord/Telegram signals",
        "Priority access to new features",
      ]),
      isActive: true,
      sortOrder: 2,
    },
  });

  // Create admin user
  const adminPasswordHash = await hash("admin123!", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@cs2intelpro.com" },
    update: {},
    create: {
      email: "admin@cs2intelpro.com",
      name: "Admin",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  // Give admin VIP subscription
  await prisma.subscription.upsert({
    where: { userId: adminUser.id },
    update: { planId: vipPlan.id, status: "ACTIVE" },
    create: {
      userId: adminUser.id,
      planId: vipPlan.id,
      status: "ACTIVE",
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("Seeded:", { freePlan, proPlan, vipPlan, adminUser: adminUser.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
