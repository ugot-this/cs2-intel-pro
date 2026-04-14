import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PlanEditForm } from "./edit-form";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plan = await prisma.subscriptionPlan.findUnique({ where: { id }, select: { name: true } });
  return { title: plan ? `Edit: ${plan.name}` : "Plan Not Found" };
}

export default async function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plan = await prisma.subscriptionPlan.findUnique({ where: { id } });
  if (!plan) notFound();
  return <PlanEditForm plan={{
    id: plan.id, name: plan.name, slug: plan.slug, price: Number(plan.price),
    currency: plan.currency, features: JSON.stringify(plan.features, null, 2),
    sortOrder: plan.sortOrder, isActive: plan.isActive,
  }} />;
}
