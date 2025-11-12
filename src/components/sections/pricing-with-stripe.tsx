"use client";

import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Crown, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";

const pricingTiers = [
  {
    name: "Free",
    icon: Sparkles,
    monthlyPrice: "£0.00",
    yearlyPrice: "£0.00",
    period: "/month",
    description: "Perfect for solo professionals getting started",
    features: [
      "1 staff member",
      "Unlimited bookings",
      "Email reminders",
      '"Powered by GlamBooking" branding',
    ],
    cta: "Current Plan",
    popular: false,
    gradient: "from-white/5 to-white/10",
    stripePriceId: null,
  },
  {
    name: "Pro",
    icon: Zap,
    monthlyPrice: "£24.99",
    yearlyPrice: "£21.25",
    yearlyTotal: "£254.99",
    yearlySavings: "£44.89",
    period: "/month",
    description: "For growing businesses that need more power",
    features: [
      "Unlimited staff",
      "SMS reminders (250/month)",
      "Loyalty & retention tools",
      "Remove branding",
      "Priority support",
      "Advanced analytics",
    ],
    cta: "Upgrade",
    popular: true,
    gradient: "from-glam-purple/20 to-glam-pink/20",
    stripeMonthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || "price_1SOMLtGutXTU3oixCgx223jF",
    stripeYearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID || "price_1SOMNCGutXTU3oixggb8YGgs",
  },
  {
    name: "Business",
    icon: Crown,
    monthlyPrice: "£49.99",
    yearlyPrice: "£42.50",
    yearlyTotal: "£509.99",
    yearlySavings: "£89.89",
    period: "/month",
    description: "For established businesses scaling operations",
    features: [
      "Multi-location support",
      "SMS reminders (1000/month)",
      "Team roles & staff permissions",
      "Advanced reporting",
      "AI Booking Assistant",
      "Dedicated account manager",
    ],
    cta: "Upgrade",
    popular: false,
    gradient: "from-white/5 to-white/10",
    stripeMonthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID || "price_1SOMNbGutXTU3oix9XshUkFE",
    stripeYearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID || "price_1SOMOaGutXTU3oixNwn89Ezd",
  }
];

export function PricingWithStripe() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState<string | null>(null);
  const { isSignedIn, isLoaded } = useUser();

  const handleUpgrade = async (priceId: string | null, planName: string) => {
    if (!priceId) {
      // Free plan
      if (!isSignedIn) {
        window.location.href = "/sign-up";
      } else {
        window.location.href = "/dashboard";
      }
      return;
    }

    if (!isSignedIn) {
      // Redirect to sign up
      window.location.href = "/sign-up";
      return;
    }

    setLoading(planName);
    try {
      const response = await fetch("/api/stripe/subscription-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout. Please try again.");
      setLoading(null);
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-black via-glam-purple/5 to-black relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-glam-purple/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-glam-pink/20 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-6xl font-heading font-black mb-4">
            <span className="text-white">Simple, </span>
            <span className="bg-glam-gradient bg-clip-text text-transparent">
              Transparent
            </span>
            <span className="text-white"> Pricing</span>
          </h2>
          <p className="text-white/60 text-xl max-w-2xl mx-auto mb-8">
            No hidden fees. No commission. Just straightforward pricing that scales with you.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                billingPeriod === "monthly"
                  ? "bg-glam-gradient text-black shadow-lg"
                  : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 relative ${
                billingPeriod === "yearly"
                  ? "bg-glam-gradient text-black shadow-lg"
                  : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                15% OFF
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {pricingTiers.map((tier, index) => {
            const Icon = tier.icon;
            const currentPrice = billingPeriod === "yearly" ? tier.yearlyPrice : tier.monthlyPrice;
            const priceId = billingPeriod === "yearly" ? tier.stripeYearlyPriceId : tier.stripeMonthlyPriceId;
            
            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`relative group ${tier.popular ? 'lg:-mt-4 lg:mb-4' : ''}`}
              >
                {/* Popular Badge */}
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-glam-gradient px-6 py-2 rounded-full text-black font-bold text-sm shadow-lg">
                      POPULAR
                    </div>
                  </div>
                )}

                <div className={`bg-gradient-to-br ${tier.gradient} backdrop-blur-xl border ${
                  tier.popular ? 'border-glam-purple' : 'border-white/10'
                } rounded-3xl p-8 hover:border-glam-purple/50 transition-all duration-300 ${
                  tier.popular ? 'shadow-2xl shadow-glam-purple/20' : 'hover:shadow-2xl hover:shadow-glam-purple/10'
                } h-full flex flex-col`}>
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className={`inline-flex p-3 ${
                      tier.popular ? 'bg-glam-gradient' : 'bg-white/10'
                    } rounded-2xl mb-4`}>
                      <Icon className={`w-8 h-8 ${tier.popular ? 'text-black' : 'text-white'}`} />
                    </div>
                    <h3 className="text-2xl font-heading font-black text-white mb-2">
                      {tier.name}
                    </h3>
                    <p className="text-white/60 text-sm mb-6">
                      {tier.description}
                    </p>

                    {/* Price */}
                    <div className="mb-2">
                      <span className="text-5xl font-heading font-black bg-glam-gradient bg-clip-text text-transparent">
                        {currentPrice}
                      </span>
                      <span className="text-white/60 text-lg">
                        {tier.period}
                      </span>
                    </div>
                    
                    {billingPeriod === "yearly" && tier.yearlyTotal && (
                      <div className="space-y-1">
                        <p className="text-white/50 text-sm">
                          {tier.yearlyTotal} billed yearly
                        </p>
                        <p className="text-green-400 text-sm font-semibold">
                          ✨ Save {tier.yearlySavings}/year
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="flex-grow mb-8">
                    <ul className="space-y-3">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="p-0.5 bg-glam-gradient rounded-full mt-0.5">
                            <Check className="w-4 h-4 text-black" />
                          </div>
                          <span className="text-white/80 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleUpgrade(priceId || null, tier.name)}
                    disabled={loading === tier.name}
                    variant={tier.popular ? "gradient" : "outline"}
                    size="lg"
                    className={`w-full ${
                      tier.popular 
                        ? 'bg-glam-gradient hover:shadow-2xl hover:shadow-glam-purple/40' 
                        : 'border-2 border-white/30 hover:border-glam-purple'
                    } group`}
                  >
                    {loading === tier.name ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></span>
                        Processing...
                      </span>
                    ) : (
                      <>
                        {tier.cta}
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                  
                  {tier.stripePriceId && (
                    <p className="text-center text-white/40 text-xs mt-3">
                      Secure payment via Stripe • Cancel anytime
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-white/70 mb-4">
            All plans include zero commission on bookings
          </p>
          <Link href="/pricing" className="text-glam-purple hover:text-glam-pink font-semibold transition-colors">
            View detailed comparison →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
