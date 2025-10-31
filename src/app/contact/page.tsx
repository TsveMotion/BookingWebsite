import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Metadata } from "next";
import { Mail, MapPin, Phone, Send } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us — GlamBooking",
  description: "Get in touch with the GlamBooking team. We're here to help beauty professionals succeed.",
  openGraph: {
    title: "Contact Us — GlamBooking",
    description: "Get in touch with the GlamBooking team. We're here to help beauty professionals succeed.",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-black pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          {/* Header */}
          <div className="mb-16 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white mb-4">
              <span className="gradient-text">Get in Touch</span>
            </h1>
            <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="glass-card p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>
                
                <div className="space-y-6">
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-rose-gradient flex-shrink-0">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">Email</h3>
                      <a 
                        href="mailto:hello@glambooking.co.uk" 
                        className="text-pink-400 hover:text-pink-300 transition-colors"
                      >
                        hello@glambooking.co.uk
                      </a>
                      <p className="text-white/60 text-sm mt-1">
                        We typically respond within 24 hours
                      </p>
                    </div>
                  </div>

                  {/* Support Email */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-lavender-gradient flex-shrink-0">
                      <Send className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">Support</h3>
                      <a 
                        href="mailto:support@glambooking.co.uk" 
                        className="text-pink-400 hover:text-pink-300 transition-colors"
                      >
                        support@glambooking.co.uk
                      </a>
                      <p className="text-white/60 text-sm mt-1">
                        For technical support and assistance
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-blush-gradient flex-shrink-0">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">Location</h3>
                      <p className="text-white/70">
                        United Kingdom
                      </p>
                      <p className="text-white/60 text-sm mt-1">
                        Serving beauty professionals nationwide
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="glass-card p-8">
                <h2 className="text-xl font-bold text-white mb-4">Quick Links</h2>
                <div className="grid grid-cols-2 gap-3">
                  <a 
                    href="/help" 
                    className="text-white/70 hover:text-pink-400 text-sm transition-colors"
                  >
                    → Help Center
                  </a>
                  <a 
                    href="/pricing" 
                    className="text-white/70 hover:text-pink-400 text-sm transition-colors"
                  >
                    → Pricing
                  </a>
                  <a 
                    href="/features" 
                    className="text-white/70 hover:text-pink-400 text-sm transition-colors"
                  >
                    → Features
                  </a>
                  <a 
                    href="/privacy" 
                    className="text-white/70 hover:text-pink-400 text-sm transition-colors"
                  >
                    → Privacy Policy
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>
              
              <form className="space-y-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-white font-medium mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400/50 transition-all"
                    placeholder="Your name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-white font-medium mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400/50 transition-all"
                    placeholder="your@email.com"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-white font-medium mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400/50 transition-all"
                    placeholder="How can we help?"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-white font-medium mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400/50 transition-all resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-luxury-gradient text-white font-semibold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </button>

                <p className="text-white/40 text-sm text-center">
                  By submitting this form, you agree to our{" "}
                  <a href="/privacy" className="text-pink-400 hover:underline">
                    Privacy Policy
                  </a>
                </p>
              </form>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16 glass-card p-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-white font-semibold mb-2">What are your support hours?</h3>
                <p className="text-white/70 text-sm">
                  Our team is available Monday-Friday, 9am-6pm GMT. We respond to all emails within 24 hours.
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Do you offer phone support?</h3>
                <p className="text-white/70 text-sm">
                  Currently, we provide support via email and live chat. For urgent issues, please email support@glambooking.co.uk.
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Can I schedule a demo?</h3>
                <p className="text-white/70 text-sm">
                  Yes! Email us at hello@glambooking.co.uk to schedule a personalized demo of our platform.
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">How do I report a bug?</h3>
                <p className="text-white/70 text-sm">
                  Please email support@glambooking.co.uk with details about the issue, including screenshots if possible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
