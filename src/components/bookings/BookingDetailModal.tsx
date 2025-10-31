"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  DollarSign,
  CreditCard,
  FileText,
  CheckCircle,
  XCircle,
  Send,
  Copy
} from "lucide-react";
import { useState } from "react";

interface BookingDetailModalProps {
  booking: {
    id: string;
    client: {
      name: string;
      email?: string;
      phone?: string;
    };
    service: {
      name: string;
      duration: number;
    };
    startTime: string;
    endTime: string;
    totalAmount: number;
    status: string;
    paymentStatus?: string;
    paymentLink?: string;
    notes?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (bookingId: string, status: string) => void;
  onResendPayment?: (bookingId: string) => void;
}

export function BookingDetailModal({ 
  booking, 
  isOpen, 
  onClose, 
  onStatusUpdate,
  onResendPayment 
}: BookingDetailModalProps) {
  const [copying, setCopying] = useState(false);

  if (!booking) return null;

  const startTime = new Date(booking.startTime);
  const endTime = new Date(booking.endTime);

  const copyPaymentLink = async () => {
    if (booking.paymentLink) {
      await navigator.clipboard.writeText(booking.paymentLink);
      setCopying(true);
      setTimeout(() => setCopying(false), 2000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "completed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-white/10 text-white/60 border-white/20";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "PENDING":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "UNPAID":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-white/10 text-white/60 border-white/20";
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-[500px] bg-black border-l border-white/10 z-50 overflow-y-auto"
          >
            <div className="glass-card m-4 p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Booking Details</h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </div>

              {/* Status Badges */}
              <div className="flex gap-2 mb-6">
                <div className={`px-3 py-1 rounded-full border text-xs font-bold capitalize ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </div>
                {booking.paymentStatus && (
                  <div className={`px-3 py-1 rounded-full border text-xs font-bold ${getPaymentStatusColor(booking.paymentStatus)}`}>
                    {booking.paymentStatus}
                  </div>
                )}
              </div>

              {/* Client Info */}
              <div className="space-y-4 mb-6">
                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Client Information</h3>
                
                <div className="glass-card p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-lavender" />
                    <div>
                      <p className="text-xs text-white/60">Name</p>
                      <p className="text-white font-semibold">{booking.client.name}</p>
                    </div>
                  </div>
                  
                  {booking.client.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-lavender" />
                      <div>
                        <p className="text-xs text-white/60">Email</p>
                        <p className="text-white">{booking.client.email}</p>
                      </div>
                    </div>
                  )}
                  
                  {booking.client.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-lavender" />
                      <div>
                        <p className="text-xs text-white/60">Phone</p>
                        <p className="text-white">{booking.client.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Info */}
              <div className="space-y-4 mb-6">
                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Appointment Details</h3>
                
                <div className="glass-card p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-lavender" />
                    <div>
                      <p className="text-xs text-white/60">Service</p>
                      <p className="text-white font-semibold">{booking.service.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-lavender" />
                    <div>
                      <p className="text-xs text-white/60">Date</p>
                      <p className="text-white">
                        {startTime.toLocaleDateString("en-GB", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-lavender" />
                    <div>
                      <p className="text-xs text-white/60">Time</p>
                      <p className="text-white">
                        {startTime.toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })} - {endTime.toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })} ({booking.service.duration} mins)
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-xs text-white/60">Price</p>
                      <p className="text-white font-bold text-lg">£{booking.totalAmount}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Link */}
              {booking.paymentLink && booking.paymentStatus !== "PAID" && (
                <div className="space-y-4 mb-6">
                  <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Payment</h3>
                  
                  <div className="glass-card p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CreditCard className="w-5 h-5 text-lavender" />
                      <p className="text-white font-semibold">Payment Link</p>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={booking.paymentLink}
                        readOnly
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={copyPaymentLink}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <Copy className="w-4 h-4 text-white" />
                      </motion.button>
                    </div>
                    {copying && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-green-400 text-xs mt-2"
                      >
                        ✓ Copied to clipboard
                      </motion.p>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {booking.notes && (
                <div className="space-y-4 mb-6">
                  <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Notes</h3>
                  <div className="glass-card p-4">
                    <p className="text-white/80 text-sm">{booking.notes}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                {booking.status === "pending" && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onStatusUpdate(booking.id, "confirmed")}
                    className="w-full px-6 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl font-bold border border-green-500/30 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Confirm Booking
                  </motion.button>
                )}

                {booking.status === "confirmed" && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onStatusUpdate(booking.id, "completed")}
                    className="w-full px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl font-bold border border-blue-500/30 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Mark as Completed
                  </motion.button>
                )}

                {(booking.status === "pending" || booking.status === "confirmed") && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onStatusUpdate(booking.id, "cancelled")}
                    className="w-full px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-bold border border-red-500/30 transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Cancel Booking
                  </motion.button>
                )}

                {booking.paymentLink && booking.paymentStatus !== "PAID" && onResendPayment && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onResendPayment(booking.id)}
                    className="w-full px-6 py-3 bg-luxury-gradient text-white rounded-xl font-bold transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Resend Payment Link
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
