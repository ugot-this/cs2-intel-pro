import { Activity, MapPin } from "lucide-react";

export function LivePreview() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Live Match{" "}
            <span className="text-primary text-glow">Intelligence</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base">
            Real-time win probabilities, map analysis, and odds — all in one
            unified view.
          </p>
        </div>

        {/* Mock match card */}
        <div className="max-w-2xl mx-auto">
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-glow">
            {/* Match header */}
            <div className="px-5 py-3 border-b border-border bg-surface flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Live
                </span>
                <span className="text-xs text-muted-foreground">
                  · ESL Pro League S19
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                Nuke
              </div>
            </div>

            {/* Teams */}
            <div className="px-5 py-6">
              {/* Team row */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-surface border border-border flex items-center justify-center text-sm font-bold text-primary">
                    NV
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Natus Vincere</p>
                    <p className="text-xs text-muted-foreground">#3 World</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">13</p>
                  <p className="text-xs text-muted-foreground">Rounds</p>
                </div>
              </div>

              {/* Win probability bar */}
              <div className="mb-5">
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span className="font-medium text-primary">64%</span>
                  <span className="font-medium">Win Probability</span>
                  <span>36%</span>
                </div>
                <div className="h-2 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary shadow-glow"
                    style={{ width: "64%" }}
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs font-bold text-muted-foreground">
                  VS
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Team 2 row */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-surface border border-border flex items-center justify-center text-sm font-bold text-muted-foreground">
                    FZ
                  </div>
                  <div>
                    <p className="font-semibold text-sm">FaZe Clan</p>
                    <p className="text-xs text-muted-foreground">#1 World</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">10</p>
                  <p className="text-xs text-muted-foreground">Rounds</p>
                </div>
              </div>
            </div>

            {/* Odds footer */}
            <div className="px-5 py-3 border-t border-border bg-surface/50 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Activity className="h-3.5 w-3.5" />
                Live odds updated
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">NaVi</p>
                  <p className="text-sm font-bold text-primary">1.56</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">FaZe</p>
                  <p className="text-sm font-bold">2.40</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Decorative preview — real data available with a free account
          </p>
        </div>
      </div>
    </section>
  );
}
