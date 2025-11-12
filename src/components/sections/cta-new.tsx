"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Calendar } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

export function CTANew() {
  return (
    <section className="py-24 bg-black relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-glam-gradient opacity-10" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(179,140,255,0.15),transparent_70%)]" />
      </div>

      {/* Animated gradient orbs */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-glam-purple/20 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-glam-pink/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1s' }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            {/* Sparkles decoration */}
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-6"
            >
              <Sparkles className="w-12 h-12 text-glam-purple" />
            </motion.div>

            {/* Headline */}
            <h2 className="text-5xl md:text-7xl font-heading font-black mb-6 leading-tight">
              <span className="text-white">Run Your Business.</span>
              <br />
              <span className="bg-glam-gradient bg-clip-text text-transparent">
                Your Way.
              </span>
            </h2>

            {/* Subtext */}
            <p className="text-xl md:text-2xl text-white/70 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join 300+ UK beauty professionals who've taken control of their business. 
              No commissions. No limits. Just growth.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link href="/sign-up">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="gradient" 
                    size="lg"
                    className="text-lg px-12 py-8 bg-glam-gradient hover:shadow-2xl hover:shadow-glam-purple/50 group"
                  >
                    Start Free
                    <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </Link>
              
              <Link href="/contact">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="text-lg px-12 py-8 border-2 border-white/30 hover:border-glam-purple"
                  >
                    <Calendar className="w-6 h-6 mr-2" />
                    Book a Demo
                  </Button>
                </motion.div>
              </Link>
            </div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white/60 text-sm"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>No credit card required</span>
              </div>
              
              <div className="hidden sm:block w-1 h-1 bg-white/30 rounded-full" />
              
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>14-day free trial</span>
              </div>
              
              <div className="hidden sm:block w-1 h-1 bg-white/30 rounded-full" />
              
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Cancel anytime</span>
              </div>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              className="mt-12 pt-12 border-t border-white/10"
            >
              <p className="text-white/40 text-sm mb-4">
                Trusted by leading beauty professionals
              </p>
              <div className="flex items-center justify-center gap-8 flex-wrap opacity-40">
                <div className="text-white font-semibold">London</div>
                <div className="text-white font-semibold">Manchester</div>
                <div className="text-white font-semibold">Birmingham</div>
                <div className="text-white font-semibold">Leeds</div>
                <div className="text-white font-semibold">Bristol</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
