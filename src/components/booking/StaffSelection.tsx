"use client";

import { motion } from "framer-motion";
import { User, Star, ChevronRight, Users } from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  displayName: string;
  email: string;
  role: string;
}

interface StaffSelectionProps {
  staff: StaffMember[];
  selectedStaff: StaffMember | null;
  onSelectStaff: (staff: StaffMember | null) => void;
  onNext: () => void;
}

export default function StaffSelection({
  staff,
  selectedStaff,
  onSelectStaff,
  onNext,
}: StaffSelectionProps) {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Choose Your Specialist</h2>
        <p className="text-white/60 text-sm">Select a team member or let us choose for you</p>
      </div>

      {/* Any Staff Option */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div
          onClick={() => {
            onSelectStaff(null);
            onNext();
          }}
          className={`group relative p-5 rounded-2xl cursor-pointer transition-all duration-200 ${
            selectedStaff === null
              ? "bg-gradient-to-br from-[#e7b5ff]/20 to-[#e7b5ff]/10 ring-2 ring-[#e7b5ff] shadow-lg shadow-[#e7b5ff]/20"
              : "bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#e7b5ff] to-[#d4a5ff] rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="w-8 h-8 text-black" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">
                No Preference
              </h3>
              <p className="text-sm text-white/60">
                First available team member
              </p>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectStaff(null);
                onNext();
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold transition-all ${
                selectedStaff === null
                  ? "bg-[#e7b5ff] text-black shadow-lg shadow-[#e7b5ff]/30"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {selectedStaff === null ? "Selected" : "Select"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Staff List */}
      {staff.length > 0 && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-black px-4 text-sm text-white/60">or choose a specialist</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {staff.map((member) => {
              const isSelected = selectedStaff?.id === member.id;
              
              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.05 }}
                >
                  <div
                    onClick={() => onSelectStaff(member)}
                    className={`group relative p-4 rounded-2xl cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "bg-gradient-to-br from-[#e7b5ff]/20 to-[#e7b5ff]/10 ring-2 ring-[#e7b5ff] shadow-lg shadow-[#e7b5ff]/20"
                        : "bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-[#e7b5ff]/10 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-[#e7b5ff]/20">
                        <User className="w-7 h-7 text-[#e7b5ff]" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-white mb-0.5 truncate">
                          {member.displayName || member.name}
                        </h3>
                        <p className="text-xs text-white/50 mb-1 truncate">{member.role}</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs text-white/60">Specialist</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectStaff(member);
                          onNext();
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isSelected
                            ? "bg-[#e7b5ff] text-black"
                            : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                      >
                        {isSelected ? "✓" : "Select"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {/* Continue Button */}
      {(selectedStaff || staff.length === 0) && (
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
