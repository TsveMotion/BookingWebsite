"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Check, Loader2, Plus } from "lucide-react";
import toast from "react-hot-toast";

interface Location {
  id: string;
  name: string;
  address?: string;
  active: boolean;
  assigned?: boolean;
}

interface ManageLocationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  serviceName: string;
}

export function ManageLocationsModal({
  isOpen,
  onClose,
  serviceId,
  serviceName,
}: ManageLocationsModalProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationIds, setSelectedLocationIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreateLocation, setShowCreateLocation] = useState(false);
  const [newLocationData, setNewLocationData] = useState({
    name: "",
    address: "",
    phone: "",
    manager: "",
  });
  const [creatingLocation, setCreatingLocation] = useState(false);

  useEffect(() => {
    if (isOpen && serviceId) {
      fetchLocations();
    }
  }, [isOpen, serviceId]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/services/${serviceId}/locations`);
      
      if (response.ok) {
        const data = await response.json();
        setLocations(data);
        
        // Pre-select assigned locations
        const assigned = data.filter((loc: Location) => loc.assigned).map((loc: Location) => loc.id);
        setSelectedLocationIds(new Set(assigned));
      }
    } catch (error) {
      console.error("Failed to fetch locations:", error);
      toast.error("Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  const toggleLocation = (locationId: string) => {
    const newSelected = new Set(selectedLocationIds);
    if (newSelected.has(locationId)) {
      newSelected.delete(locationId);
    } else {
      newSelected.add(locationId);
    }
    setSelectedLocationIds(newSelected);
  };

  const handleCreateLocation = async () => {
    if (!newLocationData.name.trim()) {
      toast.error("Location name is required");
      return;
    }

    try {
      setCreatingLocation(true);
      const response = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLocationData),
      });

      if (response.ok) {
        const newLocation = await response.json();
        toast.success("✅ Location created successfully!");
        setShowCreateLocation(false);
        setNewLocationData({ name: "", address: "", phone: "", manager: "" });
        
        // Refresh locations and auto-select the new one
        await fetchLocations();
        setSelectedLocationIds(prev => new Set([...prev, newLocation.id]));
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to create location");
      }
    } catch (error) {
      console.error("Failed to create location:", error);
      toast.error("An error occurred");
    } finally {
      setCreatingLocation(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/services/${serviceId}/locations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationIds: Array.from(selectedLocationIds),
        }),
      });

      if (response.ok) {
        toast.success("✅ Locations updated successfully!");
        onClose();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update locations");
      }
    } catch (error) {
      console.error("Failed to update locations:", error);
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="glass-card p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto pointer-events-auto">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-xl bg-lavender-gradient">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Manage Locations</h3>
                      <p className="text-white/60 text-sm mt-1">{serviceName}</p>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm">
                    Select which locations offer this service
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors ml-4"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              {/* Add Location Button */}
              {!loading && (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setShowCreateLocation(!showCreateLocation)}
                  className="w-full mb-4 p-4 rounded-xl border-2 border-dashed border-lavender/50 hover:border-lavender transition-all bg-lavender/10 hover:bg-lavender/20"
                >
                  <div className="flex items-center justify-center gap-2 text-lavender font-semibold">
                    <Plus className="w-5 h-5" />
                    <span>{showCreateLocation ? "Cancel" : "Create New Location"}</span>
                  </div>
                </motion.button>
              )}

              {/* Create Location Form */}
              <AnimatePresence>
                {showCreateLocation && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-4"
                  >
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                      <h4 className="text-lg font-bold text-white mb-3">New Location</h4>
                      <input
                        type="text"
                        placeholder="Location Name *"
                        value={newLocationData.name}
                        onChange={(e) => setNewLocationData({ ...newLocationData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-lavender"
                      />
                      <input
                        type="text"
                        placeholder="Address"
                        value={newLocationData.address}
                        onChange={(e) => setNewLocationData({ ...newLocationData, address: e.target.value })}
                        className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-lavender"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="tel"
                          placeholder="Phone"
                          value={newLocationData.phone}
                          onChange={(e) => setNewLocationData({ ...newLocationData, phone: e.target.value })}
                          className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-lavender"
                        />
                        <input
                          type="text"
                          placeholder="Manager"
                          value={newLocationData.manager}
                          onChange={(e) => setNewLocationData({ ...newLocationData, manager: e.target.value })}
                          className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-lavender"
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCreateLocation}
                        disabled={creatingLocation || !newLocationData.name.trim()}
                        className="w-full px-4 py-3 bg-lavender-gradient text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {creatingLocation ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Create Location
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Content */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-lavender animate-spin" />
                </div>
              ) : locations.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60 mb-4">No locations created yet</p>
                  <p className="text-white/40 text-sm">
                    Create locations first to assign services to them
                  </p>
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  {locations.map((location) => {
                    const isSelected = selectedLocationIds.has(location.id);
                    
                    return (
                      <motion.button
                        key={location.id}
                        onClick={() => toggleLocation(location.id)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? "bg-lavender/20 border-lavender shadow-lg shadow-lavender/20"
                            : "bg-white/5 border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div
                              className={`p-2 rounded-lg transition-colors ${
                                isSelected ? "bg-lavender" : "bg-white/10"
                              }`}
                            >
                              <MapPin className={`w-5 h-5 ${isSelected ? "text-white" : "text-white/60"}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-lg font-bold text-white truncate">
                                  {location.name}
                                </h4>
                                {!location.active && (
                                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-semibold rounded-full">
                                    Inactive
                                  </span>
                                )}
                              </div>
                              {location.address && (
                                <p className="text-white/60 text-sm truncate">
                                  {location.address}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Checkbox */}
                          <div
                            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 ml-3 ${
                              isSelected
                                ? "bg-lavender border-lavender"
                                : "border-white/30"
                            }`}
                          >
                            {isSelected && <Check className="w-4 h-4 text-white" />}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Footer */}
              {locations.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
                  <div className="flex-1 text-sm text-white/60">
                    {selectedLocationIds.size} of {locations.length} location
                    {locations.length !== 1 ? "s" : ""} selected
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onClose}
                      className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-3 bg-luxury-gradient text-white font-bold rounded-xl shadow-lg shadow-lavender/30 hover:shadow-lavender/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
