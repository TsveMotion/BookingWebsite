"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Twitter, Instagram, Linkedin, Mail, Globe } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function Footer() {
  const [selectedCountry, setSelectedCountry] = useState("UK");

  return (
    <footer className="relative border-t border-white/10 bg-black">
      {/* Subtle gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-glam-purple/5 to-transparent opacity-50" />
      
      <div className="container mx-auto px-4 md:px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1 space-y-4">
            <Link href="/" className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Image
                  src="/logo/Logo_Long.png"
                  alt="GlamBooking Logo"
                  width={160}
                  height={40}
                  className="object-contain transition-all hover:opacity-90"
                />
              </motion.div>
            </Link>
            <p className="text-white/70 text-sm max-w-xs font-medium leading-relaxed">
              Built by beauty professionals, for beauty professionals.
            </p>
            <p className="text-white/50 text-xs max-w-xs">
              The booking platform that puts you in control. No commissions. Ever.
            </p>

            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 hover:bg-glam-gradient rounded-lg transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-white/80" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 hover:bg-glam-gradient rounded-lg transition-all duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5 text-white/80" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 hover:bg-glam-gradient rounded-lg transition-all duration-300"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5 text-white/80" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                href="mailto:support@glambooking.co.uk"
                className="p-2 bg-white/10 hover:bg-glam-gradient rounded-lg transition-all duration-300"
                aria-label="Email"
              >
                <Mail className="w-5 h-5 text-white/80" />
              </motion.a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/features" className="text-white/60 hover:text-glam-purple text-sm transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-white/60 hover:text-glam-purple text-sm transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/book" className="text-white/60 hover:text-glam-purple text-sm transition-colors">
                  Businesses
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-white/60 hover:text-glam-purple text-sm transition-colors">
                  Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-white/60 hover:text-glam-purple text-sm transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-white/60 hover:text-glam-purple text-sm transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/60 hover:text-glam-purple text-sm transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/60 hover:text-glam-purple text-sm transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/terms" className="text-white/60 hover:text-glam-purple text-sm transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-white/60 hover:text-glam-purple text-sm transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-white/60 hover:text-glam-purple text-sm transition-colors">
                  Cookies
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-white/60 hover:text-glam-purple text-sm transition-colors">
                  GDPR
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Connect</h3>
            <ul className="space-y-3">
              <li>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-glam-purple text-sm transition-colors">
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-glam-purple text-sm transition-colors">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href="mailto:support@glambooking.co.uk" className="text-white/60 hover:text-glam-purple text-sm transition-colors">
                  Support
                </a>
              </li>
              <li>
                <Link href="/help" className="text-white/60 hover:text-glam-purple text-sm transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-white/40 text-sm">
              <p className="text-center md:text-left">
                © {new Date().getFullYear()} GlamBooking. All rights reserved.
              </p>
              
              {/* Country Selector */}
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <select 
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-white/70 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <option value="UK">🇬🇧 United Kingdom</option>
                  <option value="US">🇺🇸 United States</option>
                  <option value="EU">🇪🇺 Europe</option>
                </select>
              </div>
            </div>

            <p className="text-sm text-center md:text-right">
              <span className="text-white/40">Built by </span>
              <a 
                href="https://tsvweb.co.uk" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-glam-gradient bg-clip-text text-transparent hover:opacity-80 transition-opacity font-semibold"
              >
                TsvWeb
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
