"use client";

import { motion } from "framer-motion";
import { Star, MapPin, TrendingUp, Sparkles, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

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

export function Trending() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const categories = ["All", "Featured", "New"];

  useEffect(() => {
    async function fetchBusinesses() {
      try {
        const response = await fetch("/api/businesses");
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
  }, []);

  const filteredBusinesses = businesses.filter((business) => {
    if (activeCategory === "All") return true;
    if (activeCategory === "Featured") return business.featured;
    if (activeCategory === "New") {
      // Show businesses with fewer bookings as "new"
      return business.totalBookings < 10;
    }
    return true;
  }).slice(0, 6);

  return (
    <section className="py-24 bg-black relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-glam-purple/5 to-black" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-6xl font-heading font-black mb-4">
            <span className="text-white">Discover </span>
            <span className="bg-glam-gradient bg-clip-text text-transparent">
              Top-Rated
            </span>
            <span className="text-white"> Businesses</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Handpicked professionals loved by thousands across the UK
          </p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex justify-center gap-4 mb-12 flex-wrap"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeCategory === category
                  ? "bg-glam-gradient text-black shadow-lg shadow-glam-purple/30"
                  : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
              }`}
            >
              {category === "All" && <Star className="w-4 h-4 inline mr-2" />}
              {category === "New" && <Sparkles className="w-4 h-4 inline mr-2" />}
              {category === "Featured" && <TrendingUp className="w-4 h-4 inline mr-2" />}
              {category}
            </button>
          ))}
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-glam-purple border-t-transparent"></div>
            <p className="text-white/60 mt-4">Loading businesses...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredBusinesses.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60 text-lg">No businesses found in this category yet.</p>
            <p className="text-white/40 text-sm mt-2">Be the first to join GlamBooking!</p>
          </div>
        )}

        {/* Business Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {filteredBusinesses.map((business, index) => (
            <Link href={`/book/${business.slug}`} key={business.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group cursor-pointer"
              >
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-glam-purple/50 transition-all duration-300 hover:shadow-2xl hover:shadow-glam-purple/20">
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
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-glam-purple transition-colors">
                          {business.name}
                        </h3>
                        <div className="flex items-center gap-2 text-white/60 text-sm mt-1">
                          <MapPin className="w-4 h-4" />
                          <span>{business.location}</span>
                          <span className="text-white/30">•</span>
                          <span>{business.category}</span>
                        </div>
                      </div>
                    </div>

                    {/* Rating & Bookings */}
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-1 bg-glam-gradient px-3 py-1 rounded-full">
                        <Star className="w-4 h-4 text-black fill-black" />
                        <span className="text-black font-bold text-sm">{business.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-white/50 text-sm">({business.reviews} reviews)</span>
                    </div>
                    
                    {business.totalBookings > 0 && (
                      <div className="mt-2 text-xs text-white/40">
                        {business.totalBookings} bookings completed
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        {!loading && filteredBusinesses.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link href="/book">
              <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-glam-purple/50 rounded-full text-white font-semibold transition-all duration-300 group">
                View All Businesses
                <ChevronRight className="w-5 h-5 inline ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
