"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Calendar, Users, Bell, CreditCard, Gift, Bot } from "lucide-react";

const features = [
  {
    pillar: "Save Time",
    color: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-500/30",
    icon: Calendar,
    title: "Reduce No-Shows by 90%",
    description: "Automated SMS & email reminders keep your schedule full and stress-free.",
    benefit: "Get your time back",
  },
  {
    pillar: "Save Time",
    color: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-500/30",
    icon: Bot,
    title: "AI Assistant That Works 24/7",
    description: "Coming soon: AI responds to DMs and auto-books appointments while you sleep.",
    benefit: "Never miss a booking",
  },
  {
    pillar: "Build Loyalty",
    color: "from-pink-500/20 to-rose-500/20",
    borderColor: "border-pink-500/30",
    icon: Users,
    title: "Client CRM with Notes & Photos",
    description: "Track preferences, service history, and before/after photos for every client.",
    benefit: "Personal touch at scale",
  },
  {
    pillar: "Build Loyalty",
    color: "from-pink-500/20 to-rose-500/20",
    borderColor: "border-pink-500/30",
    icon: Gift,
    title: "Loyalty & Rewards Programme",
    description: "Keep clients coming back with points, perks, and exclusive offers.",
    benefit: "Turn clients into regulars",
  },
  {
    pillar: "Get Paid",
    color: "from-blue-500/20 to-purple-500/20",
    borderColor: "border-blue-500/30",
    icon: CreditCard,
    title: "Deposits + Card on File",
    description: "Secure payment holds and auto-charge protection for no-shows and cancellations.",
    benefit: "Protect your revenue",
  },
  {
    pillar: "Get Paid",
    color: "from-blue-500/20 to-purple-500/20",
    borderColor: "border-blue-500/30",
    icon: Bell,
    title: "Smart Payment Processing",
    description: "Accept deposits, process payments, and manage refunds — all in one place.",
    benefit: "Get paid instantly",
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
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-heading font-bold mb-6 leading-tight">
            Everything You Need to <span className="gradient-text">Grow Your Business</span>
          </h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto mb-12">
            Built for beauty, wellness, and creative professionals who want to work smarter, not harder.
          </p>
          
          {/* Three Pillars */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-4">
                <Calendar className="w-8 h-8 text-purple-300" />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-2 gradient-text">Save Time</h3>
              <p className="text-white/60">Automation that works for you</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/30 mb-4">
                <Users className="w-8 h-8 text-pink-300" />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-2 gradient-text">Build Loyalty</h3>
              <p className="text-white/60">Keep clients coming back</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 mb-4">
                <CreditCard className="w-8 h-8 text-blue-300" />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-2 gradient-text">Get Paid</h3>
              <p className="text-white/60">Secure payments, zero hassle</p>
            </motion.div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group"
            >
              <Card className={`h-full hover:bg-white/[0.08] hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer border-l-4 ${feature.borderColor} transition-all duration-300`}>
                <CardHeader>
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} border ${feature.borderColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <CardTitle className="text-xl font-bold mb-2">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/70 mb-3">{feature.description}</p>
                  <p className="text-sm font-semibold gradient-text">
                    ✓ {feature.benefit}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
