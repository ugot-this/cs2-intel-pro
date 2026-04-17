"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Crosshair, LayoutDashboard, TrendingUp, Users, Trophy, Crown, Settings, LogOut,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/use-session";
import { cn } from "@/lib/utils";

interface NavItem { href: string; label: string; icon: React.ElementType; planBadge?: string; }

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard",              label: "Overview",     icon: LayoutDashboard },
  { href: "/dashboard/predictions",  label: "Predictions",  icon: TrendingUp },
  { href: "/dashboard/teams",        label: "Teams",        icon: Users },
  { href: "/dashboard/pro/analytics", label: "Pro Analytics", icon: Trophy, planBadge: "pro" },
  { href: "/dashboard/vip/signals",   label: "VIP Signals",  icon: Crown,  planBadge: "vip" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const user = useCurrentUser();

  return (
    <aside className="flex h-full w-56 flex-col border-r border-border/60 bg-card">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-border/60 px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Crosshair className="h-4 w-4 text-primary" />
          </div>
          <span className="font-black text-sm tracking-tight">
            CS2{" "}
            <span className="text-primary">Intel</span>
            {" "}Pro
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2.5 space-y-0.5">
        <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.25em] px-3 py-2">Navigation</p>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/8 text-primary"
                  : "text-muted-foreground/70 hover:bg-border/40 hover:text-foreground"
              )}
            >
              {/* Active left bar */}
              {isActive && (
                <span className="absolute left-0 inset-y-2 w-0.5 rounded-full bg-primary" />
              )}
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-sm">{item.label}</span>
              {item.planBadge && (
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded",
                  item.planBadge === "vip"
                    ? "bg-yellow-400/10 text-yellow-400"
                    : "bg-primary/10 text-primary"
                )}>
                  {item.planBadge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border/60 p-2.5 space-y-0.5">
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
            pathname === "/dashboard/settings"
              ? "bg-primary/8 text-primary"
              : "text-muted-foreground/70 hover:bg-border/40 hover:text-foreground"
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground/50 hover:bg-red-500/8 hover:text-red-400 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
        {/* User info */}
        {user && (
          <div className="mt-2 px-3 py-2 rounded-lg bg-background/30 border border-border/30">
            <p className="text-[11px] font-bold text-foreground truncate">{user.name ?? user.email}</p>
            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-medium">{user.planSlug ?? "free"} plan</p>
          </div>
        )}
      </div>
    </aside>
  );
}
