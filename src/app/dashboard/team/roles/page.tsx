"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Shield, Plus, Edit2, Trash2, Lock, Crown } from "lucide-react";
import { useRouter } from "next/navigation";

interface CustomRole {
  id: string;
  name: string;
  permissions: any;
}

export default function CustomRolesPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState("free");

  useEffect(() => {
    if (isLoaded && user) {
      fetchRoles();
      fetchUserProfile();
    }
  }, [isLoaded, user]);

  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/team/roles");
      const data = await response.json();
      setRoles(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();
      setUserPlan(data.plan || "free");
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const isBusiness = userPlan.toLowerCase() === "business";

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white text-lg"
        >
          Loading roles...
        </motion.div>
      </div>
    );
  }

  if (!isBusiness) {
    return (
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-luxury-gradient flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Business Plan Feature
          </h1>
          <p className="text-white/70 mb-8 max-w-2xl mx-auto">
            Custom roles are available exclusively on the Business plan. 
            Create unlimited custom roles with granular permissions tailored 
            to your business needs.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/dashboard/billing")}
            className="px-8 py-4 bg-luxury-gradient text-white font-bold rounded-xl shadow-lg shadow-lavender/30 hover:shadow-lavender/50 transition-all flex items-center gap-2 mx-auto"
          >
            <Crown className="w-5 h-5" />
            Upgrade to Business Plan
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-2">
              <span className="relative inline-block">
                Custom Roles
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-luxury-gradient rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                />
              </span>
            </h1>
            <p className="text-white/60 text-lg mt-3">
              Create custom roles with specific permissions
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-white shadow-lg transition-all bg-luxury-gradient shadow-lavender/30 hover:shadow-lavender/50"
          >
            <Plus className="w-5 h-5" />
            Create Role
          </motion.button>
        </div>

        {/* Default Roles Info */}
        <div className="glass-card p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-lavender" />
            Default Roles
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="font-bold text-white mb-1">Owner</h4>
              <p className="text-white/60 text-sm">Full access to everything</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="font-bold text-white mb-1">Manager</h4>
              <p className="text-white/60 text-sm">Manage team, bookings, clients</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="font-bold text-white mb-1">Staff</h4>
              <p className="text-white/60 text-sm">View and manage bookings</p>
            </div>
          </div>
        </div>

        {/* Custom Roles */}
        {roles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-12 text-center"
          >
            <Shield className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">
              No custom roles yet 🛡️
            </h3>
            <p className="text-white/60 mb-6">
              Create your first custom role with specific permissions
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-6 py-3 bg-luxury-gradient text-white font-bold rounded-xl"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Create Role
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {roles.map((role) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 hover:shadow-xl hover:shadow-lavender/20 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-luxury-gradient">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{role.name}</h3>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-white/80 mb-2">Permissions:</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(role.permissions || {}).map(([key, value]) => {
                      if (value) {
                        return (
                          <span
                            key={key}
                            className="px-2 py-1 bg-lavender/20 text-lavender text-xs rounded-full"
                          >
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-2 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-red-500/10 text-red-400 font-semibold rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
