"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, Send, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface SendSmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientPhone: string;
  clientName: string;
  bookingId?: string;
  serviceName?: string;
  bookingDate?: string;
  bookingTime?: string;
  onSmsSent?: () => void;
}

export default function SendSmsModal({
  isOpen,
  onClose,
  clientPhone,
  clientName,
  bookingId,
  serviceName,
  bookingDate,
  bookingTime,
  onSmsSent,
}: SendSmsModalProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Pre-fill template message
  const handleUseTemplate = () => {
    const template = `Hi ${clientName}! ${
      serviceName
        ? `This is a reminder about your ${serviceName} appointment${
            bookingDate ? ` on ${bookingDate}` : ""
          }${bookingTime ? ` at ${bookingTime}` : ""}.`
        : "This is a message from your salon."
    } Looking forward to seeing you!`;
    setMessage(template);
  };

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (!clientPhone) {
      toast.error("Client has no phone number");
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: clientPhone,
          message: message.trim(),
          clientName,
          bookingId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`SMS sent! ${data.creditsRemaining} credits remaining`);
        setMessage("");
        onSmsSent?.();
        onClose();
      } else {
        toast.error(data.error || "Failed to send SMS");
      }
    } catch (error) {
      console.error("SMS send error:", error);
      toast.error("Failed to send SMS");
    } finally {
      setSending(false);
    }
  };

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card p-6 w-full max-w-md relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-rose-400 to-amber-300 rounded-xl">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-heading font-bold text-white">
                    Send SMS
                  </h2>
                  <p className="text-white/60 text-sm">To: {clientName}</p>
                </div>
              </div>

              {/* Phone Display */}
              <div className="mb-4 p-3 bg-white/5 rounded-lg">
                <p className="text-white/60 text-xs mb-1">Phone Number</p>
                <p className="text-white font-mono">{clientPhone}</p>
              </div>

              {/* Template Button */}
              {serviceName && (
                <button
                  onClick={handleUseTemplate}
                  className="mb-4 text-sm text-lavender hover:text-lavender/80 transition-colors"
                >
                  ✨ Use reminder template
                </button>
              )}

              {/* Message Input */}
              <div className="mb-6">
                <label className="text-white/80 text-sm mb-2 block">
                  Message ({message.length}/160)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={5}
                  maxLength={160}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lavender/50 resize-none"
                />
                <p className="text-white/40 text-xs mt-1">
                  1 SMS credit will be deducted
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={sending || !message.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-400 to-amber-300 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-rose-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send SMS
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
