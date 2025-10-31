"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Users, UserPlus, Crown, Lock, ArrowRight } from "lucide-react";
import { TeamCard } from "@/components/team/TeamCard";
import { InviteModal } from "@/components/team/InviteModal";
import { EditRoleModal } from "@/components/team/EditRoleModal";
import { useRouter } from "next/navigation";

interface TeamMember {
  id: string;
  name?: string;
  email: string;
  role: string;
  status: string;
  permissions?: any;
}

export default function TeamPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState("free");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      fetchTeamMembers();
      fetchUserProfile();
    }
  }, [isLoaded, user]);

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch("/api/team");
      const data = await response.json();
      setTeamMembers(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch team:", error);
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();
      setUserPlan(data.plan || "free");
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setSelectedMember(member);
    setShowEditModal(true);
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;

    try {
      const response = await fetch("/api/team/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });

      if (response.ok) {
        fetchTeamMembers();
      }
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
  };

  const handleResendInvite = async (memberId: string) => {
    try {
      const response = await fetch("/api/team/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });

      if (response.ok) {
        alert("Invitation resent!");
      }
    } catch (error) {
      console.error("Failed to resend invite:", error);
    }
  };

  const isPro = userPlan.toLowerCase() === "pro" || userPlan.toLowerCase() === "business";
  const isBusiness = userPlan.toLowerCase() === "business";

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white text-lg"
        >
          Loading team...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-2">
              <span className="relative inline-block">
                Team Members
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-luxury-gradient rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                />
              </span>
            </h1>
            <p className="text-white/60 text-lg mt-3">
              Invite staff and manage permissions
            </p>
          </div>
          <div className="relative group">
            <motion.button
              whileHover={{ scale: isPro ? 1.05 : 1 }}
              whileTap={{ scale: isPro ? 0.95 : 1 }}
              onClick={() => isPro && setShowInviteModal(true)}
              disabled={!isPro}
              className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-white shadow-lg transition-all ${
                isPro
                  ? "bg-luxury-gradient shadow-lavender/30 hover:shadow-lavender/50"
                  : "bg-white/10 cursor-not-allowed"
              }`}
            >
              <UserPlus className="w-5 h-5" />
              Invite Team Member
              {!isPro && <Lock className="w-4 h-4" />}
            </motion.button>
            {!isPro && (
              <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1 rounded-lg text-xs bg-black/90 border border-yellow-500/30 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                <Crown className="w-3 h-3 inline mr-1" />
                Upgrade to Pro to invite unlimited team members ✨
              </span>
            )}
          </div>
        </div>

        {/* Plan Notice - Only for Free users */}
        {!isPro && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 mb-8 border border-lavender/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-luxury-gradient opacity-5" />
            <div className="relative flex items-start gap-4">
              <div className="p-4 bg-luxury-gradient rounded-xl">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Unlock Team Collaboration
                </h3>
                <p className="text-white/70 mb-4">
                  Invite unlimited team members with Pro or Business plans. Each member can manage
                  bookings, clients, and services with customizable role-based permissions.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push("/dashboard/billing")}
                  className="px-6 py-3 bg-luxury-gradient rounded-xl text-white font-bold shadow-lg shadow-lavender/30 hover:shadow-lavender/50 transition-all flex items-center gap-2"
                >
                  Upgrade Plan
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}


        {/* Team Members Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Owner Card */}
          <TeamCard
            member={{
              id: user?.id || "",
              name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
              email: user?.emailAddresses[0]?.emailAddress || "",
              role: "Owner",
              status: "Active",
            }}
            isOwner={true}
          />

          {/* Team Members */}
          {teamMembers.map((member) => (
            <TeamCard
              key={member.id}
              member={member}
              onEdit={handleEdit}
              onRemove={handleRemove}
              onResendInvite={handleResendInvite}
            />
          ))}
        </div>

        {/* Empty State */}
        {teamMembers.length === 0 && isPro && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-12 text-center mt-6"
          >
            <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">
              No team members yet 👥
            </h3>
            <p className="text-white/60 mb-6">
              Invite your first collaborator to start growing your beauty business!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowInviteModal(true)}
              className="px-6 py-3 bg-luxury-gradient text-white font-bold rounded-xl"
            >
              <UserPlus className="w-5 h-5 inline mr-2" />
              Invite Team Member
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      {/* Modals */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInviteSent={fetchTeamMembers}
      />

      <EditRoleModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedMember(null);
        }}
        onSave={fetchTeamMembers}
        member={selectedMember}
      />
    </div>
  );
}
