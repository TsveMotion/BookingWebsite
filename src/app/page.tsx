import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/hero";
import { Stats } from "@/components/sections/stats";
import { Features } from "@/components/sections/features";
import { PricingPreview } from "@/components/sections/pricing-preview";
import { CTA } from "@/components/sections/cta";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Stats />
        <Features />
        <PricingPreview />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
