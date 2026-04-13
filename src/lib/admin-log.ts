import { prisma } from "./db";

export async function logAdminAction(
  adminId: string,
  action: string,
  target?: string,
  details?: Record<string, unknown>
) {
  await prisma.adminLog.create({
    data: {
      adminId,
      action,
      target,
      details: details ? (details as object) : undefined,
    },
  });
}
