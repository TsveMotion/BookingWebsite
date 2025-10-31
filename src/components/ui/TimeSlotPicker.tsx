"use client";

import { motion } from "framer-motion";
import { Clock, Loader2 } from "lucide-react";

interface TimeSlotPickerProps {
  slots: string[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  loading?: boolean;
}

export default function TimeSlotPicker({
  slots,
  selectedTime,
  onSelectTime,
  loading = false,
}: TimeSlotPickerProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-lavender animate-spin" />
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 text-white/20 mx-auto mb-4" />
        <p className="text-white/60">No available times for this date</p>
        <p className="text-white/40 text-sm mt-2">Please select another date</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-lavender" />
        <h3 className="text-white font-semibold">Available Times</h3>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {slots.map((time) => (
          <motion.button
            key={time}
            onClick={() => onSelectTime(time)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              px-4 py-3 rounded-xl font-semibold text-sm transition-all
              ${
                selectedTime === time
                  ? "bg-gradient-to-br from-lavender to-blush text-white ring-2 ring-lavender shadow-lg"
                  : "bg-black/40 text-white border border-white/20 hover:bg-white/10"
              }
            `}
          >
            {time}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
