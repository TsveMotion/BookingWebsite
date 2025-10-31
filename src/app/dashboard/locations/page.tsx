"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plus, Edit2, Trash2, Users, Lock, Crown, Building, LinkIcon, X, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

interface Location {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  openingHours?: any;
  active: boolean;
  staff: any[];
}


export default function LocationsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState("free");
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Add Location form state
  const [newLocation, setNewLocation] = useState({
    name: "",
    address: "",
    phone: "",
    manager: "",
  });

  useEffect(() => {
    if (isLoaded && user) {
      fetchLocations();
      fetchUserPlan();
    }
  }, [isLoaded, user]);

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/locations");
      const data = await response.json();
      setLocations(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch locations:", error);
      setLoading(false);
    }
  };

  const fetchUserPlan = async () => {
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();
      setUserPlan(data.plan || "free");
    } catch (error) {
      console.error("Failed to fetch plan:", error);
    }
  };


  const handleAddLocation = async () => {
    if (!newLocation.name.trim()) {
      toast.error("Location name is required");
      return;
    }

    try {
      const response = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLocation),
      });

      if (response.ok) {
        toast.success("📍 Location added successfully!");
        setShowAddModal(false);
        setNewLocation({ name: "", address: "", phone: "", manager: "" });
        fetchLocations();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to add location");
      }
    } catch (error) {
      console.error("Failed to add location:", error);
      toast.error("An error occurred");
    }
  };

  const isBusiness = userPlan.toLowerCase() === "business";
  const isPro = userPlan.toLowerCase() === "pro";
  const isFree = userPlan.toLowerCase() === "free";
  
  // Free/Pro can add 1 location, Business unlimited
  const locationLimit = isBusiness ? Infinity : 1;
  const canAddLocation = locations.length < locationLimit;

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white text-lg"
        >
          Loading locations...
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
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
                  Locations
                  <motion.div
                    className="absolute -bottom-2 left-0 right-0 h-1 bg-luxury-gradient rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  />
                </span>
              </h1>
              <p className="text-white/60 text-lg mt-3">
                Manage multiple business locations
              </p>
            </div>
            {canAddLocation ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-white shadow-lg transition-all bg-luxury-gradient shadow-lavender/30 hover:shadow-lavender/50"
              >
                <Plus className="w-5 h-5" />
                Add Location
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/dashboard/billing")}
                className="flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-white shadow-lg transition-all bg-gradient-to-r from-yellow-400 to-yellow-600"
              >
                <Crown className="w-5 h-5" />
                Upgrade for More
              </motion.button>
            )}
          </div>

          {/* Plan Limit Warning */}
          {!canAddLocation && locations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 mb-6 border border-yellow-400/30"
            >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-400/20 to-yellow-600/20">
                <Lock className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">
                  Location Limit Reached
                </h3>
                <p className="text-white/70 mb-4">
                  You&apos;ve reached the {locationLimit} location limit on your current plan. 
                  Upgrade to Business to add unlimited locations and assign staff to different branches.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push("/dashboard/billing")}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-xl shadow-lg hover:shadow-yellow-400/30 transition-all"
                >
                  <Crown className="w-4 h-4 inline mr-2" />
                  Upgrade to Business
                </motion.button>
              </div>
            </div>
            </motion.div>
          )}

        {/* Locations Grid */}
        {locations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-12 text-center"
          >
            <MapPin className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">
              No locations yet 📍
            </h3>
            <p className="text-white/60 mb-6">
              {isBusiness 
                ? "Add your first location to start managing multiple branches"
                : "Add your location to manage your business address and details"}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-luxury-gradient text-white font-bold rounded-xl"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Add Location
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {locations.map((location) => (
              <motion.div
                key={location.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 hover:shadow-xl hover:shadow-lavender/20 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-luxury-gradient">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {location.name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          location.active
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {location.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                {location.address && (
                  <p className="text-white/60 text-sm mb-2">
                    📍 {location.address}
                  </p>
                )}
                {location.phone && (
                  <p className="text-white/60 text-sm mb-4">
                    📞 {location.phone}
                  </p>
                )}

                <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
                  <Users className="w-4 h-4" />
                  <span>{location.staff?.length || 0} staff members</span>
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
                    className="px-4 py-2 bg-red-500/10 text-red-400 font-semibold rounded-lg hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
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

      {/* Add Location Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
            >
              <div className="glass-card p-6 mx-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">Add New Location</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white/60" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-white/80 text-sm mb-2 block">Location Name *</label>
                    <input
                      type="text"
                      value={newLocation.name}
                      onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lavender/50"
                      placeholder="e.g., Downtown Branch"
                    />
                  </div>

                  <div>
                    <label className="text-white/80 text-sm mb-2 block">Address</label>
                    <input
                      type="text"
                      value={newLocation.address}
                      onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lavender/50"
                      placeholder="123 High Street, London"
                    />
                  </div>

                  <div>
                    <label className="text-white/80 text-sm mb-2 block">Phone</label>
                    <input
                      type="tel"
                      value={newLocation.phone}
                      onChange={(e) => setNewLocation({ ...newLocation, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lavender/50"
                      placeholder="+44 7700 900000"
                    />
                  </div>

                  <div>
                    <label className="text-white/80 text-sm mb-2 block">Manager</label>
                    <input
                      type="text"
                      value={newLocation.manager}
                      onChange={(e) => setNewLocation({ ...newLocation, manager: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lavender/50"
                      placeholder="Manager name"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddLocation}
                      className="flex-1 px-6 py-3 bg-luxury-gradient text-white font-bold rounded-xl shadow-lg shadow-lavender/30 hover:shadow-lavender/50 transition-all"
                    >
                      Add Location
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowAddModal(false)}
                      className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
