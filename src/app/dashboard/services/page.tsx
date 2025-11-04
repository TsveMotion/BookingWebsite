"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Scissors, Plus, Trash2, Edit2, Crown, Lock, Clock, Tag, MapPin } from "lucide-react";
import { AddServiceModal } from "@/components/services/AddServiceModal";
import { AddonsModal } from "@/components/services/AddonsModal";
import { ManageLocationsModal } from "@/components/services/ManageLocationsModal";

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category?: string;
  active: boolean;
  addons?: any[];
}

export default function ServicesPage() {
  const { user, isLoaded } = useUser();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddonsModal, setShowAddonsModal] = useState(false);
  const [showLocationsModal, setShowLocationsModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [userPlan, setUserPlan] = useState("free");

  useEffect(() => {
    if (isLoaded && user) {
      fetchServices();
      fetchUserProfile();
    }
  }, [isLoaded, user]);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
      const data = await response.json();
      setServices(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch services:", error);
      setLoading(false);
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchServices();
      }
    } catch (error) {
      console.error("Failed to delete service:", error);
    }
  };

  const handleOpenAddons = (service: Service) => {
    setSelectedService(service);
    setShowAddonsModal(true);
  };

  const isPro = userPlan.toLowerCase() === "pro" || userPlan.toLowerCase() === "business";

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white text-lg"
        >
          Loading services...
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
                Services
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-luxury-gradient rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                />
              </span>
            </h1>
            <p className="text-white/60 text-lg mt-3">
              Manage your service menu, pricing, and add-ons
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-4 bg-luxury-gradient rounded-2xl font-bold text-white shadow-lg shadow-lavender/30 hover:shadow-lavender/50 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Service
          </motion.button>
        </div>


        {/* Services Grid */}
        {services.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-12 text-center"
          >
            <Scissors className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">
              No services yet 💅
            </h3>
            <p className="text-white/60 mb-6">
              Add your first service to start taking bookings!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-luxury-gradient text-white font-bold rounded-xl"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Add Your First Service
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-6 hover:shadow-xl hover:shadow-lavender/20 transition-all group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-luxury-gradient rounded-xl group-hover:scale-110 transition-transform">
                    <Scissors className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setEditingService(service);
                        setShowAddModal(true);
                      }}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-white/60 hover:text-lavender" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(service.id)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-white/60 hover:text-red-400" />
                    </motion.button>
                  </div>
                </div>

                {/* Content */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-white">
                      {service.name}
                    </h3>
                    {service.category && (
                      <span className="px-2 py-0.5 bg-lavender/20 text-lavender text-xs font-semibold rounded-full">
                        {service.category}
                      </span>
                    )}
                  </div>
                  <p className="text-white/60 text-sm line-clamp-2">
                    {service.description || "No description"}
                  </p>
                </div>

                {/* Info */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2 text-white/70">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{service.duration} mins</span>
                  </div>
                  <span className="text-2xl font-bold text-white">
                    £{typeof service.price === 'number' ? service.price.toFixed(2) : parseFloat(service.price || '0').toFixed(2)}
                  </span>
                </div>

                {/* Manage Locations Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedService(service);
                    setShowLocationsModal(true);
                  }}
                  className="w-full px-4 py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all bg-lavender/20 text-white hover:bg-lavender/30 border border-lavender/30 mb-2"
                >
                  <MapPin className="w-4 h-4" />
                  Manage Locations
                </motion.button>

                {/* Add-ons Button (Pro Feature) */}
                <div className="relative group/addons">
                  <motion.button
                    whileHover={{ scale: isPro ? 1.02 : 1 }}
                    whileTap={{ scale: isPro ? 0.98 : 1 }}
                    onClick={() => isPro && handleOpenAddons(service)}
                    disabled={!isPro}
                    className={`w-full px-4 py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                      isPro
                        ? "bg-white/10 text-white hover:bg-white/20"
                        : "bg-white/5 text-white/40 cursor-not-allowed"
                    }`}
                  >
                    <Tag className="w-4 h-4" />
                    Add-ons {service.addons && service.addons.length > 0 && `(${service.addons.length})`}
                    {!isPro && <Crown className="w-3 h-3 text-yellow-400" />}
                  </motion.button>
                  {!isPro && (
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1 rounded-lg text-xs bg-black/90 border border-yellow-500/30 text-yellow-300 opacity-0 group-hover/addons:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      <Crown className="w-3 h-3 inline mr-1" />
                      Upgrade to Pro to create service add-ons ✨
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <AddServiceModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingService(null);
        }}
        onServiceAdded={fetchServices}
        editService={editingService}
      />

      <AddonsModal
        isOpen={showAddonsModal}
        onClose={() => {
          setShowAddonsModal(false);
          setSelectedService(null);
        }}
        serviceId={selectedService?.id || ""}
        serviceName={selectedService?.name || ""}
        userPlan={userPlan}
      />

      <ManageLocationsModal
        isOpen={showLocationsModal}
        onClose={() => {
          setShowLocationsModal(false);
          setSelectedService(null);
        }}
        serviceId={selectedService?.id || ""}
        serviceName={selectedService?.name || ""}
      />
    </div>
  );
}
