"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  CheckCircle,
  Clock,
  Download,
  Sparkles,
  MessageSquare,
  Calendar,
  ExternalLink,
  X,
  AlertTriangle,
  TrendingUp,
  Zap,
} from "lucide-react";
import useSWR from "swr";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface BillingData {
  plan: string;
  status: string;
  nextBillingDate: string | null;
  amountDue: number;
  currency: string;
  paymentMethod: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  } | null;
  interval: string;
  smsCredits: number;
  smsCreditsUsed: number;
}

interface BillingHistoryItem {
  id: string;
  type: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  invoiceUrl: string | null;
  invoicePdf: string | null;
}

export default function BillingPage() {
  const { user, isLoaded } = useUser();
  const [buyingCredits, setBuyingCredits] = useState(false);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [changingPlan, setChangingPlan] = useState(false);
  const [cancelingSubscription, setCancelingSubscription] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Fetch billing data
  const { data: billing, error: billingError, mutate: mutateBilling } = useSWR<BillingData>("/api/billing", fetcher);
  const { data: invoices, error: invoicesError } = useSWR<BillingHistoryItem[]>("/api/billing/invoices", fetcher);

  const handleManagePaymentMethods = async () => {
    try {
      const response = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await response.json();
      
      if (response.ok && data.url) {
        window.location.href = data.url;
      } else if (data.configRequired) {
        showToast(
          "Stripe Customer Portal needs to be configured. Please visit Stripe Dashboard → Settings → Customer Portal",
          "error"
        );
      } else {
        showToast(data.error || "Failed to open billing portal", "error");
      }
    } catch (error) {
      console.error("Failed to open billing portal:", error);
      showToast("Failed to open billing portal. Please try again.", "error");
    }
  };

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleBuySmsCredits = async (amount: number) => {
    if (billing?.plan === "free") {
      showToast("SMS credits require Pro or Business plan. Please upgrade first!", "error");
      return;
    }

    setBuyingCredits(true);
    try {
      const response = await fetch("/api/stripe/sms-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();
      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        showToast("Failed to create checkout session", "error");
        setBuyingCredits(false);
      }
    } catch (error) {
      console.error("Failed to buy SMS credits:", error);
      showToast("Failed to purchase SMS credits", "error");
      setBuyingCredits(false);
    }
  };

  const handleChangePlan = async (planName: string) => {
    if (planName === billing?.plan) {
      showToast("You're already on this plan", "error");
      return;
    }

    setChangingPlan(true);
    try {
      const response = await fetch("/api/stripe/update-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planName, billingPeriod }),
      });

      const data = await response.json();
      
      if (response.ok) {
        if (data.checkoutUrl) {
          // Redirect to Stripe Checkout for new subscription
          window.location.href = data.checkoutUrl;
        } else {
          // Subscription updated successfully
          showToast(data.message || "Plan updated successfully!", "success");
          await mutateBilling();
          setShowChangePlanModal(false);
        }
      } else {
        // Show specific error message
        const errorMsg = data.error || "Failed to update plan";
        showToast(errorMsg, "error");
        console.error("Plan change error:", data);
      }
    } catch (error) {
      console.error("Failed to change plan:", error);
      showToast("Network error. Please try again.", "error");
    } finally {
      setChangingPlan(false);
    }
  };

  const handleCancelSubscription = async (immediately: boolean = false) => {
    setCancelingSubscription(true);
    try {
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ immediately }),
      });

      const data = await response.json();
      if (response.ok) {
        showToast(data.message || "Subscription canceled", "success");
        mutateBilling();
        setShowCancelModal(false);
      } else {
        showToast(data.error || "Failed to cancel subscription", "error");
      }
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      showToast("Failed to cancel subscription", "error");
    } finally {
      setCancelingSubscription(false);
    }
  };

  if (!isLoaded || !billing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white text-lg"
        >
          Loading billing...
        </motion.div>
      </div>
    );
  }

  const currentPlan = billing.plan || "free";
  const smsRemaining = (billing.smsCredits || 0) - (billing.smsCreditsUsed || 0);
  const monthlyAllowance = currentPlan === "business" ? 500 : currentPlan === "pro" ? 50 : 0;

  const plans = [
    {
      id: "free",
      name: "Free",
      price: { monthly: 0, yearly: 0 },
      features: [
        "1 staff member",
        "Unlimited bookings",
        "Email reminders",
        '"Powered by GlamBooking" branding',
      ],
      gradient: "from-gray-400 to-gray-500",
    },
    {
      id: "pro",
      name: "Pro",
      price: { monthly: 19.99, yearly: 203.90 },
      popular: true,
      features: [
        "Unlimited staff",
        "SMS reminders (50/month)",
        "Loyalty & retention tools",
        "Remove branding",
        "Priority support",
        "Advanced analytics",
      ],
      gradient: "from-pink-400 to-purple-500",
    },
    {
      id: "business",
      name: "Business",
      price: { monthly: 39.99, yearly: 407.90 },
      features: [
        "Multi-location support",
        "SMS reminders (500/month)",
        "Team roles & staff permissions",
        "Advanced reporting",
        "AI Booking Assistant",
        "Dedicated account manager",
      ],
      gradient: "from-purple-400 to-blue-500",
    },
  ];

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; text: string }> = {
      active: { color: "bg-green-500/20 text-green-400 border-green-500/30", text: "Active" },
      trialing: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", text: "Trial" },
      past_due: { color: "bg-red-500/20 text-red-400 border-red-500/30", text: "Past Due" },
      canceled: { color: "bg-gray-500/20 text-gray-400 border-gray-500/30", text: "Canceled" },
      inactive: { color: "bg-gray-500/20 text-gray-400 border-gray-500/30", text: "Inactive" },
    };

    const badge = badges[status] || badges.inactive;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-2">
            Billing & Subscription
          </h1>
          <p className="text-white/60 text-lg">Manage your plan and view billing history</p>
        </div>

        {/* Current Plan Overview */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Plan Card */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Current Plan</h2>
              {getStatusBadge(billing.status)}
            </div>

            <div className="mb-4">
              <p className="text-4xl font-heading font-black gradient-text capitalize mb-2">
                {currentPlan}
              </p>
              {billing.nextBillingDate && (
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Next billing: {new Date(billing.nextBillingDate).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
              {billing.amountDue > 0 && (
                <p className="text-white/80 mt-2">
                  £{billing.amountDue.toFixed(2)}/{billing.interval}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleManagePaymentMethods}
                className="flex-1 px-4 py-2 bg-luxury-gradient hover:opacity-90 text-white font-semibold rounded-lg transition-all"
              >
                Manage Payment Methods
              </button>
              <button
                onClick={() => setShowChangePlanModal(true)}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-all"
              >
                Change Plan
              </button>
            </div>

            {currentPlan !== "free" && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="mt-3 w-full px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold rounded-lg transition-all border border-red-500/30"
              >
                Cancel Subscription
              </button>
            )}
          </div>

          {/* Payment Method Card */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-lavender-gradient rounded-xl">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Payment Method</h2>
            </div>

            {billing.paymentMethod ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white/60" />
                  </div>
                  <div>
                    <p className="text-white font-medium capitalize">
                      {billing.paymentMethod.brand} •••• {billing.paymentMethod.last4}
                    </p>
                    <p className="text-white/60 text-sm">
                      Expires {billing.paymentMethod.expMonth}/{billing.paymentMethod.expYear}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleManagePaymentMethods}
                  className="text-pink-400 hover:text-pink-300 text-sm font-medium transition-colors"
                >
                  Update
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-white/60 mb-4">No payment method on file</p>
                <button
                  onClick={handleManagePaymentMethods}
                  className="px-6 py-2 bg-luxury-gradient hover:opacity-90 text-white font-semibold rounded-lg transition-all"
                >
                  Add Payment Method
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SMS Credits Section */}
        {currentPlan !== "free" && (
          <div className="glass-card p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-rose-400 to-amber-300 rounded-xl">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">SMS & WhatsApp Credits</h2>
                <p className="text-white/60 text-sm">Send reminders and notifications to clients</p>
              </div>
            </div>

            {/* Credits Overview */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-white/60 text-sm mb-1">Monthly Allowance</p>
                <p className="text-2xl font-bold text-white">
                  {monthlyAllowance}
                  <span className="text-sm text-white/60 ml-1">messages</span>
                </p>
                <p className="text-xs text-white/40 mt-1">
                  {currentPlan === "pro" ? "Pro Plan: 50/mo" : "Business Plan: 500/mo"}
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-white/60 text-sm mb-1">Used This Month</p>
                <p className="text-2xl font-bold text-amber-400">
                  {billing.smsCreditsUsed || 0}
                  <span className="text-sm text-white/60 ml-1">messages</span>
                </p>
                <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                  <div
                    className="bg-gradient-to-r from-rose-400 to-amber-300 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        ((billing.smsCreditsUsed || 0) / (billing.smsCredits || 1)) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-white/60 text-sm mb-1">Remaining</p>
                <p className="text-2xl font-bold text-green-400">
                  {smsRemaining}
                  <span className="text-sm text-white/60 ml-1">messages</span>
                </p>
                {smsRemaining < 10 && (
                  <p className="text-xs text-red-400 mt-1">⚠️ Low balance - top up below</p>
                )}
              </div>
            </div>

            {/* Top-Up Options */}
            <div className="p-6 bg-gradient-to-br from-rose-400/10 to-amber-300/10 rounded-xl border border-rose-400/20">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Buy Additional Credits
              </h3>
              <p className="text-white/60 text-sm mb-4">
                Need more messages? Purchase additional credits on top of your monthly allowance.
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleBuySmsCredits(1000)}
                  disabled={buyingCredits}
                  className="flex-1 min-w-[200px] px-6 py-4 bg-gradient-to-r from-rose-400 to-amber-300 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-rose-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {buyingCredits ? (
                    <span>Processing...</span>
                  ) : (
                    <span>
                      1000 Credits - £4.95
                      <span className="block text-xs text-white/80 mt-1">Best Value</span>
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleBuySmsCredits(500)}
                  disabled={buyingCredits}
                  className="flex-1 min-w-[200px] px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
                >
                  500 Credits - £2.99
                </button>
              </div>

              <p className="text-xs text-white/40 mt-4">
                💡 Credits never expire and roll over month-to-month
              </p>
            </div>
          </div>
        )}

        {/* Billing History */}
        <div className="glass-card p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Billing History</h2>

          {invoices && invoices.length > 0 ? (
            <div className="space-y-3">
              {invoices.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {item.status === "paid" ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-400" />
                    )}
                    <div>
                      <p className="text-white font-medium">{item.description}</p>
                      <p className="text-white/60 text-sm">
                        {new Date(item.date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-white font-bold">
                        £{item.amount.toFixed(2)} {item.currency.toUpperCase()}
                      </p>
                      <p
                        className={`text-sm capitalize ${
                          item.status === "paid"
                            ? "text-green-400"
                            : item.status === "pending"
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}
                      >
                        {item.status}
                      </p>
                    </div>
                    {item.invoiceUrl && (
                      <a
                        href={item.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="View Invoice"
                      >
                        <ExternalLink className="w-5 h-5 text-pink-400" />
                      </a>
                    )}
                    {item.invoicePdf && (
                      <a
                        href={item.invoicePdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-5 h-5 text-purple-400" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/40">No billing history yet</p>
            </div>
          )}
        </div>
        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-4 right-4 z-50"
            >
              <div
                className={`px-6 py-4 rounded-lg shadow-lg border ${
                  toast.type === "success"
                    ? "bg-green-500/20 border-green-500/50 text-green-400"
                    : "bg-red-500/20 border-red-500/50 text-red-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  {toast.type === "success" ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                  <p className="font-medium">{toast.message}</p>
                  <button onClick={() => setToast(null)} className="ml-2">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Change Plan Modal */}
        <AnimatePresence>
          {showChangePlanModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => !changingPlan && setShowChangePlanModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-white">Change Subscription Plan</h2>
                  <button
                    onClick={() => setShowChangePlanModal(false)}
                    disabled={changingPlan}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>

                {/* Billing Period Toggle */}
                <div className="flex items-center justify-center gap-4 mb-8">
                  <button
                    onClick={() => setBillingPeriod("monthly")}
                    className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                      billingPeriod === "monthly"
                        ? "bg-luxury-gradient text-white"
                        : "bg-white/10 text-white/60 hover:bg-white/20"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingPeriod("yearly")}
                    className={`px-6 py-2 rounded-lg font-semibold transition-all relative ${
                      billingPeriod === "yearly"
                        ? "bg-luxury-gradient text-white"
                        : "bg-white/10 text-white/60 hover:bg-white/20"
                    }`}
                  >
                    Yearly
                    <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                      15% OFF
                    </span>
                  </button>
                </div>

                {/* Plans Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                  {plans.map((plan) => {
                    const isCurrent = plan.id === currentPlan;
                    const price =
                      billingPeriod === "monthly" ? plan.price.monthly : plan.price.yearly;
                    const displayPrice = billingPeriod === "yearly" ? price / 12 : price;

                    return (
                      <div
                        key={plan.id}
                        className={`relative p-6 rounded-xl border ${
                          isCurrent
                            ? "border-pink-400 bg-pink-400/10"
                            : "border-white/10 bg-white/5"
                        } ${plan.popular ? "ring-2 ring-pink-400" : ""}`}
                      >
                        {plan.popular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className="px-3 py-1 bg-luxury-gradient text-white text-xs font-bold rounded-full">
                              POPULAR
                            </span>
                          </div>
                        )}

                        {isCurrent && (
                          <div className="absolute -top-3 right-4">
                            <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                              CURRENT
                            </span>
                          </div>
                        )}

                        <div className="mb-4">
                          <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                          <div className="flex items-baseline">
                            <span className="text-4xl font-bold text-white">
                              £{displayPrice.toFixed(2)}
                            </span>
                            <span className="text-white/60 ml-1">/month</span>
                          </div>
                          {billingPeriod === "yearly" && plan.id !== "free" && (
                            <p className="text-sm text-white/60 mt-1">
                              £{price.toFixed(2)} billed yearly
                            </p>
                          )}
                        </div>

                        <ul className="space-y-3 mb-6">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-white/80 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>

                        <button
                          onClick={() => handleChangePlan(plan.id)}
                          disabled={isCurrent || changingPlan}
                          className={`w-full py-3 rounded-lg font-semibold transition-all ${
                            isCurrent
                              ? "bg-white/10 text-white/40 cursor-not-allowed"
                              : `bg-gradient-to-r ${plan.gradient} text-white hover:opacity-90 disabled:opacity-50`
                          }`}
                        >
                          {changingPlan
                            ? "Processing..."
                            : isCurrent
                            ? "Current Plan"
                            : plan.id === "free"
                            ? "Downgrade to Free"
                            : currentPlan === "free"
                            ? "Upgrade"
                            : plans.findIndex((p) => p.id === plan.id) >
                              plans.findIndex((p) => p.id === currentPlan)
                            ? "Upgrade"
                            : "Downgrade"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cancel Subscription Modal */}
        <AnimatePresence>
          {showCancelModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => !cancelingSubscription && setShowCancelModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card p-8 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-red-500/20 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Cancel Subscription?</h2>
                </div>

                <p className="text-white/60 mb-2">
                  Are you sure you want to cancel your subscription?
                </p>

                {billing?.nextBillingDate && (
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10 mb-6">
                    <p className="text-sm text-white/80">
                      Your subscription will remain active until{" "}
                      <span className="font-semibold text-white">
                        {new Date(billing.nextBillingDate).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    disabled={cancelingSubscription}
                    className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-all"
                  >
                    Keep Subscription
                  </button>
                  <button
                    onClick={() => handleCancelSubscription(false)}
                    disabled={cancelingSubscription}
                    className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                  >
                    {cancelingSubscription ? "Canceling..." : "Cancel Plan"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
