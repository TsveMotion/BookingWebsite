import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — GlamBooking",
  description: "Learn how GlamBooking protects your data and keeps your business information secure.",
  openGraph: {
    title: "Privacy Policy — GlamBooking",
    description: "Learn how GlamBooking protects your data and keeps your business information secure.",
    type: "website",
  },
};

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-black pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-4">
              <span className="gradient-text">Privacy Policy</span>
            </h1>
            <p className="text-white/60 text-lg">
              Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

          {/* Content */}
          <div className="glass-card p-8 md:p-12 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
              <p className="text-white/70 leading-relaxed">
                At GlamBooking, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, 
                and safeguard your information when you use our platform. Please read this privacy policy carefully. 
                If you do not agree with the terms of this privacy policy, please do not access the site.
              </p>
            </section>

            {/* What Data We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">What Data We Collect</h2>
              <div className="space-y-4 text-white/70 leading-relaxed">
                <p>We collect information that you provide directly to us, including:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Account information (name, email address, phone number)</li>
                  <li>Business information (business name, address, services offered)</li>
                  <li>Payment information (processed securely through Stripe)</li>
                  <li>Client data you enter into the platform</li>
                  <li>Booking and appointment details</li>
                  <li>Communications with our support team</li>
                </ul>
                <p className="mt-4">We also automatically collect certain information when you use our platform:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Log data (IP address, browser type, pages visited)</li>
                  <li>Device information</li>
                  <li>Cookies and similar tracking technologies</li>
                  <li>Usage data and analytics</li>
                </ul>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">How We Use Your Information</h2>
              <div className="space-y-4 text-white/70 leading-relaxed">
                <p>We use the information we collect to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process your bookings and transactions</li>
                  <li>Send you booking confirmations, reminders, and notifications</li>
                  <li>Provide customer support and respond to your requests</li>
                  <li>Send you marketing communications (with your consent)</li>
                  <li>Detect, prevent, and address technical issues and fraud</li>
                  <li>Analyze usage patterns to improve user experience</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>
            </section>

            {/* Data Sharing and Disclosure */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Data Sharing and Disclosure</h2>
              <div className="space-y-4 text-white/70 leading-relaxed">
                <p>We do not sell your personal information. We may share your information with:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Service Providers:</strong> Third parties who help us operate our platform (e.g., Stripe for payments, Clerk for authentication)</li>
                  <li><strong>Business Partners:</strong> With your consent, to provide services you've requested</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                </ul>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Data Security</h2>
              <p className="text-white/70 leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information. 
                This includes encryption, secure servers, and regular security audits. However, no method of transmission over 
                the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Data Retention</h2>
              <p className="text-white/70 leading-relaxed">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, 
                unless a longer retention period is required or permitted by law. When you delete your account, we will delete or 
                anonymize your personal information within 30 days, except where we need to retain it for legal compliance.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Your Rights</h2>
              <div className="space-y-4 text-white/70 leading-relaxed">
                <p>Depending on your location, you may have the following rights:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Access and receive a copy of your personal data</li>
                  <li>Correct inaccurate or incomplete data</li>
                  <li>Request deletion of your data</li>
                  <li>Object to or restrict processing of your data</li>
                  <li>Data portability</li>
                  <li>Withdraw consent at any time</li>
                </ul>
                <p className="mt-4">
                  To exercise these rights, please contact us at{" "}
                  <a href="mailto:privacy@glambooking.co.uk" className="text-pink-400 hover:text-pink-300 underline">
                    privacy@glambooking.co.uk
                  </a>
                </p>
              </div>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Cookies and Tracking</h2>
              <p className="text-white/70 leading-relaxed">
                We use cookies and similar tracking technologies to track activity on our platform and hold certain information. 
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, 
                if you do not accept cookies, you may not be able to use some portions of our service.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Children's Privacy</h2>
              <p className="text-white/70 leading-relaxed">
                Our service is not intended for children under the age of 18. We do not knowingly collect personal information 
                from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, 
                please contact us.
              </p>
            </section>

            {/* Changes to This Policy */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Changes to This Privacy Policy</h2>
              <p className="text-white/70 leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy 
                on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            {/* Contact */}
            <section className="border-t border-white/10 pt-8">
              <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
              <div className="text-white/70 leading-relaxed space-y-2">
                <p>If you have any questions about this Privacy Policy, please contact us:</p>
                <ul className="space-y-1 ml-4">
                  <li>
                    Email:{" "}
                    <a href="mailto:privacy@glambooking.co.uk" className="text-pink-400 hover:text-pink-300 underline">
                      privacy@glambooking.co.uk
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
