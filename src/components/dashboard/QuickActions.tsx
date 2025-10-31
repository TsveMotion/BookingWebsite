"use client";

import { motion } from "framer-motion";
import { Calendar, Users, Settings, CreditCard, BarChart3, Share2 } from "lucide-react";
import Link from "next/link";

interface QuickAction {
  icon: any;
  label: string;
  href: string;
  gradient: string;
}

const actions: QuickAction[] = [
  {
    icon: Calendar,
    label: "Bookings",
    href: "/dashboard/bookings",
    gradient: "bg-rose-gradient",
  },
  {
    icon: Users,
    label: "Clients",
    href: "/dashboard/clients",
    gradient: "bg-lavender-gradient",
  },
  {
    icon: BarChart3,
    label: "Analytics",
    href: "/dashboard/analytics",
    gradient: "bg-blush-gradient",
  },
  {
    icon: CreditCard,
    label: "Billing",
    href: "/dashboard/billing",
    gradient: "bg-luxury-gradient",
  },
  {
    icon: Share2,
    label: "Share Link",
    href: "/dashboard/share",
    gradient: "bg-rose-gradient",
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/dashboard/settings",
    gradient: "bg-lavender-gradient",
  },
];

export function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="glass-card p-6"
    >
      <h2 className="text-xl font-heading font-bold text-white mb-6">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.1, type: "spring" }}
              className="h-full"
            >
              <Link
                href={action.href}
                className="group block h-full"
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative w-full h-full min-h-[120px] flex flex-col items-center justify-center gap-3 p-4 bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all"
                >
                  {/* Gradient glow on hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-rose-light/20 via-lavender/20 to-blush/20"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  {/* Gradient background on hover */}
                  <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${action.gradient}`}
                  />

                  <div className="relative z-10 flex flex-col items-center text-center gap-3">
                    <div className={`p-3 rounded-xl ${action.gradient} bg-opacity-20 backdrop-blur-sm`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-white group-hover:text-white transition-colors">
                      {action.label}
                    </span>
                  </div>
                </motion.button>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
