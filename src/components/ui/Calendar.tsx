"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  minDate?: Date;
  disabledDays?: number[]; // 0 = Sunday, 6 = Saturday
}

export default function Calendar({
  selectedDate,
  onSelectDate,
  minDate = new Date(),
  disabledDays = [],
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(
    selectedDate || new Date()
  );

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

  const monthName = currentMonth.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const handleDateClick = (day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    
    // Check if date is disabled
    if (disabledDays.includes(date.getDay())) return;
    if (minDate && date < minDate) return;

    onSelectDate(date);
  };

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return (
      date.toDateString() === selectedDate.toDateString()
    );
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    
    // Disabled if before minDate
    if (minDate && date < minDate) return true;
    
    // Disabled if day of week is in disabledDays
    if (disabledDays.includes(date.getDay())) return true;

    return false;
  };

  const isToday = (day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <div className="bg-black/40 border border-white/20 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <h3 className="text-white font-bold text-lg">{monthName}</h3>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div
            key={day}
            className="text-center text-white/60 text-sm font-semibold py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} />
        ))}
        {days.map((day) => {
          const disabled = isDateDisabled(day);
          const selected = isDateSelected(day);
          const today = isToday(day);

          return (
            <motion.button
              key={day}
              onClick={() => !disabled && handleDateClick(day)}
              disabled={disabled}
              whileHover={!disabled ? { scale: 1.1 } : {}}
              whileTap={!disabled ? { scale: 0.95 } : {}}
              className={`
                aspect-square p-2 rounded-lg text-sm font-semibold transition-all
                ${disabled 
                  ? "text-white/20 cursor-not-allowed" 
                  : "text-white hover:bg-white/10 cursor-pointer"
                }
                ${selected 
                  ? "bg-gradient-to-br from-lavender to-blush text-white ring-2 ring-lavender" 
                  : ""
                }
                ${today && !selected 
                  ? "ring-2 ring-white/40" 
                  : ""
                }
              `}
            >
              {day}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-white/60">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-lavender to-blush" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full ring-2 ring-white/40" />
          <span>Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-white/20" />
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  );
}
