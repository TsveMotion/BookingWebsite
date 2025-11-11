"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ServiceSelection from "@/components/booking/ServiceSelection";
import StaffSelection from "@/components/booking/StaffSelection";
import DateTimeSelection from "@/components/booking/DateTimeSelection";
import ClientDetailsForm from "@/components/booking/ClientDetailsForm";
import BookingSummary from "@/components/booking/BookingSummary";

interface Location {
  id: string;
  name: string;
  address?: string;
  phone?: string;
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
  logo?: string;
  logoUrl?: string;
  plan?: string;
  services: Service[];
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

  const steps = ["Service", "Staff", "Date & Time", "Details", "Review"];

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
    } catch (error) {
      console.error("Failed to fetch business:", error);
    } finally {
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

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleToggleAddon = (addonId: string) => {
    setSelectedAddons(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
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
          addons: selectedAddons,
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Business Not Found</h1>
          <p className="text-white/60">The booking page you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Business Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          {(business.logoUrl || business.logo) && (
            <img
              src={business.logoUrl || business.logo}
              alt={business.businessName || "Business"}
              className="h-16 w-auto object-contain mx-auto mb-4"
            />
          )}
          <h1 className="text-2xl font-bold text-white mb-1">
            {business.businessName || "Book an Appointment"}
          </h1>
          {business.description && (
            <p className="text-white/60 text-sm">{business.description}</p>
          )}
        </motion.div>

        {/* Step Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    index === currentStep
                      ? "bg-gradient-to-br from-[#e7b5ff] to-[#d4a5ff] text-black"
                      : index < currentStep
                      ? "bg-[#e7b5ff]/20 text-[#e7b5ff]"
                      : "bg-white/5 text-white/40"
                  }`}
                >
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 w-8 mx-1 transition-all ${
                      index < currentStep ? "bg-[#e7b5ff]/50" : "bg-white/10"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-white/60">{steps[currentStep]}</p>
        </div>

        {/* Booking Steps */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <AnimatePresence mode="wait">
            {/* Step 0: Select Service */}
            {currentStep === 0 && (
              <motion.div
                key="service"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <ServiceSelection
                  services={business.services}
                  selectedService={selectedService}
                  selectedAddons={selectedAddons}
                  onSelectService={setSelectedService}
                  onToggleAddon={handleToggleAddon}
                  onNext={handleNext}
                />
              </motion.div>
            )}

            {/* Step 1: Select Staff */}
            {currentStep === 1 && (
              <motion.div
                key="staff"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <StaffSelection
                  staff={staffList}
                  selectedStaff={selectedStaff}
                  onSelectStaff={setSelectedStaff}
                  onNext={handleNext}
                />
              </motion.div>
            )}

            {/* Step 2: Date & Time */}
            {currentStep === 2 && (
              <motion.div
                key="datetime"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <DateTimeSelection
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  availableSlots={availableSlots}
                  loadingSlots={loadingSlots}
                  onSelectDate={setSelectedDate}
                  onSelectTime={setSelectedTime}
                  onNext={handleNext}
                />
              </motion.div>
            )}

            {/* Step 3: Client Details */}
            {currentStep === 3 && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <ClientDetailsForm
                  formData={formData}
                  onChange={handleFormChange}
                  onNext={handleNext}
                />
              </motion.div>
            )}

            {/* Step 4: Review & Confirm */}
            {currentStep === 4 && selectedService && selectedDate && selectedTime && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <BookingSummary
                  service={selectedService}
                  selectedAddons={selectedAddons}
                  staff={selectedStaff}
                  location={selectedLocation}
                  date={selectedDate}
                  time={selectedTime}
                  clientName={formData.clientName}
                  clientEmail={formData.clientEmail}
                  clientPhone={formData.clientPhone}
                  onConfirm={handleSubmitBooking}
                  isSubmitting={submitting}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Branding Footer */}
        {(!business.plan || business.plan.toLowerCase() === 'free') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8 py-6 border-t border-white/10"
          >
            <p className="text-white/40 text-sm">
              Powered by{' '}
              <a
                href="https://glambooking.co.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#e7b5ff] hover:text-[#d4a5ff] transition-colors font-semibold"
              >
                GlamBooking
              </a>
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
