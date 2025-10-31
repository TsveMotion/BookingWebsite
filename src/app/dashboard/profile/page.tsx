"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Building2, Mail, Phone, MapPin, Save, Check } from "lucide-react";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      setEmail(user.emailAddresses[0]?.emailAddress || "");
    }
  }, [isLoaded, user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update profile completed status
      await fetch("/api/dashboard/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field: "profileCompleted", value: true }),
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
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
    <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-2">
              Business Profile
            </h1>
            <p className="text-white/60 text-lg mb-8">
              Complete your profile to help clients find and book with you
            </p>

            <div className="glass-card p-8 space-y-6">
              {/* Business Name */}
              <div>
                <label className="flex items-center gap-2 text-white font-semibold mb-2">
                  <Building2 className="w-5 h-5" />
                  Business Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g., Glam Beauty Studio"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lavender/50 transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-white font-semibold mb-2">
                  <Mail className="w-5 h-5" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lavender/50 transition-all"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-white font-semibold mb-2">
                  <Phone className="w-5 h-5" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+44 7700 900000"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lavender/50 transition-all"
                />
              </div>

              {/* Address */}
              <div>
                <label className="flex items-center gap-2 text-white font-semibold mb-2">
                  <MapPin className="w-5 h-5" />
                  Business Address
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 High Street, London, UK"
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lavender/50 transition-all resize-none"
                />
              </div>

              {/* Save Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saving || !businessName}
                className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
                  saved
                    ? "bg-green-500"
                    : "bg-luxury-gradient hover:shadow-lg hover:shadow-lavender/20"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className="flex items-center justify-center gap-2">
                  {saved ? (
                    <>
                      <Check className="w-5 h-5" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {saving ? "Saving..." : "Save Profile"}
                    </>
                  )}
                </span>
              </motion.button>
            </div>
          </motion.div>
    </div>
  );
}
