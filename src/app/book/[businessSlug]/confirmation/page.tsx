"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Calendar, Mail, Phone, ArrowRight } from "lucide-react";
import Confetti from "react-confetti";

export default function BookingConfirmationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const businessSlug = params.businessSlug as string;
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceError, setInvoiceError] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (sessionId) {
      fetchBookingDetails();
    }
    
    // Set window size for confetti
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    
    // Stop confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, [sessionId]);

  const fetchBookingDetails = async () => {
    try {
      // Fetch business details
      const businessRes = await fetch(`/api/booking/${businessSlug}`);
      if (businessRes.ok) {
        const businessData = await businessRes.json();
        setBusiness(businessData);
      }

      // Fetch invoice if session ID exists
      if (sessionId) {
        setInvoiceLoading(true);
        try {
          const invoiceRes = await fetch(`/api/invoices?session_id=${sessionId}`);
          if (invoiceRes.ok) {
            const invoiceData = await invoiceRes.json();
            setInvoiceUrl(invoiceData.pdfUrl);
            setBooking(invoiceData.booking);
          } else {
            console.warn('Invoice not yet available, will retry...');
            setInvoiceError(true);
          }
        } catch (error) {
          console.error('Failed to fetch invoice:', error);
          setInvoiceError(true);
        } finally {
          setInvoiceLoading(false);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch booking:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white text-lg"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          colors={['#E9B5D8', '#C9A5D6', '#B8A3D9', '#F8C8DC']}
        />
      )}
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30"
          >
            <Check className="w-12 h-12 text-white" />
          </motion.div>

          {/* Success Message */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-heading font-black text-white mb-4"
          >
            Booking Confirmed! 🎉
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/80 text-lg mb-8"
          >
            Your payment has been processed successfully. You&apos;ll receive a confirmation email shortly.
          </motion.p>

          {/* Invoice Section */}
          {invoiceLoading ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 text-center"
            >
              <div className="animate-pulse flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-lavender border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white/70">Generating your invoice...</p>
              </div>
            </motion.div>
          ) : invoiceUrl ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="mb-8"
            >
              <a
                href={invoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-br from-lavender/20 to-blush/20 border border-lavender/30 rounded-xl text-white hover:border-lavender/50 hover:shadow-lg hover:shadow-lavender/20 transition-all group"
              >
                <div className="w-10 h-10 bg-lavender/20 rounded-lg flex items-center justify-center group-hover:bg-lavender/30 transition-colors">
                  <svg className="w-6 h-6 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg">Download Invoice</p>
                  <p className="text-sm text-white/60">View or print your receipt</p>
                </div>
              </a>
            </motion.div>
          ) : invoiceError ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-8 text-center"
            >
              <p className="text-amber-300 text-sm">Invoice is being generated. Check your email for the receipt.</p>
            </motion.div>
          ) : null}

          {/* Booking Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 text-left"
          >
            <h2 className="text-white font-bold text-xl mb-4">What&apos;s Next?</h2>
            <div className="space-y-3 text-white/70">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-lavender mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">Check Your Email</p>
                  <p className="text-sm">We&apos;ve sent a confirmation with all your booking details</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blush mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">Add to Calendar</p>
                  <p className="text-sm">Save your appointment date and time</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-amber mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">Need Changes?</p>
                  <p className="text-sm">Contact the business directly if you need to reschedule</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href={`/book/${businessSlug}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-luxury-gradient rounded-xl text-white font-bold shadow-lg shadow-lavender/30 hover:shadow-lavender/50 transition-all flex items-center justify-center gap-2"
            >
              Book Another Service
              <ArrowRight className="w-5 h-5" />
            </motion.a>
            <motion.a
              href="/"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white/10 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/20 transition-all"
            >
              Return Home
            </motion.a>
          </div>
        </motion.div>

        {/* Branding Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-8"
        >
          {(!business?.plan || business?.plan.toLowerCase() === 'free') ? (
            <div className="text-white/40 text-sm">
              <p className="mb-1">
                Powered by{' '}
                <a
                  href="https://glambooking.co.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lavender hover:text-blush transition-colors underline font-semibold"
                >
                  GlamBooking.co.uk
                </a>
              </p>
              <p className="text-white/30 text-xs">
                Need a booking system?{' '}
                <a
                  href="https://glambooking.co.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-lavender transition-colors"
                >
                  Try GlamBooking
                </a>
              </p>
            </div>
          ) : (
            business?.logoUrl && (
              <img
                src={business.logoUrl}
                alt="Business Logo"
                className="h-12 mx-auto"
              />
            )
          )}
        </motion.div>
      </div>
    </div>
  );
}
