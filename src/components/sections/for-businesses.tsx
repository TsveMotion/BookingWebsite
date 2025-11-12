"use client";

import { motion } from "framer-motion";
import { Calendar, DollarSign, BarChart3, Users, Zap, Shield, Link as LinkIcon, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

export function ForBusinesses() {
  const features = [
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Automated booking calendar that syncs across all devices"
    },
    {
      icon: DollarSign,
      title: "Zero Commission",
      description: "Keep 100% of your earnings. No hidden fees, ever"
    },
    {
      icon: BarChart3,
      title: "Growth Analytics",
      description: "Real-time insights to grow your business faster"
    },
    {
      icon: Users,
      title: "Client Management",
      description: "Track client history, preferences, and loyalty points"
    },
    {
      icon: Zap,
      title: "Instant Payments",
      description: "Get paid faster with integrated payment processing"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption keeps your data safe"
    }
  ];

  return (
    <section className="py-24 bg-black relative overflow-hidden">
      {/* Gradient backgrounds */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-glam-purple/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-glam-pink/10 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-heading font-black mb-6">
              <span className="bg-glam-gradient bg-clip-text text-transparent">
                GlamBooking
              </span>
              <span className="text-white"> for Businesses</span>
            </h2>
            <p className="text-white/70 text-xl max-w-3xl mx-auto leading-relaxed">
              The complete booking, payment, and growth platform for beauty professionals. 
              Built by professionals, for professionals.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Screenshot with Calendar */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative">
                {/* Dashboard mockup */}
                <div className="bg-gradient-to-br from-glam-purple/20 to-glam-pink/20 rounded-3xl p-8 border border-white/10 shadow-2xl backdrop-blur-xl">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="h-4 bg-white/30 rounded w-32 mb-2" />
                        <div className="h-3 bg-white/20 rounded w-24" />
                      </div>
                      <div className="w-10 h-10 bg-glam-gradient rounded-full" />
                    </div>

                    {/* Calendar Grid */}
                    <div className="bg-black/40 rounded-2xl p-4 backdrop-blur-xl border border-white/10">
                      <div className="grid grid-cols-7 gap-2 mb-4">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                          <div key={i} className="text-center text-white/60 text-xs font-semibold">
                            {day}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-2">
                        {[...Array(35)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`h-8 rounded-lg ${
                              i % 7 === 3 || i % 7 === 5 
                                ? 'bg-glam-gradient' 
                                : i % 3 === 0 
                                  ? 'bg-white/20' 
                                  : 'bg-white/10'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-black/40 rounded-xl p-3 backdrop-blur-xl border border-white/10">
                        <div className="h-2 bg-white/20 rounded w-12 mb-2" />
                        <div className="h-4 bg-glam-gradient rounded w-16" />
                      </div>
                      <div className="bg-black/40 rounded-xl p-3 backdrop-blur-xl border border-white/10">
                        <div className="h-2 bg-white/20 rounded w-12 mb-2" />
                        <div className="h-4 bg-glam-gradient rounded w-16" />
                      </div>
                      <div className="bg-black/40 rounded-xl p-3 backdrop-blur-xl border border-white/10">
                        <div className="h-2 bg-white/20 rounded w-12 mb-2" />
                        <div className="h-4 bg-glam-gradient rounded w-16" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating stats */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -right-6 top-12 bg-white rounded-2xl p-4 shadow-xl"
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-glam-purple" />
                    <div>
                      <p className="text-xs text-black/60">Revenue this month</p>
                      <p className="text-lg font-bold text-black">£12,840</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="absolute -left-6 bottom-12 bg-white rounded-2xl p-4 shadow-xl"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-glam-pink" />
                    <div>
                      <p className="text-xs text-black/60">New clients</p>
                      <p className="text-lg font-bold text-black">+47</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Right: Features List */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="group"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="p-3 bg-glam-gradient rounded-xl w-fit group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-6 h-6 text-black" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white mb-1 text-lg">{feature.title}</h4>
                          <p className="text-white/60 text-sm leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* CTA Button */}
              <div className="pt-6">
                <Link href="/sign-up">
                  <Button 
                    variant="gradient" 
                    size="lg"
                    className="bg-glam-gradient hover:shadow-2xl hover:shadow-glam-purple/40 group"
                  >
                    Start Free
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <p className="text-white/50 text-sm mt-3">
                  No credit card required • 14-day free trial • Cancel anytime
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
