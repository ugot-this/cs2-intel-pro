import { Prisma } from "@prisma/client";
import { prisma } from "./db";

export async function logAdminAction(
  adminId: string,
  action: string,
  target?: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.adminLog.create({
      data: {
        adminId,
        action,
        target,
        details: details as Prisma.InputJsonValue ?? undefined,
      },
    });
  } catch (err) {
    console.error("[admin-log] Failed to write audit log:", err);
  }
}
