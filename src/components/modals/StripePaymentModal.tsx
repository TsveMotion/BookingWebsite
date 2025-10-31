"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Check, CreditCard, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  billingPeriod: "monthly" | "yearly";
  amount: number;
  onSuccess?: () => void;
  subscriptionId?: string;
}

function PaymentForm({
  planName,
  billingPeriod,
  amount,
  onSuccess,
  onClose,
  subscriptionId,
}: Omit<StripePaymentModalProps, "isOpen">) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || "An error occurred");
      setProcessing(false);
      return;
    }

    // Confirm payment
    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/billing?success=true`,
      },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message || "Payment failed");
      setProcessing(false);
    } else {
      setSucceeded(true);
      setProcessing(false);

      try {
        if (subscriptionId) {
          setSyncing(true);
          const response = await fetch("/api/stripe/sync-subscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              subscriptionId,
              planName,
              billingPeriod,
            }),
          });

          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            console.error("Failed to sync subscription:", data);
          }
        } else {
          console.warn("No subscriptionId available after payment confirmation.");
        }
      } catch (syncError) {
        console.error("Subscription sync error:", syncError);
      } finally {
        setSyncing(false);
      }

      // Trigger confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E9B5D8', '#C9A9E9', '#F4A5C4'],
      });
      
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2500);
    }
  };

  if (succeeded) {
    return (
      <div className="text-center py-12">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="inline-flex p-4 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-500/30 mb-4 relative"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-green-400/30"
          />
          <Check className="w-12 h-12 text-green-400" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-green-400" />
            Payment Successful!
            <Sparkles className="w-6 h-6 text-green-400" />
          </h3>
          <p className="text-white/60">
            Your subscription has been activated. Redirecting...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white/60 text-sm">Plan</span>
          <span className="text-white font-semibold capitalize">{planName}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-white/60 text-sm">Billing</span>
          <span className="text-white font-semibold capitalize">{billingPeriod}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-white/10">
          <span className="text-white font-semibold">Total</span>
          <span className="text-2xl font-bold text-transparent bg-clip-text bg-luxury-gradient">
            £{amount.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <PaymentElement />
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={processing}
          className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || processing || syncing}
          className="flex-1 px-4 py-3 bg-luxury-gradient hover:opacity-90 text-white font-semibold rounded-lg transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {(processing || syncing) ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {syncing ? "Syncing..." : "Processing..."}
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Subscribe Now
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export function StripePaymentModal({
  isOpen,
  onClose,
  planName,
  billingPeriod,
  amount,
  onSuccess,
}: StripePaymentModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) {
      setClientSecret(null);
      setSubscriptionId(null);
      setLoading(true);
      return;
    }

    setLoading(true);

    // Create payment intent
    fetch("/api/stripe/create-subscription-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planName, billingPeriod }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const error = await res.json().catch(() => ({}));
          throw new Error(error?.error || "Failed to create subscription");
        }
        return res.json();
      })
      .then((data) => {
        setClientSecret(data.clientSecret);
        setSubscriptionId(data.subscriptionId || null);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error creating payment intent:", error);
        setLoading(false);
      });
  }, [isOpen, planName, billingPeriod]);

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

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="glass-card max-w-lg w-full p-6 md:p-8 relative max-h-[90vh] overflow-y-auto rounded-t-3xl md:rounded-3xl"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex p-4 rounded-2xl bg-luxury-gradient bg-opacity-20 mb-4">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-heading font-bold text-white mb-2">
                  Complete Your Subscription
                </h2>
                <p className="text-white/60 text-sm">
                  Secure payment powered by Stripe
                </p>
              </div>

              {/* Payment Form */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              ) : clientSecret ? (
                <Elements
                  key={clientSecret}
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "night",
                      variables: {
                        colorPrimary: "#E9B5D8",
                        colorBackground: "#1a1a1a",
                        colorText: "#ffffff",
                        colorDanger: "#ff6b6b",
                        borderRadius: "8px",
                      },
                    },
                  }}
                >
                  <PaymentForm
                    planName={planName}
                    billingPeriod={billingPeriod}
                    amount={amount}
                    onSuccess={onSuccess}
                    onClose={onClose}
                    subscriptionId={subscriptionId || undefined}
                  />
                </Elements>
              ) : (
                <div className="text-center py-12 text-white/60">
                  Failed to initialize payment. Please try again.
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
