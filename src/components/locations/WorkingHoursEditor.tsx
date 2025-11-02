"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Check, X } from "lucide-react";

interface DaySchedule {
  open: string;
  close: string;
  closed: boolean;
}

interface WorkingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

interface WorkingHoursEditorProps {
  locationId: string;
  initialHours?: WorkingHours;
  onSave: (locationId: string, hours: WorkingHours) => Promise<void>;
  saving?: boolean;
}

const DEFAULT_HOURS: WorkingHours = {
  monday: { open: "09:00", close: "17:00", closed: false },
  tuesday: { open: "09:00", close: "17:00", closed: false },
  wednesday: { open: "09:00", close: "17:00", closed: false },
  thursday: { open: "09:00", close: "17:00", closed: false },
  friday: { open: "09:00", close: "17:00", closed: false },
  saturday: { open: "10:00", close: "16:00", closed: false },
  sunday: { open: "10:00", close: "16:00", closed: true },
};

const DAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
] as const;

export function WorkingHoursEditor({
  locationId,
  initialHours,
  onSave,
  saving = false,
}: WorkingHoursEditorProps) {
  const [hours, setHours] = useState<WorkingHours>(initialHours || DEFAULT_HOURS);
  const [hasChanges, setHasChanges] = useState(false);

  const handleDayChange = (
    day: keyof WorkingHours,
    field: keyof DaySchedule,
    value: string | boolean
  ) => {
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    await onSave(locationId, hours);
    setHasChanges(false);
  };

  const copyToAll = (sourceDay: keyof WorkingHours) => {
    const sourceSchedule = hours[sourceDay];
    const newHours = { ...hours };
    
    DAYS.forEach(({ key }) => {
      if (key !== sourceDay) {
        newHours[key] = { ...sourceSchedule };
      }
    });
    
    setHours(newHours);
    setHasChanges(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-lavender" />
        <h3 className="text-lg font-bold text-white">Working Hours</h3>
      </div>

      <div className="space-y-3">
        {DAYS.map(({ key, label }, index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10"
          >
            {/* Day Label */}
            <div className="w-24 flex-shrink-0">
              <p className="text-white font-medium">{label}</p>
            </div>

            {/* Closed Toggle */}
            <button
              onClick={() => handleDayChange(key, "closed", !hours[key].closed)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                hours[key].closed
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-green-500/20 text-green-400 border border-green-500/30"
              }`}
            >
              {hours[key].closed ? "Closed" : "Open"}
            </button>

            {/* Time Inputs */}
            {!hours[key].closed && (
              <div className="flex items-center gap-3 flex-1">
                <input
                  type="time"
                  value={hours[key].open}
                  onChange={(e) => handleDayChange(key, "open", e.target.value)}
                  className="px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white focus:border-lavender focus:outline-none"
                />
                <span className="text-white/60">to</span>
                <input
                  type="time"
                  value={hours[key].close}
                  onChange={(e) => handleDayChange(key, "close", e.target.value)}
                  className="px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white focus:border-lavender focus:outline-none"
                />
              </div>
            )}

            {/* Copy to All Button */}
            {!hours[key].closed && (
              <button
                onClick={() => copyToAll(key)}
                className="px-3 py-1 text-xs bg-white/5 hover:bg-white/10 text-white/80 rounded-lg transition-colors border border-white/10"
              >
                Copy to all
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Save Button */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end"
        >
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-luxury-gradient hover:opacity-90 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save Schedule
              </>
            )}
          </button>
        </motion.div>
      )}
    </div>
  );
}
