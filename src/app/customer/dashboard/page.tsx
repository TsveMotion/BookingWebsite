"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Gift, Download, Clock, MapPin, Star } from "lucide-react";
import Link from "next/link";

interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  totalAmount: number;
  service: {
    name: string;
    duration: number;
  };
  user: {
    businessName: string;
  };
}

interface LoyaltyPoints {
  points: number;
  totalEarned: number;
  totalSpent: number;
  client: {
    name: string;
    email: string;
  };
}

export default function CustomerDashboard() {
  const { user, isLoaded } = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyPoints[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      fetchCustomerData();
    }
  }, [isLoaded, user]);

  const fetchCustomerData = async () => {
    try {
      // Fetch bookings
      const bookingsResponse = await fetch("/api/customer/bookings");
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData);
      }

      // Fetch loyalty points
      const loyaltyResponse = await fetch("/api/customer/loyalty");
      if (loyaltyResponse.ok) {
        const loyaltyData = await loyaltyResponse.json();
        setLoyaltyData(loyaltyData);
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch customer data:", error);
      setLoading(false);
    }
  };

  const totalPoints = loyaltyData.reduce((sum, item) => sum + item.points, 0);
  const totalEarned = loyaltyData.reduce((sum, item) => sum + item.totalEarned, 0);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white text-lg"
        >
          Loading your dashboard...
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Please Sign In</h1>
          <p className="text-white/60 mb-6">You need to be signed in to view your dashboard</p>
          <Link
            href="/sign-in"
            className="px-6 py-3 bg-luxury-gradient text-white font-semibold rounded-xl hover:opacity-90 transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-black text-white mb-2">
                Welcome back, <span className="gradient-text">{user.firstName || "there"}!</span>
              </h1>
              <p className="text-white/60">Manage your bookings and loyalty rewards</p>
            </div>
            <Link
              href="/"
              className="text-white/70 hover:text-white transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Loyalty Points Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1"
          >
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-rose-gradient">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Loyalty Points</h2>
              </div>

              <div className="text-center py-6">
                <div className="text-5xl font-black gradient-text mb-2">
                  {totalPoints}
                </div>
                <p className="text-white/60 mb-4">points available</p>

                <div className="flex justify-around text-sm mb-6">
                  <div>
                    <p className="text-white/40">Earned</p>
                    <p className="text-white font-semibold">{totalEarned}</p>
                  </div>
                  <div>
                    <p className="text-white/40">Redeemed</p>
                    <p className="text-white font-semibold">
                      {loyaltyData.reduce((sum, item) => sum + item.totalSpent, 0)}
                    </p>
                  </div>
                </div>

                <Link
                  href="/book"
                  className="block w-full px-6 py-3 bg-luxury-gradient text-white font-semibold rounded-xl hover:opacity-90 transition-all"
                >
                  Book & Earn More
                </Link>
              </div>

              {/* Points by Business */}
              {loyaltyData.length > 0 && (
                <div className="border-t border-white/10 pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-white/80 mb-3">Points by Business</h3>
                  <div className="space-y-2">
                    {loyaltyData.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-white/70">{item.client.name}</span>
                        <span className="text-pink-400 font-semibold">{item.points} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-lavender-gradient">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm text-white/60">Total Bookings</h3>
                  <p className="text-2xl font-bold text-white">{bookings.length}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-blush-gradient">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm text-white/60">Total Spent</h3>
                  <p className="text-2xl font-bold text-white">
                    £{bookings.reduce((sum, b) => sum + b.totalAmount, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bookings List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Your Bookings</h2>
            <Link
              href="/book"
              className="text-pink-400 hover:text-pink-300 transition-colors text-sm font-medium"
            >
              Book New Appointment →
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 mb-4">You don't have any bookings yet</p>
              <Link
                href="/book"
                className="inline-block px-6 py-3 bg-luxury-gradient text-white font-semibold rounded-xl hover:opacity-90 transition-all"
              >
                Find a Business
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 rounded-xl bg-luxury-gradient flex-shrink-0">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{booking.service.name}</h3>
                      <p className="text-white/60 text-sm mb-2">{booking.user.businessName}</p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(booking.startTime).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          {new Date(booking.startTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === "completed"
                              ? "bg-green-500/20 text-green-400"
                              : booking.status === "confirmed"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-white mb-2">
                      £{booking.totalAmount.toFixed(2)}
                    </p>
                    <button
                      onClick={() => window.open(`/api/invoices/${booking.id}`, "_blank")}
                      className="flex items-center gap-2 text-sm text-pink-400 hover:text-pink-300 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Invoice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
