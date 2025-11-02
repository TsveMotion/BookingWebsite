"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Settings, Bell, CreditCard, Shield, Mail, Save, Check, DollarSign, Building, Link as LinkIcon } from "lucide-react";

interface UserProfile {
  businessName?: string;
  businessSlug?: string;
  address?: string;
  description?: string;
  phone?: string;
  logoUrl?: string;
  vatNumber?: string;
  certificate?: string;
  payoutFrequency?: string;
  notificationsEmail: boolean;
  notificationsWhatsApp: boolean;
  emailRemindersEnabled: boolean;
  plan?: string;
  updatedAt?: string;
}

interface BookingPreferences {
  primaryColor?: string;
  allowAddons: boolean;
  allowStaffPick: boolean;
  autoConfirm: boolean;
  cancellationHrs: number;
}

interface StripeConnection {
  connected: boolean;
  accountId?: string;
  payoutsEnabled?: boolean;
}

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookingPrefs, setBookingPrefs] = useState<BookingPreferences | null>(null);
  const [stripeConnection, setStripeConnection] = useState<StripeConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [connectingStripe, setConnectingStripe] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      fetchProfile();
      fetchStripeConnection();
      fetchBookingPreferences();
    }
  }, [isLoaded, user]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();
      setProfile(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      setLoading(false);
    }
  };

  const fetchStripeConnection = async () => {
    try {
      const response = await fetch("/api/stripe/connect");
      const data = await response.json();
      setStripeConnection(data);
    } catch (error) {
      console.error("Failed to fetch Stripe connection:", error);
    }
  };

  const fetchBookingPreferences = async () => {
    try {
      const response = await fetch("/api/booking-preferences");
      const data = await response.json();
      setBookingPrefs(data);
    } catch (error) {
      console.error("Failed to fetch booking preferences:", error);
    }
  };

  const handleConnectStripe = async () => {
    setConnectingStripe(true);
    try {
      const response = await fetch("/api/stripe/connect", {
        method: "POST",
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Failed to connect Stripe:", error);
      setConnectingStripe(false);
    }
  };

  const handleOpenStripeDashboard = async () => {
    try {
      const response = await fetch("/api/stripe/dashboard", {
        method: "POST",
      });
      const data = await response.json();
      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Failed to open Stripe dashboard:", error);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (uploadResponse.ok) {
        const data = await uploadResponse.json();
        
        // Save the logo URL to the database
        const saveResponse = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ logoUrl: data.url }),
        });

        if (saveResponse.ok) {
          setProfile({ ...profile!, logoUrl: data.url });
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
          
          // Trigger a page reload to update the sidebar logo
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          throw new Error('Failed to save logo URL');
        }
      } else {
        const error = await uploadResponse.json();
        alert(`Upload failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Logo upload failed:', error);
      alert('Failed to upload logo. Please try again.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      // Save profile
      const profileResponse = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      // Save booking preferences
      if (bookingPrefs) {
        await fetch("/api/booking-preferences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingPrefs),
        });
      }

      if (profileResponse.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white text-lg"
        >
          Loading settings...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-2">
          Settings
        </h1>
        <p className="text-white/60 text-lg mb-8">
          Manage your account preferences and settings
        </p>

        {/* Profile Settings Section */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-rose-light/20 rounded-xl">
              <Building className="w-6 h-6 text-rose-light" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-white">
              Business Profile
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-white/80 text-sm mb-2 block">Business Name</label>
              <input
                type="text"
                value={profile?.businessName || ""}
                onChange={(e) => setProfile({ ...profile!, businessName: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lavender/50"
                placeholder="Your Salon Name"
              />
            </div>

            <div>
              <label className="text-white/80 text-sm mb-2 block">Booking URL</label>
              <div className="flex gap-2">
                <div className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white/60 flex items-center">
                  {process.env.NEXT_PUBLIC_APP_URL || 'glambooking.co.uk'}/book/{profile?.businessSlug || 'your-business'}
                </div>
                {profile?.businessSlug && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/book/${profile.businessSlug}`);
                      alert('Booking link copied!');
                    }}
                    className="px-4 py-3 bg-lavender/20 hover:bg-lavender/30 text-lavender rounded-xl transition-colors"
                  >
                    <LinkIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="text-white/80 text-sm mb-2 block">Address</label>
              <input
                type="text"
                value={profile?.address || ""}
                onChange={(e) => setProfile({ ...profile!, address: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lavender/50"
                placeholder="123 High Street, London"
              />
            </div>

            <div>
              <label className="text-white/80 text-sm mb-2 block">Phone</label>
              <input
                type="tel"
                value={profile?.phone || ""}
                onChange={(e) => setProfile({ ...profile!, phone: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lavender/50"
                placeholder="+44 7700 900000"
              />
            </div>

            <div>
              <label className="text-white/80 text-sm mb-2 block">Business Logo</label>
              <div className="space-y-3">
                {profile?.logoUrl && (
                  <div className="flex items-center gap-4">
                    <img
                      src={profile.logoUrl}
                      alt="Business Logo"
                      className="h-16 w-auto object-contain rounded-lg bg-white/5 p-2 border border-white/10"
                    />
                    <button
                      onClick={async () => {
                        if (confirm('Are you sure you want to remove your logo?')) {
                          try {
                            const response = await fetch("/api/profile", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ logoUrl: null }),
                            });
                            if (response.ok) {
                              setProfile({ ...profile, logoUrl: undefined });
                              setSaved(true);
                              setTimeout(() => setSaved(false), 2000);
                              // Reload to update sidebar
                              setTimeout(() => window.location.reload(), 1000);
                            }
                          } catch (error) {
                            console.error('Failed to remove logo:', error);
                            alert('Failed to remove logo. Please try again.');
                          }
                        }
                      }}
                      className="text-red-400 hover:text-red-300 text-sm transition-colors font-medium"
                    >
                      Remove Logo
                    </button>
                  </div>
                )}
                <div>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-3 bg-lavender/20 hover:bg-lavender/30 text-lavender rounded-xl transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="hidden"
                    />
                  </label>
                  <p className="text-white/40 text-xs mt-2">Recommended: PNG or JPG, max 2MB</p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-white/80 text-sm mb-2 block">Description</label>
              <textarea
                value={profile?.description || ""}
                onChange={(e) => setProfile({ ...profile!, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lavender/50"
                placeholder="Tell clients about your business..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/80 text-sm mb-2 block">VAT Number</label>
                <input
                  type="text"
                  value={profile?.vatNumber || ""}
                  onChange={(e) => setProfile({ ...profile!, vatNumber: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lavender/50"
                  placeholder="GB123456789"
                />
              </div>
              <div>
                <label className="text-white/80 text-sm mb-2 block">Certificate URL</label>
                <input
                  type="text"
                  value={profile?.certificate || ""}
                  onChange={(e) => setProfile({ ...profile!, certificate: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lavender/50"
                  placeholder="https://..."
                />
                <p className="text-white/40 text-xs mt-1">Link to business certificate or license</p>
              </div>
            </div>

            {profile?.updatedAt && (
              <p className="text-white/40 text-xs mt-4">
                Last updated: {new Date(profile.updatedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Stripe Connect Section */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blush/20 rounded-xl">
              <DollarSign className="w-6 h-6 text-blush" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-white">
              Payments & Payouts
            </h2>
          </div>

          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
            {stripeConnection?.connected ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-white font-semibold">Stripe Connected</span>
                </div>
                <p className="text-white/60 text-sm mb-4">
                  Your account is connected and ready to accept payments.
                  {stripeConnection.payoutsEnabled && " Payouts are enabled."}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleOpenStripeDashboard}
                    className="px-6 py-3 bg-luxury-gradient rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-lavender/20 transition-all"
                  >
                    View Payout Dashboard
                  </button>
                  <select
                    value={profile?.payoutFrequency || "weekly"}
                    onChange={(e) => setProfile({ ...profile!, payoutFrequency: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blush/50"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="daily" className="bg-black text-white">Daily</option>
                    <option value="weekly" className="bg-black text-white">Weekly</option>
                    <option value="monthly" className="bg-black text-white">Monthly</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <p className="text-white font-semibold mb-2">Connect Stripe to accept payments</p>
                <p className="text-white/60 text-sm mb-4">
                  Enable online payments and automatic payouts for your bookings. GlamBooking takes 0% commission — only Stripe fees (1.5% domestic / 2.9% international) apply.
                </p>
                <button
                  onClick={handleConnectStripe}
                  disabled={connectingStripe}
                  className="px-6 py-3 bg-luxury-gradient rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-lavender/20 transition-all disabled:opacity-50"
                >
                  {connectingStripe ? "Connecting..." : "Connect Stripe Account"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Booking Customization Section */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-lavender/20 rounded-xl">
              <Settings className="w-6 h-6 text-lavender" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-white">
              Booking Page Customization
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div>
                <p className="text-white font-semibold mb-1">Enable Add-Ons</p>
                <p className="text-white/60 text-sm">Allow clients to select service add-ons when booking</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={bookingPrefs?.allowAddons ?? true}
                  onChange={(e) => setBookingPrefs({ ...bookingPrefs!, allowAddons: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-lavender rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lavender"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div>
                <p className="text-white font-semibold mb-1">Enable Staff Selection</p>
                <p className="text-white/60 text-sm">Let clients choose their preferred staff member</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={bookingPrefs?.allowStaffPick ?? true}
                  onChange={(e) => setBookingPrefs({ ...bookingPrefs!, allowStaffPick: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-lavender rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lavender"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div>
                <p className="text-white font-semibold mb-1">Auto-Confirm Bookings</p>
                <p className="text-white/60 text-sm">Automatically confirm bookings without manual approval</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={bookingPrefs?.autoConfirm ?? false}
                  onChange={(e) => setBookingPrefs({ ...bookingPrefs!, autoConfirm: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-lavender rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lavender"></div>
              </label>
            </div>

            <div className="p-4 bg-white/5 rounded-xl">
              <label className="text-white font-semibold mb-2 block">Cancellation Policy</label>
              <p className="text-white/60 text-sm mb-3">Clients can cancel up to X hours before appointment</p>
              <select
                value={bookingPrefs?.cancellationHrs ?? 24}
                onChange={(e) => setBookingPrefs({ ...bookingPrefs!, cancellationHrs: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-black border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-lavender/50"
                style={{ colorScheme: 'dark' }}
              >
                <option value="6" className="bg-black text-white">6 hours</option>
                <option value="12" className="bg-black text-white">12 hours</option>
                <option value="24" className="bg-black text-white">24 hours</option>
                <option value="48" className="bg-black text-white">48 hours</option>
                <option value="72" className="bg-black text-white">72 hours</option>
              </select>
            </div>
          </div>
        </div>

        {/* Automations Section */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-amber/20 rounded-xl">
              <Settings className="w-6 h-6 text-amber" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-white">
              Automations
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div>
                <p className="text-white font-semibold mb-1">📧 Day-Before Reminders</p>
                <p className="text-white/60 text-sm">Automatically send reminder emails to clients 24 hours before appointments</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile?.emailRemindersEnabled ?? true}
                  onChange={(e) => setProfile({ ...profile!, emailRemindersEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-lavender rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lavender"></div>
              </label>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-white font-semibold">CRON Status: Active</p>
              </div>
              <p className="text-white/60 text-sm">
                Reminder emails are scheduled to send daily at 9:00 AM UTC via Vercel CRON
              </p>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-lavender/20 rounded-xl">
              <Bell className="w-6 h-6 text-lavender" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-white">
              Notifications
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div>
                <p className="text-white font-semibold mb-1">Email Notifications</p>
                <p className="text-white/60 text-sm">Receive booking confirmations via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile?.notificationsEmail || false}
                  onChange={(e) => setProfile({ ...profile!, notificationsEmail: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-lavender rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lavender"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-white font-semibold">WhatsApp/SMS Notifications</p>
                  {(profile?.plan === 'free') && (
                    <span className="px-2 py-0.5 bg-gradient-to-r from-rose-400 to-amber-300 text-white text-xs font-bold rounded-full">
                      PRO
                    </span>
                  )}
                </div>
                <p className="text-white/60 text-sm">
                  Send SMS/WhatsApp reminders to clients (Pro: 50/mo, Business: 500/mo)
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile?.notificationsWhatsApp || false}
                  onChange={(e) => setProfile({ ...profile!, notificationsWhatsApp: e.target.checked })}
                  disabled={profile?.plan === 'free'}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-lavender rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lavender peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Billing Section */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-rose-light/20 rounded-xl">
              <CreditCard className="w-6 h-6 text-rose-light" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-white">
              Billing & Subscription
            </h2>
          </div>

          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white font-semibold mb-1">Current Plan</p>
                <div className="flex items-center gap-3">
                  <p className="text-2xl font-bold capitalize">
                    <span className={profile?.plan === 'business' ? 'gradient-text' : profile?.plan === 'pro' ? 'text-lavender' : 'text-white'}>
                      {profile?.plan || 'Free'}
                    </span>
                  </p>
                  {profile?.plan === 'business' && (
                    <span className="px-3 py-1 bg-luxury-gradient text-white text-xs font-bold rounded-full">
                      BUSINESS
                    </span>
                  )}
                  {profile?.plan === 'pro' && (
                    <span className="px-3 py-1 bg-lavender/20 text-lavender text-xs font-bold rounded-full border border-lavender/30">
                      PRO
                    </span>
                  )}
                </div>
              </div>
              {profile?.plan !== 'business' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = '/dashboard/billing'}
                  className="px-6 py-3 bg-luxury-gradient rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-lavender/20"
                >
                  {profile?.plan === 'pro' ? 'Upgrade to Business' : 'Upgrade Plan'}
                </motion.button>
              )}
            </div>
            <p className="text-white/60 text-sm">
              {profile?.plan === 'business' ? (
                'You have full access to all GlamBooking features including custom branding, unlimited team members, and priority support.'
              ) : profile?.plan === 'pro' ? (
                'Upgrade to Business for custom branding, unlimited team members, and advanced features.'
              ) : (
                'Upgrade to Pro or Business for unlimited bookings, team collaboration, and advanced analytics.'
              )}
            </p>
          </div>
        </div>

        {/* Security Section */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blush/20 rounded-xl">
              <Shield className="w-6 h-6 text-blush" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-white">
              Security
            </h2>
          </div>

          <div className="space-y-3">
            <button className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-colors">
              <p className="text-white font-semibold mb-1">Change Password</p>
              <p className="text-white/60 text-sm">Update your account password</p>
            </button>
            <button className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-colors">
              <p className="text-white font-semibold mb-1">Two-Factor Authentication</p>
              <p className="text-white/60 text-sm">Add an extra layer of security</p>
            </button>
          </div>
        </div>

        {/* Save Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
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
                {saving ? "Saving..." : "Save Settings"}
              </>
            )}
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
}
