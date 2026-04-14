import {
  Brain,
  BarChart3,
  Zap,
  Star,
  History,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const FEATURES = [
  {
    icon: Brain,
    title: "AI Predictions",
    description:
      "Our machine learning models analyze hundreds of data points to deliver win probability forecasts with industry-leading accuracy.",
  },
  {
    icon: BarChart3,
    title: "Team Analytics",
    description:
      "Deep-dive into team performance metrics, map win rates, economy trends, and player statistics across all major tournaments.",
  },
  {
    icon: Zap,
    title: "Live Odds",
    description:
      "Real-time odds tracking and comparison across all major bookmakers. Never miss a value bet with instant alerts.",
  },
  {
    icon: Star,
    title: "VIP Signals",
    description:
      "Exclusive high-confidence signals curated by our expert analysts — reserved for VIP subscribers.",
  },
  {
    icon: History,
    title: "Match History",
    description:
      "Comprehensive historical match database covering years of CS2 data. Identify patterns and trends at a glance.",
  },
  {
    icon: TrendingUp,
    title: "Pro Insights",
    description:
      "Premium written analysis from professional CS2 analysts delivered before every major match.",
  },
];

export function FeaturesGrid() {
  return (
    <section className="py-24 bg-surface/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to{" "}
            <span className="text-primary text-glow">Win</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base">
            A complete toolkit for serious CS2 analysts — from live intelligence
            to deep historical research.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="bg-card border-border hover:border-primary/30 transition-colors group"
              >
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/15 transition-colors">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base font-semibold">
                    {feature.title}
                  </CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent />
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
