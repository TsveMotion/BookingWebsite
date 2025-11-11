"use client";

import { motion } from "framer-motion";
import { User, Mail, Phone, MessageSquare, ChevronRight } from "lucide-react";

interface ClientDetailsFormProps {
  formData: {
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    notes: string;
  };
  onChange: (field: string, value: string) => void;
  onNext: () => void;
}

export default function ClientDetailsForm({
  formData,
  onChange,
  onNext,
}: ClientDetailsFormProps) {
  const isValid = formData.clientName.trim() && formData.clientEmail.trim();

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Your Details</h2>
        <p className="text-white/60 text-sm">We'll send your booking confirmation here</p>
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Full Name <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              required
              value={formData.clientName}
              onChange={(e) => onChange("clientName", e.target.value)}
              placeholder="John Doe"
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#e7b5ff]/50 focus:border-[#e7b5ff]/50 transition-all"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Email Address <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="email"
              required
              value={formData.clientEmail}
              onChange={(e) => onChange("clientEmail", e.target.value)}
              placeholder="john@example.com"
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#e7b5ff]/50 focus:border-[#e7b5ff]/50 transition-all"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="tel"
              value={formData.clientPhone}
              onChange={(e) => onChange("clientPhone", e.target.value)}
              placeholder="+44 7700 900000"
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#e7b5ff]/50 focus:border-[#e7b5ff]/50 transition-all"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Special Requests
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-white/40" />
            <textarea
              value={formData.notes}
              onChange={(e) => onChange("notes", e.target.value)}
              rows={4}
              placeholder="Any special requests or notes..."
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#e7b5ff]/50 focus:border-[#e7b5ff]/50 transition-all resize-none"
            />
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent pt-6 pb-4"
      >
        <button
          onClick={onNext}
          disabled={!isValid}
          className="w-full py-4 bg-gradient-to-r from-[#e7b5ff] to-[#d4a5ff] text-black font-bold rounded-2xl shadow-lg shadow-[#e7b5ff]/30 hover:shadow-[#e7b5ff]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
}
