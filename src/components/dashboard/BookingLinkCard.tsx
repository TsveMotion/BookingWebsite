"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Link2, Copy, Check, ExternalLink } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export function BookingLinkCard() {
  const { user } = useUser();
  const [copied, setCopied] = useState(false);
  const businessSlug = user?.publicMetadata?.businessSlug as string | undefined;
  
  const bookingUrl = businessSlug 
    ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/book/${businessSlug}`
    : null;

  const handleCopy = async () => {
    if (bookingUrl) {
      await navigator.clipboard.writeText(bookingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!businessSlug) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 rounded-xl bg-lavender-gradient bg-opacity-20">
            <Link2 className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">Your Booking Page</h3>
        </div>
        <p className="text-white/60 text-sm mb-4">
          Complete your business profile to get your custom booking link
        </p>
        <a
          href="/dashboard/settings"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium"
        >
          Complete Profile
          <ExternalLink className="w-4 h-4" />
        </a>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-3 rounded-xl bg-lavender-gradient bg-opacity-20">
          <Link2 className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-white">Your Booking Page</h3>
      </div>
      
      <p className="text-white/60 text-sm mb-4">
        Share this link with clients so they can book appointments online
      </p>

      <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg mb-4 border border-white/10">
        <code className="flex-1 text-white/80 text-sm truncate">
          {bookingUrl}
        </code>
        <button
          onClick={handleCopy}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="Copy link"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-white/60" />
          )}
        </button>
      </div>

      <div className="flex gap-2">
        <a
          href={bookingUrl ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-luxury-gradient hover:opacity-90 text-white rounded-lg transition-opacity text-sm font-semibold"
        >
          View Page
          <ExternalLink className="w-4 h-4" />
        </a>
        <button
          onClick={handleCopy}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium"
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>
    </motion.div>
  );
}
