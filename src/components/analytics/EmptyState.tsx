"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[280px] px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        {/* Icon */}
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
          <Icon className="w-10 h-10 md:w-12 md:h-12 text-white/40" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>

        {/* Description */}
        <p className="text-white/60 text-sm mb-6">{description}</p>

        {/* Action */}
        {action && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={action.onClick}
            className="px-6 py-2.5 bg-gradient-to-r from-rose-400 to-amber-300 text-white font-semibold rounded-xl shadow-lg shadow-rose-400/20 hover:shadow-rose-400/40 transition-all"
          >
            {action.label}
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
