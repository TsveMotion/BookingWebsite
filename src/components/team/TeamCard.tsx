"use client";

import { motion } from "framer-motion";
import { User, Mail, Shield, Trash2, Edit2, Send, Crown } from "lucide-react";

interface TeamMember {
  id: string;
  name?: string;
  email: string;
  role: string;
  status: string;
  permissions?: any;
}

interface TeamCardProps {
  member: TeamMember;
  isOwner?: boolean;
  onEdit?: (member: TeamMember) => void;
  onRemove?: (memberId: string) => void;
  onResendInvite?: (memberId: string) => void;
}

export function TeamCard({ member, isOwner, onEdit, onRemove, onResendInvite }: TeamCardProps) {
  const getRoleBadgeColor = (role: string) => {
    if (role === "Owner") return "bg-luxury-gradient";
    if (role === "Manager") return "bg-purple-500/20 text-purple-300";
    return "bg-white/10 text-white/70";
  };

  const getStatusBadge = (status: string) => {
    if (status === "Active") {
      return <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">Active</span>;
    }
    return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded-full">Pending</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 hover:shadow-xl hover:shadow-lavender/20 transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
            isOwner ? "bg-luxury-gradient" : "bg-white/10"
          }`}>
            <User className="w-7 h-7 text-white" />
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-white">
                {member.name || "Pending"}
              </h3>
              <span className={`px-3 py-0.5 text-xs font-semibold rounded-full ${getRoleBadgeColor(member.role)}`}>
                {member.role}
              </span>
            </div>
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Mail className="w-4 h-4" />
              {member.email}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        {getStatusBadge(member.status)}
      </div>

      {/* Permissions Preview */}
      {member.permissions && (
        <div className="mb-4 p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-lavender" />
            <span className="text-sm font-semibold text-white">Permissions</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(member.permissions).map(([key, value]) => {
              if (value) {
                return (
                  <span key={key} className="px-2 py-1 bg-lavender/20 text-lavender text-xs rounded-full">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      {!isOwner && (
        <div className="flex gap-2">
          {member.status === "Pending" && onResendInvite && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onResendInvite(member.id)}
              className="flex-1 px-4 py-2 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Resend Invite
            </motion.button>
          )}
          
          {member.status === "Active" && onEdit && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onEdit(member)}
              className="flex-1 px-4 py-2 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit Role
            </motion.button>
          )}

          {onRemove && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onRemove(member.id)}
              className="px-4 py-2 bg-red-500/10 text-red-400 font-semibold rounded-lg hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      )}

      {/* Owner Badge */}
      {isOwner && (
        <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm font-semibold">
          <Crown className="w-4 h-4" />
          Account Owner
        </div>
      )}
    </motion.div>
  );
}
