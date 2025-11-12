"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Twitter, Instagram, Facebook, Mail } from "lucide-react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-black">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
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
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/features" className="text-white/60 hover:text-white text-sm transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-white/60 hover:text-white text-sm transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/book" className="text-white/60 hover:text-white text-sm transition-colors">
                  Find Businesses
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-white/60 hover:text-white text-sm transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-white/60 hover:text-white text-sm transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/60 hover:text-white text-sm transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-white/60 hover:text-white text-sm transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-white/60 hover:text-white text-sm transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <div className="flex gap-3">
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Twitter className="w-5 h-5 text-white/80" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Instagram className="w-5 h-5 text-white/80" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Facebook className="w-5 h-5 text-white/80" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                href="mailto:hello@glambooking.co.uk"
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Mail className="w-5 h-5 text-white/80" />
              </motion.a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm text-center md:text-left">
            © {new Date().getFullYear()} GlamBooking. All rights reserved.
          </p>
          <p className="text-sm text-center md:text-right">
            <span className="text-white/40">Powered by </span>
            <a 
              href="https://tsvweb.co.uk" 
              target="_blank" 
              rel="noopener noreferrer"
              className="gradient-text hover:text-pink-300 transition-colors hover:underline font-semibold"
            >
              TSVWEB.co.uk
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
