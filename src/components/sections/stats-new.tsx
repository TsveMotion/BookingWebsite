"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Calendar, Building2, Star, TrendingUp } from "lucide-react";

interface PlatformStats {
  totalBookings: number;
  activeBusinesses: number;
  averageRating: number;
  retentionRate: number;
}

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [isInView, setIsInView] = useState(false);
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isInView) {
          setIsInView(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isInView]);

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, value, { duration: 2.5, ease: "easeOut" });
      return controls.stop;
    }
  }, [isInView, value, count]);

  return (
    <div ref={ref}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </div>
  );
}

export function StatsNew() {
  const [platformStats, setPlatformStats] = useState<PlatformStats>({
    totalBookings: 0,
    activeBusinesses: 0,
    averageRating: 4.9,
    retentionRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/homepage/stats");
        if (response.ok) {
          const data = await response.json();
          setPlatformStats({
            totalBookings: data.totalBookings,
            activeBusinesses: data.activeBusinesses,
            averageRating: data.averageRating,
            retentionRate: data.retentionRate
          });
        }
      } catch (error) {
        console.error("Error fetching platform stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const stats = [
    {
      icon: Calendar,
      value: platformStats.totalBookings,
      suffix: "+",
      label: "Appointments Booked",
      description: "Trusted by thousands of clients"
    },
    {
      icon: Building2,
      value: platformStats.activeBusinesses,
      suffix: "+",
      label: "UK Businesses",
      description: "Growing every day"
    },
    {
      icon: Star,
      value: platformStats.averageRating,
      suffix: "★",
      label: "Average Rating",
      description: "Based on verified reviews"
    },
    {
      icon: TrendingUp,
      value: platformStats.retentionRate,
      suffix: "%",
      label: "Client Retention",
      description: "Businesses stay with us"
    }
  ];

  return (
    <section className="py-24 bg-black relative overflow-hidden">
      {/* Gradient glow effect */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[400px] bg-glam-gradient opacity-10 blur-[150px] animate-pulse-slow" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-heading font-black mb-4">
            <span className="text-white">Powering Growth </span>
            <span className="bg-glam-gradient bg-clip-text text-transparent">
              Across the UK
            </span>
          </h2>
          <p className="text-white/60 text-lg">
            Real numbers from real businesses transforming their operations
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-glam-purple border-t-transparent"></div>
            <p className="text-white/60 mt-4">Loading statistics...</p>
          </div>
        )}

        {/* Stats Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.05 }}
                className="group"
              >
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-glam-purple/50 transition-all duration-300 hover:shadow-2xl hover:shadow-glam-purple/20 text-center">
                  {/* Icon */}
                  <div className="inline-flex p-4 bg-glam-gradient rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-black" />
                  </div>

                  {/* Number */}
                  <div className="mb-3">
                    <h3 className="text-5xl md:text-6xl font-heading font-black bg-glam-gradient bg-clip-text text-transparent">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </h3>
                  </div>

                  {/* Label */}
                  <h4 className="text-white font-bold text-xl mb-2">
                    {stat.label}
                  </h4>

                  {/* Description */}
                  <p className="text-white/50 text-sm">
                    {stat.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
          </div>
        )}

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-white/60 text-lg">
            Join the fastest-growing beauty booking platform in the UK
          </p>
          <div className="flex items-center justify-center gap-8 mt-8 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-white/70 text-sm">Live Support 24/7</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-glam-purple rounded-full animate-pulse" />
              <span className="text-white/70 text-sm">99.9% Uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-glam-pink rounded-full animate-pulse" />
              <span className="text-white/70 text-sm">Zero Commission</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
