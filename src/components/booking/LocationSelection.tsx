"use client";

import { motion } from "framer-motion";
import { MapPin, ChevronRight } from "lucide-react";

interface Location {
  id: string;
  name: string;
  address?: string;
  phone?: string;
}

interface LocationSelectionProps {
  locations: Location[];
  selectedLocation: Location | null;
  onSelectLocation: (location: Location) => void;
  onNext: () => void;
}

export default function LocationSelection({
  locations,
  selectedLocation,
  onSelectLocation,
  onNext,
}: LocationSelectionProps) {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Choose Location</h2>
        <p className="text-white/60 text-sm">Where would you like your appointment?</p>
      </div>

      <div className="space-y-3">
        {locations.map((location) => {
          const isSelected = selectedLocation?.id === location.id;
          
          return (
            <motion.div
              key={location.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div
                onClick={() => {
                  onSelectLocation(location);
                  onNext();
                }}
                className={`group relative p-5 rounded-2xl cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "bg-gradient-to-br from-[#e7b5ff]/20 to-[#e7b5ff]/10 ring-2 ring-[#e7b5ff] shadow-lg shadow-[#e7b5ff]/20"
                    : "bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#e7b5ff]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-[#e7b5ff]" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white mb-2 truncate">
                      {location.name}
                    </h3>
                    
                    {location.address && (
                      <p className="text-sm text-white/60 mb-1 flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{location.address}</span>
                      </p>
                    )}
                    
                    {location.phone && (
                      <p className="text-sm text-white/60">{location.phone}</p>
                    )}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectLocation(location);
                      onNext();
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold transition-all ${
                      isSelected
                        ? "bg-[#e7b5ff] text-black shadow-lg shadow-[#e7b5ff]/30"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {isSelected ? "Selected" : "Select"}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Continue Button */}
      {selectedLocation && (
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
