"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Users, 
  Briefcase, 
  BarChart3, 
  ArrowLeft, 
  Clock,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  TrendingUp
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface Location {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  manager?: string;
  workingHours?: any;
  active: boolean;
  staff: any[];
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalBookings: number;
  totalSpent: number;
}

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  category?: string;
}

interface Analytics {
  totalRevenue: number;
  totalBookings: number;
  avgBookingValue: number;
  clientCount: number;
}

type TabType = "clients" | "services" | "team" | "analytics";

export default function LocationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locationId = params?.id as string;

  const [location, setLocation] = useState<Location | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("clients");

  useEffect(() => {
    if (locationId) {
      fetchLocationData();
    }
  }, [locationId]);

  const fetchLocationData = async () => {
    try {
      const [locationRes, clientsRes, servicesRes, analyticsRes] = await Promise.all([
        fetch(`/api/locations/${locationId}`),
        fetch(`/api/locations/${locationId}/clients`),
        fetch(`/api/locations/${locationId}/services`),
        fetch(`/api/locations/${locationId}/analytics`),
      ]);

      if (locationRes.ok) {
        const locationData = await locationRes.json();
        setLocation(locationData);
      }

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        setClients(clientsData);
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setServices(servicesData);
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch location data:", error);
      toast.error("Failed to load location details");
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatCurrency = (amount: number) => {
    // Prices are already in pounds, not pence
    return `£${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white text-lg"
        >
          Loading location...
        </motion.div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Location not found</h2>
          <button
            onClick={() => router.push("/dashboard/locations")}
            className="px-6 py-3 bg-luxury-gradient text-white font-semibold rounded-lg"
          >
            Back to Locations
          </button>
        </div>
      </div>
    );
  }

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: "clients", label: "Clients", icon: Users },
    { id: "services", label: "Services", icon: Briefcase },
    { id: "team", label: "Team", icon: Users },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Back Button */}
          <button
            onClick={() => router.push("/dashboard/locations")}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Locations</span>
          </button>

          {/* Location Header */}
          <div className="glass-card p-6 sm:p-8 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="p-4 rounded-xl bg-luxury-gradient flex-shrink-0">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white break-words">
                      {location.name}
                    </h1>
                    <span
                      className={`text-xs px-3 py-1 rounded-full flex-shrink-0 ${
                        location.active
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {location.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {location.address && (
                    <p className="text-white/60 flex items-center gap-2 mb-2 break-words">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      {location.address}
                    </p>
                  )}
                  {location.phone && (
                    <p className="text-white/60 flex items-center gap-2 mb-2">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      {location.phone}
                    </p>
                  )}
                  {location.manager && (
                    <p className="text-white/60 flex items-center gap-2">
                      <Users className="w-4 h-4 flex-shrink-0" />
                      Manager: {location.manager}
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4 lg:min-w-[300px]">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-white/60 text-xs mb-1">Total Revenue</p>
                  <p className="text-xl font-bold text-white">
                    {analytics ? formatCurrency(analytics.totalRevenue) : "£0.00"}
                  </p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-white/60 text-xs mb-1">Bookings</p>
                  <p className="text-xl font-bold text-white">
                    {analytics?.totalBookings || 0}
                  </p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-white/60 text-xs mb-1">Clients</p>
                  <p className="text-xl font-bold text-white">{clients.length}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-white/60 text-xs mb-1">Team</p>
                  <p className="text-xl font-bold text-white">
                    {location.staff?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Working Hours */}
            {location.workingHours && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-lavender" />
                  Working Hours
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => {
                    const dayCapitalized = day.charAt(0).toUpperCase() + day.slice(1);
                    const dayHours = location.workingHours[day];
                    
                    if (!dayHours) return null;
                    
                    return (
                      <div key={day} className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-white font-medium text-sm mb-1">{dayCapitalized}</p>
                        {dayHours.closed ? (
                          <p className="text-red-400 text-sm">Closed</p>
                        ) : (
                          <p className="text-white/60 text-sm">
                            {formatTime(dayHours.open)} - {formatTime(dayHours.close)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="glass-card mb-6 overflow-x-auto">
            <div className="flex border-b border-white/10 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
                    activeTab === tab.id
                      ? "text-white border-b-2 border-lavender"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  {tab.id === "clients" && clients.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-white/10 rounded-full text-xs">
                      {clients.length}
                    </span>
                  )}
                  {tab.id === "services" && services.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-white/10 rounded-full text-xs">
                      {services.length}
                    </span>
                  )}
                  {tab.id === "team" && location.staff?.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-white/10 rounded-full text-xs">
                      {location.staff.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="glass-card p-6">
            {activeTab === "clients" && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Clients at this Location</h2>
                {clients.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">No clients at this location yet</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {clients.map((client) => (
                      <div
                        key={client.id}
                        className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-white mb-1 break-words">
                              {client.name}
                            </h3>
                            <p className="text-white/60 text-sm flex items-center gap-2 mb-1 break-all">
                              <Mail className="w-4 h-4 flex-shrink-0" />
                              {client.email}
                            </p>
                            {client.phone && (
                              <p className="text-white/60 text-sm flex items-center gap-2">
                                <Phone className="w-4 h-4 flex-shrink-0" />
                                {client.phone}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-4 sm:gap-6 text-center">
                            <div>
                              <p className="text-white/60 text-xs mb-1">Bookings</p>
                              <p className="text-xl font-bold text-white">
                                {client.totalBookings}
                              </p>
                            </div>
                            <div>
                              <p className="text-white/60 text-xs mb-1">Total Spent</p>
                              <p className="text-xl font-bold text-white">
                                {formatCurrency(client.totalSpent)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "services" && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Services at this Location</h2>
                {services.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">No services configured for this location</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className="p-5 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-bold text-white break-words flex-1 mr-2">
                            {service.name}
                          </h3>
                          <span className="px-3 py-1 bg-lavender/20 text-lavender text-sm font-semibold rounded-full border border-lavender/30 flex-shrink-0">
                            £{service.price.toFixed(2)}
                          </span>
                        </div>
                        {service.category && (
                          <p className="text-white/60 text-sm mb-2">{service.category}</p>
                        )}
                        <p className="text-white/60 text-sm flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {service.duration} minutes
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "team" && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Team Members</h2>
                {!location.staff || location.staff.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">No team members assigned to this location</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {location.staff.map((member) => (
                      <div
                        key={member.id}
                        className="p-5 bg-white/5 rounded-xl border border-white/10"
                      >
                        <h3 className="text-lg font-bold text-white mb-2 break-words">
                          {member.name}
                        </h3>
                        <p className="text-white/60 text-sm break-all">{member.email}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "analytics" && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Location Analytics</h2>
                {analytics ? (
                  <div className="space-y-6">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-6 bg-gradient-to-br from-green-400/10 to-emerald-500/10 rounded-xl border border-green-400/20">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-3 rounded-xl bg-green-400/20">
                            <DollarSign className="w-6 h-6 text-green-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white/60 text-sm">Total Revenue</p>
                            <p className="text-2xl font-bold text-white break-words">
                              {formatCurrency(analytics.totalRevenue)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-xl border border-blue-400/20">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-3 rounded-xl bg-blue-400/20">
                            <Calendar className="w-6 h-6 text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white/60 text-sm">Total Bookings</p>
                            <p className="text-2xl font-bold text-white">
                              {analytics.totalBookings}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-gradient-to-br from-purple-400/10 to-pink-500/10 rounded-xl border border-purple-400/20">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-3 rounded-xl bg-purple-400/20">
                            <Users className="w-6 h-6 text-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white/60 text-sm">Unique Clients</p>
                            <p className="text-2xl font-bold text-white">
                              {analytics.clientCount}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-gradient-to-br from-amber-400/10 to-orange-500/10 rounded-xl border border-amber-400/20">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-3 rounded-xl bg-amber-400/20">
                            <TrendingUp className="w-6 h-6 text-amber-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white/60 text-sm">Avg Booking Value</p>
                            <p className="text-2xl font-bold text-white break-words">
                              {formatCurrency(analytics.avgBookingValue)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-white/70 text-center">
                        📊 More detailed analytics coming soon...
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">No analytics data available yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
