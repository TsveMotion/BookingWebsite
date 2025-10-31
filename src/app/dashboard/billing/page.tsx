"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { CreditCard, CheckCircle, Clock, XCircle, Loader2, Sparkles, MessageSquare, Plus } from "lucide-react";
import { StripePaymentModal } from "@/components/modals/StripePaymentModal";

interface BillingHistory {
  id: string;
  date: string;
  amount: number;
  status: string;
  description: string;
}

export default function BillingPage() {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; period: string; amount: number } | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [smsCredits, setSmsCredits] = useState({ total: 0, used: 0, remaining: 0, monthlyAllowance: 0 });
  const [buyingSmsCredits, setBuyingSmsCredits] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      fetchBillingData();
    }
  }, [isLoaded, user]);

  const fetchBillingData = async () => {
    try {
      const [profileRes, historyRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/billing/history'),
      ]);

      if (profileRes.ok) {
        const profile = await profileRes.json();
        setCurrentPlan(profile.plan || 'free');
        
        // Fetch SMS credits if not free plan
        if (profile.plan !== 'free') {
          fetchSmsCredits();
        }
      }

      if (historyRes.ok) {
        const history = await historyRes.json();
        setBillingHistory(history.data || []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch billing data:', error);
      setLoading(false);
    }
  };

  const fetchSmsCredits = async () => {
    try {
      const response = await fetch('/api/sms/credits');
      if (response.ok) {
        const data = await response.json();
        setSmsCredits(data);
      }
    } catch (error) {
      console.error('Failed to fetch SMS credits:', error);
    }
  };

  const handleUpgrade = (planName: string, amount: number) => {
    setSelectedPlan({ name: planName, period: billingPeriod, amount });
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    // Refresh billing data
    fetchBillingData();
    setShowPaymentModal(false);
    setSelectedPlan(null);
  };

  const handleBuySmsCredits = async (credits: number) => {
    if (currentPlan === 'free') {
      alert('SMS feature requires Pro or Business plan. Please upgrade first!');
      return;
    }
    
    setBuyingSmsCredits(true);
    try {
      // TODO: Implement Stripe checkout for SMS credits
      // For now, just add credits directly
      const response = await fetch('/api/sms/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credits }),
      });
      
      if (response.ok) {
        alert(`Successfully added ${credits} SMS credits!`);
        fetchSmsCredits();
      } else {
        alert('Failed to purchase SMS credits');
      }
    } catch (error) {
      console.error('Failed to buy SMS credits:', error);
      alert('Failed to purchase SMS credits');
    } finally {
      setBuyingSmsCredits(false);
    }
  };

  if (!isLoaded || loading) {
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

  const plans = [
    {
      name: "Free",
      monthlyPrice: 0,
      yearlyPrice: 0,
      displayPrice: billingPeriod === "monthly" ? "£0" : "£0",
      period: "/month",
      features: [
        "1 staff member",
        "Unlimited bookings",
        "Email reminders",
        '"Powered by GlamBooking" branding',
      ],
      gradient: "bg-white/5",
      current: currentPlan === "free",
      disabled: true,
    },
    {
      name: "Pro",
      monthlyPrice: 19.99,
      yearlyPrice: 203.90,
      displayPrice: billingPeriod === "monthly" ? "£19.99" : "£203.90",
      period: billingPeriod === "monthly" ? "/month" : "/year",
      savings: billingPeriod === "yearly" ? "Save 15%" : null,
      features: [
        "Unlimited staff",
        "SMS reminders",
        "Loyalty & retention tools",
        "Remove branding",
        "Priority support",
        "Advanced analytics",
      ],
      gradient: "bg-lavender-gradient",
      popular: true,
      current: currentPlan === "pro",
    },
    {
      name: "Business",
      monthlyPrice: 39.99,
      yearlyPrice: 407.90,
      displayPrice: billingPeriod === "monthly" ? "£39.99" : "£407.90",
      period: billingPeriod === "monthly" ? "/month" : "/year",
      savings: billingPeriod === "yearly" ? "Save 15%" : null,
      features: [
        "Multi-location support",
        "Team roles & staff permissions",
        "Advanced reporting",
        "AI Booking Assistant (priority access)",
        "Dedicated account manager",
        "Custom integrations",
      ],
      gradient: "bg-luxury-gradient",
      current: currentPlan === "business",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-white/40" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-2">
            Billing & Subscription
          </h1>
          <p className="text-white/60 text-lg">
            Manage your plan and view billing history
          </p>
        </div>

        {/* Current Plan Status */}
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Current Plan</h2>
              <p className="text-3xl font-heading font-black text-transparent bg-clip-text bg-luxury-gradient capitalize">
                {currentPlan}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-luxury-gradient bg-opacity-20">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
          </div>
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
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-card p-6 ${plan.current ? 'ring-2 ring-lavender' : ''} ${plan.popular ? 'relative' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-luxury-gradient text-white text-xs font-bold rounded-full">
                    POPULAR
                  </span>
                </div>
              )}

              <div className={`inline-flex p-3 rounded-xl ${plan.gradient} bg-opacity-20 mb-4`}>
                <CreditCard className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="mb-2">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-white">{plan.displayPrice}</span>
                  <span className="text-white/60 ml-1">{plan.period}</span>
                </div>
                {billingPeriod === "yearly" && plan.name !== "Free" && (
                  <div className="mt-1 text-white/50 text-sm">
                    £{(billingPeriod === "yearly" ? plan.yearlyPrice / 12 : plan.monthlyPrice).toFixed(2)}/mo average
                  </div>
                )}
              </div>
              {plan.savings && (
                <div className="mb-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    {plan.savings} • {billingPeriod === "yearly" ? `Save £${((plan.monthlyPrice * 12) - plan.yearlyPrice).toFixed(2)}` : ""}
                  </span>
                </div>
              )}

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-white/80 text-sm">
                    <CheckCircle className="w-4 h-4 text-lavender flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.current ? (
                <button
                  disabled
                  className="w-full py-3 bg-white/10 text-white/60 font-semibold rounded-lg cursor-not-allowed"
                >
                  Current Plan
                </button>
              ) : plan.disabled ? (
                <button
                  disabled
                  className="w-full py-3 bg-white/10 text-white/60 font-semibold rounded-lg cursor-not-allowed"
                >
                  Downgrade to Free
                </button>
              ) : (
                <button
                  onClick={() => handleUpgrade(
                    plan.name.toLowerCase(),
                    billingPeriod === "monthly" ? plan.monthlyPrice : plan.yearlyPrice
                  )}
                  className={`w-full py-3 ${plan.gradient} hover:opacity-90 text-white font-semibold rounded-lg transition-opacity`}
                >
                  Upgrade to {plan.name}
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {/* SMS Credits Section */}
        {currentPlan !== 'free' && (
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
                  {smsCredits.monthlyAllowance}
                  <span className="text-sm text-white/60 ml-1">messages</span>
                </p>
                <p className="text-xs text-white/40 mt-1">
                  {currentPlan === 'pro' ? 'Pro Plan: 50/mo' : 'Business Plan: 500/mo'}
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-white/60 text-sm mb-1">Used This Month</p>
                <p className="text-2xl font-bold text-amber-400">
                  {smsCredits.used}
                  <span className="text-sm text-white/60 ml-1">messages</span>
                </p>
                <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-rose-400 to-amber-300 h-2 rounded-full transition-all"
                    style={{ width: `${(smsCredits.used / smsCredits.total) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-white/60 text-sm mb-1">Remaining</p>
                <p className="text-2xl font-bold text-green-400">
                  {smsCredits.remaining}
                  <span className="text-sm text-white/60 ml-1">messages</span>
                </p>
                {smsCredits.remaining < 10 && (
                  <p className="text-xs text-red-400 mt-1">⚠️ Low balance - top up below</p>
                )}
              </div>
            </div>

            {/* Top-Up Options */}
            <div className="p-6 bg-gradient-to-br from-rose-400/10 to-amber-300/10 rounded-xl border border-rose-400/20">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Buy Additional Credits
              </h3>
              <p className="text-white/60 text-sm mb-4">
                Need more messages? Purchase additional credits on top of your monthly allowance.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleBuySmsCredits(1000)}
                  disabled={buyingSmsCredits}
                  className="flex-1 min-w-[200px] px-6 py-4 bg-gradient-to-r from-rose-400 to-amber-300 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-rose-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {buyingSmsCredits ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span>
                      1000 Credits - £4.95
                      <span className="block text-xs text-white/80 mt-1">Best Value</span>
                    </span>
                  )}
                </button>
                
                <button
                  onClick={() => handleBuySmsCredits(500)}
                  disabled={buyingSmsCredits}
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
          
          {billingHistory.length > 0 ? (
            <div className="space-y-3">
              {billingHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(item.status)}
                    <div>
                      <p className="text-white font-medium">{item.description}</p>
                      <p className="text-white/60 text-sm">{item.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">£{item.amount.toFixed(2)}</p>
                    <p className={`text-sm capitalize ${
                      item.status === 'paid' ? 'text-green-400' :
                      item.status === 'pending' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {item.status}
                    </p>
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

        {/* Payment Modal */}
        {selectedPlan && (
          <StripePaymentModal
            isOpen={showPaymentModal}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedPlan(null);
            }}
            planName={selectedPlan.name}
            billingPeriod={selectedPlan.period as "monthly" | "yearly"}
            amount={selectedPlan.amount}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </motion.div>
    </div>
  );
}
