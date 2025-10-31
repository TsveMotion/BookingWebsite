"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Calendar, Users, Bell, CreditCard, Gift, Bot } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Intelligent calendar that learns your availability patterns",
  },
  {
    icon: Users,
    title: "Client CRM w/ Notes & Photos",
    description: "Track preferences, service history, and client photos",
  },
  {
    icon: CreditCard,
    title: "Deposits + Card on File",
    description: "Secure payment holds and auto-charge for no-shows",
  },
  {
    icon: Bell,
    title: "SMS + Email Reminders",
    description: "Automated reminders that reduce no-shows by 90%",
  },
  {
    icon: Gift,
    title: "Loyalty & Rewards System",
    description: "Keep clients coming back with points and perks",
  },
  {
    icon: Bot,
    title: "AI Auto-Reply + DM Booking",
    description: "Coming soon: AI responds to DMs and books appointments",
  },
];

export function Features() {
  return (
    <section className="py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-heading font-bold mb-4">
            Everything You Need — <span className="gradient-text">Built for Beauty, Wellness & Creatives</span>
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Real tools that free up your time and grow your business
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group"
            >
              <Card className="h-full hover:bg-white/[0.08] hover:shadow-2xl hover:shadow-purple-500/10 cursor-pointer">
                <CardHeader>
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-gradient/10 border border-white/20 mb-4 group-hover:bg-accent-gradient/20 transition-all">
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <CardTitle className="text-2xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/60">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
