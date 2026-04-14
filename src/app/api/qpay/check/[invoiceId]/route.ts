import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Хэрэглэгч frontend-ээс 3 секунд тутамд энийг дуудаж төлөв шалгана
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });
  }

  const { invoiceId } = await params;

  const invoice = await prisma.qpayInvoice.findUnique({
    where: { invoiceId },
    select: { paid: true, userId: true, expiresAt: true },
  });

  if (!invoice || invoice.userId !== session.user.id) {
    return NextResponse.json({ error: "Invoice олдсонгүй" }, { status: 404 });
  }

  const expired = new Date() > invoice.expiresAt;

  return NextResponse.json({
    paid: invoice.paid,
    expired,
  });
}
