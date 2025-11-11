"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Users, Plus, Mail, Phone, Search, User, TrendingUp, Crown, Lock, Calendar, Eye, Tag, MessageSquare, MapPin } from "lucide-react";
import { ClientDrawer } from "@/components/clients/ClientDrawer";
import { AddClientModal } from "@/components/clients/AddClientModal";

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  totalBookings?: number;
  lastVisit?: string;
  lifetimeValue?: number;
  notes?: string;
  tags?: string[];
  locationId?: string;
  location?: {
    id: string;
    name: string;
  };
  _count: {
    bookings: number;
  };
  bookings: Array<{
    startTime: string;
  }>;
}

interface ClientStats {
  totalClients: number;
  activeThisMonth: number;
  totalBookings: number;
  retentionRate: number;
}

export default function ClientsPage() {
  const { user, isLoaded } = useUser();
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "active" | "inactive" | "vip">("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [locations, setLocations] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userPlan, setUserPlan] = useState("free");
  const [showAddClientModal, setShowAddClientModal] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      fetchClients();
      fetchStats();
      fetchUserProfile();
      fetchLocations();
    }
  }, [isLoaded, user]);

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients");
      const data = await response.json();
      setClients(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/clients/stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();
      setUserPlan(data.plan || "free");
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/locations");
      const data = await response.json();
      setLocations(data || []);
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    }
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setIsDrawerOpen(true);
  };

  const handleSendRetentionEmail = async (clientId: string) => {
    try {
      const response = await fetch("/api/clients/send-retention-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });
      
      if (response.ok) {
        alert("Retention email sent successfully!");
      }
    } catch (error) {
      console.error("Failed to send retention email:", error);
    }
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.phone && client.phone.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    // Location filter
    if (locationFilter !== "all" && client.locationId !== locationFilter) {
      return false;
    }
    
    if (filterType === "all") return true;
    if (filterType === "active") return client._count.bookings > 0;
    if (filterType === "inactive") return client._count.bookings === 0;
    if (filterType === "vip") return client.tags?.includes("VIP");
    
    return true;
  });

  const isPro = userPlan.toLowerCase() === "pro" || userPlan.toLowerCase() === "business";
  const isBusiness = userPlan.toLowerCase() === "business";

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white text-lg"
        >
          Loading clients...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
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
                Clients
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-luxury-gradient rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                />
              </span>
            </h1>
            <p className="text-white/60 text-lg mt-3">
              Manage your client relationships, loyalty, and insights
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddClientModal(true)}
            className="flex items-center gap-2 px-6 py-4 bg-luxury-gradient rounded-xl font-bold text-white shadow-lg shadow-lavender/30 hover:shadow-lavender/50 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Client
          </motion.button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-lavender" />
            </div>
            <p className="text-white/60 text-sm mb-1">Total Clients</p>
            <p className="text-4xl font-bold text-white">{stats?.totalClients || clients.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-white/60 text-sm mb-1">Active This Month</p>
            <p className="text-4xl font-bold text-green-400">{stats?.activeThisMonth || 0}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-white/60 text-sm mb-1">Total Bookings</p>
            <p className="text-4xl font-bold text-white">
              {stats?.totalBookings || clients.reduce((sum, c) => sum + c._count.bookings, 0)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6 relative"
          >
            {!isPro && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                <div className="text-center">
                  <Lock className="w-8 h-8 text-lavender mx-auto mb-2" />
                  <p className="text-xs text-yellow-400 font-semibold">
                    <Crown className="w-3 h-3 inline mr-1" />
                    Pro Feature
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-white/60 text-sm mb-1">
              Retention Rate {!isPro && <Crown className="w-3 h-3 inline text-yellow-400" />}
            </p>
            <p className="text-4xl font-bold text-purple-400">{isPro ? `${stats?.retentionRate || 0}%` : "--"}</p>
          </motion.div>
        </div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-lavender transition-colors"
              />
            </div>

            {/* Location Filter */}
            {locations.length > 0 && (
              <div className="relative min-w-[200px]">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-lavender transition-colors appearance-none cursor-pointer"
                >
                  <option value="all" className="bg-gray-900">All Locations</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id} className="bg-gray-900">
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Filter by Status */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterType("all")}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  filterType === "all"
                    ? "bg-luxury-gradient text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType("active")}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  filterType === "active"
                    ? "bg-luxury-gradient text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterType("inactive")}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  filterType === "inactive"
                    ? "bg-luxury-gradient text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                Inactive
              </button>
              {isPro && (
                <button
                  onClick={() => setFilterType("vip")}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-1 ${
                    filterType === "vip"
                      ? "bg-luxury-gradient text-white"
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  <Crown className="w-3 h-3" />
                  VIP
                </button>
              )}
            </div>
          </div>
        </motion.div>


        {/* Clients List */}
        <div className="space-y-4">
          {filteredClients.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-12 text-center"
            >
              <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">
                No clients yet 💅
              </h3>
              <p className="text-white/60 mb-6">
                {searchQuery ? "Try a different search" : "Add your first client to start managing relationships"}
              </p>
              {!searchQuery && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowAddClientModal(true)}
                  className="px-6 py-3 bg-luxury-gradient text-white font-bold rounded-xl"
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  Add Your First Client
                </motion.button>
              )}
            </motion.div>
          ) : (
            filteredClients.map((client, index) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-6 hover:shadow-xl hover:shadow-lavender/20 transition-all group"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-luxury-gradient flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <User className="w-8 h-8 text-white" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-white">
                        {client.name}
                      </h3>
                      {client.tags?.includes("VIP") && (
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full border border-yellow-500/30">
                          VIP
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-white/70">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {client.email}
                      </div>
                      {client.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {client.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {client._count.bookings} bookings
                      </div>
                    </div>
                    {client.bookings.length > 0 && (
                      <p className="text-white/40 text-xs mt-2">
                        Last visit: {new Date(client.bookings[0].startTime).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleViewClient(client)}
                      className="px-4 py-2 bg-luxury-gradient text-white font-semibold rounded-lg flex items-center gap-2 shadow-lg shadow-lavender/20"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </motion.button>
                    
                    {isPro ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-white/10 text-white font-semibold rounded-lg flex items-center gap-2 hover:bg-white/20 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Message
                      </motion.button>
                    ) : (
                      <div className="relative group px-4 py-2 bg-white/5 text-white/40 font-semibold rounded-lg flex items-center gap-2 cursor-not-allowed">
                        <Lock className="w-4 h-4" />
                        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1 rounded-lg text-xs bg-black/90 border border-yellow-500/30 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                          <Crown className="w-3 h-3 inline mr-1" />
                          Upgrade to Pro
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Client Drawer */}
      <ClientDrawer
        client={selectedClient}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedClient(null);
        }}
        userPlan={userPlan}
        onSendRetentionEmail={handleSendRetentionEmail}
      />

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={showAddClientModal}
        onClose={() => setShowAddClientModal(false)}
        onClientAdded={() => {
          fetchClients();
          fetchStats();
        }}
      />
    </div>
  );
}
