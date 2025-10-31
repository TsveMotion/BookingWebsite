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
              "radial-gradient(circle at 20% 50%, rgba(233, 181, 216, 0.05) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, rgba(233, 181, 216, 0.05) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, rgba(233, 181, 216, 0.05) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        />
      </div>

      {/* Welcome Banner */}
      <WelcomeBanner
        userName={user?.firstName || undefined}
        userEmail={user?.emailAddresses[0]?.emailAddress}
        plan={currentPlan}
      />

      {/* Stats Grid with Sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <StatsCard
          title="Bookings This Month"
          value={bookingsValue}
          change={`${bookingsChange > 0 ? '+' : ''}${bookingsChange}% from last month`}
          changeType={bookingsChange > 0 ? "positive" : bookingsChange < 0 ? "negative" : "neutral"}
          icon={Calendar}
          gradient="bg-rose-gradient"
          delay={0.1}
          tooltip="Total confirmed bookings for the current month"
          sparkline={bookingsSparkline}
        />
        <StatsCard
          title="Total Clients"
          value={clientsTotal}
          change={`${clientsNew > 0 ? '+' : ''}${clientsNew} new this week`}
          changeType={clientsNew > 0 ? "positive" : "neutral"}
          icon={Users}
          gradient="bg-lavender-gradient"
          delay={0.2}
          tooltip="Total unique clients in your database"
        />
        <StatsCard
          title="Revenue"
          value={`£${revenueValue.toFixed(2)}`}
          change={`${revenueChange > 0 ? '+' : ''}${revenueChange}% from last month`}
          changeType={revenueChange > 0 ? "positive" : revenueChange < 0 ? "negative" : "neutral"}
          icon={DollarSign}
          gradient="bg-blush-gradient"
          delay={0.3}
          tooltip="Total revenue from completed bookings"
          sparkline={revenueSparkline}
        />
        <StatsCard
          title="Growth Rate"
          value={`${growthRate > 0 ? '+' : ''}${growthRate}%`}
          change={growthRate > 0 ? "Trending up" : growthRate < 0 ? "Trending down" : "Stable"}
          changeType={growthRate > 0 ? "positive" : growthRate < 0 ? "negative" : "neutral"}
          icon={TrendingUp}
          gradient="bg-luxury-gradient"
          delay={0.4}
          tooltip="Average growth based on bookings and revenue"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8 mt-8">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upgrade Prompt (only shown for free users) */}
          <UpgradePrompt currentPlan={currentPlan} />

          {/* Progress & Goal Section */}
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
  );
}
