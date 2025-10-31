"use client";

import { motion } from "framer-motion";
import { Button } from "../ui/button";

export function CTA() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(203,166,247,0.05),transparent_70%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card p-12 md:p-20 text-center max-w-4xl mx-auto"
        >
          <h2 className="text-4xl md:text-6xl font-heading font-black mb-6">
            <span className="gradient-text">Your Time Is Valuable.</span><br />
            Stop Wasting It.
          </h2>
          <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            Take control of your bookings, payments, and client relationships. No commissions. Ever.
          </p>
          
          <Button variant="gradient" size="lg" className="text-lg px-12">
            Start Free
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
