import { PrismaClient } from "@/generated/prisma/client";

// Prisma 7 requires a driver adapter (e.g. @prisma/adapter-pg) to be passed
// to the PrismaClient constructor. This singleton is intentionally typed loosely
// here during scaffolding — wire up the adapter before connecting to a real DB.
// See: https://www.prisma.io/docs/orm/overview/databases/postgresql

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma = globalForPrisma.prisma ?? new (PrismaClient as any)();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
