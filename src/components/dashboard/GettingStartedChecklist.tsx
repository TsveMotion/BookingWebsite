"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Circle, Sparkles, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";

interface OnboardingProgress {
  profileCompleted: boolean;
  servicesAdded: boolean;
  scheduleConfigured: boolean;
  teamInvited: boolean;
  firstBookingReceived: boolean;
  hidden?: boolean;
  totalCompleted: number;
  progress: number;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  href: string;
}

export function GettingStartedChecklist() {
  const router = useRouter();
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/progress")
      .then((res) => res.json())
      .then((data) => {
        setProgress(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch progress:", err);
        setLoading(false);
      });
  }, []);


  const items: ChecklistItem[] = [
    {
      id: "profile",
      title: "Complete Your Business Profile",
      description: "Add your salon details, location, and contact information",
      completed: progress?.profileCompleted ?? false,
      href: "/dashboard/profile",
    },
    {
      id: "services",
      title: "Add Your Services",
      description: "Set up your service menu with pricing and duration",
      completed: progress?.servicesAdded ?? false,
      href: "/dashboard/services",
    },
    {
      id: "schedule",
      title: "Configure Your Schedule",
      description: "Set your working hours and availability",
      completed: progress?.scheduleConfigured ?? false,
      href: "/dashboard/schedule",
    },
    {
      id: "team",
      title: "Invite Team Members",
      description: "Add staff and assign permissions (Pro/Business plans)",
      completed: progress?.teamInvited ?? false,
      href: "/dashboard/team",
    },
    {
      id: "first-booking",
      title: "Receive Your First Booking",
      description: "Share your booking link and start accepting clients",
      completed: progress?.firstBookingReceived ?? false,
      href: "/dashboard/bookings",
    },
  ];

  const completedCount = progress?.totalCompleted ?? 0;
  const progressPercent = progress?.progress ?? 0;

  // Trigger confetti when 100% complete (must be before any conditional returns)
  useEffect(() => {
    if (progressPercent === 100 && !loading) {
      // Fire confetti immediately
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E9B5D8', '#C9A9E9', '#F4A5C4', '#D4B5E9'],
      });

      // Fire additional bursts
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#E9B5D8', '#C9A9E9', '#F4A5C4'],
        });
      }, 250);

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#E9B5D8', '#C9A9E9', '#F4A5C4'],
        });
      }, 400);
    }
  }, [progressPercent, loading]);

  // Don't render if hidden
  if (progress?.hidden) {
    return null;
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 md:p-8"
      >
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/3" />
          <div className="h-2 bg-white/10 rounded" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  const handleDismissBanner = async () => {
    try {
      const response = await fetch('/api/onboarding/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        setProgress({ ...progress!, hidden: true });
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#E9B5D8', '#C9A9E9', '#F4A5C4'],
        });
      }
    } catch (error) {
      console.error('Failed to dismiss banner:', error);
    }
  };

  // Show celebration if all tasks are completed
  if (progressPercent === 100) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl p-8 md:p-10 bg-luxury-gradient"
      >
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-4 right-4"
        >
          <Sparkles className="w-8 h-8 text-white" />
        </motion.div>

        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-6xl mb-4"
          >
            🎉
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-heading font-black text-white mb-3"
          >
            You're All Set!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/90 text-lg leading-relaxed mb-6"
          >
            You've completed all the setup steps! Your GlamBooking account is
            ready to accept bookings and grow your beauty business.
          </motion.p>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={handleDismissBanner}
            className="px-6 py-2.5 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-colors backdrop-blur-sm"
          >
            Dismiss
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/dashboard/bookings")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-white/90 transition-colors"
          >
            View Bookings
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="glass-card p-6 md:p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-white mb-1">
            Getting Started
          </h2>
          <p className="text-white/60 text-sm">
            {completedCount} of {items.length} completed
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{progressPercent}%</p>
            <p className="text-white/60 text-xs">Complete</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden mb-6">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="absolute top-0 left-0 h-full bg-luxury-gradient rounded-full"
        />
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
            onClick={() => !item.completed && router.push(item.href)}
            className={`group flex items-start gap-4 p-4 rounded-xl transition-all duration-300 cursor-pointer ${
              item.completed
                ? "bg-white/5 hover:bg-white/10"
                : "bg-transparent hover:bg-white/5"
            }`}
          >
            <div className="flex-shrink-0 mt-1">
              {item.completed ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-6 h-6 rounded-full bg-lavender-gradient flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-white" />
                </motion.div>
              ) : (
                <Circle className="w-6 h-6 text-white/30 group-hover:text-white/50 transition-colors" />
              )}
            </div>

            <div className="flex-1">
              <h3
                className={`font-semibold mb-1 transition-colors ${
                  item.completed
                    ? "text-white/50 line-through"
                    : "text-white group-hover:text-white"
                }`}
              >
                {item.title}
              </h3>
              <p
                className={`text-sm transition-colors ${
                  item.completed ? "text-white/30" : "text-white/60"
                }`}
              >
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
