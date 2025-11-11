"use client";

import { motion } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useState } from "react";

interface DateTimeSelectionProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  availableSlots: string[];
  loadingSlots: boolean;
  onSelectDate: (date: Date) => void;
  onSelectTime: (time: string) => void;
  onNext: () => void;
}

export default function DateTimeSelection({
  selectedDate,
  selectedTime,
  availableSlots,
  loadingSlots,
  onSelectDate,
  onSelectTime,
  onNext,
}: DateTimeSelectionProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isSelectedDate = (date: Date) => {
    if (!selectedDate) return false;
    return date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear();
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Select Date & Time</h2>
        <p className="text-white/60 text-sm">Choose when you'd like to come in</p>
      </div>

      {/* Calendar */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h3 className="text-lg font-semibold text-white">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-white/50 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} />;
            }

            const past = isPastDate(date);
            const today = isToday(date);
            const selected = isSelectedDate(date);

            return (
              <motion.button
                key={date.toISOString()}
                whileHover={!past ? { scale: 1.05 } : {}}
                whileTap={!past ? { scale: 0.95 } : {}}
                onClick={() => !past && onSelectDate(date)}
                disabled={past}
                className={`
                  aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all
                  ${past ? "text-white/20 cursor-not-allowed" : ""}
                  ${today && !selected ? "ring-2 ring-[#e7b5ff]/50 text-white" : ""}
                  ${selected ? "bg-gradient-to-br from-[#e7b5ff] to-[#d4a5ff] text-black shadow-lg shadow-[#e7b5ff]/30" : ""}
                  ${!selected && !past && !today ? "bg-white/5 hover:bg-white/10 text-white" : ""}
                `}
              >
                {date.getDate()}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-[#e7b5ff]" />
            <h3 className="text-lg font-semibold text-white">Available Times</h3>
          </div>

          {loadingSlots ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : availableSlots.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {availableSlots.map((time) => {
                const isSelected = selectedTime === time;
                return (
                  <motion.button
                    key={time}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelectTime(time)}
                    className={`
                      py-3 px-2 rounded-xl font-semibold text-sm transition-all
                      ${isSelected
                        ? "bg-gradient-to-br from-[#e7b5ff] to-[#d4a5ff] text-black shadow-lg shadow-[#e7b5ff]/30"
                        : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                      }
                    `}
                  >
                    {time}
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-white/60">No available times for this date</p>
              <p className="text-white/40 text-sm mt-1">Please select another date</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Continue Button */}
      {selectedTime && (
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
    </div>
  );
}
