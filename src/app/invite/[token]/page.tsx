"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function InviteAcceptPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [validating, setValidating] = useState(true);
  const [inviteData, setInviteData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await fetch(`/api/invite/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setInviteData(data);
        // Store invitation token in localStorage for after Clerk signup
        localStorage.setItem('pendingInviteToken', token);
        localStorage.setItem('pendingInviteEmail', data.email);
        setValidating(false);
      } else {
        setError(data.error || "Invalid or expired invitation");
        setValidating(false);
      }
    } catch (err) {
      setError("Failed to validate invitation");
      setValidating(false);
    }
  };

  const handleAcceptInvite = () => {
    // Redirect to Clerk sign-up with email pre-filled
    const signUpUrl = `/sign-up?redirect_url=/dashboard&email=${encodeURIComponent(inviteData.email)}`;
    router.push(signUpUrl);
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-950/20 to-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-lavender animate-spin mx-auto mb-4" />
          <p className="text-white/60">Validating invitation...</p>
        </motion.div>
      </div>
    );
  }

  if (error && !inviteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-950/20 to-black p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full glass-card p-8 text-center"
        >
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Invalid Invitation</h1>
          <p className="text-white/60 mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-luxury-gradient rounded-xl text-white font-bold"
          >
            Go to Homepage
          </motion.button>
        </motion.div>
      </div>
    );
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-950/20 to-black p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Header Card */}
        <div className="glass-card p-8 mb-6 text-center">
          <div className="w-16 h-16 rounded-full bg-luxury-gradient flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Join {inviteData?.businessName || "GlamBooking"}
          </h1>
          <p className="text-white/60">
            You've been invited as a <span className="text-lavender font-semibold">{inviteData?.role}</span>
          </p>
          <p className="text-white/40 text-sm mt-2">{inviteData?.email}</p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-8">
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-white/80 mb-4">
                Click below to create your account and join the team. You can sign up with email, Google, or other social accounts.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Accept Button */}
            <motion.button
              onClick={handleAcceptInvite}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-4 bg-luxury-gradient text-white font-bold rounded-xl shadow-lg shadow-lavender/30 hover:shadow-lavender/50 transition-all"
            >
              Accept Invitation & Create Account
            </motion.button>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-white/60 text-sm">
                ✨ <strong className="text-white">Multiple Sign-Up Options:</strong> Email, Google, and more
              </p>
              <p className="text-white/60 text-sm mt-2">
                🔒 <strong className="text-white">Secure:</strong> Powered by Clerk authentication
              </p>
            </div>
          </div>

          <p className="text-white/40 text-xs text-center mt-6">
            By creating an account, you agree to GlamBooking's Terms of Service and Privacy Policy.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
