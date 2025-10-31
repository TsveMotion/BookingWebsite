"use client";

import { motion } from "framer-motion";
import { DollarSign, Bot, ShieldCheck, Infinity } from "lucide-react";

const stats = [
  {
    icon: DollarSign,
    title: "Lowest Fees in the UK",
  },
  {
    icon: Bot,
    title: "AI Booking Assistant",
  },
  {
    icon: ShieldCheck,
    title: "Reduce No-Shows by 90%",
  },
  {
    icon: Infinity,
    title: "Unlimited Bookings",
  },
];

export function Stats() {
  return (
    <section className="py-20 border-y border-white/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-gradient/10 border border-white/10 mb-4">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm md:text-base font-medium">{stat.title}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
