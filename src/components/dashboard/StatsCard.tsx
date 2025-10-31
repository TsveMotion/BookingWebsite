"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Sparkline } from "./Sparkline";
import { Tooltip } from "@/components/ui/tooltip";

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  gradient: string;
  delay?: number;
  tooltip?: string;
  sparkline?: number[];
}

export function StatsCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  gradient,
  delay = 0,
  tooltip,
  sparkline,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.03, y: -8 }}
      className="group relative overflow-hidden glass-card p-6 cursor-pointer"
      style={{
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 20px 40px rgba(147, 112, 219, 0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
      }}
    >
      {/* Gradient background on hover */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-rose-light/10 via-lavender/10 to-blush/10"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      />
      
      {/* Gradient border glow on hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(229, 152, 155, 0.3), rgba(181, 131, 141, 0.3), rgba(147, 112, 219, 0.3))",
          filter: "blur(8px)",
          opacity: 0,
        }}
        whileHover={{ opacity: 0.6 }}
        transition={{ duration: 0.4 }}
      />

      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${gradient}`}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <p className="text-white/60 text-sm mb-2">{title}</p>
          <motion.h3
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.2, type: "spring" }}
            className="text-3xl md:text-4xl font-heading font-black text-white mb-2"
          >
            {value}
          </motion.h3>
          {change && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.3 }}
              className={`text-sm ${
                changeType === "positive"
                  ? "text-green-400"
                  : changeType === "negative"
                  ? "text-red-400"
                  : "text-white/60"
              }`}
            >
              {change}
            </motion.p>
          )}
          {sparkline && sparkline.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.4 }}
              className="mt-3"
            >
              <Sparkline data={sparkline} color="#E9B5D8" />
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: delay + 0.1, type: "spring", stiffness: 200 }}
          className={`p-3 rounded-2xl ${gradient} bg-opacity-20 backdrop-blur-sm`}
        >
          {tooltip ? (
            <Tooltip content={tooltip}>
              <Icon className="w-6 h-6 text-white" />
            </Tooltip>
          ) : (
            <Icon className="w-6 h-6 text-white" />
          )}
        </motion.div>
      </div>

      {/* Animated shine effect */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
        }}
        animate={{
          x: ["-100%", "200%"],
        }}
        transition={{
          repeat: Infinity,
          duration: 2,
          ease: "linear",
        }}
      />
    </motion.div>
  );
}
