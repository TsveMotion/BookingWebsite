"use client";

import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(203,166,247,0.03),transparent_70%)]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center max-w-5xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-black mb-8 leading-tight">
            <span className="gradient-text">Run Your Business.</span><br />
            <span className="text-white">Your Way.</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/70 mb-6 max-w-3xl mx-auto font-body leading-relaxed">
            No commissions. No middlemen. Just clients who love you — and software that helps you grow.
          </p>

          <p className="text-base md:text-lg text-white/50 mb-10 max-w-2xl mx-auto font-body">
            Loved by salons, beauticians, and wellness professionals across the UK
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="gradient" size="lg" className="text-lg px-10 py-6 shadow-2xl shadow-purple-500/30">
                Start Free
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="lg" className="text-lg px-10 py-6">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-white/60 rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}
