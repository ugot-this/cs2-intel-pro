"use client";

import { useState } from "react";
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

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <Card className="bg-surface border-border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-glow">
            Check Your Email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted">
            If an account exists for that email address, we&apos;ve sent a
            password reset link. Please check your inbox and spam folder.
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Link href="/login" className="text-primary hover:underline text-sm">
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="bg-surface border-border">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-glow">
          Reset Password
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-muted text-sm">
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </p>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending…" : "Send Reset Link"}
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
