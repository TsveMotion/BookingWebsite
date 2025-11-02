"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  User, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Search,
  Plus,
  TrendingUp,
  Users,
  CreditCard,
  Filter,
  Eye,
  Crown,
  MessageSquare,
  Mail
} from "lucide-react";
import Link from "next/link";
import { BookingDetailModal } from "@/components/bookings/BookingDetailModal";
import SendSmsModal from "@/components/modals/SendSmsModal";

interface Booking {
  id: string;
  clientId: string;
  serviceId: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentStatus?: string;
  paymentLink?: string;
  notes?: string;
  client: {
    name: string;
    email?: string;
    phone?: string;
  };
  service: {
    name: string;
    duration: number;
  };
}

interface BookingStats {
  totalBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  statusBreakdown: {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
}

export default function BookingsPage() {
  const { user, isLoaded } = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "completed" | "cancelled">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [userPlan, setUserPlan] = useState("free");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [smsCredits, setSmsCredits] = useState({ total: 0, used: 0, remaining: 0, monthlyAllowance: 0 });
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [selectedSmsBooking, setSelectedSmsBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      fetchData();
    }
  }, [isLoaded, user]);

  const fetchData = async () => {
    try {
      const [bookingsRes, statsRes, profileRes] = await Promise.all([
        fetch("/api/bookings"),
        fetch("/api/bookings/stats"),
        fetch("/api/profile"),
      ]);

      const bookingsData = await bookingsRes.json();
      const statsData = await statsRes.json();
      const profileData = await profileRes.json();

      setBookings(bookingsData);
      setStats(statsData);
      setUserPlan(profileData.plan || "free");
      
      // Fetch SMS credits if not free plan
      if (profileData.plan !== "free") {
        fetchSmsCredits();
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch bookings data:", error);
      setLoading(false);
    }
  };

  const fetchSmsCredits = async () => {
    try {
      const response = await fetch("/api/sms/credits");
      const data = await response.json();
      setSmsCredits(data);
    } catch (error) {
      console.error("Failed to fetch SMS credits:", error);
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchData();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Failed to update booking:", error);
    }
  };

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleResendPayment = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/resend-payment`, {
        method: "POST",
      });
      
      if (response.ok) {
        alert("Payment link resent to client!");
      } else {
        alert("Failed to resend payment link");
      }
    } catch (error) {
      console.error("Failed to resend payment link:", error);
      alert("Failed to resend payment link");
    }
  };

  const handleSendSms = (booking: Booking) => {
    if (userPlan === "free") {
      alert("SMS feature requires Pro or Business plan. Upgrade to unlock!");
      return;
    }
    setSelectedSmsBooking(booking);
    setSmsModalOpen(true);
  };

  const handleSmsSent = () => {
    // Refresh SMS credits after sending
    fetchSmsCredits();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "pending":
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-400" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-blue-400" />;
      default:
        return <Calendar className="w-5 h-5 text-white/60" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "completed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-white/10 text-white/60 border-white/20";
    }
  };

  const filteredBookings = bookings
    .filter(b => filter === "all" || b.status === filter)
    .filter(b => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        b.client.name.toLowerCase().includes(query) ||
        b.service.name.toLowerCase().includes(query)
      );
    });

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white text-lg"
        >
          Loading bookings...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            background: [
              "radial-gradient(circle at 30% 50%, rgba(233, 181, 216, 0.03) 0%, transparent 50%)",
              "radial-gradient(circle at 70% 50%, rgba(255, 182, 193, 0.03) 0%, transparent 50%)",
              "radial-gradient(circle at 30% 50%, rgba(216, 191, 216, 0.03) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        />
      </div>

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-2">
                <span className="relative inline-block">
                  Bookings
                  <motion.div
                    className="absolute -bottom-2 left-0 right-0 h-1 bg-luxury-gradient rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  />
                </span>
              </h1>
              <p className="text-white/60 text-lg mt-3">
                Manage your appointments, clients, and revenue
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* SMS Credits Display */}
              {userPlan !== "free" && (
                <div className="glass-card px-4 py-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-rose-400" />
                  <span className="text-white font-semibold">
                    {smsCredits.remaining}
                    <span className="text-white/60 text-sm ml-1">SMS remaining</span>
                  </span>
                  {smsCredits.remaining < 10 && (
                    <Link href="/dashboard/billing" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
                      Top Up
                    </Link>
                  )}
                </div>
              )}

              <Link href="/dashboard/bookings/new">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-luxury-gradient text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-lavender/30 hover:shadow-lavender/50 transition-shadow"
                >
                  <Plus className="w-5 h-5" />
                  New Booking
                </motion.button>
              </Link>
            </div>
          </div>

          {/* Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="glass-card p-6 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Status Tabs */}
              <div className="flex gap-2 flex-wrap flex-1">
                {["all", "pending", "confirmed", "completed", "cancelled"].map((status) => (
                  <motion.button
                    key={status}
                    onClick={() => setFilter(status as any)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-xl font-semibold capitalize transition-all relative ${
                      filter === status
                        ? "text-white"
                        : "bg-white/5 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    {filter === status && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-luxury-gradient rounded-xl"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{status}</span>
                  </motion.button>
                ))}
              </div>

              {/* Search */}
              <div className="relative flex-shrink-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Search client or service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-lavender transition-colors min-w-[250px]"
                />
              </div>

              {/* Staff Filter (Pro+ Feature - Locked for Free) */}
              <div className="relative group">
                <button
                  disabled={userPlan === "free"}
                  className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all relative ${
                    userPlan === "free"
                      ? "bg-white/5 text-white/40 cursor-not-allowed"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filter by Staff
                  {userPlan === "free" && <Crown className="w-4 h-4 text-yellow-400" />}
                </button>
                
                {/* Tooltip for Free users */}
                {userPlan === "free" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-4 py-2 rounded-lg text-xs bg-black/90 backdrop-blur-xl border border-lavender/30 text-pink-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-50"
                  >
                    <div className="flex items-center gap-2">
                      <Crown className="w-3 h-3 text-yellow-400" />
                      <span className="font-semibold">Upgrade to Pro to access staff filters ✨</span>
                    </div>
                    {/* Tooltip arrow */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black/90"></div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="glass-card p-6 relative overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-luxury-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                whileHover={{ scale: 1.05 }}
              />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-rose-gradient bg-opacity-20">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-white/60 text-sm mb-1">Total Bookings</p>
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="text-4xl font-bold text-white"
                >
                  {stats?.totalBookings || 0}
                </motion.p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="glass-card p-6 relative overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-luxury-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                whileHover={{ scale: 1.05 }}
              />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-blush-gradient bg-opacity-20">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <CreditCard className="w-5 h-5 text-lavender" />
                </div>
                <p className="text-white/60 text-sm mb-1">Total Revenue</p>
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className="text-4xl font-bold gradient-text"
                >
                  £{stats?.totalRevenue.toFixed(2) || "0.00"}
                </motion.p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="glass-card p-6 relative overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-luxury-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                whileHover={{ scale: 1.05 }}
              />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-lavender-gradient bg-opacity-20">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-white/60 text-sm mb-1">Avg Booking Value</p>
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, type: "spring" }}
                  className="text-4xl font-bold text-white"
                >
                  £{stats?.averageBookingValue.toFixed(2) || "0.00"}
                </motion.p>
              </div>
            </motion.div>
          </div>

          {/* Bookings List */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {filteredBookings.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-card p-12 text-center"
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Calendar className="w-20 h-20 text-white/20 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {filter === "all" && !searchQuery
                      ? "No bookings yet 💅"
                      : "No bookings found"}
                  </h3>
                  <p className="text-white/60 mb-6">
                    {filter === "all" && !searchQuery
                      ? "Start accepting appointments and grow your beauty business!"
                      : searchQuery
                      ? `No results for "${searchQuery}"`
                      : `No ${filter} bookings at the moment`}
                  </p>
                  {filter === "all" && !searchQuery && (
                    <Link href="/dashboard/bookings/new">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 bg-luxury-gradient text-white font-bold rounded-xl inline-flex items-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Create Booking
                      </motion.button>
                    </Link>
                  )}
                </motion.div>
              ) : (
                filteredBookings.map((booking, index) => {
                  const startTime = new Date(booking.startTime);
                  return (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -4 }}
                      className="glass-card p-6 hover:shadow-xl hover:shadow-lavender/10 transition-all border-2 border-transparent hover:border-lavender/20"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Status Icon with Animated Glow */}
                        <div className="flex-shrink-0 relative">
                          <motion.div
                            animate={{
                              boxShadow: [
                                "0 0 0 0 rgba(233, 181, 216, 0)",
                                "0 0 20px 5px rgba(233, 181, 216, 0.2)",
                                "0 0 0 0 rgba(233, 181, 216, 0)",
                              ],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="rounded-full"
                          >
                            {getStatusIcon(booking.status)}
                          </motion.div>
                        </div>

                        {/* Client & Service */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-bold text-white mb-1">
                                {booking.client.name}
                              </h3>
                              <p className="text-white/70">{booking.service.name}</p>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="flex flex-wrap gap-4 text-sm text-white/60">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {startTime.toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {startTime.toLocaleTimeString("en-GB", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              ({booking.service.duration} mins)
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-green-400" />
                              <span className="text-green-400 font-semibold">
                                £{booking.totalAmount}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          {/* Status Badge Above Button */}
                          <div
                            className={`px-3 py-1 rounded-full border text-xs font-bold capitalize text-center ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </div>
                          
                          {/* Quick Actions */}
                          <div className="flex gap-2 flex-wrap">
                            {booking.status === "pending" && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleStatusUpdate(booking.id, "confirmed")}
                                className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-semibold transition-colors border border-green-500/30"
                              >
                                Confirm
                              </motion.button>
                            )}
                            {booking.status === "confirmed" && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleStatusUpdate(booking.id, "completed")}
                                className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg font-semibold transition-colors border border-blue-500/30"
                              >
                                Complete
                              </motion.button>
                            )}
                            {booking.client.phone && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleSendSms(booking)}
                                className="px-4 py-2 bg-rose-400/20 hover:bg-rose-400/30 text-rose-400 rounded-lg font-semibold transition-colors border border-rose-400/30 flex items-center gap-2"
                                title={userPlan === "free" ? "SMS requires Pro/Business plan" : "Send SMS"}
                              >
                                <MessageSquare className="w-4 h-4" />
                                SMS
                              </motion.button>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleViewBooking(booking)}
                              className="px-4 py-2 bg-luxury-gradient hover:opacity-90 text-white rounded-lg font-semibold transition-opacity flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>

          {/* SMS Usage Counter */}
          {userPlan !== "free" && smsCredits.total > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-rose-400" />
                  <span className="text-white font-semibold">
                    {smsCredits.remaining} SMS Credits
                  </span>
                </div>
                <span className="text-white/60 text-sm">
                  {smsCredits.used} of {smsCredits.total} used
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-rose-400 to-amber-300 h-2 rounded-full transition-all"
                  style={{ width: `${smsCredits.total > 0 ? (smsCredits.used / smsCredits.total) * 100 : 0}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>Monthly allowance: {smsCredits.monthlyAllowance}</span>
                {smsCredits.total > smsCredits.monthlyAllowance && (
                  <span className="text-green-400">+ {smsCredits.total - smsCredits.monthlyAllowance} purchased</span>
                )}
              </div>
              {smsCredits.remaining < 10 && (
                <p className="text-amber-400 text-xs mt-2">
                  ⚠️ Low SMS balance. <Link href="/dashboard/billing" className="underline hover:text-amber-300">Top up credits</Link> to continue sending messages.
                </p>
              )}
            </motion.div>
          )}

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-16 text-center"
          >
            <p className="text-white/40 text-sm">
              GlamBooking — Empowering the beauty industry, one booking at a time 💖
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Booking Detail Modal */}
      <BookingDetailModal
        booking={selectedBooking}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBooking(null);
        }}
        onStatusUpdate={handleStatusUpdate}
        onResendPayment={handleResendPayment}
      />

      {/* SMS Send Modal */}
      {selectedSmsBooking && (
        <SendSmsModal
          isOpen={smsModalOpen}
          onClose={() => {
            setSmsModalOpen(false);
            setSelectedSmsBooking(null);
          }}
          clientPhone={selectedSmsBooking.client.phone || ""}
          clientName={selectedSmsBooking.client.name}
          bookingId={selectedSmsBooking.id}
          serviceName={selectedSmsBooking.service.name}
          bookingDate={new Date(selectedSmsBooking.startTime).toLocaleDateString("en-GB")}
          bookingTime={new Date(selectedSmsBooking.startTime).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          })}
          onSmsSent={handleSmsSent}
        />
      )}
    </div>
  );
}
