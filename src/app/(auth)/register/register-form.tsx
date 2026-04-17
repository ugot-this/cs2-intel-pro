"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Crosshair, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export function RegisterForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();

  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Password strength hints
  const pwdLen   = password.length >= 8;
  const pwdUpper = /[A-Z]/.test(password);
  const pwdNum   = /[0-9]/.test(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Бүртгэл үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.");
        return;
      }

      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("Бүртгэл үүслээ, гэхч нэвтрэхэд алдаа гарлаа. Нэвтрэх хуудас руу орно уу.");
        router.push("/login");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.4)]">
      {/* Header */}
      <div className="px-7 pt-7 pb-5 border-b border-border/40">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Crosshair className="w-4 h-4 text-primary" />
          </div>
          <span className="font-black text-sm tracking-tight">
            CS2 <span className="text-primary">Intel</span> Pro
          </span>
        </div>
        <h1 className="text-2xl font-black leading-tight">Бүртгүүлэх</h1>
        <p className="text-muted-foreground/60 text-sm mt-1">
          Үнэгүй данс үүсгэж эхлэх
        </p>
      </div>

      <div className="px-7 py-6 space-y-5">
        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-2.5 rounded-lg border border-red-500/25 bg-red-500/8 px-4 py-3 text-sm text-red-400">
            <span className="shrink-0 mt-0.5 text-red-400/60">⚠</span>
            {error}
          </div>
        )}

        {/* Google button */}
        {googleEnabled && (
          <>
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
              className={cn(
                "w-full flex items-center justify-center gap-3 rounded-xl border border-border/60 bg-background/40 h-11 text-sm font-semibold transition-all",
                "hover:border-border hover:bg-background/70",
                "disabled:opacity-60 disabled:cursor-not-allowed"
              )}
            >
              {googleLoading ? (
                <span className="w-4 h-4 rounded-full border-2 border-border border-t-primary animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              Google-ээр үргэлжлүүлэх
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border/40" />
              <span className="text-[11px] text-muted-foreground/40 uppercase tracking-widest font-semibold">эсвэл</span>
              <div className="flex-1 h-px bg-border/40" />
            </div>
          </>
        )}

        {/* Registration form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-widest">
              Нэр
            </label>
            <input
              id="name"
              type="text"
              placeholder="Таны нэр"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoComplete="name"
              className={cn(
                "w-full h-10 rounded-xl border border-border/60 bg-background/40 px-3.5 text-sm",
                "placeholder:text-muted-foreground/30",
                "focus:outline-none focus:border-primary/50 focus:bg-background/60",
                "transition-colors"
              )}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-widest">
              Имэйл
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={cn(
                "w-full h-10 rounded-xl border border-border/60 bg-background/40 px-3.5 text-sm",
                "placeholder:text-muted-foreground/30",
                "focus:outline-none focus:border-primary/50 focus:bg-background/60",
                "transition-colors"
              )}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-widest">
              Нууц үг
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPwd ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className={cn(
                  "w-full h-10 rounded-xl border border-border/60 bg-background/40 px-3.5 pr-10 text-sm",
                  "placeholder:text-muted-foreground/30",
                  "focus:outline-none focus:border-primary/50 focus:bg-background/60",
                  "transition-colors"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength hints */}
            {password.length > 0 && (
              <div className="flex items-center gap-3 pt-0.5">
                {[
                  { ok: pwdLen,   label: "8+ тэмдэгт" },
                  { ok: pwdUpper, label: "Том үсэг" },
                  { ok: pwdNum,   label: "Тоо" },
                ].map(({ ok, label }) => (
                  <span key={label} className={cn(
                    "flex items-center gap-1 text-[10px] font-semibold transition-colors",
                    ok ? "text-primary" : "text-muted-foreground/40"
                  )}>
                    <Check className={cn("w-2.5 h-2.5", ok ? "opacity-100" : "opacity-30")} />
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-xl h-11 text-sm font-bold tracking-wide transition-all mt-1",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 shadow-[0_0_20px_rgba(0,255,136,0.2)] hover:shadow-[0_0_30px_rgba(0,255,136,0.3)]",
              "disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
            )}
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
            ) : (
              <>Бүртгүүлэх <ArrowRight className="w-3.5 h-3.5" /></>
            )}
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="px-7 py-4 border-t border-border/40 bg-background/20 text-center">
        <p className="text-sm text-muted-foreground/50">
          Бүртгэл байгаа юу?{" "}
          <Link href="/login" className="text-primary font-semibold hover:text-primary/80 transition-colors">
            Нэвтрэх
          </Link>
        </p>
      </div>
    </div>
  );
}
