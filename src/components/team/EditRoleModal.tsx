"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Edit2 } from "lucide-react";
import { useState } from "react";

interface TeamMember {
  id: string;
  name?: string;
  email: string;
  role: string;
  permissions?: any;
}

interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  member: TeamMember | null;
}

export function EditRoleModal({ isOpen, onClose, onSave, member }: EditRoleModalProps) {
  const [formData, setFormData] = useState({
    role: member?.role || "Staff",
    permissions: member?.permissions || {
      manageBookings: true,
      manageClients: true,
      manageServices: false,
      manageAnalytics: false,
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/team/update-role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: member.id,
          ...formData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      onSave();
      onClose();
    } catch (err) {
      setError("Failed to update role. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!member) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-luxury-gradient">
                    <Edit2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Edit Role</h2>
                    <p className="text-white/60 text-sm">{member.email}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Role */}
                <div>
                  <label className="block text-white/80 text-sm font-semibold mb-2">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-lavender transition-colors"
                  >
                    <option value="Staff">Staff</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>

                {/* Permissions */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-lavender" />
                    <label className="text-white/80 text-sm font-semibold">
                      Permissions
                    </label>
                  </div>
                  <div className="space-y-2 p-4 bg-white/5 rounded-xl">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions.manageBookings}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              manageBookings: e.target.checked,
                            },
                          })
                        }
                        className="w-5 h-5 rounded bg-white/5 border-white/10 text-lavender focus:ring-lavender"
                      />
                      <span className="text-white/80 text-sm">Manage Bookings</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions.manageClients}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              manageClients: e.target.checked,
                            },
                          })
                        }
                        className="w-5 h-5 rounded bg-white/5 border-white/10 text-lavender focus:ring-lavender"
                      />
                      <span className="text-white/80 text-sm">Manage Clients</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions.manageServices}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              manageServices: e.target.checked,
                            },
                          })
                        }
                        className="w-5 h-5 rounded bg-white/5 border-white/10 text-lavender focus:ring-lavender"
                      />
                      <span className="text-white/80 text-sm">Manage Services</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions.manageAnalytics}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              manageAnalytics: e.target.checked,
                            },
                          })
                        }
                        className="w-5 h-5 rounded bg-white/5 border-white/10 text-lavender focus:ring-lavender"
                      />
                      <span className="text-white/80 text-sm">View Analytics</span>
                    </label>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 mt-6">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="flex-1 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-luxury-gradient text-white font-bold rounded-xl shadow-lg shadow-lavender/30 hover:shadow-lavender/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
