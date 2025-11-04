"use client";

import { motion } from "framer-motion";
import { Lock, Crown, Sparkles, ChevronRight, LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface FeaturePreview {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface PlanLockProps {
  feature: string;
  requiredPlan: "Pro" | "Business";
  description?: string;
  features?: FeaturePreview[];
  pricing?: string;
}

export function PlanLock({ 
  feature, 
  requiredPlan, 
  description,
  features,
  pricing = "£19.99/month"
}: PlanLockProps) {
  const router = useRouter();

  // Default features if none provided
  const defaultFeatures: FeaturePreview[] = [
    {
      icon: Crown,
      title: "Premium Analytics",
      description: "Track revenue, bookings, client trends, and business performance in real-time.",
    },
    {
      icon: Sparkles,
      title: "Advanced Reports",
      description: "Generate detailed insights with beautiful charts and exportable CSV reports.",
    },
    {
      icon: ChevronRight,
      title: "Data-Driven Growth",
      description: "Make informed decisions with comprehensive analytics and forecasting tools.",
    },
  ];

  const featureList = features || defaultFeatures;

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header Banner */}
        <div className="mb-8 p-6 glass-card bg-gradient-to-r from-lavender/20 to-pink/20 border-lavender/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Lock className="w-8 h-8 text-lavender" />
                <h1 className="text-4xl md:text-5xl font-heading font-black text-white">
                  {feature}
                </h1>
                <span className="px-3 py-1 bg-luxury-gradient text-white text-xs font-bold rounded-full">
                  {requiredPlan.toUpperCase()} ONLY
                </span>
              </div>
              <p className="text-white/80 text-lg">
                GlamBooking — The #1 Salon Platform in the UK (and soon, the world!) 💅
              </p>
              <p className="text-white/60 mt-2">
                {description || `Unlock ${feature.toLowerCase()} and take your business to the next level`}
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard/billing")}
              className="px-6 py-3 bg-luxury-gradient hover:opacity-90 text-white font-semibold rounded-lg transition-opacity flex items-center gap-2"
            >
              <Crown className="w-5 h-5" />
              Upgrade to {requiredPlan}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureList.map((featureItem, index) => (
              <motion.div
                key={featureItem.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 relative overflow-hidden"
              >
                {/* Blur Overlay */}
                <div className="absolute inset-0 backdrop-blur-sm bg-white/5 z-10 flex items-center justify-center">
                  <div className="text-center">
                    <Lock className="w-12 h-12 text-white/40 mx-auto mb-3" />
                    <button
                      onClick={() => router.push("/dashboard/billing")}
                      className="px-4 py-2 bg-luxury-gradient text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Unlock with {requiredPlan}
                    </button>
                  </div>
                </div>

                {/* Content (blurred) */}
                <div className="filter blur-sm">
                  <div className="inline-flex p-3 rounded-xl bg-lavender-gradient bg-opacity-20 mb-4">
                    <featureItem.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{featureItem.title}</h3>
                  <p className="text-white/60">{featureItem.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="glass-card p-8 text-center bg-gradient-to-br from-lavender/10 to-pink/10">
            <Sparkles className="w-16 h-16 text-lavender mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-3">
              Unlock {feature}
            </h2>
            <p className="text-white/70 text-lg mb-6 max-w-2xl mx-auto">
              {description || `Get access to powerful ${feature.toLowerCase()} features and grow your business with data-driven insights.`}
            </p>
            <button
              onClick={() => router.push("/dashboard/billing")}
              className="px-8 py-4 bg-luxury-gradient text-white font-bold rounded-lg hover:opacity-90 transition-opacity text-lg flex items-center gap-2 mx-auto"
            >
              <Crown className="w-6 h-6" />
              Upgrade to {requiredPlan} — Only {pricing}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
