"use client";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { Search, MapPin, Star, TrendingUp, Sparkles, Filter, SlidersHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Business {
  id: string;
  slug: string;
  name: string;
  category: string;
  location: string;
  description: string;
  image: string;
  rating: number;
  reviews: number;
  featured: boolean;
  totalBookings: number;
  totalServices: number;
}

export default function BookPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [filteredCategory, setFilteredCategory] = useState("all");

  useEffect(() => {
    async function fetchBusinesses() {
      try {
        const queryString = new URLSearchParams({
          ...(searchQuery && { query: searchQuery }),
          ...(location && { location }),
          ...(category && { category }),
        }).toString();

        const response = await fetch(`/api/businesses?${queryString}`);
        if (response.ok) {
          const data = await response.json();
          setBusinesses(data);
        }
      } catch (error) {
        console.error("Error fetching businesses:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBusinesses();
  }, [searchQuery, location, category]);

  const filteredBusinesses = businesses.filter(business => {
    if (filteredCategory === "all") return true;
    if (filteredCategory === "featured") return business.featured;
    if (filteredCategory === "popular") return business.totalBookings > 5;
    return true;
  });

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-black">
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 overflow-hidden">
          {/* Gradient Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-glam-gradient opacity-5" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-glam-purple/20 rounded-full blur-[120px] animate-pulse-slow" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-glam-pink/15 rounded-full blur-[100px]" />
          </div>

          <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-12 text-center"
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-black mb-6 leading-tight">
                <span className="text-white">Find Your Perfect</span>
                <br />
                <span className="bg-glam-gradient bg-clip-text text-transparent">
                  Beauty Experience
                </span>
              </h1>
              <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                Discover and book with top-rated salons, spas, and barbershops near you
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-5xl mx-auto"
            >
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl mb-8">
                <div className="grid md:grid-cols-3 gap-3">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-glam-purple" />
                    <input
                      type="text"
                      placeholder="Search services..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border-none outline-none text-white placeholder-white/50 transition-colors"
                    />
                  </div>

                  {/* Location */}
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-glam-pink" />
                    <input
                      type="text"
                      placeholder="Location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border-none outline-none text-white placeholder-white/50 transition-colors"
                    />
                  </div>

                  {/* Category Filter */}
                  <div className="relative">
                    <SlidersHorizontal className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-glam-purple" />
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border-none outline-none text-white appearance-none cursor-pointer transition-colors"
                    >
                      <option value="" className="bg-black">All Categories</option>
                      <option value="Hair Salon" className="bg-black">Hair Salon</option>
                      <option value="Spa" className="bg-black">Spa & Wellness</option>
                      <option value="Barbershop" className="bg-black">Barbershop</option>
                      <option value="Nails" className="bg-black">Nail Salon</option>
                      <option value="Beauty" className="bg-black">Beauty Clinic</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Quick Filters */}
              <div className="flex justify-center gap-3 flex-wrap">
                <button 
                  onClick={() => setFilteredCategory("all")}
                  className={`px-5 py-2 rounded-full font-medium transition-all duration-300 ${
                    filteredCategory === "all"
                      ? "bg-glam-gradient text-black shadow-lg shadow-glam-purple/30"
                      : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  <Filter className="w-4 h-4 inline mr-2" />
                  All
                </button>
                <button 
                  onClick={() => setFilteredCategory("featured")}
                  className={`px-5 py-2 rounded-full font-medium transition-all duration-300 ${
                    filteredCategory === "featured"
                      ? "bg-glam-gradient text-black shadow-lg shadow-glam-purple/30"
                      : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  Featured
                </button>
                <button 
                  onClick={() => setFilteredCategory("popular")}
                  className={`px-5 py-2 rounded-full font-medium transition-all duration-300 ${
                    filteredCategory === "popular"
                      ? "bg-glam-gradient text-black shadow-lg shadow-glam-purple/30"
                      : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  Popular
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Businesses Grid */}
        <section className="py-16 bg-black">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            {/* Results Header */}
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                {loading ? "Loading..." : `${filteredBusinesses.length} Businesses Found`}
              </h2>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-glam-purple border-t-transparent"></div>
                <p className="text-white/60 mt-4">Discovering amazing businesses...</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredBusinesses.length === 0 && (
              <div className="text-center py-16">
                <Sparkles className="w-20 h-20 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 text-lg mb-2">No businesses found</p>
                <p className="text-white/40 text-sm">Try adjusting your search criteria</p>
              </div>
            )}

            {/* Business Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {!loading && filteredBusinesses.map((business, index) => (
                <Link key={business.id} href={`/book/${business.slug}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group cursor-pointer"
                  >
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-glam-purple/50 transition-all duration-300 hover:shadow-2xl hover:shadow-glam-purple/20 h-full">
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-glam-purple/20 to-glam-pink/20">
                        {business.featured && (
                          <div className="absolute top-3 right-3 z-10 bg-glam-gradient px-3 py-1 rounded-full text-xs font-bold text-black">
                            Featured
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all duration-300" />
                        <div className="w-full h-full flex items-center justify-center text-white/40">
                          <Sparkles className="w-16 h-16" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="mb-3">
                          <h3 className="text-xl font-bold text-white group-hover:text-glam-purple transition-colors mb-2">
                            {business.name}
                          </h3>
                          <div className="flex items-center gap-2 text-white/60 text-sm">
                            <MapPin className="w-4 h-4" />
                            <span>{business.location}</span>
                            <span className="text-white/30">•</span>
                            <span>{business.category}</span>
                          </div>
                        </div>

                        <p className="text-white/60 text-sm line-clamp-2 mb-4">
                          {business.description}
                        </p>

                        {/* Rating & Stats */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 bg-glam-gradient px-3 py-1 rounded-full">
                              <Star className="w-4 h-4 text-black fill-black" />
                              <span className="text-black font-bold text-sm">{business.rating.toFixed(1)}</span>
                            </div>
                            <span className="text-white/50 text-xs">({business.reviews})</span>
                          </div>
                          {business.totalBookings > 0 && (
                            <span className="text-white/40 text-xs">
                              {business.totalBookings} bookings
                            </span>
                          )}
                        </div>

                        {/* Book Button */}
                        <button className="w-full px-4 py-3 bg-glam-gradient text-black font-bold rounded-xl hover:shadow-lg hover:shadow-glam-purple/30 transition-all group-hover:scale-105">
                          View & Book
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-b from-black via-glam-purple/5 to-black">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 text-center"
            >
              <Sparkles className="w-12 h-12 text-glam-purple mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-heading font-black text-white mb-4">
                Are You a Beauty Professional?
              </h2>
              <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
                Join GlamBooking and reach thousands of potential clients. Manage your bookings, 
                payments, and client relationships all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/pricing">
                  <button className="px-8 py-4 bg-glam-gradient text-black font-bold rounded-xl hover:shadow-lg hover:shadow-glam-purple/30 transition-all">
                    Get Started Free
                  </button>
                </Link>
                <Link href="/features">
                  <button className="px-8 py-4 border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/10 hover:border-glam-purple transition-all">
                    Learn More
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SEO Content */}
        <section className="py-16 bg-black">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Find and Book Beauty Services Near You
                </h2>
                <p className="text-white/70 leading-relaxed">
                  GlamBooking makes it easy to discover and book appointments with top beauty professionals 
                  in your area. Whether you're looking for a hair salon, spa, barbershop, or beauty clinic, 
                  we connect you with verified businesses offering exceptional services across the UK.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-4">
                  Why Use GlamBooking?
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-glam-gradient rounded-lg mt-1">
                      <Star className="w-4 h-4 text-black" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">Verified Reviews</h4>
                      <p className="text-white/60 text-sm">Browse businesses with real customer reviews and ratings</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-glam-gradient rounded-lg mt-1">
                      <Sparkles className="w-4 h-4 text-black" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">Instant Booking</h4>
                      <p className="text-white/60 text-sm">Book appointments 24/7 with instant confirmation</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-glam-gradient rounded-lg mt-1">
                      <TrendingUp className="w-4 h-4 text-black" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">Secure Payments</h4>
                      <p className="text-white/60 text-sm">Safe payment processing and booking management</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-glam-gradient rounded-lg mt-1">
                      <MapPin className="w-4 h-4 text-black" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">Local Businesses</h4>
                      <p className="text-white/60 text-sm">Discover new businesses and exclusive offers near you</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
