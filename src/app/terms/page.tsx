import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — GlamBooking",
  description: "Read GlamBooking's terms of service and policies for our platform and features.",
  openGraph: {
    title: "Terms of Service — GlamBooking",
    description: "Read GlamBooking's terms of service and policies for our platform and features.",
    type: "website",
  },
};

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-black pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-4">
              <span className="gradient-text">Terms of Service</span>
            </h1>
            <p className="text-white/60 text-lg">
              Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

          {/* Content */}
          <div className="glass-card p-8 md:p-12 space-y-8">
            {/* Agreement Overview */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Agreement Overview</h2>
              <p className="text-white/70 leading-relaxed">
                Welcome to GlamBooking. By accessing or using our platform, you agree to be bound by these Terms of Service 
                and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited 
                from using or accessing this site.
              </p>
            </section>

            {/* Use License */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Use License</h2>
              <div className="space-y-4 text-white/70 leading-relaxed">
                <p>
                  Permission is granted to temporarily use GlamBooking for personal or commercial booking management purposes. 
                  This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Modify or copy the platform materials</li>
                  <li>Use the materials for any commercial purpose without proper subscription</li>
                  <li>Attempt to reverse engineer any software contained on GlamBooking</li>
                  <li>Remove any copyright or proprietary notations from the materials</li>
                  <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                </ul>
                <p className="mt-4">
                  This license shall automatically terminate if you violate any of these restrictions and may be terminated 
                  by GlamBooking at any time.
                </p>
              </div>
            </section>

            {/* Account Responsibilities */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Account Responsibilities</h2>
              <div className="space-y-4 text-white/70 leading-relaxed">
                <p>When you create an account with us, you agree to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Accept responsibility for all activities that occur under your account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                  <li>Not share your account with others</li>
                  <li>Use the platform in compliance with all applicable laws</li>
                </ul>
                <p className="mt-4">
                  We reserve the right to refuse service, terminate accounts, remove or edit content, or cancel bookings 
                  at our sole discretion.
                </p>
              </div>
            </section>

            {/* Payments & Fees */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Payments & Fees</h2>
              <div className="space-y-4 text-white/70 leading-relaxed">
                <p><strong>Subscription Plans:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Free Plan: No monthly fee, basic features included</li>
                  <li>Pro Plan: £19/month, includes advanced features and analytics</li>
                  <li>Business Plan: £39/month, includes all Pro features plus custom branding and team management</li>
                </ul>
                <p className="mt-4"><strong>Transaction Fees:</strong></p>
                <p>
                  A 1.99% transaction fee applies to all bookings processed through the platform. This is the lowest 
                  booking fee in the UK market.
                </p>
                <p className="mt-4"><strong>Payment Processing:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>All payments are processed securely through Stripe</li>
                  <li>Subscription fees are billed monthly in advance</li>
                  <li>Transaction fees are deducted from booking payments</li>
                  <li>Refunds are subject to our refund policy</li>
                </ul>
                <p className="mt-4"><strong>Price Changes:</strong></p>
                <p>
                  We reserve the right to modify our pricing with 30 days' notice. Price changes will not affect your 
                  current billing cycle.
                </p>
              </div>
            </section>

            {/* Cancellation & Refunds */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Cancellation & Refunds</h2>
              <div className="space-y-4 text-white/70 leading-relaxed">
                <p><strong>Subscription Cancellation:</strong></p>
                <p>
                  You may cancel your subscription at any time. Cancellations take effect at the end of your current 
                  billing period. You will retain access to paid features until the end of that period.
                </p>
                <p className="mt-4"><strong>Refund Policy:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Monthly subscriptions: No refunds for partial months</li>
                  <li>Transaction fees: Non-refundable once processing is complete</li>
                  <li>First-time subscribers: 14-day money-back guarantee on first payment</li>
                </ul>
              </div>
            </section>

            {/* User Content */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">User Content</h2>
              <div className="space-y-4 text-white/70 leading-relaxed">
                <p>
                  You retain ownership of any content you upload to GlamBooking, including client data, service descriptions, 
                  images, and business information. By uploading content, you grant us a license to use, store, and display 
                  that content for the purpose of providing our services to you.
                </p>
                <p className="mt-4">You are responsible for ensuring that:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You have the right to upload and use all content</li>
                  <li>Your content does not violate any laws or third-party rights</li>
                  <li>Your content is not offensive, defamatory, or inappropriate</li>
                  <li>You maintain appropriate backups of your data</li>
                </ul>
              </div>
            </section>

            {/* Service Availability */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Service Availability</h2>
              <p className="text-white/70 leading-relaxed">
                We strive to provide 99.9% uptime but cannot guarantee uninterrupted access to our platform. We may 
                perform scheduled maintenance with advance notice. We are not liable for any losses resulting from 
                service interruptions.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Limitation of Liability</h2>
              <div className="space-y-4 text-white/70 leading-relaxed">
                <p>
                  GlamBooking and its suppliers shall not be liable for any damages (including, without limitation, 
                  damages for loss of data or profit, or due to business interruption) arising out of the use or 
                  inability to use the platform, even if we have been notified of the possibility of such damage.
                </p>
                <p className="mt-4">
                  Our total liability to you for all claims arising from your use of the platform shall not exceed 
                  the amount you paid us in the 12 months preceding the claim.
                </p>
              </div>
            </section>

            {/* Indemnification */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Indemnification</h2>
              <p className="text-white/70 leading-relaxed">
                You agree to indemnify and hold harmless GlamBooking, its officers, directors, employees, and agents 
                from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your 
                use of the platform, your violation of these Terms, or your violation of any rights of another party.
              </p>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Termination</h2>
              <div className="space-y-4 text-white/70 leading-relaxed">
                <p>
                  We may terminate or suspend your account and access to the platform immediately, without prior notice 
                  or liability, for any reason, including breach of these Terms.
                </p>
                <p className="mt-4">Upon termination:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Your right to use the platform will cease immediately</li>
                  <li>You may export your data within 30 days</li>
                  <li>We will delete your data after 30 days (subject to legal requirements)</li>
                  <li>Outstanding fees remain payable</li>
                </ul>
              </div>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Governing Law</h2>
              <p className="text-white/70 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of England and Wales, 
                without regard to its conflict of law provisions. Any disputes shall be resolved in the courts of 
                England and Wales.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Changes to Terms</h2>
              <p className="text-white/70 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify you of material changes via 
                email or through the platform. Your continued use of GlamBooking after changes are posted constitutes 
                acceptance of the new Terms.
              </p>
            </section>

            {/* Contact */}
            <section className="border-t border-white/10 pt-8">
              <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
              <div className="text-white/70 leading-relaxed space-y-2">
                <p>If you have any questions about these Terms of Service, please contact us:</p>
                <ul className="space-y-1 ml-4">
                  <li>
                    Email:{" "}
                    <a href="mailto:legal@glambooking.co.uk" className="text-pink-400 hover:text-pink-300 underline">
                      legal@glambooking.co.uk
                    </a>
                  </li>
                  <li>
                    Support:{" "}
                    <a href="mailto:hello@glambooking.co.uk" className="text-pink-400 hover:text-pink-300 underline">
                      hello@glambooking.co.uk
                    </a>
                  </li>
                  <li>
                    Website:{" "}
                    <a href="/help" className="text-pink-400 hover:text-pink-300 underline">
                      Help Center
                    </a>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
