import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { HeroNew } from "@/components/sections/hero-new";
import { Trending } from "@/components/sections/trending";
import { AppPromo } from "@/components/sections/app-promo";
import { ForBusinesses } from "@/components/sections/for-businesses";
import { TestimonialsNew } from "@/components/sections/testimonials-new";
import { StatsNew } from "@/components/sections/stats-new";
import { PricingWithStripe } from "@/components/sections/pricing-with-stripe";
import { CTANew } from "@/components/sections/cta-new";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <HeroNew />
        <Trending />
        <AppPromo />
        <ForBusinesses />
        <TestimonialsNew />
        <StatsNew />
        <PricingWithStripe />
        <CTANew />
      </main>
      <Footer />
    </>
  );
}
