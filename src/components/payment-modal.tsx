"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe-client";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  priceId: string;
}

function PaymentForm({
  planName,
  priceId,
  onSuccess,
}: {
  planName: string;
  priceId: string;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Confirm the setup intent
      const { error: confirmError, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/dashboard",
        },
        redirect: "if_required",
      });

      if (confirmError) {
        setError(confirmError.message || "Payment failed");
        setIsProcessing(false);
        return;
      }

      if (!setupIntent?.payment_method) {
        setError("Failed to set up payment method");
        setIsProcessing(false);
        return;
      }

      // Create subscription with the confirmed payment method
      const subscriptionResponse = await fetch(
        "/api/stripe/create-subscription",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            priceId,
            paymentMethodId: setupIntent.payment_method,
          }),
        }
      );

      if (!subscriptionResponse.ok) {
        const data = await subscriptionResponse.json();
        throw new Error(data.error || "Failed to create subscription");
      }

      // Call success callback
      onSuccess();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <PaymentElement />
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="gradient"
        size="lg"
        className="w-full"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? "Processing..." : "Subscribe Now"}
      </Button>

      <p className="text-xs text-white/40 mt-4 text-center">
        Your payment is secure and encrypted. Cancel anytime.
      </p>
    </form>
  );
}

export function PaymentModal({
  isOpen,
  onClose,
  planName,
  priceId,
}: PaymentModalProps) {
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      initializePayment();
    } else {
      setClientSecret(null);
      setError(null);
    }
  }, [isOpen]);

  const initializePayment = async () => {
    try {
      // First, create or get the customer
      const customerResponse = await fetch("/api/stripe/create-customer", {
        method: "POST",
      });

      if (!customerResponse.ok) {
        throw new Error("Failed to create customer");
      }

      // Create setup intent for payment collection
      const setupResponse = await fetch("/api/stripe/create-setup-intent", {
        method: "POST",
      });

      if (!setupResponse.ok) {
        throw new Error("Failed to initialize payment");
      }

      const { clientSecret: secret } = await setupResponse.json();
      setClientSecret(secret);
    } catch (err: any) {
      setError(err.message || "Failed to initialize payment");
    }
  };

  const handleSuccess = () => {
    router.push("/dashboard");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg glass-card p-8 z-10"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-3xl font-heading font-bold mb-2">
              Subscribe to <span className="gradient-text">{planName}</span>
            </h2>
            <p className="text-white/60 mb-8">
              Enter your payment details to get started.
            </p>

            {error && !clientSecret ? (
              <div className="text-center py-8">
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
                <Button
                  onClick={() => initializePayment()}
                  variant="outline"
                  className="mx-auto"
                >
                  Try Again
                </Button>
              </div>
            ) : !clientSecret ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white/60">Loading payment form...</p>
              </div>
            ) : (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'night',
                    variables: {
                      colorPrimary: '#a855f7',
                    },
                  },
                }}
              >
                <PaymentForm
                  planName={planName}
                  priceId={priceId}
                  onSuccess={handleSuccess}
                />
              </Elements>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
