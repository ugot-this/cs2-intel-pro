import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkPayment } from "@/lib/qpay";

// QPay манай сервер рүү дуудна — нэвтрэлт шаардахгүй
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Буруу payload" }, { status: 400 });
  }

  const invoiceId = body.invoice_id as string | undefined;
  if (!invoiceId) {
    return NextResponse.json({ error: "invoice_id байхгүй" }, { status: 400 });
  }

  // DB-ээс invoice олох
  const qpayInvoice = await prisma.qpayInvoice.findUnique({
    where: { invoiceId },
    include: { user: true, plan: true },
  });

  if (!qpayInvoice || qpayInvoice.paid) {
    return NextResponse.json({ ok: true }); // давтагдсан callback — алгасах
  }

  // QPay-аас төлбөр баталгаажуулах
  const payment = await checkPayment(invoiceId).catch(() => null);
  if (!payment?.paid) {
    return NextResponse.json({ ok: true }); // төлөгдөөгүй
  }

  // Subscription идэвхжүүлэх
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  await prisma.$transaction(async (tx) => {
    // Subscription үүсгэх эсвэл шинэчлэх
    await tx.subscription.upsert({
      where: { userId: qpayInvoice.userId },
      create: {
        userId: qpayInvoice.userId,
        planId: qpayInvoice.planId,
        status: "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
      update: {
        planId: qpayInvoice.planId,
        status: "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      },
    });

    // Subscription ID авах
    const sub = await tx.subscription.findUniqueOrThrow({
      where: { userId: qpayInvoice.userId },
    });

    // Payment бүртгэх
    await tx.payment.create({
      data: {
        userId: qpayInvoice.userId,
        subscriptionId: sub.id,
        qpayPaymentId: payment.paymentId ?? invoiceId,
        amount: qpayInvoice.amount,
        currency: "MNT",
        status: "SUCCEEDED",
      },
    });

    // Invoice-г төлөгдсөн гэж тэмдэглэх
    await tx.qpayInvoice.update({
      where: { invoiceId },
      data: { paid: true },
    });
  });

  return NextResponse.json({ ok: true });
}
