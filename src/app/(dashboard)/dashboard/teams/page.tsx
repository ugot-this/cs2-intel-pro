import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth-helpers";
import { TEAMS } from "@/lib/cs2-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Teams" };

const REGION_COLORS: Record<string, string> = {
  EU: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  NA: "bg-red-500/10 text-red-400 border-red-500/30",
  CIS: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  APAC: "bg-green-500/10 text-green-400 border-green-500/30",
};

function FormBadge({ result }: { result: "W" | "L" }) {
  return (
    <span className={cn(
      "inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold",
      result === "W" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
    )}>
      {result}
    </span>
  );
}

export default async function TeamsPage() {
  await requireAuth();

  const sorted = [...TEAMS].sort((a, b) => b.rating - a.rating);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Багуудын статистик</h1>
        <p className="text-muted-foreground mt-1">CS2 дэлхийн шилдэг багуудын мэдээлэл</p>
      </div>

      {/* Top 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sorted.slice(0, 3).map((team, i) => (
          <Card key={team.id} className={cn(
            "bg-card border-border",
            i === 0 && "border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]"
          )}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{team.logo}</span>
                  <div>
                    <CardTitle className="text-base">{team.name}</CardTitle>
                    <Badge variant="outline" className={cn("text-xs mt-0.5", REGION_COLORS[team.region])}>
                      {team.region}
                    </Badge>
                  </div>
                </div>
                <span className={cn(
                  "text-2xl font-black",
                  i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : "text-amber-600"
                )}>
                  #{i + 1}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                  <p className="font-bold text-primary">{team.rating}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ялалтын хувь</p>
                  <p className="font-bold text-green-400">{team.winRate}%</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Сүүлийн 5 тоглоом</p>
                <div className="flex gap-1">
                  {team.recentForm.map((r, idx) => <FormBadge key={idx} result={r} />)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Дэлхийн рейтинг</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background/40">
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium w-10">#</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Баг</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Бүс</th>
                  <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Rating</th>
                  <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">WR%</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Хэлбэр</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium hidden lg:table-cell">Тоглогчид</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sorted.map((team, i) => {
                  const wins = team.recentForm.filter(r => r === "W").length;
                  const trending = wins >= 3;
                  return (
                    <tr key={team.id} className="hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground font-medium">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{team.logo}</span>
                          <div>
                            <p className="font-semibold">{team.name}</p>
                            <p className="text-xs text-muted-foreground">{team.tag}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={cn("text-xs", REGION_COLORS[team.region])}>
                          {team.region}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-primary">{team.rating}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={cn("font-medium", team.winRate >= 60 ? "text-green-400" : team.winRate >= 55 ? "text-yellow-400" : "text-red-400")}>
                          {team.winRate}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {team.recentForm.map((r, idx) => <FormBadge key={idx} result={r} />)}
                          </div>
                          {trending
                            ? <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                            : <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                          }
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <p className="text-xs text-muted-foreground">{team.players.join(", ")}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
