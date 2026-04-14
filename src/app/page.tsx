import { MarketingNav } from "@/components/layout/marketing-nav";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { Hero } from "@/components/marketing/hero";
import { FeaturesGrid } from "@/components/marketing/features-grid";
import { LivePreview } from "@/components/marketing/live-preview";
import { PricingTeaser } from "@/components/marketing/pricing-teaser";
import { Testimonials } from "@/components/marketing/testimonials";
import { Faq } from "@/components/marketing/faq";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="flex-1">
        <Hero />
        <LivePreview />
        <FeaturesGrid />
        <PricingTeaser />
        <Testimonials />
        <Faq />
      </main>
      <MarketingFooter />
    </div>
  );
}
