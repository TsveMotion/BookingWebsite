"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lightbulb, TrendingUp, Users, Heart, BarChart3, Star } from "lucide-react";

interface Tip {
  id: string;
  title: string;
  content: string;
  icon: string;
  gradient: string;
}

const iconMap: Record<string, any> = {
  Lightbulb,
  TrendingUp,
  Users,
  Heart,
  BarChart3,
  Star,
};

export function GlamTip() {
  const [tip, setTip] = useState<Tip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tips")
      .then((res) => res.json())
      .then((data) => {
        setTip(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch tip:", err);
        setLoading(false);
      });
  }, []);

  if (loading || !tip) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="glass-card p-6 md:p-8"
      >
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/10 rounded w-1/3" />
          <div className="h-6 bg-white/10 rounded w-3/4" />
          <div className="h-16 bg-white/10 rounded" />
        </div>
      </motion.div>
    );
  }

  const Icon = iconMap[tip.icon] || Lightbulb;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="relative overflow-hidden glass-card p-6 md:p-8"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className={`w-full h-full ${tip.gradient} rounded-full blur-3xl`}
        />
      </div>

      <div className="relative z-10 flex items-start gap-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
          className={`flex-shrink-0 p-3 ${tip.gradient} bg-opacity-20 backdrop-blur-sm rounded-2xl`}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>

        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex items-center gap-2 mb-2"
          >
            <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">
              ✨ Glam Tip of the Day
            </span>
          </motion.div>

          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="text-lg font-heading font-bold text-white mb-2"
          >
            {tip.title}
          </motion.h3>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="text-white/70 text-sm leading-relaxed"
          >
            {tip.content}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}
