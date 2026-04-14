import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const FAQ_ITEMS = [
  {
    question: "How accurate are the AI match predictions?",
    answer:
      "Our models achieve approximately 95% accuracy on tier-1 CS2 matches when measured against historical results. Accuracy can vary on lower-tier events with less data available. We display confidence scores alongside every prediction so you always know how reliable a forecast is.",
  },
  {
    question: "What data sources power the platform?",
    answer:
      "We aggregate data from official match APIs, community databases, and proprietary scrapers covering all major CS2 tournaments. Team statistics, player performance, map records, and economy data are refreshed in real time during live matches.",
  },
  {
    question: "Can I cancel my subscription at any time?",
    answer:
      "Yes. You can cancel your Pro or VIP subscription from your dashboard at any time. You keep full access until the end of your current billing period. There are no cancellation fees or lock-in contracts.",
  },
  {
    question: "What is the difference between Pro and VIP?",
    answer:
      "Pro gives you unlimited access to all AI predictions, team analytics, and live odds tracking. VIP adds exclusive high-confidence signals curated by our expert analyst team, access to the private Discord community, priority data refresh rates, and the option to book 1-on-1 sessions with our analysts.",
  },
  {
    question: "Is there a free trial for paid plans?",
    answer:
      "Our Free tier gives you a genuine taste of the platform with up to 5 match previews per day. We occasionally run limited-time trials for Pro — sign up to the free plan and you will be notified when a trial is available.",
  },
  {
    question: "Do you cover CS2 Premier and Faceit matches?",
    answer:
      "Currently CS2 Intel Pro focuses on tier-1 and tier-2 professional tournament play covered by ESL, BLAST, PGL, and other major organizers. Premier and Faceit rank-based matchmaking are on the roadmap for a future release.",
  },
];

export function Faq() {
  return (
    <section className="py-24 bg-surface/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked{" "}
            <span className="text-primary text-glow">Questions</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base">
            Everything you need to know before getting started.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Accordion>
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-border">
                <AccordionTrigger className="text-sm font-medium py-4 hover:no-underline hover:text-primary transition-colors">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
