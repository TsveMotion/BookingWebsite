"use client";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Calendar, Users, CreditCard, Gift, Bell, UserPlus, Shield, XCircle, DollarSign } from "lucide-react";

const featureGroups = [
  {
    title: "Run Your Business",
    description: "Everything you need to manage daily operations",
    features: [
      {
        icon: Calendar,
        title: "Smart Scheduling",
        description: "Intelligent calendar that adapts to your availability patterns and preferences",
      },
      {
        icon: Users,
        title: "Client CRM",
        description: "Track service history, preferences, notes, and before/after photos",
      },
      {
        icon: CreditCard,
        title: "Deposits + Payments",
        description: "Accept deposits, store cards on file, and process payments seamlessly",
      },
    ],
  },
  {
    title: "Grow Your Business",
    description: "Tools that bring clients back and attract new ones",
    features: [
      {
        icon: Gift,
        title: "Loyalty Points",
        description: "Reward repeat clients with points and perks that keep them coming back",
      },
      {
        icon: Bell,
        title: "Automatic Re-Engagement",
        description: "Smart reminders sent to clients who haven't booked in a while",
      },
      {
        icon: UserPlus,
        title: "Referral Rewards",
        description: "Turn your best clients into advocates with automated referral tracking",
      },
    ],
  },
  {
    title: "Protect Your Time",
    description: "Stop losing money to no-shows and last-minute cancellations",
    features: [
      {
        icon: Shield,
        title: "Card on File",
        description: "Securely store payment methods and charge for no-shows automatically",
      },
      {
        icon: XCircle,
        title: "Cancellation Rules",
        description: "Set custom cancellation policies and enforce them automatically",
      },
      {
        icon: DollarSign,
        title: "No-Show Auto-Charge",
        description: "Protect your revenue with automatic charges for missed appointments",
      },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen pt-24 pb-32">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-32 max-w-4xl mx-auto"
          >
            <h1 className="text-6xl md:text-7xl font-heading font-black mb-6">
              Built to Help You <span className="gradient-text">Grow</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/70 mb-12">
              Powerful tools that free up your time and bring clients back.
            </p>
          </motion.div>

          {/* Feature Groups */}
          <div className="space-y-32">
            {featureGroups.map((group, groupIndex) => (
              <motion.section
                key={group.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: groupIndex * 0.1 }}
              >
                <div className="text-center mb-12">
                  <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
                    {group.title}
                  </h2>
                  <p className="text-lg text-white/60 max-w-2xl mx-auto">
                    {group.description}
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  {group.features.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ y: -8 }}
                    >
                      <Card className="h-full hover:bg-white/[0.08] transition-all">
                        <CardHeader>
                          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-gradient/10 border border-white/20 mb-4">
                            <feature.icon className="w-7 h-7" />
                          </div>
                          <CardTitle className="text-2xl mb-3">{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-white/60 leading-relaxed">{feature.description}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mt-32"
          >
            <div className="glass-card p-12 md:p-16 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-heading font-black mb-6">
                Ready to <span className="gradient-text">Take Control?</span>
              </h2>
              <p className="text-lg text-white/70 mb-8">
                Start your 14-day free trial. No credit card required.
              </p>
              <Button variant="gradient" size="lg" className="text-lg px-12">
                Start Free
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
