"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Check, X, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Plan = {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  features: string[];
  stripePriceId: string | null;
};

type QpayData = {
  invoiceId: string;
  qrImage: string;
  qrText: string;
  urls: Array<{ name: string; description: string; logo: string; link: string }>;
  amount: number;
  expiresAt: string;
  planName: string;
};

// Монгол банкны нэрүүд товчлол
const BANK_COLORS: Record<string, string> = {
  "Khan Bank": "bg-[#005baa]",
  "Golomt Bank": "bg-[#e31837]",
  "TDB": "bg-[#1a3c6e]",
  "Xac Bank": "bg-[#f7941d]",
  "State Bank": "bg-[#00853f]",
};

function QpayModal({ data, onClose }: { data: QpayData; onClose: () => void }) {
  const [status, setStatus] = useState<"pending" | "paid" | "expired">("pending");
  const [secondsLeft, setSecondsLeft] = useState(
    Math.max(0, Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000))
  );

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/qpay/check/${data.invoiceId}`);
      const json = await res.json();
      if (json.paid) {
        setStatus("paid");
        setTimeout(() => (window.location.href = "/dashboard?payment=success"), 1500);
      } else if (json.expired) {
        setStatus("expired");
      }
    } catch {
      // network error — дараа дахин оролдоно
    }
  }, [data.invoiceId]);

  // 3 секунд тутамд poll хийх
  useEffect(() => {
    if (status !== "pending") return;
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [status, checkStatus]);

  // Countdown timer
  useEffect(() => {
    if (status !== "pending") return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setStatus("expired");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border rounded-xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-bold text-lg">QPay төлбөр</h2>
          <button onClick={onClose} className="text-muted hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {status === "pending" && (
            <>
              {/* Үнийн мэдээлэл */}
              <div className="text-center">
                <p className="text-muted text-sm">{data.planName} төлөвлөгөө</p>
                <p className="text-3xl font-bold text-primary mt-1">
                  ₮{data.amount.toLocaleString()}
                </p>
                <p className="text-xs text-muted mt-1">сард нэг удаа</p>
              </div>

              {/* QR код */}
              <div className="flex justify-center">
                <div className="border-4 border-primary rounded-lg p-2 bg-white">
                  <Image
                    src={`data:image/png;base64,${data.qrImage}`}
                    alt="QPay QR код"
                    width={180}
                    height={180}
                    unoptimized
                  />
                </div>
              </div>

              {/* Хугацаа */}
              <div className="text-center">
                <p className="text-sm text-muted">Хугацаа дуусна:</p>
                <p className={cn(
                  "text-2xl font-mono font-bold",
                  secondsLeft < 60 ? "text-red-500" : "text-primary"
                )}>
                  {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </p>
              </div>

              {/* Банкны app линкүүд */}
              {data.urls.length > 0 && (
                <div>
                  <p className="text-xs text-muted text-center mb-2">Эсвэл банкны аппаар нэвтрэх</p>
                  <div className="grid grid-cols-3 gap-2">
                    {data.urls.slice(0, 6).map((bank) => (
                      <a
                        key={bank.name}
                        href={bank.link}
                        className={cn(
                          "flex flex-col items-center gap-1 p-2 rounded-lg text-white text-xs font-medium transition-opacity hover:opacity-90",
                          BANK_COLORS[bank.name] ?? "bg-gray-600"
                        )}
                      >
                        {bank.logo ? (
                          <img src={bank.logo} alt={bank.name} className="w-6 h-6 object-contain" />
                        ) : null}
                        <span className="text-center leading-tight">{bank.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted text-center">
                QPay аппаар эсвэл банкны аппаар QR кодыг скан хийнэ үү
              </p>
            </>
          )}

          {status === "paid" && (
            <div className="flex flex-col items-center gap-4 py-6">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
              <div className="text-center">
                <p className="text-xl font-bold text-green-500">Төлбөр амжилттай!</p>
                <p className="text-muted text-sm mt-1">Dashboard руу шилжиж байна...</p>
              </div>
              <Loader2 className="w-5 h-5 animate-spin text-muted" />
            </div>
          )}

          {status === "expired" && (
            <div className="flex flex-col items-center gap-4 py-6">
              <X className="w-16 h-16 text-red-500" />
              <div className="text-center">
                <p className="text-xl font-bold text-red-500">Хугацаа дууссан</p>
                <p className="text-muted text-sm mt-1">QR кодны хугацаа дууссан байна</p>
              </div>
              <Button onClick={onClose} variant="outline" className="mt-2">
                Дахин оролдох
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PricingPageClient({ plans }: { plans: Plan[] }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<string | null>(null);
  const [qpayData, setQpayData] = useState<QpayData | null>(null);

  async function handleCheckout(plan: Plan) {
    if (!session) {
      window.location.href = "/register";
      return;
    }
    setLoading(plan.id);
    try {
      const res = await fetch("/api/qpay/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planSlug: plan.slug }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "Алдаа гарлаа. Дахин оролдоно уу.");
        return;
      }
      const data = await res.json();
      setQpayData({ ...data, planName: plan.name });
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      {qpayData && (
        <QpayModal data={qpayData} onClose={() => setQpayData(null)} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => {
          const isPro = plan.slug === "pro";
          const isFree = plan.slug === "free";
          const mntPrice = isPro ? 50_000 : plan.slug === "vip" ? 100_000 : 0;

          return (
            <Card
              key={plan.id}
              className={cn(
                "relative flex flex-col bg-card border",
                isPro ? "border-primary shadow-glow scale-105" : "border-border"
              )}
            >
              {isPro && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3">Хамгийн алдартай</Badge>
                </div>
              )}
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <div className="mt-2">
                  {isFree ? (
                    <span className="text-4xl font-bold text-primary">Үнэгүй</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-primary">
                        ₮{mntPrice.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">/сар</span>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 flex-1 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={cn("w-full", isPro && "shadow-glow")}
                  variant={isPro ? "default" : "outline"}
                  disabled={loading === plan.id}
                  onClick={() =>
                    isFree ? (window.location.href = "/register") : handleCheckout(plan)
                  }
                >
                  {loading === plan.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Уншиж байна...
                    </>
                  ) : isFree ? (
                    "Үнэгүй эхлэх"
                  ) : (
                    `${plan.name} авах`
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
