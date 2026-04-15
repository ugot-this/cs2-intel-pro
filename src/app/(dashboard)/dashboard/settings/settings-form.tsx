"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";

type Props = {
  user: { name: string | null; email: string };
};

export function SettingsForm({ user }: Props) {
  const [profileName, setProfileName] = useState(user.name ?? "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(false);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileName }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setProfileError(d.error ?? "Алдаа гарлаа");
      } else {
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch {
      setProfileError("Сүлжээний алдаа гарлаа");
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(false);
    try {
      const res = await fetch("/api/users/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setPasswordError(d.error ?? "Нууц үг солих амжилтгүй");
      } else {
        setPasswordSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setTimeout(() => setPasswordSuccess(false), 3000);
      }
    } catch {
      setPasswordError("Сүлжээний алдаа гарлаа");
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      {/* Profile */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Профайл мэдээлэл</CardTitle>
          <CardDescription>Нэр болон имэйлийг шинэчлэх</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSave} className="space-y-4">
            {profileError && (
              <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">{profileError}</p>
            )}
            {profileSuccess && (
              <div className="flex items-center gap-2 text-sm text-green-500 bg-green-500/10 border border-green-500/20 rounded-md px-3 py-2">
                <CheckCircle2 className="w-4 h-4" /> Хадгалагдлаа
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Нэр</Label>
              <Input
                id="name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Таны нэр"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Имэйл</Label>
              <Input id="email" value={user.email} disabled className="opacity-60" />
              <p className="text-xs text-muted-foreground">Имэйлийг өөрчлөх боломжгүй</p>
            </div>
            <Button type="submit" disabled={profileLoading}>
              {profileLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Хадгалж байна...</> : "Хадгалах"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Нууц үг солих</CardTitle>
          <CardDescription>Аюулгүй байдлын үүднээс тогтмол солих хэрэгтэй</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {passwordError && (
              <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">{passwordError}</p>
            )}
            {passwordSuccess && (
              <div className="flex items-center gap-2 text-sm text-green-500 bg-green-500/10 border border-green-500/20 rounded-md px-3 py-2">
                <CheckCircle2 className="w-4 h-4" /> Нууц үг солигдлоо
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Одоогийн нууц үг</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Шинэ нууц үг</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">Хамгийн багадаа 8 тэмдэгт</p>
            </div>
            <Button type="submit" disabled={passwordLoading}>
              {passwordLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Солж байна...</> : "Нууц үг солих"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
