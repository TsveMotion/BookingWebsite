"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Image from "next/image";

interface LogoSwitcherProps {
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

interface BusinessProfile {
  plan: string;
  logoUrl?: string | null;
  businessName?: string | null;
}

export function LogoSwitcher({ showText = true, size = "md", className = "" }: LogoSwitcherProps) {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch profile:", err);
        setLoading(false);
      });
  }, []);

  // Determine if we should show custom logo
  // Check plan field (can be "business", "Business", "BUSINESS")
  const planLower = profile?.plan?.toLowerCase() || "";
  const isBusinessPlan = planLower === "business";
  const showCustomLogo = isBusinessPlan && profile?.logoUrl && !imageError;

  // Size configurations
  const sizeConfig = {
    sm: { icon: "w-4 h-4", text: "text-base", container: "p-1.5" },
    md: { icon: "w-5 h-5", text: "text-xl", container: "p-2" },
    lg: { icon: "w-6 h-6", text: "text-2xl", container: "p-3" },
  };

  const config = sizeConfig[size];

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`${config.container} rounded-xl bg-white/10 animate-pulse`}>
          <div className={`${config.icon}`} />
        </div>
        {showText && (
          <div className="h-6 w-32 bg-white/10 rounded animate-pulse" />
        )}
      </div>
    );
  }

  if (showCustomLogo && profile.logoUrl) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="relative">
          <Image
            src={profile.logoUrl}
            alt={profile.businessName || "Business Logo"}
            width={size === "sm" ? 120 : size === "md" ? 160 : 180}
            height={size === "sm" ? 30 : size === "md" ? 40 : 48}
            className="object-contain rounded-lg"
            onError={() => {
              console.error("Logo failed to load, falling back to default");
              setImageError(true);
            }}
          />
        </div>
        {showText && profile.businessName && (
          <span className={`${config.text} font-heading font-bold text-white`}>
            {profile.businessName}
          </span>
        )}
      </div>
    );
  }

  // Default GlamBooking logo
  return (
    <div className={`flex items-center ${className}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <Image
          src="/logo/Logo_Long.png"
          alt="GlamBooking Logo"
          width={size === "sm" ? 120 : size === "md" ? 160 : 180}
          height={size === "sm" ? 30 : size === "md" ? 40 : 48}
          className="object-contain transition-all hover:opacity-90"
        />
      </motion.div>
    </div>
  );
}
