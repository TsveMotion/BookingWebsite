"use client";

import { motion } from "framer-motion";
import { Clock, Plus, ChevronRight, Package } from "lucide-react";
import { useState } from "react";

interface ServiceAddon {
  id: string;
  name: string;
  description?: string;
  extraTime: number;
  extraPrice: number;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category?: string;
  addons?: ServiceAddon[];
}

interface ServiceSelectionProps {
  services: Service[];
  selectedService: Service | null;
  selectedAddons: string[];
  onSelectService: (service: Service) => void;
  onToggleAddon: (addonId: string) => void;
  onNext: () => void;
}

export default function ServiceSelection({
  services,
  selectedService,
  selectedAddons,
  onSelectService,
  onToggleAddon,
  onNext,
}: ServiceSelectionProps) {
  const [showAddonModal, setShowAddonModal] = useState(false);

  // Group services by category
  const groupedServices = services.reduce((acc, service) => {
    const category = service.category || "All Services";
    if (!acc[category]) acc[category] = [];
    acc[category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  const categories = Object.keys(groupedServices);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Choose a Service</h2>
        <p className="text-white/60 text-sm">Select the service you'd like to book</p>
      </div>

      {categories.map((category) => (
        <div key={category} className="space-y-3">
          {categories.length > 1 && (
            <h3 className="text-lg font-semibold text-white/80 mb-3">{category}</h3>
          )}
          
          <div className="space-y-3">
            {groupedServices[category].map((service) => {
              const isSelected = selectedService?.id === service.id;
              const hasAddons = service.addons && service.addons.length > 0;
              
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    onClick={() => onSelectService(service)}
                    className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "bg-gradient-to-br from-[#e7b5ff]/20 to-[#e7b5ff]/10 ring-2 ring-[#e7b5ff] shadow-lg shadow-[#e7b5ff]/20"
                        : "bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white truncate">
                            {service.name}
                          </h3>
                          {hasAddons && (
                            <span className="flex items-center gap-1 text-xs text-[#e7b5ff] bg-[#e7b5ff]/10 px-2 py-1 rounded-full">
                              <Package className="w-3 h-3" />
                              Add-ons
                            </span>
                          )}
                        </div>
                        
                        {service.description && (
                          <p className="text-sm text-white/60 mb-3 line-clamp-2">
                            {service.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1.5 text-white/70">
                            <Clock className="w-4 h-4" />
                            {service.duration} min
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-2xl font-bold text-[#e7b5ff]">
                          £{service.price.toFixed(2)}
                        </span>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectService(service);
                            if (hasAddons) {
                              setShowAddonModal(true);
                            } else {
                              onNext();
                            }
                          }}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold transition-all ${
                            isSelected
                              ? "bg-[#e7b5ff] text-black shadow-lg shadow-[#e7b5ff]/30"
                              : "bg-white/10 text-white hover:bg-white/20"
                          }`}
                        >
                          <Plus className="w-4 h-4" />
                          {isSelected ? "Selected" : "Select"}
                        </button>
                      </div>
                    </div>

                    {/* Add-ons preview when selected */}
                    {isSelected && hasAddons && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-white/10"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold text-white/90">Available Add-ons:</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowAddonModal(true);
                            }}
                            className="text-xs text-[#e7b5ff] hover:text-[#e7b5ff]/80 flex items-center gap-1"
                          >
                            View all <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {service.addons?.slice(0, 4).map((addon) => {
                            const isAddonSelected = selectedAddons.includes(addon.id);
                            return (
                              <label
                                key={addon.id}
                                onClick={(e) => e.stopPropagation()}
                                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                                  isAddonSelected
                                    ? "bg-[#e7b5ff]/10 border border-[#e7b5ff]/30"
                                    : "bg-white/5 border border-white/10 hover:bg-white/10"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isAddonSelected}
                                  onChange={() => onToggleAddon(addon.id)}
                                  className="w-4 h-4 rounded border-white/20 text-[#e7b5ff] focus:ring-[#e7b5ff] bg-black/30"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-white font-medium truncate">{addon.name}</p>
                                  <p className="text-xs text-white/50">+{addon.extraTime}min</p>
                                </div>
                                <span className="text-xs font-semibold text-[#e7b5ff]">
                                  +£{addon.extraPrice}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Continue Button */}
      {selectedService && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent pt-6 pb-4"
        >
          <button
            onClick={onNext}
            className="w-full py-4 bg-gradient-to-r from-[#e7b5ff] to-[#d4a5ff] text-black font-bold rounded-2xl shadow-lg shadow-[#e7b5ff]/30 hover:shadow-[#e7b5ff]/50 transition-all flex items-center justify-center gap-2"
          >
            Continue
            <ChevronRight className="w-5 h-5" />
          </button>
        </motion.div>
      )}

      {/* Add-ons Modal */}
      {showAddonModal && selectedService?.addons && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddonModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-2xl font-bold text-white mb-4">Enhance Your Experience</h3>
            <p className="text-white/60 mb-6">Add extras to your {selectedService.name}</p>
            
            <div className="space-y-3">
              {selectedService.addons.map((addon) => {
                const isSelected = selectedAddons.includes(addon.id);
                return (
                  <label
                    key={addon.id}
                    className={`block p-4 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#e7b5ff]/10 border-2 border-[#e7b5ff]"
                        : "bg-white/5 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleAddon(addon.id)}
                        className="mt-1 w-5 h-5 rounded border-white/20 text-[#e7b5ff] focus:ring-[#e7b5ff] bg-black/30"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <p className="text-white font-semibold">{addon.name}</p>
                          <span className="text-lg font-bold text-[#e7b5ff]">+£{addon.extraPrice}</span>
                        </div>
                        {addon.description && (
                          <p className="text-sm text-white/60 mb-2">{addon.description}</p>
                        )}
                        <p className="text-xs text-white/50">+{addon.extraTime} minutes</p>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
            
            <button
              onClick={() => {
                setShowAddonModal(false);
                onNext();
              }}
              className="w-full mt-6 py-3 bg-gradient-to-r from-[#e7b5ff] to-[#d4a5ff] text-black font-bold rounded-xl"
            >
              Continue with{" "}
              {selectedAddons.length > 0 ? `${selectedAddons.length} add-on${selectedAddons.length > 1 ? "s" : ""}` : "service"}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
