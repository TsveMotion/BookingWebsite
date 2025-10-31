"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Clock, DollarSign, Crown, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

interface Addon {
  id: string;
  name: string;
  description: string;
  extraTime: number;
  extraPrice: number;
}

interface AddonsModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  serviceName: string;
  userPlan: string;
}

export function AddonsModal({ isOpen, onClose, serviceId, serviceName, userPlan }: AddonsModalProps) {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    extraTime: 15,
    extraPrice: 10,
  });

  const isPro = userPlan.toLowerCase() === "pro" || userPlan.toLowerCase() === "business";

  useEffect(() => {
    if (isOpen && serviceId) {
      fetchAddons();
    }
  }, [isOpen, serviceId]);

  const fetchAddons = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/services/${serviceId}/addons`);
      const data = await response.json();
      setAddons(data);
    } catch (error) {
      console.error("Failed to fetch addons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPro) return;

    try {
      const response = await fetch(`/api/services/${serviceId}/addons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ name: "", description: "", extraTime: 15, extraPrice: 10 });
        setShowAddForm(false);
        fetchAddons();
      }
    } catch (error) {
      console.error("Failed to add addon:", error);
    }
  };

  const handleDeleteAddon = async (addonId: string) => {
    if (!confirm("Are you sure you want to delete this add-on?")) return;

    try {
      const response = await fetch(`/api/services/${serviceId}/addons/${addonId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchAddons();
      }
    } catch (error) {
      console.error("Failed to delete addon:", error);
    }
  };

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Crown className="w-6 h-6 text-yellow-400" />
                    Service Add-ons
                  </h2>
                  <p className="text-white/60 text-sm mt-1">{serviceName}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </div>

              {/* Pro Check */}
              {!isPro ? (
                <div className="glass-card p-8 text-center">
                  <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    Upgrade to Pro
                  </h3>
                  <p className="text-white/60 mb-4">
                    Create service add-ons to upsell extra treatments and boost revenue
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="px-6 py-3 bg-luxury-gradient text-white font-bold rounded-xl"
                  >
                    Upgrade Now
                  </motion.button>
                </div>
              ) : (
                <>
                  {/* Add Button */}
                  {!showAddForm && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setShowAddForm(true)}
                      className="w-full mb-4 px-4 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add New Add-on
                    </motion.button>
                  )}

                  {/* Add Form */}
                  {showAddForm && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleAddAddon}
                      className="glass-card p-4 mb-4 space-y-3"
                    >
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Add-on name"
                        required
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-lavender"
                      />
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Description"
                        rows={2}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-lavender resize-none"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                          <input
                            type="number"
                            value={formData.extraTime}
                            onChange={(e) => setFormData({ ...formData, extraTime: parseInt(e.target.value) })}
                            placeholder="Extra mins"
                            required
                            min="0"
                            className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-lavender"
                          />
                        </div>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                          <input
                            type="number"
                            value={formData.extraPrice}
                            onChange={(e) => setFormData({ ...formData, extraPrice: parseFloat(e.target.value) })}
                            placeholder="Extra £"
                            required
                            min="0"
                            step="0.01"
                            className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-lavender"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddForm(false);
                            setFormData({ name: "", description: "", extraTime: 15, extraPrice: 10 });
                          }}
                          className="flex-1 px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 px-4 py-2 bg-luxury-gradient text-white font-semibold rounded-lg"
                        >
                          Add
                        </button>
                      </div>
                    </motion.form>
                  )}

                  {/* Addons List */}
                  {loading ? (
                    <div className="text-center text-white/60 py-8">Loading add-ons...</div>
                  ) : addons.length === 0 ? (
                    <div className="glass-card p-8 text-center">
                      <p className="text-white/60">No add-ons yet. Create one to get started!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {addons.map((addon) => (
                        <motion.div
                          key={addon.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="glass-card p-4 hover:shadow-lg hover:shadow-lavender/10 transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-white">{addon.name}</h4>
                              {addon.description && (
                                <p className="text-sm text-white/60 mt-1">{addon.description}</p>
                              )}
                              <div className="flex items-center gap-4 mt-2 text-sm">
                                <span className="flex items-center gap-1 text-white/70">
                                  <Clock className="w-4 h-4" />
                                  +{addon.extraTime} mins
                                </span>
                                <span className="flex items-center gap-1 text-green-400 font-semibold">
                                  <DollarSign className="w-4 h-4" />
                                  +£{addon.extraPrice.toFixed(2)}
                                </span>
                              </div>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteAddon(addon.id)}
                              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
