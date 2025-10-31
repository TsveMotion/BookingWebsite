"use client";

import Link from "next/link";
import { useUser, UserButton, SignInButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";

export function Nav() {
  const { isSignedIn, isLoaded } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="p-2 rounded-xl bg-luxury-gradient"
          >
            <Sparkles className="w-5 h-5 text-white" />
          </motion.div>
          <span className="text-xl md:text-2xl font-heading font-bold">
            <span className="gradient-text">Glam</span>Booking
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {isLoaded && !isSignedIn && (
            <>
              <Link 
                href="/" 
                className="text-sm text-white/80 hover:text-white transition-colors"
              >
                Home
              </Link>
              <Link 
                href="/features" 
                className="text-sm text-white/80 hover:text-white transition-colors"
              >
                Features
              </Link>
              <Link 
                href="/pricing" 
                className="text-sm text-white/80 hover:text-white transition-colors"
              >
                Pricing
              </Link>
            </>
          )}
          
          {isLoaded && isSignedIn && (
            <Link 
              href="/dashboard" 
              className="text-sm text-white/80 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {isLoaded && !isSignedIn && (
            <>
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </SignInButton>
              <Link href="/sign-up">
                <Button variant="gradient" size="sm">
                  Start Free
                </Button>
              </Link>
            </>
          )}
          
          {isLoaded && isSignedIn && (
            <div className="flex items-center gap-3">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 rounded-full ring-2 ring-lavender/50",
                  },
                }}
              />
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Menu className="w-6 h-6 text-white" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-white/10 bg-black/95 backdrop-blur-xl"
        >
          <div className="container mx-auto px-4 py-6 space-y-4">
            {isLoaded && !isSignedIn && (
              <>
                <Link 
                  href="/" 
                  className="block text-white/80 hover:text-white transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  href="/features" 
                  className="block text-white/80 hover:text-white transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link 
                  href="/pricing" 
                  className="block text-white/80 hover:text-white transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <div className="pt-4 space-y-2">
                  <SignInButton mode="modal">
                    <Button variant="ghost" size="sm" className="w-full">
                      Sign In
                    </Button>
                  </SignInButton>
                  <Link href="/sign-up" className="block">
                    <Button variant="gradient" size="sm" className="w-full">
                      Start Free
                    </Button>
                  </Link>
                </div>
              </>
            )}
            
            {isLoaded && isSignedIn && (
              <>
                <Link 
                  href="/dashboard" 
                  className="block text-white/80 hover:text-white transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <div className="pt-4">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10 rounded-full ring-2 ring-lavender/50",
                      },
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
