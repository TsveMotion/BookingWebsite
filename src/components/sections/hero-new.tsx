"use client";

import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { Search, MapPin, Calendar, Clock, Smartphone, QrCode } from "lucide-react";
import { useState, useEffect } from "react";

export function HeroNew() {
  const [showQR, setShowQR] = useState(false);
  const [stats, setStats] = useState({
    bookingsThisMonth: 0,
    loading: true
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/homepage/stats");
        if (response.ok) {
          const data = await response.json();
          setStats({
            bookingsThisMonth: data.bookingsThisMonth,
            loading: false
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    }
    fetchStats();
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 pb-16">
      {/* Gradient Background with Glow */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-glam-gradient opacity-5" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-glam-purple/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-glam-pink/15 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center max-w-6xl mx-auto"
        >
          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-black mb-6 leading-tight">
            <span className="text-white">Book Local Beauty &</span>
            <br />
            <span className="bg-glam-gradient bg-clip-text text-transparent">
              Wellness Experts
            </span>
            <br />
            <span className="text-white">— Instantly.</span>
          </h1>

          {/* Subtext */}
          <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-3xl mx-auto font-body leading-relaxed">
            Discover trusted salons, barbers, and wellness professionals near you.
          </p>

          {/* Search Bar - Fresha Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-5xl mx-auto mb-8"
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {/* Service Type */}
                <div className="md:col-span-1 relative">
                  <div className="flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-4 cursor-pointer">
                    <Search className="w-5 h-5 text-glam-purple" />
                    <input
                      type="text"
                      placeholder="Service type"
                      className="bg-transparent border-none outline-none text-white placeholder:text-white/50 w-full"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="md:col-span-1 relative">
                  <div className="flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-4 cursor-pointer">
                    <MapPin className="w-5 h-5 text-glam-pink" />
                    <input
                      type="text"
                      placeholder="Location"
                      className="bg-transparent border-none outline-none text-white placeholder:text-white/50 w-full"
                    />
                  </div>
                </div>

                {/* Date */}
                <div className="md:col-span-1 relative">
                  <div className="flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-4 cursor-pointer">
                    <Calendar className="w-5 h-5 text-glam-purple" />
                    <input
                      type="text"
                      placeholder="Date"
                      className="bg-transparent border-none outline-none text-white placeholder:text-white/50 w-full"
                    />
                  </div>
                </div>

                {/* Time */}
                <div className="md:col-span-1 relative">
                  <div className="flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-4 cursor-pointer">
                    <Clock className="w-5 h-5 text-glam-pink" />
                    <input
                      type="text"
                      placeholder="Time"
                      className="bg-transparent border-none outline-none text-white placeholder:text-white/50 w-full"
                    />
                  </div>
                </div>

                {/* Search Button */}
                <div className="md:col-span-1">
                  <Button 
                    variant="gradient" 
                    className="w-full h-full bg-glam-gradient hover:shadow-2xl hover:shadow-glam-purple/40"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Live Counter - Only show if we have real data */}
          {!stats.loading && stats.bookingsThisMonth > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-white/60 text-sm mb-8"
            >
              <span className="text-glam-purple font-semibold">
                {stats.bookingsThisMonth.toLocaleString()} verified booking{stats.bookingsThisMonth !== 1 ? 's' : ''}
              </span> completed on GlamBooking this month
            </motion.p>
          )}

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setShowQR(!showQR)}
              className="text-lg px-8 py-6 border-2 border-white/30 hover:border-glam-purple"
            >
              <Smartphone className="w-5 h-5 mr-2" />
              Get the App
            </Button>
            {showQR && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white p-4 rounded-xl"
              >
                <div className="w-32 h-32 bg-gray-200 flex items-center justify-center">
                  <QrCode className="w-20 h-20 text-gray-400" />
                </div>
                <p className="text-xs text-black text-center mt-2">Scan to Download</p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-glam-gradient rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}
