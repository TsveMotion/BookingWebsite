"use client";

import { motion } from "framer-motion";
import { Crown, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

interface UpgradePromptProps {
  currentPlan?: string;
}

export function UpgradePrompt({ currentPlan = "Free" }: UpgradePromptProps) {
  if (currentPlan !== "Free") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
      className="relative overflow-hidden rounded-3xl p-8 bg-luxury-gradient"
    >
      {/* Animated sparkles */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-4 right-4"
      >
        <Sparkles className="w-8 h-8 text-white" />
      </motion.div>

      <div className="relative z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4"
        >
          <Crown className="w-5 h-5 text-white" />
          <span className="text-white font-semibold text-sm">Unlock Premium Features</span>
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
          className="text-2xl md:text-3xl font-heading font-black text-white mb-3"
        >
          Grow Your Beauty Business
        </motion.h3>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-white/90 mb-6 max-w-xl"
        >
          Upgrade to Pro or Business plan to unlock advanced scheduling, team management,
          custom branding, and powerful analytics to scale your salon.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="flex flex-wrap gap-4"
        >
          <Link href="/pricing">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-white/90 transition-colors"
            >
              View Plans
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-full hover:bg-white/30 transition-colors border border-white/30"
          >
            Learn More
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
