"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  Gift,
  ArrowLeft,
  Save,
  Settings as SettingsIcon,
  Award,
  Target,
  TrendingUp,
  DollarSign,
  Percent,
  Info,
  Power,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface LoyaltySettings {
  enabled: boolean;
  pointsPerPound: number;
  bonusPerBooking: number;
  redemptionRate: number;
  minimumRedemption: number;
  welcomeBonus: number;
}

export default function LoyaltySettingsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userPlan, setUserPlan] = useState<string>("free");
  
  const [settings, setSettings] = useState<LoyaltySettings>({
    enabled: true,
    pointsPerPound: 1,
    bonusPerBooking: 10,
    redemptionRate: 100,
    minimumRedemption: 100,
    welcomeBonus: 50,
  });

  useEffect(() => {
    if (isLoaded && user) {
      checkAccessAndFetchSettings();
    }
  }, [isLoaded, user]);

  const checkAccessAndFetchSettings = async () => {
    try {
      const profileRes = await fetch('/api/profile');
      if (profileRes.ok) {
        const profile = await profileRes.json();
        setUserPlan(profile.plan || 'free');

        if (profile.plan === 'free') {
          router.push('/dashboard/loyalty');
          return;
        }
      }

      // Fetch actual settings
      const settingsRes = await fetch('/api/loyalty/settings');
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings({
          enabled: data.enabled,
          pointsPerPound: data.pointsPerPound,
          bonusPerBooking: data.bonusPerBooking,
          redemptionRate: data.redemptionRate,
          minimumRedemption: data.minimumRedemption,
          welcomeBonus: data.welcomeBonus,
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const response = await fetch('/api/loyalty/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success('Settings saved successfully!');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
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
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/loyalty"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Loyalty
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="w-8 h-8 text-lavender" />
            <h1 className="text-4xl font-heading font-black text-white">
              Loyalty Points Settings
            </h1>
          </div>
          <p className="text-white/60">
            Configure how clients earn and redeem loyalty points
          </p>
        </div>

        {/* Loyalty Program Toggle */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-rose-400 to-amber-300">
                <Power className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Loyalty Program Status</h2>
                <p className="text-white/60 text-sm">Enable or disable loyalty points for all bookings</p>
              </div>
            </div>
            <button
              onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                settings.enabled ? 'bg-gradient-to-r from-rose-400 to-amber-300' : 'bg-white/20'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  settings.enabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="mt-4 p-3 bg-white/5 rounded-lg">
            <p className="text-sm text-white/70">
              {settings.enabled ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Loyalty program is <strong className="text-green-400">ACTIVE</strong> - Points are being awarded and can be redeemed
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                  Loyalty program is <strong className="text-red-400">DISABLED</strong> - No points will be awarded or redeemed
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Settings Cards */}
        <div className="space-y-6">
          {/* Points Earning */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-luxury-gradient bg-opacity-20">
                <TrendingUp className="w-6 h-6 text-lavender" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Points Earning</h2>
                <p className="text-white/60 text-sm">Configure how clients earn points</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white font-semibold mb-2">
                  Points per £1 spent
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={settings.pointsPerPound}
                    onChange={(e) => setSettings({ ...settings, pointsPerPound: parseFloat(e.target.value) || 0 })}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-lavender transition-colors"
                  />
                  <div className="flex items-center gap-2 text-white/60">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">£1 = {settings.pointsPerPound} points</span>
                  </div>
                </div>
                <p className="text-white/40 text-sm mt-2">
                  Clients earn points based on their spending amount
                </p>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Bonus points per booking
                </label>
                <input
                  type="number"
                  min="0"
                  value={settings.bonusPerBooking}
                  onChange={(e) => setSettings({ ...settings, bonusPerBooking: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-lavender transition-colors"
                />
                <p className="text-white/40 text-sm mt-2">
                  Extra points awarded for each completed booking
                </p>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Welcome bonus points
                </label>
                <input
                  type="number"
                  min="0"
                  value={settings.welcomeBonus}
                  onChange={(e) => setSettings({ ...settings, welcomeBonus: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-lavender transition-colors"
                />
                <p className="text-white/40 text-sm mt-2">
                  Points awarded to new clients on their first booking
                </p>
              </div>

            </div>
          </div>

          {/* Points Redemption */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-luxury-gradient bg-opacity-20">
                <Award className="w-6 h-6 text-lavender" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Points Redemption</h2>
                <p className="text-white/60 text-sm">Configure how points are redeemed</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white font-semibold mb-2">
                  Redemption rate
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="1"
                    value={settings.redemptionRate}
                    onChange={(e) => setSettings({ ...settings, redemptionRate: parseInt(e.target.value) || 100 })}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-lavender transition-colors"
                  />
                  <div className="flex items-center gap-2 text-white/60">
                    <Percent className="w-4 h-4" />
                    <span className="text-sm">{settings.redemptionRate} pts = £1</span>
                  </div>
                </div>
                <p className="text-white/40 text-sm mt-2">
                  How many points equal £1 discount
                </p>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Minimum redemption
                </label>
                <input
                  type="number"
                  min="0"
                  value={settings.minimumRedemption}
                  onChange={(e) => setSettings({ ...settings, minimumRedemption: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-lavender transition-colors"
                />
                <p className="text-white/40 text-sm mt-2">
                  Minimum points required to redeem (prevents small redemptions)
                </p>
              </div>
            </div>
          </div>

          {/* Preview/Example */}
          <div className="glass-card p-6 bg-gradient-to-br from-lavender/10 to-pink/10">
            <div className="flex items-center gap-3 mb-4">
              <Info className="w-6 h-6 text-lavender" />
              <h3 className="text-xl font-bold text-white">Example Scenario</h3>
            </div>
            <div className="space-y-3 text-white/80">
              <p>
                <strong>Client books a £50 haircut:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-white/60">
                <li>Earns {settings.pointsPerPound * 50} points from spending (£50 × {settings.pointsPerPound})</li>
                <li>Earns {settings.bonusPerBooking} bonus points per booking</li>
                <li><strong>Total: {(settings.pointsPerPound * 50) + settings.bonusPerBooking} points</strong></li>
              </ul>
              <p className="mt-4">
                <strong>To redeem £10 discount:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-white/60">
                <li>Client needs {settings.redemptionRate * 10} points (£10 × {settings.redemptionRate})</li>
                <li>Minimum redemption: {settings.minimumRedemption} points = £{(settings.minimumRedemption / settings.redemptionRate).toFixed(2)}</li>
              </ul>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-4">
            <Link
              href="/dashboard/loyalty"
              className="flex-1 px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-6 py-4 bg-luxury-gradient hover:opacity-90 text-white font-semibold rounded-lg transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Gift className="w-5 h-5" />
                  </motion.div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Settings
                </>
              )}
            </button>
          </div>

          {/* Info Banner */}
          <div className="glass-card p-4 bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-white/70">
                <strong className="text-white">Note:</strong> These settings apply to all future bookings. 
                Existing client point balances will not be affected. Points are only awarded when bookings 
                are marked as &quot;completed&quot; in your dashboard.
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
