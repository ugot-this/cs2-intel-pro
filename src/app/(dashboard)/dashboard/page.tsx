import type { Metadata } from "next";
import Link from "next/link";
import { requireAuth } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Users,
  BarChart2,
  Zap,
  ArrowRight,
  Activity,
  Clock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await requireAuth();

  const statCards = [
    {
      label: "Current Plan",
      value: user.planSlug.toUpperCase(),
      icon: Zap,
      isText: true,
    },
    {
      label: "Matches Analyzed",
      value: "2,847",
      icon: BarChart2,
      isText: false,
    },
    {
      label: "Win Rate",
      value: "67%",
      icon: TrendingUp,
      isText: false,
    },
    {
      label: "ROI",
      value: "+23.4%",
      icon: Activity,
      isText: false,
    },
  ];

  const recentActivity = [
    { action: "Match analysis completed", subject: "NAVI vs Vitality", time: "2 hours ago" },
    { action: "Prediction generated", subject: "FaZe Clan vs G2", time: "5 hours ago" },
    { action: "Team stats updated", subject: "Team Liquid", time: "1 day ago" },
    { action: "Signal triggered", subject: "Astralis vs Cloud9", time: "2 days ago" },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back,{" "}
            <span className="text-primary text-glow">
              {user.name ?? user.email}
            </span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s your CS2 Intel Pro overview
          </p>
        </div>
        <Badge
          variant="outline"
          className="border-primary text-primary capitalize text-sm px-3 py-1"
        >
          {user.planSlug} plan
        </Badge>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="bg-card border-border">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {card.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button render={<Link href="/dashboard/predictions"><TrendingUp className="h-4 w-4" />View Predictions<ArrowRight className="h-4 w-4" /></Link>} variant="default" className="gap-2" />
          <Button render={<Link href="/dashboard/teams"><Users className="h-4 w-4" />Team Stats</Link>} variant="outline" className="gap-2 border-border hover:border-primary hover:text-primary" />
          {user.planSlug !== "vip" && (
            <Button render={<Link href="/dashboard/settings"><Zap className="h-4 w-4" />Upgrade Plan</Link>} variant="outline" className="gap-2 border-primary/50 text-primary hover:bg-primary/10" />
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Recent Activity
        </h2>
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {recentActivity.map((item, index) => (
                <li key={index} className="flex items-start gap-3 px-5 py-4">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      {item.action}{" "}
                      <span className="font-medium text-primary">
                        {item.subject}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.time}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
