"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift,
  Users,
  TrendingUp,
  Mail,
  Lock,
  Sparkles,
  Crown,
  Award,
  Target,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface LoyaltyStats {
  totalClients: number;
  activeClients: number;
  retentionRate: number;
  totalPointsIssued: number;
  topClients: Array<{
    id: string;
    name: string;
    email: string;
    points: number;
    totalEarned: number;
  }>;
}

export default function LoyaltyPage() {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<string>("free");
  const [stats, setStats] = useState<LoyaltyStats | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      fetchLoyaltyData();
    }
  }, [isLoaded, user]);

  const fetchLoyaltyData = async () => {
    try {
      const profileRes = await fetch('/api/profile');
      if (profileRes.ok) {
        const profile = await profileRes.json();
        setUserPlan(profile.plan || 'free');
      }

      // Only fetch stats if user has access
      if (userPlan !== 'free') {
        const statsRes = await fetch('/api/loyalty/stats');
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasAccess = userPlan === 'pro' || userPlan === 'business';

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white text-lg"
        >
          Loading loyalty tools...
        </motion.div>
      </div>
    );
  }

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
                <Gift className="w-8 h-8 text-lavender" />
                <h1 className="text-4xl md:text-5xl font-heading font-black text-white">
                  Loyalty & Retention Tools
                </h1>
                {hasAccess && (
                  <span className="px-3 py-1 bg-luxury-gradient text-white text-xs font-bold rounded-full">
                    {userPlan.toUpperCase()}
                  </span>
                )}
              </div>
              <p className="text-white/80 text-lg">
                GlamBooking — The #1 Salon Platform in the UK (and soon, the world!) 💅
              </p>
              <p className="text-white/60 mt-2">
                Keep your clients coming back with powerful loyalty rewards and retention campaigns
              </p>
            </div>
            {!hasAccess && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="px-6 py-3 bg-luxury-gradient hover:opacity-90 text-white font-semibold rounded-lg transition-opacity flex items-center gap-2"
              >
                <Crown className="w-5 h-5" />
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>

        {!hasAccess ? (
          <LockedView onUpgrade={() => setShowUpgradeModal(true)} />
        ) : (
          <UnlockedView stats={stats} userPlan={userPlan} />
        )}
      </motion.div>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function LockedView({ onUpgrade }: { onUpgrade: () => void }) {
  const features = [
    {
      icon: Award,
      title: "Client Loyalty Points",
      description: "Reward clients with points for every booking. Customize earning rates and redemption rules.",
    },
    {
      icon: Mail,
      title: "Automated Retention Campaigns",
      description: "Send \"We miss you\" emails to inactive clients and boost repeat bookings.",
    },
    {
      icon: BarChart3,
      title: "Loyalty Analytics",
      description: "Track your top loyal clients, retention rates, and repeat booking trends.",
    },
    {
      icon: Target,
      title: "Custom Rewards",
      description: "Create personalized rewards and promotions for your most valuable clients.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Feature Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
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
                  onClick={onUpgrade}
                  className="px-4 py-2 bg-luxury-gradient text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  Unlock with Pro
                </button>
              </div>
            </div>

            {/* Content (blurred) */}
            <div className="filter blur-sm">
              <div className="inline-flex p-3 rounded-xl bg-lavender-gradient bg-opacity-20 mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-white/60">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="glass-card p-8 text-center bg-gradient-to-br from-lavender/10 to-pink/10">
        <Sparkles className="w-16 h-16 text-lavender mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-white mb-3">
          Unlock Loyalty & Retention Tools
        </h2>
        <p className="text-white/70 text-lg mb-6 max-w-2xl mx-auto">
          Keep your clients coming back again and again with powerful loyalty rewards,
          automated campaigns, and insightful analytics.
        </p>
        <button
          onClick={onUpgrade}
          className="px-8 py-4 bg-luxury-gradient text-white font-bold rounded-lg hover:opacity-90 transition-opacity text-lg flex items-center gap-2 mx-auto"
        >
          <Crown className="w-6 h-6" />
          Upgrade to Pro — Only £19.99/month
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function UnlockedView({ stats, userPlan }: { stats: LoyaltyStats | null; userPlan: string }) {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-lavender" />
            <span className="text-2xl font-bold text-white">{stats?.totalClients || 0}</span>
          </div>
          <p className="text-white/60">Total Clients</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-green-400" />
            <span className="text-2xl font-bold text-white">{stats?.activeClients || 0}</span>
          </div>
          <p className="text-white/60">Active Clients</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">{stats?.retentionRate || 0}%</span>
          </div>
          <p className="text-white/60">Retention Rate</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <Award className="w-8 h-8 text-yellow-400" />
            <span className="text-2xl font-bold text-white">{stats?.totalPointsIssued || 0}</span>
          </div>
          <p className="text-white/60">Points Issued</p>
        </motion.div>
      </div>

      {/* Top Clients */}
      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Crown className="w-6 h-6 text-yellow-400" />
          Top Loyal Clients
        </h2>
        {stats?.topClients && stats.topClients.length > 0 ? (
          <div className="space-y-3">
            {stats.topClients.map((client, index) => (
              <div
                key={client.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-luxury-gradient flex items-center justify-center text-white font-bold">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{client.name}</p>
                    <p className="text-white/60 text-sm">{client.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">{client.points} pts</p>
                  <p className="text-white/60 text-sm">Earned: {client.totalEarned}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/40">No loyalty data yet. Start rewarding your clients!</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link
          href="/dashboard/loyalty/campaigns"
          className="glass-card p-6 hover:bg-white/10 transition-colors group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-6 h-6 text-lavender" />
                <h3 className="text-xl font-bold text-white">Email Campaigns</h3>
              </div>
              <p className="text-white/60">Create and manage retention campaigns</p>
            </div>
            <ChevronRight className="w-6 h-6 text-white/40 group-hover:text-white transition-colors" />
          </div>
        </Link>

        <Link
          href="/dashboard/loyalty/settings"
          className="glass-card p-6 hover:bg-white/10 transition-colors group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-6 h-6 text-pink" />
                <h3 className="text-xl font-bold text-white">Points Settings</h3>
              </div>
              <p className="text-white/60">Configure earning and redemption rules</p>
            </div>
            <ChevronRight className="w-6 h-6 text-white/40 group-hover:text-white transition-colors" />
          </div>
        </Link>
      </div>
    </div>
  );
}

function UpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="glass-card max-w-2xl w-full p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>

          <div className="text-center mb-6">
            <div className="inline-flex p-4 rounded-2xl bg-luxury-gradient bg-opacity-20 mb-4">
              <Crown className="w-12 h-12 text-lavender" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Upgrade to Pro</h2>
            <p className="text-white/60">Unlock powerful loyalty and retention tools</p>
          </div>

          <div className="space-y-4 mb-8">
            {[
              "Client loyalty points system",
              "Automated retention email campaigns",
              "Advanced loyalty analytics",
              "Custom reward programs",
              "Unlimited campaigns",
              "Priority support",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-white">
                <div className="w-5 h-5 rounded-full bg-luxury-gradient flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3 h-3" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <Link
            href="/dashboard/billing"
            className="w-full py-4 bg-luxury-gradient text-white font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Crown className="w-5 h-5" />
            View Pricing Plans
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </motion.div>
    </>
  );
}
