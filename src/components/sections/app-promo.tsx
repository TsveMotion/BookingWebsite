"use client";

import { motion } from "framer-motion";
import { Smartphone, Calendar, CreditCard, Bell, Download, Apple } from "lucide-react";
import { Button } from "../ui/button";

export function AppPromo() {
  return (
    <section className="py-24 bg-gradient-to-b from-black via-glam-purple/5 to-black relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-glam-purple/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-glam-pink/10 rounded-full blur-[100px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Phone Mockups */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative flex justify-center lg:justify-start gap-6">
                {/* Phone 1 */}
                <div className="relative">
                  <div className="w-64 h-[520px] bg-gradient-to-br from-glam-purple to-glam-pink rounded-[3rem] p-2 shadow-2xl shadow-glam-purple/30">
                    <div className="w-full h-full bg-black rounded-[2.5rem] overflow-hidden">
                      {/* Mockup content */}
                      <div className="p-6 space-y-4">
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-glam-gradient rounded-full" />
                            <div>
                              <div className="h-3 bg-white/30 rounded w-24 mb-2" />
                              <div className="h-2 bg-white/20 rounded w-16" />
                            </div>
                          </div>
                          <div className="h-2 bg-white/20 rounded w-full mb-2" />
                          <div className="h-2 bg-white/20 rounded w-3/4" />
                        </div>

                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                          <div className="flex items-center gap-3 mb-3">
                            <Calendar className="w-5 h-5 text-glam-purple" />
                            <div className="h-3 bg-white/30 rounded w-32" />
                          </div>
                          <div className="grid grid-cols-7 gap-2">
                            {[...Array(14)].map((_, i) => (
                              <div key={i} className="h-6 bg-white/10 rounded" />
                            ))}
                          </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                          <div className="h-3 bg-white/30 rounded w-28 mb-3" />
                          <div className="space-y-2">
                            <div className="h-2 bg-white/20 rounded w-full" />
                            <div className="h-2 bg-white/20 rounded w-5/6" />
                            <div className="h-2 bg-white/20 rounded w-4/6" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating notification */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -right-4 top-20 bg-white rounded-2xl p-3 shadow-xl"
                  >
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-glam-purple" />
                      <span className="text-xs font-semibold text-black">Appointment confirmed!</span>
                    </div>
                  </motion.div>
                </div>

                {/* Phone 2 - Slightly behind */}
                <div className="relative lg:block hidden -ml-12 mt-12">
                  <div className="w-64 h-[520px] bg-gradient-to-br from-glam-pink to-glam-purple rounded-[3rem] p-2 shadow-2xl shadow-glam-pink/30">
                    <div className="w-full h-full bg-black rounded-[2.5rem] overflow-hidden">
                      <div className="p-6 space-y-4">
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 h-32" />
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 h-40" />
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 h-24" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-4xl md:text-6xl font-heading font-black mb-6">
                  <span className="text-white">Book, Manage & Pay</span>
                  <br />
                  <span className="bg-glam-gradient bg-clip-text text-transparent">
                    All From Your Phone
                  </span>
                </h2>
                <p className="text-white/70 text-lg leading-relaxed">
                  Download the GlamBooking app and experience seamless booking at your fingertips. 
                  Manage appointments, track loyalty points, and discover new venues — all in one place.
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-glam-gradient rounded-lg">
                    <Calendar className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Instant Booking</h4>
                    <p className="text-white/60 text-sm">Book appointments in seconds</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-glam-gradient rounded-lg">
                    <CreditCard className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Secure Payments</h4>
                    <p className="text-white/60 text-sm">Pay safely with Apple Pay & more</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-glam-gradient rounded-lg">
                    <Bell className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Smart Reminders</h4>
                    <p className="text-white/60 text-sm">Never miss an appointment</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-glam-gradient rounded-lg">
                    <Smartphone className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Easy Management</h4>
                    <p className="text-white/60 text-sm">Track history & favorites</p>
                  </div>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  variant="gradient" 
                  size="lg"
                  className="bg-glam-gradient hover:shadow-2xl hover:shadow-glam-purple/40"
                >
                  <Apple className="w-5 h-5 mr-2" />
                  App Store
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-white/30 hover:border-glam-pink"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Google Play
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
