"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, User, Calendar, DollarSign, TrendingUp, Mail, Tag, Crown, Lock, Phone, Clock, MapPin } from "lucide-react";
import { useState } from "react";

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  totalBookings?: number;
  lastVisit?: string;
  lifetimeValue?: number;
  notes?: string;
  tags?: string[];
  locationId?: string;
  location?: {
    id: string;
    name: string;
  };
}

interface Booking {
  id: string;
  service: { name: string };
  startTime: string;
  totalAmount: number;
  paymentStatus: string;
  status: string;
}

interface ClientDrawerProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  userPlan: string;
  onSendRetentionEmail?: (clientId: string) => void;
}

export function ClientDrawer({ client, isOpen, onClose, userPlan, onSendRetentionEmail }: ClientDrawerProps) {
  const [activeTab, setActiveTab] = useState<"info" | "bookings" | "analytics">("info");
  const [notes, setNotes] = useState(client?.notes || "");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(client?.tags || []);
  const [savingTags, setSavingTags] = useState(false);

  const isPro = userPlan.toLowerCase() === "pro" || userPlan.toLowerCase() === "business";
  const isBusiness = userPlan.toLowerCase() === "business";

  const fetchBookingHistory = async () => {
    if (!client) return;
    setLoadingBookings(true);
    try {
      const response = await fetch(`/api/clients/${client.id}/history`);
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchInsights = async () => {
    if (!client) return;
    try {
      const response = await fetch(`/api/clients/${client.id}/insights`);
      const data = await response.json();
      setInsights(data);
    } catch (error) {
      console.error("Failed to fetch insights:", error);
    }
  };

  const handleSaveNotes = async () => {
    if (!client) return;
    setSavingNotes(true);
    setNotesSaved(false);

    try {
      const response = await fetch(`/api/clients/${client.id}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (response.ok) {
        setNotesSaved(true);
        setTimeout(() => setNotesSaved(false), 3000);
      }
    } catch (error) {
      console.error("Failed to save notes:", error);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleToggleTag = async (tag: string) => {
    if (!client || !isPro) return;
    
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    setSavingTags(true);

    try {
      const response = await fetch(`/api/clients/${client.id}/tags`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: newTags }),
      });

      if (!response.ok) {
        // Revert on error
        setSelectedTags(selectedTags);
      }
    } catch (error) {
      console.error("Failed to save tags:", error);
      setSelectedTags(selectedTags);
    } finally {
      setSavingTags(false);
    }
  };

  const handleTabChange = (tab: "info" | "bookings" | "analytics") => {
    if (tab === "bookings" && !isPro) {
      return; // Block access for free users
    }
    if (tab === "analytics" && !isBusiness) {
      return; // Block access for non-Business users
    }
    if (tab === "bookings" && isPro && bookings.length === 0) {
      fetchBookingHistory();
    }
    if (tab === "analytics" && isBusiness && !insights) {
      fetchInsights();
    }
    setActiveTab(tab);
  };

  if (!client) return null;

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-black/95 backdrop-blur-xl border-l border-white/10 z-50 overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-luxury-gradient">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{client.name}</h2>
                    <p className="text-white/60 text-sm">{client.email}</p>
                  </div>
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

              {/* Tabs */}
              <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-xl">
                <button
                  onClick={() => handleTabChange("info")}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    activeTab === "info"
                      ? "bg-luxury-gradient text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Info
                </button>
                <button
                  onClick={() => handleTabChange("bookings")}
                  disabled={!isPro}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all relative group ${
                    activeTab === "bookings"
                      ? "bg-luxury-gradient text-white"
                      : isPro
                      ? "text-white/60 hover:text-white"
                      : "text-white/30 cursor-not-allowed"
                  }`}
                >
                  Bookings {!isPro && (
                    <>
                      <Crown className="w-3 h-3 inline ml-1 text-yellow-400" />
                      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1 rounded-lg text-xs bg-black/90 border border-yellow-500/30 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Pro Feature</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleTabChange("analytics")}
                  disabled={!isBusiness}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all relative group ${
                    activeTab === "analytics"
                      ? "bg-luxury-gradient text-white"
                      : isBusiness
                      ? "text-white/60 hover:text-white"
                      : "text-white/30 cursor-not-allowed"
                  }`}
                >
                  Analytics {!isBusiness && (
                    <>
                      <Crown className="w-3 h-3 inline ml-1 text-yellow-400" />
                      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1 rounded-lg text-xs bg-black/90 border border-yellow-500/30 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Business Feature</span>
                    </>
                  )}
                </button>
              </div>

              {/* Tab Content */}
              <div className="space-y-6">
                {/* Info Tab */}
                {activeTab === "info" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Basic Info */}
                    <div className="glass-card p-6">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Basic Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-white/70">
                          <Mail className="w-4 h-4" />
                          <span>{client.email}</span>
                        </div>
                        {client.phone && (
                          <div className="flex items-center gap-3 text-white/70">
                            <Phone className="w-4 h-4" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-3 text-white/70">
                          <Clock className="w-4 h-4" />
                          <span>
                            Joined {new Date(client.createdAt).toLocaleDateString("en-GB")}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-white/70">
                          <Calendar className="w-4 h-4" />
                          <span>{client.totalBookings || 0} Total Bookings</span>
                        </div>
                        {client.location && (
                          <div className="flex items-center gap-3 text-white/70">
                            <MapPin className="w-4 h-4" />
                            <span>{client.location.name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="glass-card p-6">
                      <h3 className="text-lg font-bold text-white mb-4">Notes</h3>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes about this client..."
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-lavender transition-colors resize-none"
                        rows={4}
                      />
                      <div className="flex items-center gap-3 mt-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSaveNotes}
                          disabled={savingNotes}
                          className="px-4 py-2 bg-luxury-gradient text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {savingNotes ? "Saving..." : "Save Notes"}
                        </motion.button>
                        {notesSaved && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-green-400 text-sm font-semibold"
                          >
                            ✓ Saved!
                          </motion.span>
                        )}
                      </div>
                    </div>

                    {/* Pro Feature: Tags */}
                    {isPro && (
                      <div className="glass-card p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <Tag className="w-5 h-5" />
                          Client Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {["VIP", "Frequent", "New", "Inactive"].map((tag) => (
                            <motion.button
                              key={tag}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleToggleTag(tag)}
                              disabled={savingTags}
                              className={`px-3 py-1 rounded-full text-sm font-semibold border transition-all ${
                                selectedTags.includes(tag)
                                  ? "bg-luxury-gradient border-transparent text-white"
                                  : "border-white/20 text-white/60 hover:border-lavender"
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {tag}
                            </motion.button>
                          ))}
                        </div>
                        {savingTags && (
                          <p className="text-white/60 text-xs mt-2">Saving...</p>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Bookings Tab (Pro+) */}
                {activeTab === "bookings" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {!isPro ? (
                      <div className="glass-card p-8 text-center">
                        <Lock className="w-12 h-12 text-lavender mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">
                          Upgrade to Pro
                        </h3>
                        <p className="text-white/60 mb-4">
                          View booking history and send retention emails
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          className="px-6 py-3 bg-luxury-gradient text-white font-bold rounded-xl"
                        >
                          <Crown className="w-4 h-4 inline mr-2" />
                          Upgrade Now
                        </motion.button>
                      </div>
                    ) : loadingBookings ? (
                      <div className="text-center text-white/60 py-12">
                        Loading bookings...
                      </div>
                    ) : bookings.length === 0 ? (
                      <div className="glass-card p-8 text-center">
                        <Calendar className="w-12 h-12 text-white/40 mx-auto mb-4" />
                        <p className="text-white/60">No bookings yet</p>
                      </div>
                    ) : (
                      <>
                        <div className="glass-card p-6">
                          <h3 className="text-lg font-bold text-white mb-4">
                            Booking History
                          </h3>
                          <div className="space-y-3">
                            {bookings.map((booking) => (
                              <div
                                key={booking.id}
                                className="p-4 bg-white/5 rounded-lg border border-white/10"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-semibold text-white">
                                    {booking.service.name}
                                  </span>
                                  <span className="text-green-400 font-bold">
                                    £{booking.totalAmount}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-sm text-white/60">
                                  <span>
                                    {new Date(booking.startTime).toLocaleDateString("en-GB")}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-xs ${
                                      booking.paymentStatus === "PAID"
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-yellow-500/20 text-yellow-400"
                                    }`}
                                  >
                                    {booking.paymentStatus}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            onClick={() => onSendRetentionEmail?.(client.id)}
                            className="w-full px-6 py-3 bg-gradient-to-r from-lavender to-rose-gradient text-white font-bold rounded-xl flex items-center justify-center gap-2"
                          >
                            <Mail className="w-5 h-5" />
                            Send Retention Email
                          </motion.button>
                          
                          <div className="relative group">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              disabled
                              className="w-full px-6 py-3 bg-white/10 text-white/60 font-bold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed relative"
                            >
                              <Mail className="w-5 h-5" />
                              Customize Email Template
                              <span className="ml-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                                Coming Soon
                              </span>
                            </motion.button>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {/* Analytics Tab (Business) */}
                {activeTab === "analytics" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {!isBusiness ? (
                      <div className="glass-card p-8 text-center">
                        <Lock className="w-12 h-12 text-lavender mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">
                          Upgrade to Business
                        </h3>
                        <p className="text-white/60 mb-4">
                          Unlock advanced analytics and automation tools
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          className="px-6 py-3 bg-luxury-gradient text-white font-bold rounded-xl"
                        >
                          <Crown className="w-4 h-4 inline mr-2" />
                          Upgrade to Business
                        </motion.button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="glass-card p-6">
                          <div className="flex items-center gap-3 mb-2">
                            <DollarSign className="w-5 h-5 text-green-400" />
                            <span className="text-white/60 text-sm">Lifetime Value</span>
                          </div>
                          <p className="text-2xl font-bold text-white">
                            £{insights?.lifetimeValue?.toFixed(2) || client.lifetimeValue?.toFixed(2) || "0.00"}
                          </p>
                        </div>

                        <div className="glass-card p-6">
                          <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-5 h-5 text-blue-400" />
                            <span className="text-white/60 text-sm">Avg Spend</span>
                          </div>
                          <p className="text-2xl font-bold text-white">
                            £{insights?.avgSpend?.toFixed(2) || "0.00"}
                          </p>
                        </div>

                        <div className="glass-card p-6">
                          <div className="flex items-center gap-3 mb-2">
                            <Calendar className="w-5 h-5 text-purple-400" />
                            <span className="text-white/60 text-sm">Visit Frequency</span>
                          </div>
                          <p className="text-2xl font-bold text-white">
                            {insights?.visitFrequency || "N/A"}
                          </p>
                        </div>

                        <div className="glass-card p-6">
                          <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-5 h-5 text-pink-400" />
                            <span className="text-white/60 text-sm">Retention Score</span>
                          </div>
                          <p className="text-2xl font-bold text-white">
                            {insights?.retentionScore || "85"}%
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
