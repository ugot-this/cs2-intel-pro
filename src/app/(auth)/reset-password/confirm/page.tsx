"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

export default function ResetPasswordConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <Card className="bg-surface border-border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Invalid Reset Link
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-danger bg-danger/10 border border-danger/20 rounded-md px-4 py-3 text-sm text-center">
            This password reset link is invalid or has expired. Please request a
            new one.
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          <Link
            href="/reset-password"
            className="text-primary hover:underline text-sm"
          >
            Request new reset link
          </Link>
        </CardFooter>
      </Card>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to reset password. Please try again.");
        return;
      }

      router.push("/login?reset=success");
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="bg-surface border-border">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-glow">
          Set New Password
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-danger bg-danger/10 border border-danger/20 rounded-md px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
            <p className="text-xs text-muted">Minimum 8 characters</p>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Resetting…" : "Reset Password"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <Link href="/login" className="text-primary hover:underline text-sm">
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
