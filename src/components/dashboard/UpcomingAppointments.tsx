"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, User, DollarSign } from "lucide-react";
import Link from "next/link";

interface Appointment {
  id: string;
  clientName: string;
  serviceName: string;
  startTime: string;
  totalAmount: number;
  status: string;
}

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
  todayCount: number;
}

export function UpcomingAppointments({ appointments, todayCount }: UpcomingAppointmentsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-heading font-bold text-white">
            Upcoming Appointments
          </h2>
          <p className="text-white/60 text-sm mt-1">
            {todayCount > 0 ? `${todayCount} today` : 'No appointments today'}
          </p>
        </div>
        <Link
          href="/dashboard/bookings"
          className="text-lavender hover:text-lavender/80 text-sm font-semibold transition-colors"
        >
          View All →
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/40">No upcoming appointments</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appointment, index) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-lavender flex-shrink-0" />
                    <p className="text-white font-semibold truncate">
                      {appointment.clientName}
                    </p>
                  </div>
                  <p className="text-white/60 text-sm mb-2 truncate">
                    {appointment.serviceName}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-white/50">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(appointment.startTime).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(appointment.startTime).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1 text-white font-semibold">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span>£{appointment.totalAmount}</span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      appointment.status === 'confirmed'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {appointment.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
