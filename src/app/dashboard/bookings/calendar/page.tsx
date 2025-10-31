"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, ArrowLeft, Eye, Plus } from "lucide-react";
import Link from "next/link";
import { Calendar, dateFnsLocalizer, Views, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enGB } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { BookingDetailModal } from "@/components/bookings/BookingDetailModal";

const locales = {
  "en-GB": enGB,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Booking {
  id: string;
  clientId: string;
  serviceId: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
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

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Booking;
}

export default function BookingsCalendarPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState<View>(Views.MONTH);

  useEffect(() => {
    if (isLoaded && user) {
      fetchBookings();
    }
  }, [isLoaded, user]);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings");
      const data = await response.json();
      setBookings(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      setLoading(false);
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
        fetchBookings();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Failed to update booking:", error);
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedBooking(event.resource);
    setIsModalOpen(true);
  };

  const handleResendPayment = async (bookingId: string) => {
    console.log("Resend payment link for booking:", bookingId);
    alert("Payment link resent to client!");
  };

  // Transform bookings to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    return bookings.map((booking) => ({
      id: booking.id,
      title: `${booking.client.name} - ${booking.service.name}`,
      start: new Date(booking.startTime),
      end: new Date(booking.endTime),
      resource: booking,
    }));
  }, [bookings]);

  // Custom event style based on status
  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = "#E9B5D8"; // default lavender
    let borderColor = "#E9B5D8";

    switch (event.resource.status) {
      case "confirmed":
        backgroundColor = "#10b981";
        borderColor = "#059669";
        break;
      case "pending":
        backgroundColor = "#f59e0b";
        borderColor = "#d97706";
        break;
      case "cancelled":
        backgroundColor = "#ef4444";
        borderColor = "#dc2626";
        break;
      case "completed":
        backgroundColor = "#8b5cf6";
        borderColor = "#7c3aed";
        break;
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: "8px",
        color: "white",
        fontSize: "13px",
        fontWeight: "600",
        padding: "4px 8px",
      },
    };
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white text-lg"
        >
          Loading calendar...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <div className="max-w-7xl mx-auto">
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-2">
                  <span className="relative inline-block">
                    Calendar
                    <motion.div
                      className="absolute -bottom-2 left-0 right-0 h-1 bg-luxury-gradient rounded-full"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                    />
                  </span>
                </h1>
                <p className="text-white/60 text-lg mt-3">
                  View and manage your bookings in calendar view
                </p>
              </div>

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

          {/* Legend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="glass-card p-4 mb-6"
          >
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500"></div>
                <span className="text-white text-sm">Confirmed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-500"></div>
                <span className="text-white text-sm">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-purple-500"></div>
                <span className="text-white text-sm">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500"></div>
                <span className="text-white text-sm">Cancelled</span>
              </div>
            </div>
          </motion.div>

          {/* Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="glass-card p-6"
            style={{ minHeight: "700px" }}
          >
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%", minHeight: 650 }}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventStyleGetter}
              view={view}
              onView={setView}
              views={[Views.MONTH, Views.WEEK, Views.DAY]}
              popup
              selectable
              className="glam-calendar"
            />
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 text-center"
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

      {/* Custom Calendar Styles */}
      <style jsx global>{`
        .glam-calendar {
          background: transparent;
          color: white;
          border: none;
        }

        .glam-calendar .rbc-header {
          background: rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 12px 8px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
        }

        .glam-calendar .rbc-today {
          background-color: rgba(233, 181, 216, 0.1);
        }

        .glam-calendar .rbc-off-range-bg {
          background: rgba(255, 255, 255, 0.02);
        }

        .glam-calendar .rbc-date-cell {
          padding: 8px;
          color: rgba(255, 255, 255, 0.7);
        }

        .glam-calendar .rbc-now .rbc-button-link {
          color: #E9B5D8;
          font-weight: bold;
        }

        .glam-calendar .rbc-month-view,
        .glam-calendar .rbc-time-view {
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          overflow: hidden;
        }

        .glam-calendar .rbc-day-bg {
          border-left: 1px solid rgba(255, 255, 255, 0.05);
        }

        .glam-calendar .rbc-month-row {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          min-height: 80px;
        }

        .glam-calendar .rbc-event {
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .glam-calendar .rbc-event:hover {
          opacity: 0.9;
          transform: scale(1.02);
        }

        .glam-calendar .rbc-toolbar {
          padding: 20px 0;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .glam-calendar .rbc-toolbar button {
          color: white;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .glam-calendar .rbc-toolbar button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .glam-calendar .rbc-toolbar button.rbc-active {
          background: linear-gradient(135deg, #e5989b, #b5838d, #9370db);
          border-color: transparent;
        }

        .glam-calendar .rbc-time-slot {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .glam-calendar .rbc-time-content {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .glam-calendar .rbc-time-header-content {
          border-left: 1px solid rgba(255, 255, 255, 0.1);
        }

        .glam-calendar .rbc-current-time-indicator {
          background-color: #E9B5D8;
          height: 2px;
        }
      `}</style>
    </div>
  );
}
