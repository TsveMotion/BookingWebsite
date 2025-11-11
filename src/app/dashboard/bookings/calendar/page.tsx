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
  const [isMobile, setIsMobile] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Detect screen size and auto-switch to week view on mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile && view === Views.MONTH) {
        setView(Views.WEEK);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    try {
      const response = await fetch(`/api/bookings/${bookingId}/resend-payment`, {
        method: 'POST',
      });

      if (response.ok) {
        alert("Payment link resent to client!");
        fetchBookings(); // Refresh booking data
      } else {
        const data = await response.json();
        alert(`Failed to resend payment: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Failed to resend payment link:", error);
      alert("Failed to resend payment link");
    }
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
        borderRadius: "6px",
        color: "white",
        fontSize: "12px",
        fontWeight: "600",
        padding: "3px 6px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
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
    <div className="min-h-screen pb-16 lg:pl-72 flex items-start justify-center">
      <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 pt-20 lg:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <Link
              href="/dashboard/bookings"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Bookings</span>
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-white mb-2">
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
                <p className="text-white/60 text-sm sm:text-base lg:text-lg mt-2 lg:mt-3">
                  View and manage your bookings in calendar view
                </p>
              </div>

              <Link href="/dashboard/bookings/new" className="flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-luxury-gradient text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-lavender/30 hover:shadow-lavender/50 transition-shadow text-sm sm:text-base"
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
            className="glass-card p-3 sm:p-4 mb-4 lg:mb-6 max-w-6xl mx-auto"
          >
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-green-500"></div>
                <span className="text-white text-xs sm:text-sm">Confirmed</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-yellow-500"></div>
                <span className="text-white text-xs sm:text-sm">Pending</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-purple-500"></div>
                <span className="text-white text-xs sm:text-sm">Completed</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-red-500"></div>
                <span className="text-white text-xs sm:text-sm">Cancelled</span>
              </div>
            </div>
          </motion.div>

          {/* Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="glass-card p-3 sm:p-4 lg:p-6 overflow-hidden max-w-6xl mx-auto"
            style={{ minHeight: isMobile ? "500px" : "700px" }}
          >
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%", minHeight: isMobile ? 450 : 650 }}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventStyleGetter}
              view={view}
              onView={setView}
              date={currentDate}
              onNavigate={setCurrentDate}
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
          padding: 10px 6px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          font-size: 13px;
        }

        @media (min-width: 640px) {
          .glam-calendar .rbc-header {
            padding: 12px 8px;
            font-size: 14px;
          }
        }

        .glam-calendar .rbc-today {
          background-color: rgba(233, 181, 216, 0.15);
        }

        .glam-calendar .rbc-off-range-bg {
          background: rgba(255, 255, 255, 0.02);
        }

        .glam-calendar .rbc-date-cell {
          padding: 6px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 12px;
        }

        @media (min-width: 640px) {
          .glam-calendar .rbc-date-cell {
            padding: 8px;
            font-size: 14px;
          }
        }

        .glam-calendar .rbc-now .rbc-button-link {
          color: #E9B5D8;
          font-weight: bold;
        }

        .glam-calendar .rbc-month-view,
        .glam-calendar .rbc-time-view {
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }

        @media (min-width: 640px) {
          .glam-calendar .rbc-month-view,
          .glam-calendar .rbc-time-view {
            border-radius: 12px;
          }
        }

        .glam-calendar .rbc-day-bg {
          border-left: 1px solid rgba(255, 255, 255, 0.05);
        }

        .glam-calendar .rbc-month-row {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          min-height: 60px;
        }

        @media (min-width: 640px) {
          .glam-calendar .rbc-month-row {
            min-height: 80px;
          }
        }

        @media (min-width: 1024px) {
          .glam-calendar .rbc-month-row {
            min-height: 100px;
          }
        }

        .glam-calendar .rbc-event {
          cursor: pointer;
          transition: all 0.2s ease;
          border: none !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .glam-calendar .rbc-event:hover {
          opacity: 0.9;
          transform: scale(1.02);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
        }

        .glam-calendar .rbc-event-label {
          font-size: 11px;
        }

        .glam-calendar .rbc-event-content {
          font-size: 12px;
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .glam-calendar .rbc-toolbar {
          padding: 12px 0;
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: stretch;
        }

        @media (min-width: 640px) {
          .glam-calendar .rbc-toolbar {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding: 16px 0;
            margin-bottom: 20px;
          }
        }

        .glam-calendar .rbc-toolbar-label {
          color: white;
          font-weight: 700;
          font-size: 16px;
          text-align: center;
          flex-grow: 1;
          order: -1;
        }

        @media (min-width: 640px) {
          .glam-calendar .rbc-toolbar-label {
            font-size: 18px;
            order: 0;
          }
        }

        .glam-calendar .rbc-btn-group {
          display: flex;
          gap: 8px;
          justify-content: center;
        }

        .glam-calendar .rbc-btn-group:first-child {
          order: 1;
        }

        .glam-calendar .rbc-btn-group:last-child {
          order: 2;
        }

        @media (min-width: 640px) {
          .glam-calendar .rbc-btn-group:first-child {
            order: 0;
          }

          .glam-calendar .rbc-btn-group:last-child {
            order: 2;
          }
        }

        .glam-calendar .rbc-toolbar button {
          color: white;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 6px 12px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        @media (min-width: 640px) {
          .glam-calendar .rbc-toolbar button {
            padding: 8px 16px;
            font-size: 14px;
          }
        }

        .glam-calendar .rbc-toolbar button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .glam-calendar .rbc-toolbar button:active:not(:disabled) {
          background: rgba(255, 255, 255, 0.25);
        }

        .glam-calendar .rbc-toolbar button.rbc-active {
          background: linear-gradient(135deg, #E9B5D8, #C9A5D6, #B8A3D9);
          border-color: transparent;
          box-shadow: 0 2px 8px rgba(233, 181, 216, 0.4);
        }

        .glam-calendar .rbc-time-slot {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          min-height: 40px;
        }

        .glam-calendar .rbc-time-content {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .glam-calendar .rbc-time-header-content {
          border-left: 1px solid rgba(255, 255, 255, 0.1);
        }

        .glam-calendar .rbc-time-column {
          min-width: 60px;
        }

        @media (min-width: 640px) {
          .glam-calendar .rbc-time-column {
            min-width: 80px;
          }
        }

        .glam-calendar .rbc-current-time-indicator {
          background-color: #E9B5D8;
          height: 2px;
        }

        .glam-calendar .rbc-timeslot-group {
          min-height: 60px;
        }

        .glam-calendar .rbc-time-header {
          overflow-x: auto;
        }

        .glam-calendar .rbc-allday-cell {
          font-size: 12px;
        }

        .glam-calendar .rbc-show-more {
          background-color: rgba(233, 181, 216, 0.2);
          color: #E9B5D8;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          margin-top: 2px;
        }

        .glam-calendar .rbc-show-more:hover {
          background-color: rgba(233, 181, 216, 0.3);
        }
      `}</style>
    </div>
  );
}
