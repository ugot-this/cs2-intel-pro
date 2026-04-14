import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

const values = [
  {
    title: "Data-Driven",
    description:
      "Every insight is grounded in real match data. We surface patterns and statistics that help you make better decisions — not gut feelings.",
  },
  {
    title: "Community First",
    description:
      "Built for players, analysts, and fans. We listen to the community and build what actually matters for improving your CS2 game.",
  },
  {
    title: "Always Improving",
    description:
      "CS2 evolves fast. Our platform keeps pace — with new maps, updated meta analysis, and fresh features shipping every week.",
  },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      {/* Hero */}
      <section className="mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">About CS2 Intel Pro</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
          The professional-grade analysis platform built to give CS2 players and teams a
          competitive edge through real-time data, deep statistics, and actionable insights.
        </p>
      </section>

      {/* Our Story */}
      <section className="mb-16">
        <div className="bg-card border border-border rounded-xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary">Our Story</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              CS2 Intel Pro was founded by a group of competitive players and data engineers who
              were frustrated by the lack of accessible, high-quality analysis tools for the CS2
              community. Pro teams had proprietary software — everyone else was left with
              spreadsheets and gut instinct.
            </p>
            <p>
              We set out to change that. Starting with match data aggregation and heatmap
              generation, we built CS2 Intel Pro from the ground up to be fast, accurate, and
              genuinely useful — whether you&apos;re grinding ranked or preparing for a
              tournament.
            </p>
            <p>
              Today, thousands of players and analysts rely on our platform every day to review
              their matches, scout opponents, and stay ahead of the ever-shifting CS2 meta.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section>
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((value) => (
            <div
              key={value.title}
              className="bg-card border border-border rounded-xl p-6 hover:border-primary/40 transition-colors"
            >
              <h3 className="text-lg font-semibold mb-3 text-primary">{value.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
