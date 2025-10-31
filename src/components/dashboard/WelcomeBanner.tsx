"use client";

import { motion } from "framer-motion";
import { Sparkles, Crown } from "lucide-react";

interface WelcomeBannerProps {
  userName?: string;
  userEmail?: string;
  plan?: string;
}

export function WelcomeBanner({ userName, userEmail, plan = "Free" }: WelcomeBannerProps) {
  const greeting = getGreeting();
  const displayName = userName || userEmail?.split("@")[0] || "Beauty Pro";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl p-8 md:p-10 bg-luxury-gradient"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-10 -right-10 w-40 h-40 bg-white/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/30 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white/80 text-sm md:text-base mb-1"
            >
              {greeting}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl md:text-4xl font-heading font-black text-white"
            >
              {displayName}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white/70 text-sm mt-2"
            >
              Manage your beauty business like a pro 💅 — You're part of the #1 salon platform in the UK!
            </motion.p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30"
        >
          <Crown className="w-5 h-5 text-white" />
          <span className="text-white font-semibold">{plan.charAt(0).toUpperCase() + plan.slice(1)} Plan</span>
        </motion.div>
      </div>
    </motion.div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}
