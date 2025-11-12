"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/card";
import { Star } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    name: "Sarah Mitchell",
    business: "Birmingham Lash Studio",
    location: "Birmingham",
    image: "/testimonials/sarah.jpg", // Placeholder
    quote: "Finally — a booking app that doesn't take a cut! My clients love how easy it is, and I've reduced no-shows by 85%. Game changer.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    business: "Glow Beauty Bar",
    location: "Manchester",
    image: "/testimonials/priya.jpg", // Placeholder
    quote: "The card-on-file feature has completely eliminated last-minute cancellations. I'm actually getting paid for my time now.",
    rating: 5,
  },
  {
    name: "James Carter",
    business: "The Gentlemen's Barber",
    location: "London",
    image: "/testimonials/james.jpg", // Placeholder
    quote: "GlamBooking pays for itself. The SMS reminders alone save me hours every week, and the dashboard is slick as hell.",
    rating: 5,
  },
  {
    name: "Emma Watson",
    business: "Pure Wellness Spa",
    location: "Bristol",
    image: "/testimonials/emma.jpg", // Placeholder
    quote: "We switched from another platform and immediately noticed the difference. No commission fees means we keep every pound we earn.",
    rating: 5,
  },
  {
    name: "Alisha Khan",
    business: "Velvet Nails & Beauty",
    location: "Leeds",
    image: "/testimonials/alisha.jpg", // Placeholder
    quote: "My clients actually compliment me on how professional my booking system is. The loyalty rewards keep them coming back month after month.",
    rating: 5,
  },
  {
    name: "Marcus Brown",
    business: "Fade Masters Barbershop",
    location: "Glasgow",
    image: "/testimonials/marcus.jpg", // Placeholder
    quote: "Best investment I've made for my business. The AI assistant is coming soon and I'm already excited — this platform just keeps getting better.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(203,166,247,0.05),transparent_50%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-heading font-bold mb-6">
            Loved by <span className="gradient-text">300+ UK Professionals</span>
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Join beauty and wellness professionals who've taken back control of their business
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <Card className="h-full hover:bg-white/[0.08] hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer">
                <CardContent className="pt-6">
                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-white/80 mb-6 leading-relaxed">
                    "{testimonial.quote}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 border-t border-white/10 pt-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center border border-white/20">
                      <span className="text-lg font-bold gradient-text">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">{testimonial.name}</p>
                      <p className="text-sm text-white/60">
                        {testimonial.business} · {testimonial.location}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-white/50 text-sm mb-4">Trusted by professionals across the UK</p>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            <div className="text-white/40 text-xs">⭐ 4.9/5 Average Rating</div>
            <div className="text-white/40 text-xs">✓ 300+ Active Businesses</div>
            <div className="text-white/40 text-xs">💜 Built by Beauty Pros</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
