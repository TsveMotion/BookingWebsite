"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Calendar, Users, TrendingUp, DollarSign, Gift } from "lucide-react";
import Link from "next/link";

// Import new luxury dashboard components
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { GettingStartedChecklist } from "@/components/dashboard/GettingStartedChecklist";
import { GlamTip } from "@/components/dashboard/GlamTip";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { EnhancedRevenueChart } from "@/components/dashboard/EnhancedRevenueChart";
import { UpgradePrompt } from "@/components/dashboard/UpgradePrompt";
import { SmartAssistant } from "@/components/dashboard/SmartAssistant";
import { BookingLinkCard } from "@/components/dashboard/BookingLinkCard";
import { UpcomingAppointments } from "@/components/dashboard/UpcomingAppointments";

interface DashboardStats {
  bookings: { value: number; change: number; sparkline: number[] };
  clients: { total: number; newThisWeek: number };
  revenue: { value: number; change: number; sparkline: number[] };
  growthRate: number;
  upcomingAppointments: Array<{
    id: string;
    clientName: string;
    serviceName: string;
    startTime: string;
    totalAmount: number;
    status: string;
  }>;
  todayAppointments: number;
}

interface RevenueData {
  data: { label: string; value: number }[];
  total: number;
  change: number;
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [subscription, setSubscription] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      Promise.all([
        fetch("/api/user/subscription").then((res) => res.json()),
        fetch("/api/dashboard/summary").then((res) => res.json()),
        fetch("/api/dashboard/revenue").then((res) => res.json()),
      ])
        .then(([subData, summaryData, revData]) => {
          setSubscription(subData);
          setStats(summaryData);
          setRevenueData(revData);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch dashboard data:", err);
          setLoading(false);
        });
    }
  }, [isLoaded, user]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white text-lg"
        >
          <h1 className="text-4xl md:text-5xl font-heading font-black mb-2" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
            <span className="gradient-text">Loading your dashboard...</span>
          </h1>
        </motion.div>
      </div>
    );
  }

  const currentPlan = subscription?.plan || "Free";

  // Get real stats with fallbacks - safely handle undefined/null
  const bookingsValue = stats?.bookings?.value ?? 0;
  const bookingsChange = stats?.bookings?.change ?? 0;
  const bookingsSparkline = stats?.bookings?.sparkline ?? [];
  const clientsTotal = stats?.clients?.total ?? 0;
  const clientsNew = stats?.clients?.newThisWeek ?? 0;
  const revenueValue = stats?.revenue?.value ?? 0;
  const revenueChange = stats?.revenue?.change ?? 0;
  const revenueSparkline = stats?.revenue?.sparkline ?? [];
  const growthRate = stats?.growthRate ?? 0;
  const upcomingAppointments = stats?.upcomingAppointments ?? [];
  const todayAppointments = stats?.todayAppointments ?? 0;

  return (
    <div className="min-h-screen pb-16">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            background: [
              "radial-gradient(circle at 30% 50%, rgba(233, 181, 216, 0.03) 0%, transparent 50%)",
              "radial-gradient(circle at 70% 50%, rgba(255, 182, 193, 0.03) 0%, transparent 50%)",
              "radial-gradient(circle at 30% 50%, rgba(216, 191, 216, 0.03) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-4">

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-2">
            <span className="relative inline-block">
              Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"}, {user?.firstName || "there"} 👋
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-1 bg-luxury-gradient rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              />
            </span>
          </h1>
          <p className="text-white/60 text-lg mt-3">
            {currentPlan !== "Free" ? (
              <span className="inline-flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-luxury-gradient text-white">
                  {currentPlan.toUpperCase()}
                </span>
                Your dashboard at a glance
              </span>
            ) : (
              "Welcome to your beauty business dashboard"
            )}
          </p>
        </motion.div>

        {/* Stats Grid - Matching Bookings Page Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Bookings Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="glass-card p-6 relative overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-luxury-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-300"
              whileHover={{ scale: 1.05 }}
            />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-rose-gradient bg-opacity-20">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-white/60 text-sm mb-1">Bookings This Month</p>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="text-4xl font-bold text-white"
              >
                {bookingsValue}
              </motion.p>
              <p className={`text-sm mt-2 ${
                bookingsChange > 0 ? "text-green-400" : bookingsChange < 0 ? "text-red-400" : "text-white/60"
              }`}>
                {bookingsChange > 0 ? '+' : ''}{bookingsChange}% from last month
              </p>
            </div>
          </motion.div>

          {/* Clients Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="glass-card p-6 relative overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-luxury-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-300"
              whileHover={{ scale: 1.05 }}
            />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-lavender-gradient bg-opacity-20">
                  <Users className="w-6 h-6 text-white" />
                </div>
                {clientsNew > 0 && <Users className="w-5 h-5 text-lavender" />}
              </div>
              <p className="text-white/60 text-sm mb-1">Total Clients</p>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="text-4xl font-bold text-white"
              >
                {clientsTotal}
              </motion.p>
              <p className="text-sm mt-2 text-white/60">
                {clientsNew > 0 ? '+' : ''}{clientsNew} new this week
              </p>
            </div>
          </motion.div>

          {/* Revenue Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="glass-card p-6 relative overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-luxury-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-300"
              whileHover={{ scale: 1.05 }}
            />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-blush-gradient bg-opacity-20">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                {revenueChange > 0 && <TrendingUp className="w-5 h-5 text-green-400" />}
              </div>
              <p className="text-white/60 text-sm mb-1">Revenue</p>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
                className="text-4xl font-bold gradient-text"
              >
                £{revenueValue.toFixed(2)}
              </motion.p>
              <p className={`text-sm mt-2 ${
                revenueChange > 0 ? "text-green-400" : revenueChange < 0 ? "text-red-400" : "text-white/60"
              }`}>
                {revenueChange > 0 ? '+' : ''}{revenueChange}% from last month
              </p>
            </div>
          </motion.div>

          {/* Growth Rate Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="glass-card p-6 relative overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-luxury-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-300"
              whileHover={{ scale: 1.05 }}
            />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-luxury-gradient bg-opacity-20">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className={`w-5 h-5 ${
                  growthRate > 0 ? "text-green-400" : growthRate < 0 ? "text-red-400" : "text-white/60"
                }`} />
              </div>
              <p className="text-white/60 text-sm mb-1">Growth Rate</p>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: "spring" }}
                className="text-4xl font-bold text-white"
              >
                {growthRate > 0 ? '+' : ''}{growthRate}%
              </motion.p>
              <p className={`text-sm mt-2 ${
                growthRate > 0 ? "text-green-400" : growthRate < 0 ? "text-red-400" : "text-white/60"
              }`}>
                {growthRate > 0 ? "Trending up" : growthRate < 0 ? "Trending down" : "Stable"}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upgrade Prompt (only shown for free users) */}
            {currentPlan === "Free" && <UpgradePrompt currentPlan={currentPlan} />}

            {/* Getting Started Checklist */}
            <GettingStartedChecklist />

            {/* Enhanced Revenue Chart with Recharts */}
            <EnhancedRevenueChart 
              data={revenueData?.data || []}
              total={revenueData?.total || 0}
              change={revenueData?.change || 0}
            />

            {/* Loyalty Shortcut (Pro/Business feature) */}
            {currentPlan !== "Free" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <Link href="/dashboard/loyalty" className="block">
                  <div className="glass-card p-6 hover:bg-white/10 transition-all group cursor-pointer border-2 border-transparent hover:border-lavender/30">
                    <div className="flex items-center gap-4">
                      <div className="p-4 rounded-2xl bg-luxury-gradient">
                        <Gift className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">
                          Loyalty & Retention Tools
                        </h3>
                        <p className="text-white/60 text-sm">
                          Keep clients coming back with rewards and campaigns
                        </p>
                      </div>
                      <span className="text-white/40 group-hover:text-white transition-colors">→</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-8">
            {/* Upcoming Appointments */}
            <UpcomingAppointments 
              appointments={upcomingAppointments}
              todayCount={todayAppointments}
            />

            {/* Booking Link Card */}
            <BookingLinkCard />

            {/* Glam Tip */}
            <GlamTip />

            {/* Smart Assistant (AI placeholder) */}
            <SmartAssistant />

            {/* Quick Actions */}
            <QuickActions />
          </div>
        </div>

        {/* Footer Branding */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-16 text-center"
        >
          <p className="text-white/40 text-sm">
            GlamBooking — Empowering beauty professionals worldwide 💖
          </p>
        </motion.div>
      </div>
    </div>
  );
}
