import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/hero";
import { Stats } from "@/components/sections/stats";
import { Features } from "@/components/sections/features";
import { Testimonials } from "@/components/sections/testimonials";
import { PricingFull } from "@/components/sections/pricing-full";
import { CTA } from "@/components/sections/cta";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Stats />
        <Features />
        <Testimonials />
        <PricingFull />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
