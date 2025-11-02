"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Copy, ExternalLink, Check } from "lucide-react";
import toast from "react-hot-toast";

interface BusinessSlugModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BusinessSlugModal({ isOpen, onClose, onSuccess }: BusinessSlugModalProps) {
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingLink, setBookingLink] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!businessName.trim() || businessName.trim().length < 3) {
      toast.error("Business name must be at least 3 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/business/slug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName: businessName.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setBookingLink(data.bookingLink);
        setSuccess(true);
        toast.success("🎉 Your booking page is ready!");
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(data.error || "Failed to create booking page");
      }
    } catch (error) {
      console.error("Failed to create slug:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(bookingLink);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setBusinessName("");
    setSuccess(false);
    setBookingLink("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50"
          >
            <div className="glass-card p-8 mx-4">
              {!success ? (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-luxury-gradient">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">
                          Create Your Booking Page
                        </h3>
                        <p className="text-white/60 text-sm">
                          Get your unique booking link
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleClose}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-white/60" />
                    </button>
                  </div>

                  {/* Form */}
                  <div className="space-y-6">
                    <div>
                      <label className="text-white/80 text-sm mb-2 block font-medium">
                        What's your business name?
                      </label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lavender/50 focus:border-lavender"
                        placeholder="e.g., Kristiyan's Glam Studio"
                        autoFocus
                      />
                      <p className="text-white/40 text-xs mt-2">
                        We'll create a unique URL like: glambooking.co.uk/book/your-business-name
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        disabled={loading || !businessName.trim()}
                        className="flex-1 px-6 py-3 bg-luxury-gradient text-white font-bold rounded-xl shadow-lg shadow-lavender/30 hover:shadow-lavender/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Create Booking Page
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Success View */}
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.6 }}
                      className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-luxury-gradient mb-6"
                    >
                      <Check className="w-10 h-10 text-white" />
                    </motion.div>

                    <h3 className="text-2xl font-bold text-white mb-2">
                      Your Booking Page is Live! 🎉
                    </h3>
                    <p className="text-white/60 mb-6">
                      Share this link with clients to start receiving bookings
                    </p>

                    {/* Booking Link */}
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl mb-6">
                      <p className="text-sm text-white/60 mb-2">Your booking link:</p>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-mono text-sm break-all flex-1">
                          {bookingLink}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCopyLink}
                        className="flex-1 px-6 py-3 bg-lavender/20 text-white font-semibold rounded-xl hover:bg-lavender/30 transition-colors flex items-center justify-center gap-2 border border-lavender/30"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy Link
                          </>
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => window.open(bookingLink, "_blank")}
                        className="flex-1 px-6 py-3 bg-luxury-gradient text-white font-bold rounded-xl shadow-lg shadow-lavender/30 hover:shadow-lavender/50 transition-all flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Preview
                      </motion.button>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleClose}
                      className="mt-4 w-full px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
                    >
                      Done
                    </motion.button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
