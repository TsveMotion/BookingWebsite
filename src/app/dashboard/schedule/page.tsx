"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Clock, Calendar, Save, Check } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type DaySchedule = {
  enabled: boolean;
  start: string;
  end: string;
};

type Schedule = Record<string, DaySchedule>;

export default function SchedulePage() {
  const { user, isLoaded } = useUser();
  const [schedule, setSchedule] = useState<Schedule>(
    DAYS.reduce((acc, day) => ({
      ...acc,
      [day]: { enabled: false, start: "09:00", end: "17:00" },
    }), {} as Schedule)
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleToggleDay = (day: string) => {
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day as keyof typeof schedule], enabled: !schedule[day as keyof typeof schedule].enabled },
    });
  };

  const handleTimeChange = (day: string, field: "start" | "end", value: string) => {
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day as keyof typeof schedule], [field]: value },
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/dashboard/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field: "scheduleConfigured", value: true }),
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save schedule:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded) {
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

  return (
    <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-2">
              Working Hours
            </h1>
            <p className="text-white/60 text-lg mb-8">
              Configure your availability for bookings
            </p>

            <div className="glass-card p-8 space-y-4">
              {DAYS.map((day, index) => (
                <motion.div
                  key={day}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-xl"
                >
                  <input
                    type="checkbox"
                    checked={schedule[day as keyof typeof schedule].enabled}
                    onChange={() => handleToggleDay(day)}
                    className="w-5 h-5 rounded border-white/20 bg-white/10 checked:bg-lavender focus:ring-2 focus:ring-lavender/50"
                  />
                  <div className="flex-1 grid md:grid-cols-3 gap-4 items-center">
                    <span className="text-white font-semibold">{day}</span>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-white/60" />
                      <input
                        type="time"
                        value={schedule[day as keyof typeof schedule].start}
                        onChange={(e) => handleTimeChange(day, "start", e.target.value)}
                        disabled={!schedule[day as keyof typeof schedule].enabled}
                        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-lavender/50"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/60">to</span>
                      <input
                        type="time"
                        value={schedule[day as keyof typeof schedule].end}
                        onChange={(e) => handleTimeChange(day, "end", e.target.value)}
                        disabled={!schedule[day as keyof typeof schedule].enabled}
                        className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-lavender/50"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saving}
                className={`w-full mt-6 py-4 rounded-xl font-semibold text-white transition-all ${
                  saved
                    ? "bg-green-500"
                    : "bg-luxury-gradient hover:shadow-lg hover:shadow-lavender/20"
                } disabled:opacity-50`}
              >
                <span className="flex items-center justify-center gap-2">
                  {saved ? (
                    <>
                      <Check className="w-5 h-5" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {saving ? "Saving..." : "Save Schedule"}
                    </>
                  )}
                </span>
              </motion.button>
            </div>
          </motion.div>
    </div>
  );
}
