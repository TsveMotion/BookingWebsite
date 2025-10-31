import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Metadata } from "next";
import Image from "next/image";
import { Calendar, MapPin, Star, Clock, Phone, Mail, Globe, Check } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // In production, fetch business data from database
  const businessName = params.slug.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  return {
    title: `Book ${businessName} — GlamBooking`,
    description: `Book appointments with ${businessName}. View services, prices, and availability. Book online instantly.`,
    openGraph: {
      title: `Book ${businessName} — GlamBooking`,
      description: `Book appointments with ${businessName}. View services, prices, and availability.`,
      type: "website",
    },
  };
}

// Example business data - in production, fetch from database
const getBusinessData = (slug: string) => {
  return {
    name: "Luxe Beauty Salon",
    slug: slug,
    description: "Premium hair styling and beauty treatments in the heart of London. Our expert team delivers exceptional results with personalized service.",
    category: "Hair Salon & Beauty",
    location: "123 Oxford Street, London, W1D 2HG",
    phone: "+44 20 1234 5678",
    email: "hello@luxebeauty.co.uk",
    website: "https://luxebeauty.co.uk",
    rating: 4.9,
    reviews: 127,
    image: "/logo/Logo_Long.png",
    coverImage: "/logo/Logo_Long.png",
    openingHours: [
      { day: "Monday", hours: "9:00 AM - 6:00 PM" },
      { day: "Tuesday", hours: "9:00 AM - 6:00 PM" },
      { day: "Wednesday", hours: "9:00 AM - 6:00 PM" },
      { day: "Thursday", hours: "9:00 AM - 8:00 PM" },
      { day: "Friday", hours: "9:00 AM - 8:00 PM" },
      { day: "Saturday", hours: "10:00 AM - 5:00 PM" },
      { day: "Sunday", hours: "Closed" },
    ],
    services: [
      { id: 1, name: "Women's Haircut", duration: "45 min", price: 45 },
      { id: 2, name: "Men's Haircut", duration: "30 min", price: 30 },
      { id: 3, name: "Hair Coloring", duration: "90 min", price: 85 },
      { id: 4, name: "Balayage", duration: "120 min", price: 120 },
      { id: 5, name: "Blow Dry", duration: "30 min", price: 35 },
      { id: 6, name: "Hair Treatment", duration: "45 min", price: 55 },
    ],
    features: [
      "Free WiFi",
      "Refreshments",
      "Card Payments",
      "Gift Vouchers",
      "Wheelchair Accessible",
      "Free Consultation",
    ],
  };
};

export default function BusinessBookingPage({ params }: PageProps) {
  const business = getBusinessData(params.slug);

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-black pt-16 pb-16">
        {/* Cover Image */}
        <div className="relative h-64 bg-gradient-to-r from-pink-900/20 to-purple-900/20 border-b border-white/10">
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src={business.coverImage}
              alt={business.name}
              width={300}
              height={120}
              className="object-contain opacity-40"
            />
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="grid lg:grid-cols-3 gap-8 -mt-20">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Business Header */}
              <div className="glass-card p-8">
                <div className="flex items-start gap-6 mb-6">
                  {/* Logo */}
                  <div className="w-24 h-24 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/10">
                    <Image
                      src={business.image}
                      alt={business.name}
                      width={80}
                      height={80}
                      className="object-contain"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-heading font-black text-white mb-2">
                      {business.name}
                    </h1>
                    <p className="text-pink-400 mb-3">{business.category}</p>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(business.rating)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-white font-semibold">{business.rating}</span>
                      <span className="text-white/60">({business.reviews} reviews)</span>
                    </div>

                    <p className="text-white/70 leading-relaxed">
                      {business.description}
                    </p>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="grid sm:grid-cols-2 gap-4 pt-6 border-t border-white/10">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white/60 text-sm">Location</p>
                      <p className="text-white">{business.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white/60 text-sm">Phone</p>
                      <a href={`tel:${business.phone}`} className="text-white hover:text-pink-400 transition-colors">
                        {business.phone}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="glass-card p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-pink-400" />
                  Services & Pricing
                </h2>

                <div className="space-y-3">
                  {business.services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                    >
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">{service.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <Clock className="w-4 h-4" />
                          <span>{service.duration}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">£{service.price}</p>
                        <button className="mt-2 px-4 py-1 bg-luxury-gradient text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-all opacity-0 group-hover:opacity-100">
                          Book Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="glass-card p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Amenities</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {business.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-white/70">
                      <Check className="w-4 h-4 text-pink-400" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Booking Card */}
              <div className="glass-card p-6 sticky top-24">
                <h3 className="text-xl font-bold text-white mb-4">Book Appointment</h3>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Select Service</label>
                    <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-pink-400/50">
                      <option value="">Choose a service...</option>
                      {business.services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name} - £{service.price}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm mb-2">Select Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-pink-400/50"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm mb-2">Select Time</label>
                    <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-pink-400/50">
                      <option value="">Choose a time...</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="16:00">4:00 PM</option>
                    </select>
                  </div>
                </div>

                <button className="w-full px-6 py-3 bg-luxury-gradient text-white font-semibold rounded-xl hover:opacity-90 transition-all">
                  Continue to Booking
                </button>

                <p className="text-white/40 text-xs text-center mt-4">
                  Instant confirmation • Secure payment
                </p>
              </div>

              {/* Opening Hours */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Opening Hours</h3>
                <div className="space-y-2">
                  {business.openingHours.map((schedule, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-white/70">{schedule.day}</span>
                      <span className="text-white font-medium">{schedule.hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Contact</h3>
                <div className="space-y-3">
                  <a
                    href={`tel:${business.phone}`}
                    className="flex items-center gap-3 text-white/70 hover:text-pink-400 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{business.phone}</span>
                  </a>
                  <a
                    href={`mailto:${business.email}`}
                    className="flex items-center gap-3 text-white/70 hover:text-pink-400 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{business.email}</span>
                  </a>
                  {business.website && (
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-white/70 hover:text-pink-400 transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                      <span className="text-sm">Visit Website</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Back to Search */}
          <div className="mt-12 text-center">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 transition-colors"
            >
              ← Back to Search
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
