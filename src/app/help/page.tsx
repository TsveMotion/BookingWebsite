import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Metadata } from "next";
import Link from "next/link";
import { 
  BookOpen, 
  Calendar, 
  CreditCard, 
  Users, 
  Settings, 
  MessageCircle,
  Mail,
  FileText,
  Sparkles,
  HelpCircle
} from "lucide-react";

export const metadata: Metadata = {
  title: "Help Center — GlamBooking",
  description: "Get support, tutorials, and answers for your GlamBooking account.",
  openGraph: {
    title: "Help Center — GlamBooking",
    description: "Get support, tutorials, and answers for your GlamBooking account.",
    type: "website",
  },
};

const helpCategories = [
  {
    icon: BookOpen,
    title: "Getting Started",
    description: "Learn the basics of GlamBooking",
    articles: [
      { title: "Creating your account", href: "#getting-started" },
      { title: "Setting up your business profile", href: "#getting-started" },
      { title: "Adding your first service", href: "#getting-started" },
      { title: "Customizing your booking page", href: "#getting-started" },
      { title: "Understanding subscription plans", href: "#getting-started" },
    ],
  },
  {
    icon: Calendar,
    title: "Managing Appointments",
    description: "Book, edit, and manage client appointments",
    articles: [
      { title: "Creating a booking", href: "#appointments" },
      { title: "Managing your calendar", href: "#appointments" },
      { title: "Setting availability hours", href: "#appointments" },
      { title: "Sending appointment reminders", href: "#appointments" },
      { title: "Handling cancellations", href: "#appointments" },
    ],
  },
  {
    icon: Users,
    title: "Client Management",
    description: "Track and manage your client relationships",
    articles: [
      { title: "Adding new clients", href: "#clients" },
      { title: "Client profiles and history", href: "#clients" },
      { title: "Client communication", href: "#clients" },
      { title: "Managing client notes", href: "#clients" },
      { title: "Loyalty programs", href: "#clients" },
    ],
  },
  {
    icon: CreditCard,
    title: "Billing & Subscriptions",
    description: "Payments, invoices, and subscription management",
    articles: [
      { title: "Understanding pricing plans", href: "#billing" },
      { title: "Payment processing with Stripe", href: "#billing" },
      { title: "Transaction fees explained", href: "#billing" },
      { title: "Upgrading or downgrading plans", href: "#billing" },
      { title: "Cancellation and refunds", href: "#billing" },
    ],
  },
  {
    icon: Settings,
    title: "Settings & Customization",
    description: "Personalize your GlamBooking experience",
    articles: [
      { title: "Business settings", href: "#settings" },
      { title: "Custom branding (Business Plan)", href: "#settings" },
      { title: "Team member management", href: "#settings" },
      { title: "Notification preferences", href: "#settings" },
      { title: "Integration setup", href: "#settings" },
    ],
  },
  {
    icon: Sparkles,
    title: "Pro Features",
    description: "Advanced features for Pro and Business plans",
    articles: [
      { title: "Analytics dashboard", href: "#pro-features" },
      { title: "Advanced reporting", href: "#pro-features" },
      { title: "Marketing campaigns", href: "#pro-features" },
      { title: "Automated workflows", href: "#pro-features" },
      { title: "Custom booking widgets", href: "#pro-features" },
    ],
  },
];

export default function HelpPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-black pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          {/* Header */}
          <div className="mb-16 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white mb-4">
              <span className="gradient-text">Help Center</span>
            </h1>
            <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto">
              Find answers, guides, and support for all your GlamBooking needs
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Link href="mailto:hello@glambooking.co.uk">
              <div className="glass-card p-6 hover:bg-white/10 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-rose-gradient">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold mb-1">Email Support</h3>
                    <p className="text-white/60 text-sm">hello@glambooking.co.uk</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/dashboard">
              <div className="glass-card p-6 hover:bg-white/10 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-lavender-gradient">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold mb-1">Live Chat</h3>
                    <p className="text-white/60 text-sm">Available 24/7</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/privacy">
              <div className="glass-card p-6 hover:bg-white/10 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blush-gradient">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold mb-1">Documentation</h3>
                    <p className="text-white/60 text-sm">Policies & Terms</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Help Categories Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {helpCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div key={index} className="glass-card p-6 hover:bg-white/5 transition-all">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-luxury-gradient flex-shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{category.title}</h3>
                      <p className="text-white/60 text-sm">{category.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-2 ml-2">
                    {category.articles.map((article, articleIndex) => (
                      <li key={articleIndex}>
                        <Link
                          href={article.href}
                          className="text-white/70 hover:text-pink-400 text-sm transition-colors flex items-center gap-2 group"
                        >
                          <HelpCircle className="w-3 h-3 flex-shrink-0 opacity-50 group-hover:opacity-100" />
                          {article.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Detailed Guides */}
          <div className="glass-card p-8 md:p-12 space-y-12">
            {/* Getting Started Section */}
            <section id="getting-started">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-pink-400" />
                Getting Started
              </h2>
              <div className="space-y-6 text-white/70 leading-relaxed">
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Creating Your Account</h3>
                  <p>
                    Getting started with GlamBooking is quick and easy. Simply click "Start Free" on the homepage, 
                    enter your email address, and follow the prompts to set up your account. You'll be up and running 
                    in minutes with our Free plan, which includes all the basics you need to manage your bookings.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Setting Up Your Business Profile</h3>
                  <p>
                    Once your account is created, head to Settings to complete your business profile. Add your business name, 
                    contact details, opening hours, and a description. Pro and Business plan users can add custom branding 
                    including logos and colors to match your brand identity.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Adding Your First Service</h3>
                  <p>
                    Navigate to the Services section and click "Add Service". Enter the service name, duration, price, 
                    and description. You can also add images to showcase your work. Services can be categorized and 
                    customized to fit your specific business needs.
                  </p>
                </div>
              </div>
            </section>

            {/* Appointments Section */}
            <section id="appointments" className="border-t border-white/10 pt-12">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Calendar className="w-8 h-8 text-lavender" />
                Managing Appointments
              </h2>
              <div className="space-y-6 text-white/70 leading-relaxed">
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Creating a Booking</h3>
                  <p>
                    There are multiple ways to create bookings: through your dashboard, via your public booking page, 
                    or manually on behalf of clients. Each booking includes client details, service selection, date/time, 
                    and payment information. Confirmation emails are sent automatically.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Managing Your Calendar</h3>
                  <p>
                    Your calendar view shows all upcoming appointments at a glance. Use drag-and-drop to reschedule, 
                    click appointments to edit details, and filter by service, team member, or location. The calendar 
                    syncs in real-time across all devices.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Appointment Reminders</h3>
                  <p>
                    Automatic email reminders are sent to clients 24 hours before their appointment. Pro plan users 
                    can also enable SMS reminders and customize reminder timing. This helps reduce no-shows significantly.
                  </p>
                </div>
              </div>
            </section>

            {/* Clients Section */}
            <section id="clients" className="border-t border-white/10 pt-12">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-400" />
                Client Management
              </h2>
              <div className="space-y-6 text-white/70 leading-relaxed">
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Client Profiles</h3>
                  <p>
                    Each client has a detailed profile showing their booking history, contact information, preferences, 
                    and notes. Track important details like allergies, favorite services, and special requests. Build 
                    stronger relationships with comprehensive client data.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Loyalty Programs</h3>
                  <p>
                    Pro and Business plans include loyalty features. Set up points systems, rewards, and special offers 
                    for returning clients. Automated campaigns help you retain clients and increase repeat bookings.
                  </p>
                </div>
              </div>
            </section>

            {/* Billing Section */}
            <section id="billing" className="border-t border-white/10 pt-12">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-green-400" />
                Billing & Subscriptions
              </h2>
              <div className="space-y-6 text-white/70 leading-relaxed">
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Subscription Plans</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Free Plan:</strong> £0/month - Perfect for getting started with basic booking features</li>
                    <li><strong>Pro Plan:</strong> £19/month - Includes analytics, loyalty features, and advanced reporting</li>
                    <li><strong>Business Plan:</strong> £39/month - Everything in Pro plus custom branding and team management</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Transaction Fees</h3>
                  <p>
                    GlamBooking charges just 1.99% per booking - the lowest rate in the UK market. This fee covers payment 
                    processing, hosting, and platform maintenance. Fees are automatically deducted from booking payments.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Upgrading Your Plan</h3>
                  <p>
                    You can upgrade or downgrade your plan at any time from the Billing section. Changes take effect 
                    immediately, and you'll be charged pro-rata for the remainder of your billing cycle.
                  </p>
                </div>
              </div>
            </section>

            {/* Settings Section */}
            <section id="settings" className="border-t border-white/10 pt-12">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Settings className="w-8 h-8 text-purple-400" />
                Settings & Customization
              </h2>
              <div className="space-y-6 text-white/70 leading-relaxed">
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Custom Branding</h3>
                  <p>
                    Business plan subscribers can upload their logo, customize colors, and add their brand identity to 
                    the dashboard and booking pages. This creates a seamless, professional experience for your clients.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Team Management</h3>
                  <p>
                    Add team members with different permission levels. Assign staff to specific services, manage their 
                    availability, and track individual performance. Perfect for salons and spas with multiple professionals.
                  </p>
                </div>
              </div>
            </section>

            {/* Pro Features Section */}
            <section id="pro-features" className="border-t border-white/10 pt-12">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-yellow-400" />
                Pro Features
              </h2>
              <div className="space-y-6 text-white/70 leading-relaxed">
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Analytics Dashboard</h3>
                  <p>
                    Get insights into your business performance with detailed analytics. Track revenue trends, popular 
                    services, client retention rates, and booking patterns. Make data-driven decisions to grow your business.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Marketing Campaigns</h3>
                  <p>
                    Create and send targeted email campaigns to your clients. Promote special offers, announce new services, 
                    or re-engage inactive clients. Built-in templates make it easy to create professional campaigns.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Contact Support CTA */}
          <div className="mt-16 glass-card p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Still Need Help?</h2>
            <p className="text-white/60 mb-6 max-w-2xl mx-auto">
              Our support team is here to help you succeed. Get in touch and we'll respond as quickly as possible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:hello@glambooking.co.uk"
                className="px-6 py-3 bg-luxury-gradient text-white font-semibold rounded-xl hover:opacity-90 transition-all"
              >
                Email Support
              </a>
              <Link
                href="/dashboard"
                className="px-6 py-3 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
