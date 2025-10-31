"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Sparkles, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign?: any;
  onSaved: () => void;
}

export default function CampaignModal({
  isOpen,
  onClose,
  campaign,
  onSaved,
}: CampaignModalProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "missed_you",
    subject: "",
    body: "",
    daysInactive: 60,
    discountPercent: 0,
  });

  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name || "",
        type: campaign.type || "missed_you",
        subject: campaign.subject || "",
        body: campaign.body || "",
        daysInactive: campaign.daysInactive || 60,
        discountPercent: campaign.discountPercent || 0,
      });
    } else {
      // Reset for new campaign
      setFormData({
        name: "",
        type: "missed_you",
        subject: "",
        body: "",
        daysInactive: 60,
        discountPercent: 0,
      });
    }
  }, [campaign, isOpen]);

  const templates = {
    missed_you: {
      subject: "We Miss You at {businessName}!",
      body: "Hi {clientName},\n\nWe noticed it's been a while since your last visit. We'd love to see you again!\n\n{discount}\n\nBook your next appointment today and let us pamper you.\n\nBest regards,\n{businessName}",
    },
    welcome: {
      subject: "Welcome to {businessName}!",
      body: "Hi {clientName},\n\nThank you for choosing {businessName}! We're excited to have you.\n\nYour first booking is confirmed. We can't wait to provide you with an amazing experience.\n\nSee you soon!\n{businessName}",
    },
    birthday: {
      subject: "Happy Birthday from {businessName}! 🎉",
      body: "Hi {clientName},\n\nHappy Birthday! 🎂\n\nTo celebrate your special day, we'd like to offer you {discount} on your next visit.\n\nTreat yourself - you deserve it!\n\nWarm wishes,\n{businessName}",
    },
  };

  const handleUseTemplate = () => {
    const template = templates[formData.type as keyof typeof templates];
    if (template) {
      setFormData({
        ...formData,
        subject: template.subject,
        body: template.body,
      });
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.subject || !formData.body) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const url = campaign
        ? `/api/retention/campaigns/${campaign.id}`
        : "/api/retention/campaigns";
      
      const method = campaign ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(campaign ? "Campaign updated!" : "Campaign created!");
        onSaved();
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save campaign");
      }
    } catch (error) {
      console.error("Error saving campaign:", error);
      toast.error("Failed to save campaign");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass-card p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-rose-400 to-amber-300 rounded-xl">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold text-white">
                {campaign ? "Edit Campaign" : "New Campaign"}
              </h2>
              <p className="text-white/60 text-sm">
                Create automated email campaigns to retain clients
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-white font-semibold mb-2">
                Campaign Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Win Back Inactive Clients"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lavender/50"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Campaign Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-lavender/50"
              >
                <option value="missed_you">We Miss You (Inactive Clients)</option>
                <option value="welcome">Welcome New Clients</option>
                <option value="birthday">Birthday Offer</option>
              </select>
            </div>

            {formData.type === "missed_you" && (
              <div>
                <label className="block text-white font-semibold mb-2">
                  Days Inactive
                </label>
                <input
                  type="number"
                  value={formData.daysInactive}
                  onChange={(e) => setFormData({ ...formData, daysInactive: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-lavender/50"
                />
                <p className="text-white/40 text-xs mt-1">
                  Send to clients who haven't booked in this many days
                </p>
              </div>
            )}

            <div>
              <label className="block text-white font-semibold mb-2">
                Discount Offer (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.discountPercent}
                onChange={(e) => setFormData({ ...formData, discountPercent: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-lavender/50"
              />
              <p className="text-white/40 text-xs mt-1">
                Optional discount to include in the email
              </p>
            </div>

            <button
              onClick={handleUseTemplate}
              className="text-sm text-lavender hover:text-lavender/80 transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-4 h-4" />
              Use template for this campaign type
            </button>

            <div>
              <label className="block text-white font-semibold mb-2">
                Email Subject *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Subject line for the email"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lavender/50"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Email Body *
              </label>
              <textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Write your email message here..."
                rows={8}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lavender/50 resize-none"
              />
              <p className="text-white/40 text-xs mt-2">
                Variables: {"{clientName}"}, {"{businessName}"}, {"{discount}"}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-400 to-amber-300 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-rose-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  {campaign ? "Update" : "Create"} Campaign
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
