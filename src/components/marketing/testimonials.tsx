const TESTIMONIALS = [
  {
    quote:
      "CS2 Intel Pro completely changed how I approach match analysis. The win probability models are eerily accurate — I use them before every single bet.",
    name: "Alex K.",
    role: "Pro Bettor, 3 years",
    initial: "AK",
  },
  {
    quote:
      "The VIP signals alone more than pay for the subscription. I've gone from breaking even to consistently profitable since upgrading.",
    name: "Maria S.",
    role: "Esports Analyst",
    initial: "MS",
  },
  {
    quote:
      "No other platform gives me the depth of team analytics I get here. The map-by-map breakdown is something my whole team relies on for scouting.",
    name: "Jake T.",
    role: "Coach, Semi-Pro Team",
    initial: "JT",
  },
  {
    quote:
      "I was skeptical at first but the free tier already gave me insights I wasn't finding anywhere else. Upgraded to Pro within a week.",
    name: "Nina L.",
    role: "CS2 Content Creator",
    initial: "NL",
  },
];

export function Testimonials() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by CS2{" "}
            <span className="text-primary text-glow">Professionals</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base">
            Join thousands of analysts, bettors, and coaches who rely on CS2
            Intel Pro every match day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4"
            >
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {t.initial}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
