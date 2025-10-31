"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Calendar, DollarSign, Clock, ArrowRight } from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "@/hooks/useWindowSize";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(true);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  useEffect(() => {
    // Stop confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Get booking details from URL params
    const sessionId = searchParams.get("session_id");
    const amount = searchParams.get("amount");
    const service = searchParams.get("service");
    const date = searchParams.get("date");
    const time = searchParams.get("time");

    if (sessionId) {
      setBookingDetails({
        sessionId,
        amount: amount ? parseFloat(amount) : 0,
        service: service || "Service",
        date: date || "",
        time: time || "",
      });
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="max-w-2xl w-full"
      >
        <div className="glass-card p-8 md:p-12 text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-6"
          >
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto shadow-2xl shadow-green-500/50">
              <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-white" />
            </div>
          </motion.div>

          {/* Success Message */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl md:text-5xl font-heading font-black text-white mb-4"
          >
            Payment Successful!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-white/70 text-lg mb-8"
          >
            Your booking has been confirmed and payment received.
          </motion.p>

          {/* Payment Details */}
          {bookingDetails && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/10"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <div className="flex items-center gap-3 text-white/60">
                    <Calendar className="w-5 h-5" />
                    <span>Service</span>
                  </div>
                  <span className="text-white font-semibold">{bookingDetails.service}</span>
                </div>

                {bookingDetails.date && (
                  <div className="flex items-center justify-between py-3 border-b border-white/10">
                    <div className="flex items-center gap-3 text-white/60">
                      <Calendar className="w-5 h-5" />
                      <span>Date</span>
                    </div>
                    <span className="text-white font-semibold">{bookingDetails.date}</span>
                  </div>
                )}

                {bookingDetails.time && (
                  <div className="flex items-center justify-between py-3 border-b border-white/10">
                    <div className="flex items-center gap-3 text-white/60">
                      <Clock className="w-5 h-5" />
                      <span>Time</span>
                    </div>
                    <span className="text-white font-semibold">{bookingDetails.time}</span>
                  </div>
                )}

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3 text-white/60">
                    <DollarSign className="w-5 h-5" />
                    <span>Amount Paid</span>
                  </div>
                  <span className="text-green-400 font-bold text-2xl">
                    £{bookingDetails.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-r from-rose-400/10 to-amber-300/10 rounded-xl p-6 mb-8 border border-rose-400/20"
          >
            <p className="text-white/90 text-sm leading-relaxed">
              <strong className="text-white">✉️ Confirmation Email Sent!</strong>
              <br />
              We&apos;ve sent a confirmation email with your booking details. You&apos;ll also receive a reminder the day before your appointment.
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.a
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-rose-400 to-amber-300 text-white font-bold rounded-xl shadow-lg shadow-rose-400/30 hover:shadow-rose-400/50 transition-all hover:scale-105"
          >
            Back to Home
            <ArrowRight className="w-5 h-5" />
          </motion.a>

          {/* Session ID for reference */}
          {bookingDetails?.sessionId && (
            <p className="text-white/40 text-xs mt-6">
              Reference: {bookingDetails.sessionId}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading payment confirmation...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
