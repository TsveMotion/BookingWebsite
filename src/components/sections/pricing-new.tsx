"use client";

import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Crown, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

const pricingTiers = [
  {
    name: "Free",
    icon: Sparkles,
    price: "£0",
    period: "forever",
    description: "Perfect for solo professionals getting started",
    features: [
      "Unlimited bookings",
      "Basic calendar",
      "Client management",
      "Email notifications",
      "Mobile app access",
      "Payment processing"
    ],
    cta: "Start Free",
    popular: false,
    gradient: "from-white/5 to-white/10"
  },
  {
    name: "Pro",
    icon: Zap,
    price: "£29",
    period: "per month",
    description: "For growing businesses that need more power",
    features: [
      "Everything in Free",
      "Advanced analytics",
      "Loyalty & rewards",
      "Marketing tools",
      "Priority support",
      "Custom branding",
      "Team management",
      "Automated reminders"
    ],
    cta: "Start Pro Trial",
    popular: true,
    gradient: "from-glam-purple/20 to-glam-pink/20"
  },
  {
    name: "Elite",
    icon: Crown,
    price: "£79",
    period: "per month",
    description: "For established businesses scaling operations",
    features: [
      "Everything in Pro",
      "Multi-location support",
      "Advanced reporting",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
      "White-label options",
      "Priority feature requests"
    ],
    cta: "Contact Sales",
    popular: false,
    gradient: "from-white/5 to-white/10"
  }
];

export function PricingNew() {
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
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-heading font-black mb-4">
            <span className="text-white">Simple, </span>
            <span className="bg-glam-gradient bg-clip-text text-transparent">
              Transparent
            </span>
            <span className="text-white"> Pricing</span>
          </h2>
          <p className="text-white/60 text-xl max-w-2xl mx-auto">
            No hidden fees. No commission. Just straightforward pricing that scales with you.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {pricingTiers.map((tier, index) => {
            const Icon = tier.icon;
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
                      Most Popular
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
                        {tier.price}
                      </span>
                      <span className="text-white/60 text-lg ml-2">
                        {tier.period}
                      </span>
                    </div>
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
                  <Link href="/sign-up" className="w-full">
                    <Button
                      variant={tier.popular ? "gradient" : "outline"}
                      size="lg"
                      className={`w-full ${
                        tier.popular 
                          ? 'bg-glam-gradient hover:shadow-2xl hover:shadow-glam-purple/40' 
                          : 'border-2 border-white/30 hover:border-glam-purple'
                      } group`}
                    >
                      {tier.cta}
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
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
