"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, User, MapPin, CreditCard, Check } from "lucide-react";

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  addons?: Array<{
    id: string;
    name: string;
    extraTime: number;
    extraPrice: number;
  }>;
}

interface StaffMember {
  id: string;
  name: string;
  displayName: string;
}

interface Location {
  id: string;
  name: string;
  address?: string;
}

interface BookingSummaryProps {
  service: Service;
  selectedAddons: string[];
  staff: StaffMember | null;
  location: Location | null;
  date: Date;
  time: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export default function BookingSummary({
  service,
  selectedAddons,
  staff,
  location,
  date,
  time,
  clientName,
  clientEmail,
  clientPhone,
  onConfirm,
  isSubmitting,
}: BookingSummaryProps) {
  // Calculate total
  const addonsCost = selectedAddons.reduce((total, addonId) => {
    const addon = service.addons?.find(a => a.id === addonId);
    return total + (addon?.extraPrice || 0);
  }, 0);
  
  const addonsDuration = selectedAddons.reduce((total, addonId) => {
    const addon = service.addons?.find(a => a.id === addonId);
    return total + (addon?.extraTime || 0);
  }, 0);

  const totalPrice = service.price + addonsCost;
  const totalDuration = service.duration + addonsDuration;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Review Your Booking</h2>
        <p className="text-white/60 text-sm">Double-check everything looks good</p>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 border border-[#e7b5ff]/20 rounded-2xl p-6 space-y-6">
        {/* Service */}
        <div>
          <p className="text-xs font-medium text-white/50 uppercase tracking-wide mb-2">Service</p>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{service.name}</h3>
              <div className="flex items-center gap-4 text-sm text-white/60">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {totalDuration} min
                </span>
              </div>
            </div>
            <p className="text-2xl font-bold text-[#e7b5ff]">£{totalPrice.toFixed(2)}</p>
          </div>
          
          {/* Add-ons */}
          {selectedAddons.length > 0 && service.addons && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-xs text-white/50 mb-2">Includes:</p>
              {selectedAddons.map(addonId => {
                const addon = service.addons?.find(a => a.id === addonId);
                if (!addon) return null;
                return (
                  <div key={addon.id} className="flex items-center justify-between text-sm mb-1">
                    <span className="text-white/70">+ {addon.name}</span>
                    <span className="text-white/60">£{addon.extraPrice.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="h-px bg-white/10" />

        {/* Date & Time */}
        <div>
          <p className="text-xs font-medium text-white/50 uppercase tracking-wide mb-3">When</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-white">
              <Calendar className="w-5 h-5 text-[#e7b5ff]" />
              <span className="font-medium">
                {date.toLocaleDateString('en-GB', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <Clock className="w-5 h-5 text-[#e7b5ff]" />
              <span className="font-medium">{time}</span>
            </div>
          </div>
        </div>

        {/* Staff */}
        {staff && (
          <>
            <div className="h-px bg-white/10" />
            <div>
              <p className="text-xs font-medium text-white/50 uppercase tracking-wide mb-3">Specialist</p>
              <div className="flex items-center gap-3 text-white">
                <User className="w-5 h-5 text-[#e7b5ff]" />
                <span className="font-medium">{staff.displayName || staff.name}</span>
              </div>
            </div>
          </>
        )}

        {/* Location */}
        {location && (
          <>
            <div className="h-px bg-white/10" />
            <div>
              <p className="text-xs font-medium text-white/50 uppercase tracking-wide mb-3">Location</p>
              <div className="flex items-start gap-3 text-white">
                <MapPin className="w-5 h-5 text-[#e7b5ff] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{location.name}</p>
                  {location.address && (
                    <p className="text-sm text-white/60 mt-1">{location.address}</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        <div className="h-px bg-white/10" />

        {/* Client Details */}
        <div>
          <p className="text-xs font-medium text-white/50 uppercase tracking-wide mb-3">Your Details</p>
          <div className="space-y-2 text-white">
            <p className="font-medium">{clientName}</p>
            <p className="text-sm text-white/70">{clientEmail}</p>
            {clientPhone && <p className="text-sm text-white/70">{clientPhone}</p>}
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <CreditCard className="w-5 h-5 text-[#e7b5ff] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-white mb-1">Secure Payment</p>
            <p className="text-xs text-white/60">
              You'll be redirected to our secure payment page powered by Stripe.
            </p>
          </div>
        </div>
      </div>

      {/* Confirm Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent pt-6 pb-4"
      >
        <button
          onClick={onConfirm}
          disabled={isSubmitting}
          className="w-full py-4 bg-gradient-to-r from-[#e7b5ff] to-[#d4a5ff] text-black font-bold rounded-2xl shadow-lg shadow-[#e7b5ff]/30 hover:shadow-[#e7b5ff]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Confirm & Pay £{totalPrice.toFixed(2)}
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
