"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { StripePaymentModal } from "@/components/modals/StripePaymentModal";

const plans = [
  {
    name: "Free",
    priceMonthly: "£0",
    priceYearly: "£0",
    priceIdMonthly: null,
    priceIdYearly: null,
    description: "Perfect for getting started",
    features: [
      "1 staff member",
      "Unlimited bookings",
      "Email reminders",
      "\"Powered by GlamBooking\" branding",
    ],
    highlighted: false,
  },
  {
    name: "Pro",
    priceMonthly: "£19.99",
    priceYearly: "£203.90",
    monthlyAmount: 19.99,
    yearlyAmount: 203.90,
    description: "Everything you need to grow",
    features: [
      "Unlimited staff",
      "SMS reminders",
      "Loyalty & retention tools",
      "Remove branding",
      "Priority support",
      "Advanced analytics",
    ],
    highlighted: true,
  },
  {
    name: "Business",
    priceMonthly: "£39.99",
    priceYearly: "£407.90",
    monthlyAmount: 39.99,
    yearlyAmount: 407.90,
    description: "For multi-location teams",
    features: [
      "Multi-location support",
      "Team roles & staff permissions",
      "Advanced reporting",
      "AI Booking Assistant (priority access)",
      "Dedicated account manager",
      "Custom integrations",
    ],
    highlighted: false,
  },
];

export default function PricingPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; period: string; amount: number } | null>(null);

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-24 pb-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-7xl font-heading font-black mb-6">
              Choose Your <span className="gradient-text">Perfect Plan</span>
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto mb-8">
              No commissions. No contracts. Cancel anytime.
            </p>

            {/* Monthly/Yearly Toggle */}
            <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full p-1 mb-12">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-5 py-2 rounded-full transition-all text-sm ${
                  !isYearly ? "bg-accent-gradient text-black font-semibold" : "text-white/60"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-5 py-2 rounded-full transition-all text-sm ${
                  isYearly ? "bg-accent-gradient text-black font-semibold" : "text-white/60"
                }`}
              >
                Yearly
                <span className="ml-2 text-xs">(Save 15%)</span>
              </button>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`h-full ${plan.highlighted ? "md:-mt-8" : ""}`}
              >
                <Card
                  className={`h-full relative flex flex-col ${
                    plan.highlighted
                      ? "border-2 border-transparent bg-clip-padding before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:bg-accent-gradient before:p-[2px] shadow-2xl shadow-purple-500/30 scale-105"
                      : ""
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent-gradient text-black px-4 py-1 rounded-full text-sm font-bold">
                      Most Popular
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-8 flex-shrink-0">
                    <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                    <CardDescription className="mb-6">{plan.description}</CardDescription>
                    
                    <motion.div
                      key={isYearly ? 'yearly' : 'monthly'}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mb-6"
                    >
                      <span className="text-5xl font-heading font-black">
                        {isYearly ? plan.priceYearly : plan.priceMonthly}
                      </span>
                      <span className="text-white/60 ml-2">{isYearly ? '/ year' : '/ month'}</span>
                      {isYearly && 'yearlyAmount' in plan && plan.yearlyAmount && (
                        <div className="text-sm text-white/50 mt-1">
                          £{(plan.yearlyAmount / 12).toFixed(2)}/mo average
                        </div>
                      )}
                    </motion.div>

                    <Button
                      variant={plan.highlighted ? "gradient" : "outline"}
                      className="w-full"
                      size="lg"
                      onClick={() => {
                        if (plan.name === "Free") {
                          // Free plan - require sign up first
                          if (!isSignedIn) {
                            router.push("/sign-up?redirect_url=/dashboard");
                          } else {
                            router.push("/dashboard");
                          }
                        } else {
                          // Paid plans - require sign in before payment
                          if (!isSignedIn) {
                            router.push(`/sign-in?redirect_url=/pricing`);
                          } else if ('monthlyAmount' in plan && 'yearlyAmount' in plan && plan.monthlyAmount && plan.yearlyAmount) {
                            setSelectedPlan({
                              name: plan.name.toLowerCase(),
                              period: isYearly ? 'yearly' : 'monthly',
                              amount: isYearly ? plan.yearlyAmount : plan.monthlyAmount,
                            });
                          }
                        }
                      }}
                    >
                      {plan.name === "Free" ? "Start Free" : "Subscribe Now"}
                    </Button>
                  </CardHeader>

                  <CardContent className="flex-grow">
                    <ul className="space-y-4">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-white/80">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-center mt-20"
          >
            <p className="text-xl font-semibold text-white mb-4">
              No commissions. No contracts. Cancel anytime.
            </p>
            <p className="text-white/60">
              All plans include 24/7 support. Start with a 14-day free trial.
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />

      {selectedPlan && (
        <StripePaymentModal
          isOpen={!!selectedPlan}
          onClose={() => setSelectedPlan(null)}
          planName={selectedPlan.name}
          billingPeriod={selectedPlan.period as 'monthly' | 'yearly'}
          amount={selectedPlan.amount}
          onSuccess={() => {
            setSelectedPlan(null);
            router.push('/dashboard/billing?success=true');
          }}
        />
      )}
    </>
  );
}
