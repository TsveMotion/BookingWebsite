"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Sparkles, TrendingUp, Users } from "lucide-react";
import { GlamAIWaitlistModal } from "@/components/modals/GlamAIWaitlistModal";

export function SmartAssistant() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.9 }}
      className="relative overflow-hidden glass-card p-6"
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-lavender/10 via-transparent to-rose-light/10" />

      <div className="relative z-10">
        <div className="flex items-start gap-4 mb-4">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="p-3 bg-luxury-gradient rounded-2xl"
          >
            <MessageSquare className="w-6 h-6 text-white" />
          </motion.div>

          <div className="flex-1">
            <h3 className="text-lg font-heading font-bold text-white mb-1">
              GlamAI Assistant
            </h3>
            <p className="text-white/60 text-sm">Coming Soon</p>
          </div>

          <div className="flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-lavender animate-pulse" />
            <span className="text-xs font-semibold text-lavender uppercase tracking-wider">
              AI
            </span>
          </div>
        </div>

        <p className="text-white/70 text-sm mb-4 leading-relaxed">
          💬 Need help? Ask GlamAI to analyze your bookings, suggest marketing strategies,
          or provide insights to grow your beauty business.
        </p>

        {/* Feature preview */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-white/50 text-xs">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Revenue insights & forecasting</span>
          </div>
          <div className="flex items-center gap-2 text-white/50 text-xs">
            <Users className="w-3.5 h-3.5" />
            <span>Client retention recommendations</span>
          </div>
          <div className="flex items-center gap-2 text-white/50 text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personalized growth strategies</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="mt-4 w-full px-4 py-2.5 bg-luxury-gradient hover:opacity-90 text-white font-semibold rounded-xl transition-opacity"
        >
          Join Waitlist
        </motion.button>
      </div>
    </motion.div>

    <GlamAIWaitlistModal 
      isOpen={isModalOpen} 
      onClose={() => setIsModalOpen(false)} 
    />
    </>
  );
}
