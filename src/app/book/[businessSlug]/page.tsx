"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, User, ArrowRight, ArrowLeft, Check, Clock, Mail } from "lucide-react";
import Calendar from "@/components/ui/Calendar";
import TimeSlotPicker from "@/components/ui/TimeSlotPicker";
import BookingProgress from "@/components/ui/BookingProgress";

interface Location {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  workingHours?: any;
}

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
  locations?: Location[];
  addons?: ServiceAddon[];
}

interface Business {
  id: string;
  businessName?: string;
  description?: string;
  address?: string;
  phone?: string;
  logo?: string;
  logoUrl?: string;
  plan?: string;
  services: Service[];
  ownedLocations?: Location[];
}

interface StaffMember {
  id: string;
  name: string;
  displayName: string;
  email: string;
  role: string;
}

export default function PublicBookingPage() {
  const params = useParams();
  const businessSlug = params.businessSlug as string;

  // State
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const steps = ["Service", "Location", "Staff", "Date", "Time", "Details", "Review"];

  useEffect(() => {
    fetchBusiness();
  }, [businessSlug]);

  useEffect(() => {
    if (selectedService) {
      fetchStaff();
    }
  }, [selectedService]);

  useEffect(() => {
    if (selectedDate && selectedService) {
      fetchAvailableSlots();
    }
  }, [selectedDate, selectedService, selectedStaff]);

  const fetchBusiness = async () => {
    try {
      const response = await fetch(`/api/booking/${businessSlug}`);
      const data = await response.json();
      if (response.ok) {
        setBusiness(data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch business:", error);
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await fetch(`/api/staff?businessSlug=${businessSlug}`);
      const data = await response.json();
      if (response.ok) {
        setStaffList(data);
      }
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!selectedDate || !selectedService) return;
    
    setLoadingSlots(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const url = `/api/bookings/availability?date=${dateStr}&serviceId=${selectedService.id}${selectedStaff ? `&staffId=${selectedStaff.id}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setAvailableSlots(data.slots || []);
      }
    } catch (error) {
      console.error("Failed to fetch slots:", error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return;

    setSubmitting(true);
    try {
      const startTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      startTime.setHours(parseInt(hours), parseInt(minutes));

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessSlug,
          serviceId: selectedService.id,
          locationId: selectedLocation?.id,
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          clientPhone: formData.clientPhone,
          staffId: selectedStaff?.id,
          startTime: startTime.toISOString(),
          notes: formData.notes,
        }),
      });

      const data = await response.json();
      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to create booking. Please try again.");
      }
    } catch (error) {
      console.error("Failed to create booking:", error);
      alert("Failed to create booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return selectedService !== null;
      case 1: {
        // Skip location step if no locations available
        const hasLocations = selectedService?.locations && selectedService.locations.length > 0;
        return !hasLocations || selectedLocation !== null;
      }
      case 2: return selectedStaff !== null || staffList.length === 0;
      case 3: return selectedDate !== null;
      case 4: return selectedTime !== null;
      case 5: return formData.clientName && formData.clientEmail;
      case 6: return true;
      default: return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
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

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Business Not Found</h1>
          <p className="text-white/60">The booking page you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-24">
      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col items-center justify-center">
        {/* Business Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 mb-8"
        >
          <div className="flex flex-col items-center">
            {/* Logo Display */}
            {(business.logoUrl || business.logo) && (
              <img
                src={business.logoUrl || business.logo}
                alt={business.businessName || "Business"}
                className="h-20 w-auto object-contain mb-6"
              />
            )}
            <div className="flex-1 w-full">
              <h1 className="text-4xl font-heading font-black text-white mb-2">
                {business.businessName || "Book an Appointment"}
              </h1>
              {business.description && (
                <p className="text-white/70 mb-4">{business.description}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-white/60">
                {business.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {business.address}
                  </div>
                )}
                {business.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {business.phone}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Indicator */}
        <BookingProgress currentStep={currentStep} steps={steps} />

        {/* Booking Steps */}
        <div className="glass-card p-8">
          <AnimatePresence mode="wait">
            {/* Step 0: Select Service */}
            {currentStep === 0 && (
              <motion.div
                key="service"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">Select a Service</h2>
                <div className="space-y-4">
                  {business.services.map((service) => (
                    <motion.div
                      key={service.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedService(service)}
                      className={`p-6 rounded-xl cursor-pointer transition-all ${
                        selectedService?.id === service.id
                          ? "bg-gradient-to-br from-lavender/20 to-blush/20 ring-2 ring-lavender"
                          : "bg-white/5 hover:bg-white/10 border border-white/10"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold text-white">{service.name}</h3>
                        <span className="text-2xl font-bold text-lavender">£{service.price}</span>
                      </div>
                      {service.description && (
                        <p className="text-white/60 text-sm mb-3">{service.description}</p>
                      )}
                      <div className="flex items-center gap-2 text-white/70 text-sm">
                        <Clock className="w-4 h-4" />
                        {service.duration} minutes
                      </div>
                      
                      {/* Show add-ons when service is selected */}
                      {selectedService?.id === service.id && service.addons && service.addons.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <p className="text-sm font-semibold text-white/80 mb-3">Available Add-ons:</p>
                          <div className="space-y-2">
                            {service.addons.map((addon) => (
                              <label
                                key={addon.id}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedAddons.includes(addon.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedAddons([...selectedAddons, addon.id]);
                                    } else {
                                      setSelectedAddons(selectedAddons.filter(id => id !== addon.id));
                                    }
                                  }}
                                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-lavender focus:ring-lavender"
                                />
                                <div className="flex-1">
                                  <p className="text-sm text-white font-medium">{addon.name}</p>
                                  {addon.description && (
                                    <p className="text-xs text-white/60">{addon.description}</p>
                                  )}
                                  <p className="text-xs text-white/50">+{addon.extraTime} min</p>
                                </div>
                                <span className="text-sm font-semibold text-lavender">+£{addon.extraPrice}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 1: Select Location */}
            {currentStep === 1 && (
              <motion.div
                key="location"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">Select a Location</h2>
                {selectedService?.locations && selectedService.locations.length > 0 ? (
                  <div className="space-y-4">
                    {selectedService.locations.map((location) => (
                      <motion.div
                        key={location.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedLocation(location)}
                        className={`p-6 rounded-xl cursor-pointer transition-all ${
                          selectedLocation?.id === location.id
                            ? "bg-gradient-to-br from-lavender/20 to-blush/20 ring-2 ring-lavender"
                            : "bg-white/5 hover:bg-white/10 border border-white/10"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-lavender/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-6 h-6 text-lavender" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-white mb-2">{location.name}</h3>
                            {location.address && (
                              <p className="text-white/70 text-sm mb-1 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {location.address}
                              </p>
                            )}
                            {location.phone && (
                              <p className="text-white/70 text-sm flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                {location.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-white/60">No location selection needed</p>
                    <button
                      onClick={handleNext}
                      className="mt-4 px-6 py-3 bg-luxury-gradient rounded-xl text-white font-semibold"
                    >
                      Continue
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Select Staff */}
            {currentStep === 2 && (
              <motion.div
                key="staff"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">Choose Your Specialist</h2>
                {staffList.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {staffList.map((staff) => (
                      <motion.div
                        key={staff.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedStaff(staff)}
                        className={`p-6 rounded-xl cursor-pointer transition-all ${
                          selectedStaff?.id === staff.id
                            ? "bg-gradient-to-br from-lavender/20 to-blush/20 ring-2 ring-lavender"
                            : "bg-white/5 hover:bg-white/10 border border-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-lavender/20 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-lavender" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{staff.displayName || staff.name}</h3>
                            <p className="text-white/60 text-sm">{staff.email}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-white/60">No staff selection required</p>
                    <button
                      onClick={handleNext}
                      className="mt-4 px-6 py-3 bg-luxury-gradient rounded-xl text-white font-semibold"
                    >
                      Continue
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Select Date */}
            {currentStep === 3 && (
              <motion.div
                key="date"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">Pick a Date</h2>
                <Calendar
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  minDate={new Date()}
                  disabledDays={[]}
                />
              </motion.div>
            )}

            {/* Step 4: Select Time */}
            {currentStep === 4 && (
              <motion.div
                key="time"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">Choose a Time</h2>
                <TimeSlotPicker
                  slots={availableSlots}
                  selectedTime={selectedTime}
                  onSelectTime={setSelectedTime}
                  loading={loadingSlots}
                />
              </motion.div>
            )}

            {/* Step 5: Client Details */}
            {currentStep === 5 && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">Your Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-white/80 text-sm mb-2 block">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lavender/50"
                      placeholder="John Doe"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>
                  <div>
                    <label className="text-white/80 text-sm mb-2 block">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.clientEmail}
                      onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lavender/50"
                      placeholder="john@example.com"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>
                  <div>
                    <label className="text-white/80 text-sm mb-2 block">Phone</label>
                    <input
                      type="tel"
                      value={formData.clientPhone}
                      onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lavender/50"
                      placeholder="+44 7700 900000"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>
                  <div>
                    <label className="text-white/80 text-sm mb-2 block">Special Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-black border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lavender/50"
                      placeholder="Any special requests or notes..."
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 6: Review & Confirm */}
            {currentStep === 6 && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">Review Your Booking</h2>
                <div className="bg-gradient-to-br from-lavender/10 to-blush/10 border border-lavender/20 rounded-xl p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white/60 text-sm">Service</p>
                      <p className="text-white font-semibold text-lg">{selectedService?.name}</p>
                    </div>
                    <p className="text-2xl font-bold text-lavender">£{selectedService?.price}</p>
                  </div>
                  
                  {/* Selected Add-ons */}
                  {selectedAddons.length > 0 && selectedService?.addons && (
                    <div>
                      <p className="text-white/60 text-sm mb-2">Add-ons</p>
                      {selectedAddons.map(addonId => {
                        const addon = selectedService.addons?.find(a => a.id === addonId);
                        if (!addon) return null;
                        return (
                          <div key={addon.id} className="flex justify-between text-sm mb-1">
                            <span className="text-white/80">+ {addon.name}</span>
                            <span className="text-white font-semibold">£{addon.extraPrice}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {selectedLocation && (
                    <div>
                      <p className="text-white/60 text-sm">Location</p>
                      <p className="text-white font-semibold">{selectedLocation.name}</p>
                      {selectedLocation.address && (
                        <p className="text-white/60 text-xs mt-1">{selectedLocation.address}</p>
                      )}
                    </div>
                  )}
                  
                  {selectedStaff && (
                    <div>
                      <p className="text-white/60 text-sm">Specialist</p>
                      <p className="text-white font-semibold">{selectedStaff.displayName || selectedStaff.name}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-white/60 text-sm">Date & Time</p>
                    <p className="text-white font-semibold">
                      {selectedDate?.toLocaleDateString('en-GB', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })} at {selectedTime}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-white/60 text-sm">Duration</p>
                    <p className="text-white font-semibold">{selectedService?.duration} minutes</p>
                  </div>
                  
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-white/60 text-sm">Client Details</p>
                    <p className="text-white font-semibold">{formData.clientName}</p>
                    <p className="text-white/70 text-sm">{formData.clientEmail}</p>
                    {formData.clientPhone && (
                      <p className="text-white/70 text-sm">{formData.clientPhone}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            
            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-6 py-3 bg-luxury-gradient rounded-xl text-white font-bold shadow-lg shadow-lavender/30 hover:shadow-lavender/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmitBooking}
                disabled={submitting || !canProceed()}
                className="px-8 py-3 bg-luxury-gradient rounded-xl text-white font-bold shadow-lg shadow-lavender/30 hover:shadow-lavender/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? "Processing..." : (
                  <>
                    <Check className="w-5 h-5" />
                    Confirm & Pay £{selectedService?.price}
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Branding Footer - Show only for Free plan */}
        {(!business.plan || business.plan.toLowerCase() === 'free') ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8 py-6 border-t border-white/10"
          >
            <p className="text-white/40 text-sm mb-2">
              Powered by{' '}
              <a
                href="https://glambooking.co.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lavender hover:text-blush transition-colors underline font-semibold"
              >
                GlamBooking.co.uk
              </a>
            </p>
            <p className="text-white/30 text-xs">
              Need a booking system for your business?{' '}
              <a
                href="https://glambooking.co.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-lavender transition-colors underline"
              >
                Try GlamBooking
              </a>
            </p>
          </motion.div>
        ) : (
          business.logoUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-8"
            >
              <img
                src={business.logoUrl}
                alt="Business Logo"
                className="h-12 mx-auto"
              />
            </motion.div>
          )
        )}
      </div>
    </div>
  );
}
