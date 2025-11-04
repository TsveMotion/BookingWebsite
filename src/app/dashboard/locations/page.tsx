"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plus, Edit2, Trash2, Users, Lock, Crown, Building, LinkIcon, X, Save, Clock, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { WorkingHoursEditor } from "@/components/locations/WorkingHoursEditor";

interface Location {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  manager?: string;
  workingHours?: any;
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [editLocationData, setEditLocationData] = useState({
    name: "",
    address: "",
    phone: "",
    manager: "",
  });
  const [editLocationHours, setEditLocationHours] = useState<Record<string, any>>({});
  
  // Add Location form state
  const [newLocation, setNewLocation] = useState({
    name: "",
    address: "",
    phone: "",
    manager: "",
  });

  // Working hours state for new location
  const [newLocationHours, setNewLocationHours] = useState<Record<string, any>>({
    monday: { open: "09:00", close: "17:00", closed: false },
    tuesday: { open: "09:00", close: "17:00", closed: false },
    wednesday: { open: "09:00", close: "17:00", closed: false },
    thursday: { open: "09:00", close: "17:00", closed: false },
    friday: { open: "09:00", close: "17:00", closed: false },
    saturday: { open: "10:00", close: "16:00", closed: false },
    sunday: { open: "10:00", close: "16:00", closed: true },
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
        body: JSON.stringify({
          ...newLocation,
          workingHours: newLocationHours,
        }),
      });

      if (response.ok) {
        toast.success("📍 Location added successfully!");
        setShowAddModal(false);
        setNewLocation({ name: "", address: "", phone: "", manager: "" });
        // Reset working hours to defaults
        setNewLocationHours({
          monday: { open: "09:00", close: "17:00", closed: false },
          tuesday: { open: "09:00", close: "17:00", closed: false },
          wednesday: { open: "09:00", close: "17:00", closed: false },
          thursday: { open: "09:00", close: "17:00", closed: false },
          friday: { open: "09:00", close: "17:00", closed: false },
          saturday: { open: "10:00", close: "16:00", closed: false },
          sunday: { open: "10:00", close: "16:00", closed: true },
        });
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

  const updateWorkingHours = (day: string, field: string, value: any) => {
    setNewLocationHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const isBusiness = userPlan.toLowerCase() === "business";
  const isPro = userPlan.toLowerCase() === "pro";
  const isFree = userPlan.toLowerCase() === "free";
  
  // Free: 1 location, Pro: 1 location, Business: unlimited
  const locationLimit = isBusiness ? Infinity : 1;
  const canAddLocation = locations.length < locationLimit;


  const handleEditClick = (location: Location) => {
    setEditingLocation(location);
    setEditLocationData({
      name: location.name,
      address: location.address || "",
      phone: location.phone || "",
      manager: location.manager || "",
    });
    setEditLocationHours(location.workingHours || {
      monday: { open: "09:00", close: "17:00", closed: false },
      tuesday: { open: "09:00", close: "17:00", closed: false },
      wednesday: { open: "09:00", close: "17:00", closed: false },
      thursday: { open: "09:00", close: "17:00", closed: false },
      friday: { open: "09:00", close: "17:00", closed: false },
      saturday: { open: "10:00", close: "16:00", closed: false },
      sunday: { open: "10:00", close: "16:00", closed: true },
    });
    setShowEditModal(true);
  };

  const handleUpdateLocation = async () => {
    if (!editingLocation || !editLocationData.name.trim()) {
      toast.error("Location name is required");
      return;
    }

    try {
      const response = await fetch(`/api/locations/${editingLocation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editLocationData,
          workingHours: editLocationHours,
        }),
      });

      if (response.ok) {
        toast.success("✅ Location updated successfully!");
        setShowEditModal(false);
        setEditingLocation(null);
        fetchLocations();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update location");
      }
    } catch (error) {
      console.error("Failed to update location:", error);
      toast.error("An error occurred");
    }
  };

  const updateEditLocationHours = (day: string, field: string, value: any) => {
    setEditLocationHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleDeleteLocation = async (locationId: string) => {
    if (!confirm("Are you sure you want to delete this location? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/locations/${locationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("🗑️ Location deleted successfully!");
        fetchLocations();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete location");
      }
    } catch (error) {
      console.error("Failed to delete location:", error);
      toast.error("An error occurred");
    }
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minutes} ${ampm}`;
  };

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
                Manage your business locations & working hours
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70">
                  {(isFree || isPro) && `${userPlan === 'free' ? 'Free' : 'Pro'}: 1 location (${locations.length}/1)`}
                  {isBusiness && `Business: Unlimited locations (${locations.length})`}
                </span>
              </div>
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
                  You&apos;ve reached the 1 location limit on your current plan. 
                  Upgrade to Business to add unlimited locations and manage multiple branches with separate teams.
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
                className="glass-card overflow-hidden"
              >
                {/* Location Header - Clickable */}
                <div 
                  className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => router.push(`/dashboard/locations/${location.id}`)}
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
                    <p className="text-white/60 text-sm mb-2">
                      📞 {location.phone}
                    </p>
                  )}
                  {location.manager && (
                    <p className="text-white/60 text-sm mb-4">
                      👤 Manager: {location.manager}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
                    <Users className="w-4 h-4" />
                    <span>{location.staff?.length || 0} staff members</span>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1 px-4 py-2 bg-lavender/20 text-white font-semibold rounded-lg border border-lavender/30 flex items-center justify-center gap-2">
                      <span className="text-sm">Click to view details</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(location);
                      }}
                      className="px-4 py-2 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLocation(location.id);
                      }}
                      className="px-4 py-2 bg-red-500/20 text-red-400 font-semibold rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2 border border-red-500/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        </motion.div>
      </div>

      {/* Add Location Modal - CENTERED & SCROLLABLE */}
      <AnimatePresence>
        {showAddModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            />
            {/* Modal - PERFECTLY CENTERED */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="glass-card p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto pointer-events-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-3xl font-bold text-white">Add New Location</h3>
                    <p className="text-white/60 text-sm mt-1">Add your business details and working hours</p>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white/60" />
                  </button>
                </div>

                {/* Business Details Section */}
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-lavender" />
                    Business Details
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-white/80 text-sm font-semibold mb-2 block">Location Name *</label>
                      <input
                        type="text"
                        value={newLocation.name}
                        onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lavender/50"
                        placeholder="e.g., Downtown Branch or Main Studio"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/80 text-sm font-semibold mb-2 block">Phone Number</label>
                        <input
                          type="tel"
                          value={newLocation.phone}
                          onChange={(e) => setNewLocation({ ...newLocation, phone: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lavender/50"
                          placeholder="+44 7700 900000"
                        />
                      </div>
                      <div>
                        <label className="text-white/80 text-sm font-semibold mb-2 block">Manager Name</label>
                        <input
                          type="text"
                          value={newLocation.manager}
                          onChange={(e) => setNewLocation({ ...newLocation, manager: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lavender/50"
                          placeholder="Manager name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-white/80 text-sm font-semibold mb-2 block">Full Address</label>
                      <textarea
                        value={newLocation.address}
                        onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lavender/50 resize-none"
                        placeholder="123 High Street, London, UK"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Opening Times Section */}
                <div className="mb-6 pb-6 border-t border-white/10 pt-6">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-lavender" />
                    Opening Times
                  </h4>
                  <p className="text-white/60 text-sm mb-4">Set your business hours (you can modify these later)</p>
                  
                  <div className="space-y-3">
                    {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => {
                      const dayCapitalized = day.charAt(0).toUpperCase() + day.slice(1);
                      const dayHours = newLocationHours[day];
                      
                      return (
                        <div key={day} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                          <div className="w-24 flex-shrink-0">
                            <p className="text-white font-medium text-sm">{dayCapitalized}</p>
                          </div>
                          <div className="flex items-center gap-3 flex-1">
                            {!dayHours.closed && (
                              <>
                                <input
                                  type="time"
                                  value={dayHours.open}
                                  onChange={(e) => updateWorkingHours(day, "open", e.target.value)}
                                  className="px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white text-sm focus:border-lavender focus:outline-none"
                                />
                                <span className="text-white/60 text-sm">to</span>
                                <input
                                  type="time"
                                  value={dayHours.close}
                                  onChange={(e) => updateWorkingHours(day, "close", e.target.value)}
                                  className="px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white text-sm focus:border-lavender focus:outline-none"
                                />
                              </>
                            )}
                            <label className="flex items-center gap-2 ml-auto">
                              <input
                                type="checkbox"
                                checked={dayHours.closed}
                                onChange={(e) => updateWorkingHours(day, "closed", e.target.checked)}
                                className="w-4 h-4 rounded border-white/20"
                              />
                              <span className="text-white/60 text-sm">Closed</span>
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddLocation}
                    disabled={!newLocation.name.trim()}
                    className="flex-1 px-8 py-4 bg-luxury-gradient text-white font-bold rounded-xl shadow-lg shadow-lavender/30 hover:shadow-lavender/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                  >
                    ✨ Create Location
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddModal(false)}
                    className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Location Modal */}
      <AnimatePresence>
        {showEditModal && editingLocation && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="glass-card p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto pointer-events-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-3xl font-bold text-white">Edit Location</h3>
                    <p className="text-white/60 text-sm mt-1">Update your business details and working hours</p>
                  </div>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white/60" />
                  </button>
                </div>

                {/* Business Details Section */}
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-lavender" />
                    Business Details
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-white/80 text-sm font-semibold mb-2 block">Location Name *</label>
                      <input
                        type="text"
                        value={editLocationData.name}
                        onChange={(e) => setEditLocationData({ ...editLocationData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lavender/50"
                        placeholder="e.g., Downtown Branch or Main Studio"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/80 text-sm font-semibold mb-2 block">Phone Number</label>
                        <input
                          type="tel"
                          value={editLocationData.phone}
                          onChange={(e) => setEditLocationData({ ...editLocationData, phone: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lavender/50"
                          placeholder="+44 7700 900000"
                        />
                      </div>
                      <div>
                        <label className="text-white/80 text-sm font-semibold mb-2 block">Manager Name</label>
                        <input
                          type="text"
                          value={editLocationData.manager}
                          onChange={(e) => setEditLocationData({ ...editLocationData, manager: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lavender/50"
                          placeholder="Manager name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-white/80 text-sm font-semibold mb-2 block">Full Address</label>
                      <textarea
                        value={editLocationData.address}
                        onChange={(e) => setEditLocationData({ ...editLocationData, address: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lavender/50 resize-none"
                        placeholder="123 High Street, London, UK"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Opening Times Section */}
                <div className="mb-6 pb-6 border-t border-white/10 pt-6">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-lavender" />
                    Opening Times
                  </h4>
                  
                  <div className="space-y-3">
                    {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => {
                      const dayCapitalized = day.charAt(0).toUpperCase() + day.slice(1);
                      const dayHours = editLocationHours[day] || { open: "09:00", close: "17:00", closed: false };
                      
                      return (
                        <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 bg-white/5 rounded-lg">
                          <div className="w-full sm:w-24 flex-shrink-0">
                            <p className="text-white font-medium text-sm">{dayCapitalized}</p>
                          </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
                            {!dayHours.closed && (
                              <div className="flex items-center gap-3 w-full sm:w-auto">
                                <input
                                  type="time"
                                  value={dayHours.open}
                                  onChange={(e) => updateEditLocationHours(day, "open", e.target.value)}
                                  className="px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white text-sm focus:border-lavender focus:outline-none flex-1 sm:flex-none"
                                />
                                <span className="text-white/60 text-sm">to</span>
                                <input
                                  type="time"
                                  value={dayHours.close}
                                  onChange={(e) => updateEditLocationHours(day, "close", e.target.value)}
                                  className="px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white text-sm focus:border-lavender focus:outline-none flex-1 sm:flex-none"
                                />
                              </div>
                            )}
                            <label className="flex items-center gap-2 sm:ml-auto">
                              <input
                                type="checkbox"
                                checked={dayHours.closed}
                                onChange={(e) => updateEditLocationHours(day, "closed", e.target.checked)}
                                className="w-4 h-4 rounded border-white/20"
                              />
                              <span className="text-white/60 text-sm">Closed</span>
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUpdateLocation}
                    disabled={!editLocationData.name.trim()}
                    className="flex-1 px-8 py-4 bg-luxury-gradient text-white font-bold rounded-xl shadow-lg shadow-lavender/30 hover:shadow-lavender/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                  >
                    ✨ Update Location
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowEditModal(false)}
                    className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
