"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  MapPin, 
  Clock, 
  Settings, 
  Sparkles, 
  Check, 
  ChevronRight,
  ExternalLink 
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { BusinessSlugModal } from "@/components/dashboard/BusinessSlugModal";

interface OnboardingProgress {
  locationCreated: boolean;
  scheduleConfigured: boolean;
  profileCompleted: boolean;
  bookingsReceived: boolean;
}

export default function QuickStartPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [progress, setProgress] = useState<OnboardingProgress>({
    locationCreated: false,
    scheduleConfigured: false,
    profileCompleted: false,
    bookingsReceived: false,
  });
  const [loading, setLoading] = useState(true);
  const [showSlugModal, setShowSlugModal] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      fetchProgress();
    }
  }, [isLoaded, user]);

  const fetchProgress = async () => {
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();
      
      setProgress({
        locationCreated: data.locationCreated || false,
        scheduleConfigured: data.scheduleConfigured || false,
        profileCompleted: data.profileCompleted || false,
        bookingsReceived: data.bookingsReceived || false,
      });
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch progress:", error);
      setLoading(false);
    }
  };

  const steps = [
    {
      id: "location",
      title: "Add Your Location",
      description: "Set up your business address and details",
      icon: MapPin,
      completed: progress.locationCreated,
      action: () => router.push("/dashboard/locations"),
      actionLabel: "Add Location",
    },
    {
      id: "schedule",
      title: "Configure Working Hours",
      description: "Set your availability and business hours",
      icon: Clock,
      completed: progress.scheduleConfigured,
      action: () => router.push("/dashboard/locations"),
      actionLabel: "Set Hours",
    },
    {
      id: "profile",
      title: "Complete Business Settings",
      description: "Add your business name, logo, and contact info",
      icon: Settings,
      completed: progress.profileCompleted,
      action: () => router.push("/dashboard/settings"),
      actionLabel: "Setup Profile",
    },
    {
      id: "booking",
      title: "Receive Your First Booking",
      description: "Create your public booking page and start accepting clients",
      icon: Sparkles,
      completed: progress.bookingsReceived,
      action: () => setShowSlugModal(true),
      actionLabel: "Create Booking Page",
    },
  ];

  const completedSteps = steps.filter((step) => step.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white text-lg"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-2">
              <span className="relative inline-block">
                Quick Start Guide
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-luxury-gradient rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                />
              </span>
            </h1>
            <p className="text-white/60 text-lg mt-3">
              Get your salon up and running in minutes
            </p>
          </div>

          {/* Progress Bar */}
          <div className="glass-card p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white font-semibold text-lg">
                  Setup Progress
                </p>
                <p className="text-white/60 text-sm">
                  {completedSteps} of {steps.length} steps completed
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">
                  {Math.round(progressPercentage)}%
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-luxury-gradient"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`glass-card p-6 transition-all ${
                    step.completed
                      ? "border-green-500/30"
                      : "hover:shadow-xl hover:shadow-lavender/20"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`p-4 rounded-xl flex-shrink-0 ${
                        step.completed
                          ? "bg-green-500/20"
                          : "bg-luxury-gradient"
                      }`}
                    >
                      {step.completed ? (
                        <Check className="w-6 h-6 text-green-400" />
                      ) : (
                        <Icon className="w-6 h-6 text-white" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-white">
                          {step.title}
                        </h3>
                        {step.completed && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
                            ✓ Complete
                          </span>
                        )}
                      </div>
                      <p className="text-white/60 mb-4">{step.description}</p>

                      {!step.completed && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={step.action}
                          className="px-6 py-3 bg-luxury-gradient hover:opacity-90 text-white font-semibold rounded-xl shadow-lg shadow-lavender/30 transition-all flex items-center gap-2"
                        >
                          {step.actionLabel}
                          <ChevronRight className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Completion Message */}
          {completedSteps === steps.length && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-8 mt-8 text-center border-2 border-green-500/30"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-6"
              >
                <Check className="w-10 h-10 text-green-400" />
              </motion.div>
              
              <h3 className="text-2xl font-bold text-white mb-2">
                🎉 Setup Complete!
              </h3>
              <p className="text-white/60 mb-6">
                Your salon is ready to accept bookings. Share your booking link with clients!
              </p>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/dashboard")}
                className="px-8 py-4 bg-luxury-gradient hover:opacity-90 text-white font-bold rounded-xl shadow-lg shadow-lavender/30 transition-all inline-flex items-center gap-2"
              >
                Go to Dashboard
                <ExternalLink className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Business Slug Modal */}
      <BusinessSlugModal
        isOpen={showSlugModal}
        onClose={() => setShowSlugModal(false)}
        onSuccess={() => {
          fetchProgress();
          setShowSlugModal(false);
        }}
      />
    </>
  );
}
