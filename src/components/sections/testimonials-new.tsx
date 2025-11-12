"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sarah Mitchell",
    role: "Salon Owner",
    business: "Luxe Hair Studio, London",
    rating: 5,
    quote: "GlamBooking transformed how we manage our salon. No more double bookings, and our revenue increased by 40% in just 3 months!",
    image: "SM"
  },
  {
    id: 2,
    name: "James Cooper",
    role: "Barber",
    business: "Cooper's Cuts, Manchester",
    rating: 5,
    quote: "Best decision I made for my barbershop. The booking system is intuitive and my clients love the app. Zero commission is a game-changer.",
    image: "JC"
  },
  {
    id: 3,
    name: "Emma Thompson",
    role: "Beauty Therapist",
    business: "Serenity Spa, Birmingham",
    rating: 5,
    quote: "I've tried other platforms, but GlamBooking is the only one that doesn't take a cut of my earnings. The support team is amazing too!",
    image: "ET"
  },
  {
    id: 4,
    name: "David Richards",
    role: "Wellness Coach",
    business: "Mind & Body Wellness, Bristol",
    rating: 5,
    quote: "The analytics dashboard helps me understand my business better. I can see which services are popular and optimize my schedule accordingly.",
    image: "DR"
  },
  {
    id: 5,
    name: "Priya Patel",
    role: "Nail Technician",
    business: "Nails by Priya, Leeds",
    rating: 5,
    quote: "As a solo entrepreneur, GlamBooking gives me everything I need without the complexity. It's professional, reliable, and affordable.",
    image: "PP"
  },
  {
    id: 6,
    name: "Michael Brown",
    role: "Massage Therapist",
    business: "Healing Touch, Liverpool",
    rating: 5,
    quote: "My clients appreciate the easy booking process and automated reminders. I've reduced no-shows by 80% since switching to GlamBooking.",
    image: "MB"
  }
];

export function TestimonialsNew() {
  return (
    <section className="py-24 bg-gradient-to-b from-black via-glam-pink/5 to-black relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-glam-purple/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-glam-pink/20 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-heading font-black mb-4">
            <span className="text-white">Loved by </span>
            <span className="bg-glam-gradient bg-clip-text text-transparent">
              UK Professionals
            </span>
          </h2>
          <p className="text-white/60 text-xl max-w-3xl mx-auto">
            Join beauty and wellness professionals who've taken control of their business
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group"
            >
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-glam-purple/50 transition-all duration-300 hover:shadow-2xl hover:shadow-glam-purple/20 h-full flex flex-col">
                {/* Quote Icon */}
                <div className="mb-4">
                  <Quote className="w-8 h-8 text-glam-purple opacity-50" />
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-glam-purple fill-glam-purple" />
                  ))}
                </div>

                {/* Quote Text */}
                <p className="text-white/80 text-sm leading-relaxed mb-6 flex-grow">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <div className="w-12 h-12 bg-glam-gradient rounded-full flex items-center justify-center font-bold text-black">
                    {testimonial.image}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{testimonial.name}</h4>
                    <p className="text-white/50 text-xs">{testimonial.role}</p>
                    <p className="text-glam-purple text-xs font-medium">{testimonial.business}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3">
            <Star className="w-5 h-5 text-glam-purple fill-glam-purple" />
            <span className="text-white font-semibold">4.9/5</span>
            <span className="text-white/50">•</span>
            <span className="text-white/70">Based on 1,200+ reviews</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
