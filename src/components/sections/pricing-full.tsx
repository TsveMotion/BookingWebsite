"use client";

import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Check, Sparkles, Crown, Rocket } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    description: "Perfect for new businesses getting started",
    icon: Sparkles,
    features: [
      "Up to 50 bookings per month",
      "Online booking page",
      "SMS & email reminders",
      "Basic calendar management",
      "Client database",
      "Payment processing",
      "Email support",
    ],
    notIncluded: [
      "AI assistant",
      "Advanced analytics",
      "White-label branding",
    ],
    cta: "Start Free",
    ctaVariant: "outline" as const,
    popular: false,
    gradient: "from-gray-500/10 to-gray-600/10",
    borderColor: "border-gray-500/30",
  },
  {
    name: "Pro",
    price: "£49",
    period: "per month",
    description: "For growing businesses ready to scale",
    icon: Rocket,
    features: [
      "Unlimited bookings",
      "AI booking assistant (coming soon)",
      "Advanced analytics & reports",
      "Client CRM with notes & photos",
      "Loyalty & rewards programme",
      "Deposits + card on file",
      "SMS campaigns",
      "Priority email support",
      "Multi-location support",
    ],
    notIncluded: [
      "White-label branding",
      "Dedicated account manager",
    ],
    cta: "Start 14-Day Free Trial",
    ctaVariant: "gradient" as const,
    popular: true,
    gradient: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-500/50",
  },
  {
    name: "Elite",
    price: "£199",
    period: "per month",
    description: "For established businesses demanding the best",
    icon: Crown,
    features: [
      "Everything in Pro, plus:",
      "White-label branding",
      "Custom domain",
      "Remove GlamBooking branding",
      "API access",
      "Advanced integrations",
      "Dedicated account manager",
      "Phone & priority support",
      "Custom development options",
      "Early access to new features",
    ],
    notIncluded: [],
    cta: "Book a Demo",
    ctaVariant: "outline" as const,
    popular: false,
    gradient: "from-yellow-500/10 to-orange-500/10",
    borderColor: "border-yellow-500/30",
  },
];

export function PricingFull() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(203,166,247,0.05),transparent_50%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-heading font-bold mb-6 leading-tight">
            Simple, <span className="gradient-text">Transparent</span> Pricing
          </h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto mb-4">
            Your growth, your pace, your plan. No hidden fees. No surprises.
          </p>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            All plans include payment processing with standard Stripe fees (1.5% + 20p per transaction)
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    MOST POPULAR
                  </div>
                </div>
              )}
              
              <Card className={`h-full ${plan.popular ? 'ring-2 ring-purple-500/50 shadow-2xl shadow-purple-500/30' : ''} hover:bg-white/[0.08] transition-all duration-300`}>
                <CardHeader className="text-center pb-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.gradient} border ${plan.borderColor} mb-4 mx-auto`}>
                    <plan.icon className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-2xl font-bold mb-2">{plan.name}</CardTitle>
                  <p className="text-white/60 text-sm mb-6">{plan.description}</p>
                  
                  <div className="mb-4">
                    <div className="text-5xl font-black gradient-text mb-1">{plan.price}</div>
                    <div className="text-white/50 text-sm">{plan.period}</div>
                  </div>

                  <Link href={plan.name === "Elite" ? "/contact" : "/sign-up"} className="block">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant={plan.ctaVariant} className="w-full" size="lg">
                        {plan.cta}
                      </Button>
                    </motion.div>
                  </Link>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-white/80 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center"
        >
          <div className="flex justify-center items-center gap-8 flex-wrap mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-white/60 text-sm">No contracts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-white/60 text-sm">Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-white/60 text-sm">14-day money-back guarantee</span>
            </div>
          </div>

          <p className="text-white/40 text-sm">
            Powered by{" "}
            <span className="text-white/60 font-semibold">Stripe</span>
            {" "}— secure payment processing trusted worldwide
          </p>
        </motion.div>
      </div>
    </section>
  );
}
