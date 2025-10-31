"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Plus,
  Edit,
  Trash2,
  Send,
  Pause,
  Play,
  ArrowLeft,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import CampaignModal from "@/components/modals/CampaignModal";

interface Campaign {
  id: string;
  name: string;
  type: string;
  subject: string;
  body: string;
  status: string;
  sentCount: number;
  lastSentAt: string | null;
  createdAt: string;
}

export default function CampaignsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<string>("free");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      checkAccessAndFetchData();
    }
  }, [isLoaded, user]);

  const checkAccessAndFetchData = async () => {
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

      // Fetch campaigns
      const campaignsRes = await fetch('/api/retention/campaigns');
      if (campaignsRes.ok) {
        const data = await campaignsRes.json();
        setCampaigns(data);
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      const res = await fetch(`/api/retention/campaigns/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setCampaigns(campaigns.filter(c => c.id !== id));
        toast.success('Campaign deleted');
      } else {
        toast.error('Failed to delete campaign');
      }
    } catch (error) {
      console.error('Failed to delete campaign:', error);
      toast.error('Failed to delete campaign');
    }
  };

  const toggleCampaignStatus = async (campaign: Campaign) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';

    try {
      const res = await fetch(`/api/retention/campaigns/${campaign.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        setCampaigns(campaigns.map(c => c.id === campaign.id ? updated : c));
        toast.success(`Campaign ${newStatus === 'active' ? 'activated' : 'paused'}`);
      } else {
        toast.error('Failed to update campaign');
      }
    } catch (error) {
      console.error('Failed to update campaign:', error);
      toast.error('Failed to update campaign');
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
          Loading campaigns...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/dashboard/loyalty"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Loyalty
            </Link>
            <div className="flex items-center gap-3">
              <Mail className="w-8 h-8 text-lavender" />
              <h1 className="text-4xl font-heading font-black text-white">
                Retention Campaigns
              </h1>
            </div>
            <p className="text-white/60 mt-2">
              Create and manage automated email campaigns to keep clients engaged
            </p>
          </div>
          <button
            onClick={() => setShowNewCampaignModal(true)}
            className="px-6 py-3 bg-luxury-gradient hover:opacity-90 text-white font-semibold rounded-lg transition-opacity flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Campaign
          </button>
        </div>

        {/* Campaigns List */}
        {campaigns.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Mail className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No campaigns yet</h3>
            <p className="text-white/60 mb-6">
              Create your first retention campaign to start engaging with clients
            </p>
            <button
              onClick={() => setShowNewCampaignModal(true)}
              className="px-6 py-3 bg-luxury-gradient text-white font-semibold rounded-lg hover:opacity-90 transition-opacity inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Campaign
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{campaign.name}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          campaign.status === 'active'
                            ? 'bg-green-500/20 text-green-400'
                            : campaign.status === 'paused'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-white/10 text-white/60'
                        }`}
                      >
                        {campaign.status.toUpperCase()}
                      </span>
                      <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-white">
                        {campaign.type}
                      </span>
                    </div>
                    <p className="text-white/80 mb-2">
                      <strong>Subject:</strong> {campaign.subject}
                    </p>
                    <p className="text-white/60 text-sm mb-4 line-clamp-2">
                      {campaign.body}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-white/60">
                      <div className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        <span>Sent: {campaign.sentCount}</span>
                      </div>
                      {campaign.lastSentAt && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Last: {new Date(campaign.lastSentAt).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Created: {new Date(campaign.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleCampaignStatus(campaign)}
                      className={`p-2 rounded-lg transition-colors ${
                        campaign.status === 'active'
                          ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                          : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      }`}
                      title={campaign.status === 'active' ? 'Pause' : 'Activate'}
                    >
                      {campaign.status === 'active' ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => setEditingCampaign(campaign)}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteCampaign(campaign.id)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* New/Edit Campaign Modal */}
      <CampaignModal
        isOpen={showNewCampaignModal || !!editingCampaign}
        onClose={() => {
          setShowNewCampaignModal(false);
          setEditingCampaign(null);
        }}
        campaign={editingCampaign}
        onSaved={() => {
          checkAccessAndFetchData();
        }}
      />
    </div>
  );
}
