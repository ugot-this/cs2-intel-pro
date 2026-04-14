import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth-helpers";
import { Badge } from "@/components/ui/badge";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireAuth();

  const PLAN_LABELS: Record<string, string> = {
    free: "Үнэгүй",
    pro: "Pro",
    vip: "VIP",
  };

  const PLAN_COLORS: Record<string, string> = {
    free: "border-border text-muted-foreground",
    pro: "border-primary text-primary",
    vip: "border-yellow-500 text-yellow-500",
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Тохиргоо</h1>
        <p className="text-muted-foreground mt-1">Профайл болон аюулгүй байдлын тохиргоо</p>
      </div>

      {/* Current plan info */}
      <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg max-w-lg">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">Одоогийн төлөвлөгөө</p>
          <p className="font-semibold">{PLAN_LABELS[user.planSlug] ?? user.planSlug}</p>
        </div>
        <Badge variant="outline" className={PLAN_COLORS[user.planSlug] ?? ""}>
          {PLAN_LABELS[user.planSlug] ?? user.planSlug}
        </Badge>
        {user.planSlug === "free" && (
          <a
            href="/pricing"
            className="text-sm text-primary hover:underline font-medium"
          >
            Дэвшүүлэх →
          </a>
        )}
      </div>

      <SettingsForm user={{ name: user.name, email: user.email }} />
    </div>
  );
}
