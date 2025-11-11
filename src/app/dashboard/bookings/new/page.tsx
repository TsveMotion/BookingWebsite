"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  Scissors,
  DollarSign,
  CreditCard,
  FileText,
  ArrowLeft,
  Check,
  Mail,
  Phone,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { showToast } from "@/lib/toast";

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

export default function NewBookingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  // Form state
  const [selectedClient, setSelectedClient] = useState("");
  const [newClientMode, setNewClientMode] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentType, setPaymentType] = useState<"online" | "manual">("online");

  useEffect(() => {
    if (isLoaded && user) {
      fetchData();
    }
  }, [isLoaded, user]);

  const fetchData = async () => {
    try {
      const [clientsRes, servicesRes] = await Promise.all([
        fetch("/api/clients"),
        fetch("/api/services"),
      ]);

      const clientsData = await clientsRes.json();
      const servicesData = await servicesRes.json();

      setClients(clientsData);
      setServices(servicesData);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      showToast.error("Failed to load clients and services. Please refresh the page.");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const loadingToast = showToast.loading("Creating booking...");

    try {
      let clientId = selectedClient;

      // Create new client if in new client mode
      if (newClientMode) {
        if (!newClientName.trim() || !newClientEmail.trim()) {
          showToast.dismiss(loadingToast);
          showToast.error("Client name and email are required");
          setSubmitting(false);
          return;
        }

        const clientRes = await fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newClientName,
            email: newClientEmail,
            phone: newClientPhone,
          }),
        });

        if (!clientRes.ok) {
          const errorData = await clientRes.json();
          throw new Error(errorData.error || "Failed to create client");
        }

        const newClient = await clientRes.json();
        clientId = newClient.id;
      }

      // Validate client selection
      if (!clientId) {
        showToast.dismiss(loadingToast);
        showToast.error("Please select a client");
        setSubmitting(false);
        return;
      }

      // Get service details
      const service = services.find((s) => s.id === selectedService);
      if (!service) {
        showToast.dismiss(loadingToast);
        showToast.error("Please select a service");
        setSubmitting(false);
        return;
      }

      // Validate date and time
      if (!date || !time) {
        showToast.dismiss(loadingToast);
        showToast.error("Please select date and time");
        setSubmitting(false);
        return;
      }

      // Create booking
      const startTime = new Date(`${date}T${time}`);
      const endTime = new Date(startTime.getTime() + service.duration * 60000);

      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          serviceId: selectedService,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          totalAmount: service.price,
          notes,
          paymentType, // "online" or "manual"
        }),
      });

      if (!bookingRes.ok) {
        const errorData = await bookingRes.json();
        throw new Error(errorData.error || "Failed to create booking");
      }

      const booking = await bookingRes.json();

      showToast.dismiss(loadingToast);
      
      if (paymentType === "online") {
        showToast.success("✅ Booking created! Payment link sent to client.");
      } else {
        showToast.success("✅ Booking created successfully!");
      }

      // Redirect to bookings page after short delay
      setTimeout(() => {
        router.push("/dashboard/bookings");
      }, 1500);
    } catch (error) {
      console.error("Failed to create booking:", error);
      showToast.dismiss(loadingToast);
      showToast.error(error instanceof Error ? error.message : "Failed to create booking. Please try again.");
      setSubmitting(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white text-lg"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard/bookings"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Bookings
            </Link>
            <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-2">
              <span className="relative inline-block">
                New Booking
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-luxury-gradient rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                />
              </span>
            </h1>
            <p className="text-white/60 text-lg mt-3">
              Create a new booking and send payment request to client
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Selection */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-lavender-gradient bg-opacity-20">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Client Information</h2>
              </div>

              <div className="space-y-4">
                {/* Toggle between existing/new client */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewClientMode(false)}
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                      !newClientMode
                        ? "bg-luxury-gradient text-white"
                        : "bg-white/5 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    Existing Client
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewClientMode(true)}
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                      newClientMode
                        ? "bg-luxury-gradient text-white"
                        : "bg-white/5 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    New Client
                  </button>
                </div>

                {!newClientMode ? (
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Select Client *
                    </label>
                    <select
                      value={selectedClient}
                      onChange={(e) => setSelectedClient(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-lavender transition-colors [&>option]:bg-black [&>option]:text-white"
                    >
                      <option value="">Choose a client...</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id} className="bg-black">
                          {client.name} - {client.email}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white font-semibold mb-2">
                        Client Name *
                      </label>
                      <input
                        type="text"
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        required
                        placeholder="Jane Smith"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-lavender transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-white font-semibold mb-2">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                          type="email"
                          value={newClientEmail}
                          onChange={(e) => setNewClientEmail(e.target.value)}
                          required
                          placeholder="jane@example.com"
                          className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-lavender transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-white font-semibold mb-2">
                        Phone (Optional)
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                          type="tel"
                          value={newClientPhone}
                          onChange={(e) => setNewClientPhone(e.target.value)}
                          placeholder="+44 7700 900000"
                          className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-lavender transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Service Selection */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-rose-gradient bg-opacity-20">
                  <Scissors className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Service</h2>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Select Service *
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-lavender transition-colors [&>option]:bg-black [&>option]:text-white"
                >
                  <option value="">Choose a service...</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id} className="bg-black">
                      {service.name} - £{service.price} ({service.duration} mins)
                    </option>
                  ))}
                </select>
                {selectedService && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-3 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">Duration:</span>
                      <span className="text-white font-semibold">
                        {services.find((s) => s.id === selectedService)?.duration} minutes
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-white/60">Price:</span>
                      <span className="text-white font-bold text-lg">
                        £{services.find((s) => s.id === selectedService)?.price}
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Date & Time */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-blush-gradient bg-opacity-20">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Date & Time</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-semibold mb-2">Date *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-lavender transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Time *</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-lavender transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Payment Type */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-luxury-gradient bg-opacity-20">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Payment Method</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <motion.button
                  type="button"
                  onClick={() => setPaymentType("online")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    paymentType === "online"
                      ? "border-lavender bg-lavender/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentType === "online"
                          ? "border-lavender bg-lavender"
                          : "border-white/30"
                      }`}
                    >
                      {paymentType === "online" && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="text-left">
                      <p className="text-white font-semibold">💳 Online Payment</p>
                      <p className="text-white/60 text-xs">Send Stripe payment link</p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => setPaymentType("manual")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    paymentType === "manual"
                      ? "border-lavender bg-lavender/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentType === "manual"
                          ? "border-lavender bg-lavender"
                          : "border-white/30"
                      }`}
                    >
                      {paymentType === "manual" && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="text-left">
                      <p className="text-white font-semibold">💼 Manual Payment</p>
                      <p className="text-white/60 text-xs">Pay later / in-person</p>
                    </div>
                  </div>
                </motion.button>
              </div>

              {paymentType === "online" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl"
                >
                  <p className="text-blue-400 text-sm">
                    ℹ️ A Stripe payment link will be automatically created and sent to the
                    client via email
                  </p>
                </motion.div>
              )}
            </div>

            {/* Notes */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-white/10">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Notes (Optional)</h2>
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any special instructions or notes about this booking..."
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-lavender transition-colors resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Link href="/dashboard/bookings" className="flex-1">
                <button
                  type="button"
                  className="w-full px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </Link>
              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={{ scale: submitting ? 1 : 1.02 }}
                whileTap={{ scale: submitting ? 1 : 0.98 }}
                className="flex-1 px-6 py-4 bg-luxury-gradient text-white font-bold rounded-xl transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Plus className="w-5 h-5" />
                    </motion.div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Create Booking
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
