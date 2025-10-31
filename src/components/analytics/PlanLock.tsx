"use client";

import { motion } from "framer-motion";
import { Lock, Crown } from "lucide-react";
import { useRouter } from "next/navigation";

interface PlanLockProps {
  feature: string;
  requiredPlan: "Pro" | "Business";
  description?: string;
}

export function PlanLock({ feature, requiredPlan, description }: PlanLockProps) {
  const router = useRouter();

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full"
      >
        <div className="glass-card p-12 text-center relative overflow-hidden">
          {/* Gradient glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-rose-400/10 to-amber-300/10 blur-3xl" />
          
          <div className="relative z-10">
            {/* Lock icon */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-400 to-amber-300 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-white" />
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-heading font-black text-white mb-4">
              {feature}
            </h1>

            {/* Plan badge */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400/20 to-amber-500/20 border border-yellow-400/30 mb-6"
            >
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 font-bold text-sm">{requiredPlan.toUpperCase()} FEATURE</span>
            </motion.div>

            {/* Description */}
            <p className="text-white/70 mb-8 max-w-xl mx-auto text-lg">
              {description || `${feature} is available exclusively on the ${requiredPlan} plan. Upgrade to unlock powerful insights and grow your business.`}
            </p>

            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/dashboard/billing")}
              className="px-8 py-4 bg-gradient-to-r from-rose-400 to-amber-300 text-white font-bold rounded-xl shadow-lg shadow-rose-400/30 hover:shadow-rose-400/50 transition-all flex items-center gap-2 mx-auto"
            >
              <Crown className="w-5 h-5" />
              Upgrade to {requiredPlan}
            </motion.button>

            {/* Features preview */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-white/90 font-semibold mb-1">Real-time Insights</div>
                <div className="text-white/60 text-sm">Track revenue, bookings, and trends</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-2xl mb-2">📈</div>
                <div className="text-white/90 font-semibold mb-1">Advanced Charts</div>
                <div className="text-white/60 text-sm">Visualize performance over time</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-2xl mb-2">💎</div>
                <div className="text-white/90 font-semibold mb-1">Export Reports</div>
                <div className="text-white/60 text-sm">Download CSV for deeper analysis</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
