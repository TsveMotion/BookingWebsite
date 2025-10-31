"use client";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { Search, MapPin, Star, TrendingUp, Sparkles } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());


export default function BookPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");

  // Build query string for API
  const queryString = new URLSearchParams({
    ...(searchQuery && { query: searchQuery }),
    ...(location && { location }),
    ...(category && { category }),
  }).toString();

  // Fetch businesses from API
  const { data: businesses, error, isLoading } = useSWR(
    `/api/businesses?${queryString}`,
    fetcher,
    { revalidateOnFocus: false }
  );
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-black pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white mb-4">
              <span className="gradient-text">Find Your Perfect</span>
              <br />
              Beauty Experience
            </h1>
            <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto">
              Discover top-rated salons, spas, and barbershops near you. Book instantly with GlamBooking.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-12 glass-card p-6">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Search Input */}
              <div className="md:col-span-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search services, businesses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400/50 transition-all"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="md:col-span-1">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    placeholder="Location (e.g. London)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400/50 transition-all"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="md:col-span-1">
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-pink-400/50 transition-all"
                >
                  <option value="">All Categories</option>
                  <option value="Hair Salon">Hair Salon</option>
                  <option value="Spa">Spa & Wellness</option>
                  <option value="Barbershop">Barbershop</option>
                  <option value="Nails">Nail Salon</option>
                  <option value="Beauty">Beauty Clinic</option>
                </select>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white text-sm transition-all">
                <Star className="w-4 h-4 inline mr-1" />
                Highly Rated
              </button>
              <button className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white text-sm transition-all">
                <TrendingUp className="w-4 h-4 inline mr-1" />
                Popular
              </button>
              <button className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white text-sm transition-all">
                <MapPin className="w-4 h-4 inline mr-1" />
                Near Me
              </button>
            </div>
          </div>

          {/* Featured Businesses */}
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-pink-400" />
              Featured Businesses
            </h2>

            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-pink-400/30 border-t-pink-400 rounded-full animate-spin"></div>
                <p className="text-white/60 mt-4">Loading businesses...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <p className="text-red-400">Failed to load businesses. Please try again.</p>
              </div>
            )}

            {!isLoading && !error && businesses?.length === 0 && (
              <div className="text-center py-12">
                <p className="text-white/60">No businesses found. Try adjusting your search criteria.</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {!isLoading && !error && businesses?.map((business: any) => (
                <Link key={business.id} href={`/book/${business.slug}`}>
                  <div className="glass-card p-6 hover:bg-white/10 transition-all cursor-pointer group h-full">
                    {/* Business Image */}
                    <div className="mb-4 rounded-xl overflow-hidden bg-white/5 h-40 flex items-center justify-center">
                      <Image
                        src={business.image}
                        alt={business.name}
                        width={200}
                        height={80}
                        className="object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    </div>

                    {/* Business Info */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xl font-bold text-white group-hover:text-pink-400 transition-colors">
                          {business.name}
                        </h3>
                        {business.featured && (
                          <span className="px-2 py-1 rounded-full bg-luxury-gradient text-white text-xs font-bold flex-shrink-0">
                            FEATURED
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <span className="px-2 py-1 rounded-full bg-white/5 text-xs">
                          {business.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {business.location}
                        </span>
                      </div>

                      <p className="text-white/70 text-sm line-clamp-2">
                        {business.description}
                      </p>

                      {/* Rating */}
                      <div className="flex items-center gap-2 pt-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-white font-semibold">{business.rating}</span>
                        </div>
                        <span className="text-white/60 text-sm">({business.reviews} reviews)</span>
                      </div>

                      {/* Book Button */}
                      <button className="w-full mt-4 px-4 py-2 bg-luxury-gradient text-white font-semibold rounded-xl hover:opacity-90 transition-all">
                        View & Book
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <div className="glass-card p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Are you a beauty professional?
            </h2>
            <p className="text-white/70 mb-6 max-w-2xl mx-auto">
              Join GlamBooking and reach thousands of potential clients. Manage your bookings, 
              payments, and client relationships all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/pricing"
                className="px-6 py-3 bg-luxury-gradient text-white font-semibold rounded-xl hover:opacity-90 transition-all"
              >
                Get Started Free
              </Link>
              <Link
                href="/features"
                className="px-6 py-3 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* SEO Content */}
          <div className="mt-16 max-w-4xl mx-auto space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Find and Book Beauty Services Near You
              </h2>
              <p className="text-white/70 leading-relaxed">
                GlamBooking makes it easy to discover and book appointments with top beauty professionals 
                in your area. Whether you're looking for a hair salon, spa, barbershop, or beauty clinic, 
                we connect you with verified businesses offering exceptional services.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-3">
                Why Use GlamBooking?
              </h3>
              <ul className="space-y-2 text-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-pink-400">✓</span>
                  <span>Browse verified businesses with real customer reviews</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400">✓</span>
                  <span>Book appointments 24/7 with instant confirmation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400">✓</span>
                  <span>Secure payment processing and booking management</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400">✓</span>
                  <span>Discover new businesses and exclusive offers</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
