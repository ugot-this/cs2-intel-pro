import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createInvoice } from "@/lib/qpay";
import { randomUUID } from "crypto";

// QPay invoice хугацаа — 30 минут
const INVOICE_TTL_MS = 30 * 60 * 1000;

// Нэг төлөвлөгөөний MNT үнэ
const MNT_PRICES: Record<string, number> = {
  pro: 50_000,
  vip: 100_000,
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { planSlug } = body as { planSlug?: string };
  if (!planSlug || planSlug === "free") {
    return NextResponse.json({ error: "Буруу төлөвлөгөө" }, { status: 400 });
  }

  const plan = await prisma.subscriptionPlan.findUnique({ where: { slug: planSlug } });
  if (!plan || !plan.isActive) {
    return NextResponse.json({ error: "Төлөвлөгөө олдсонгүй" }, { status: 404 });
  }

  // MNT үнэ: DB-д байвал тэрийг, үгүй бол хатуу кодлосон утга
  const amount = plan.priceMnt ?? MNT_PRICES[planSlug] ?? 50_000;

  const orderId = randomUUID().replace(/-/g, "").slice(0, 20);
  const callbackUrl = `${process.env.NEXTAUTH_URL}/api/qpay/callback`;

  const invoice = await createInvoice({
    orderId,
    description: `CS2 Intel Pro — ${plan.name}`,
    amount,
    callbackUrl,
  });

  // Invoice-г DB-д хадгалах
  await prisma.qpayInvoice.create({
    data: {
      userId: session.user.id,
      planId: plan.id,
      invoiceId: invoice.invoiceId,
      orderId,
      qrText: invoice.qrText,
      qrImage: invoice.qrImage,
      amount,
      expiresAt: new Date(Date.now() + INVOICE_TTL_MS),
    },
  });

  return NextResponse.json({
    invoiceId: invoice.invoiceId,
    qrImage: invoice.qrImage,
    qrText: invoice.qrText,
    urls: invoice.urls,
    amount,
    expiresAt: new Date(Date.now() + INVOICE_TTL_MS).toISOString(),
  });
}
