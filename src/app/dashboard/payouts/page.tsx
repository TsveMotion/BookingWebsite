"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, 
  Download, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Calendar,
  ArrowUpRight
} from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: string;
  platformFee: number;
  stripeFee: number;
  netAmount: number;
  payoutDate: string | null;
  bookingId: string | null;
  createdAt: string;
  metadata?: {
    serviceName?: string;
    clientName?: string;
    bookingDate?: string;
  };
}

interface PayoutSummary {
  availableBalance: number;
  pendingBalance: number;
  totalEarnings: number;
  totalPlatformFees: number;
  totalStripeFees: number;
}

export default function PayoutsPage() {
  const [requestingPayout, setRequestingPayout] = useState(false);

  const { data, error, isLoading, mutate } = useSWR<{
    payouts: Payout[];
    summary: PayoutSummary;
    needsStripeAccount?: boolean;
    message?: string;
  }>("/api/payouts", fetcher);

  const handleRequestPayout = async () => {
    if (!data?.summary.availableBalance || data.summary.availableBalance <= 0) {
      alert("No funds available for payout");
      return;
    }

    if (!confirm(`Request payout of £${(data.summary.availableBalance / 100).toFixed(2)}?`)) {
      return;
    }

    setRequestingPayout(true);
    try {
      const response = await fetch("/api/payouts/request", {
        method: "POST",
      });

      const result = await response.json();

      if (response.ok) {
        alert("Payout requested successfully!");
        mutate(); // Refresh data
      } else {
        alert(result.error || "Failed to request payout");
      }
    } catch (error) {
      console.error("Error requesting payout:", error);
      alert("Failed to request payout. Please try again.");
    } finally {
      setRequestingPayout(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "processing":
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-400 bg-green-400/10";
      case "processing":
        return "text-yellow-400 bg-yellow-400/10";
      case "failed":
        return "text-red-400 bg-red-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-lavender/30 border-t-lavender rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading payouts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400">Failed to load payouts</p>
        </div>
      </div>
    );
  }

  const { payouts = [], summary } = data || {};

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-black text-white mb-2">
          Payouts & Earnings
        </h1>
        <p className="text-white/60">
          Track your completed and upcoming payouts
        </p>
      </div>

      {/* Stripe Account Warning */}
      {data?.needsStripeAccount && (
        <div className="bg-yellow-900/40 border border-yellow-700 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-yellow-400 text-sm font-medium">
                <span className="font-semibold">Stripe Account Required:</span> {data.message || "Connect your Stripe account in Settings to receive payouts from bookings."}
              </p>
              <a 
                href="/dashboard/settings"
                className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-luxury-gradient text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-all"
              >
                Go to Settings
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Available Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl shadow-sm p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/60 text-sm">Available for Payout</p>
            <DollarSign className="w-5 h-5 text-lavender" />
          </div>
          <p className="text-3xl font-bold text-white mb-4">
            £{((summary?.availableBalance || 0) / 100).toFixed(2)}
          </p>
          <button
            onClick={handleRequestPayout}
            disabled={requestingPayout || !summary?.availableBalance || summary.availableBalance <= 0}
            className="w-full px-4 py-2 bg-luxury-gradient text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
          >
            {requestingPayout ? (
              "Processing..."
            ) : (
              <>
                <ArrowUpRight className="w-4 h-4" />
                Request Payout
              </>
            )}
          </button>
        </motion.div>

        {/* Pending Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl shadow-sm p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/60 text-sm">Pending</p>
            <Clock className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-white">
            £{((summary?.pendingBalance || 0) / 100).toFixed(2)}
          </p>
          <p className="text-white/40 text-xs mt-2">In processing</p>
        </motion.div>

        {/* Total Earnings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl shadow-sm p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/60 text-sm">Total Earnings</p>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-white">
            £{((summary?.totalEarnings || 0) / 100).toFixed(2)}
          </p>
          <p className="text-white/40 text-xs mt-2">All time</p>
        </motion.div>

        {/* Platform Fees */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl shadow-sm p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/60 text-sm">Platform Fees Paid</p>
            <DollarSign className="w-5 h-5 text-white/40" />
          </div>
          <p className="text-3xl font-bold text-white">
            £{((summary?.totalPlatformFees || 0) / 100).toFixed(2)}
          </p>
          <p className="text-white/40 text-xs mt-2">0% commission</p>
        </motion.div>
      </div>

      {/* Recent Payouts */}
      <div className="bg-card rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Recent Payouts</h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => mutate()}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all text-sm">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {payouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-muted-foreground py-12">
            <DollarSign className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/60 mb-2">No payouts yet</p>
            <p className="text-white/40 text-sm">
              Your payouts will appear here once you receive booking payments
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-white/60 font-semibold text-sm">Date</th>
                  <th className="text-left py-3 px-4 text-white/60 font-semibold text-sm">Description</th>
                  <th className="text-left py-3 px-4 text-white/60 font-semibold text-sm">Amount</th>
                  <th className="text-left py-3 px-4 text-white/60 font-semibold text-sm">Fees</th>
                  <th className="text-left py-3 px-4 text-white/60 font-semibold text-sm">Net Amount</th>
                  <th className="text-left py-3 px-4 text-white/60 font-semibold text-sm">Status</th>
                  <th className="text-left py-3 px-4 text-white/60 font-semibold text-sm">Payout Date</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr
                    key={payout.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-4 text-white/80 text-sm">
                      {new Date(payout.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-4 px-4 text-white text-sm">
                      {payout.metadata?.serviceName && payout.metadata?.clientName ? (
                        <div>
                          <p className="font-medium">{payout.metadata.serviceName}</p>
                          <p className="text-white/60 text-xs">{payout.metadata.clientName}</p>
                        </div>
                      ) : payout.bookingId ? (
                        `Booking #${payout.bookingId.slice(0, 8)}`
                      ) : (
                        "Manual payout"
                      )}
                    </td>
                    <td className="py-4 px-4 text-white font-semibold text-sm">
                      £{(payout.amount / 100).toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-white/60 text-sm">
                      -£{((payout.platformFee + payout.stripeFee) / 100).toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-white font-bold text-sm">
                      £{(payout.netAmount / 100).toFixed(2)}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(payout.status)}`}>
                        {getStatusIcon(payout.status)}
                        {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-white/80 text-sm">
                      {payout.payoutDate ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(payout.payoutDate).toLocaleDateString('en-GB')}
                        </div>
                      ) : (
                        <span className="text-white/40">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-card rounded-2xl shadow-sm p-6 border border-lavender/20">
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-lavender" />
          How Payouts Work
        </h3>
        <ul className="space-y-2 text-white/70 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-lavender mt-0.5">•</span>
            <span>GlamBooking charges <strong className="text-white">0% commission</strong> on bookings</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lavender mt-0.5">•</span>
            <span>Stripe processing fees (<strong className="text-white">1.5% + 20p for UK cards</strong>, up to 2.9% + 20p for international cards) are deducted from payouts</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lavender mt-0.5">•</span>
            <span>Automatic transfers are created immediately after client payment</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lavender mt-0.5">•</span>
            <span>Funds typically arrive in your UK bank account within <strong className="text-white">2–3 business days</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lavender mt-0.5">•</span>
            <span>You can request manual payouts when you have available balance</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lavender mt-0.5">•</span>
            <span>Currently supporting <strong className="text-white">UK salons and GBP payments only</strong></span>
          </li>
        </ul>
      </div>
    </div>
  );
}
