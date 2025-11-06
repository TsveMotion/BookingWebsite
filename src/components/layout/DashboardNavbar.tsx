"use client";

import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface BusinessProfile {
  plan: string;
  logoUrl?: string | null;
}

const navLinks = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Bookings", href: "/dashboard/bookings" },
  { name: "Clients", href: "/dashboard/clients" },
  { name: "Services", href: "/dashboard/services" },
  { name: "Team", href: "/dashboard/team" },
  { name: "Payouts", href: "/dashboard/payouts" },
  { name: "Settings", href: "/dashboard/settings" },
];

export default function DashboardNavbar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch profile:", err);
        setLoading(false);
      });
  }, []);

  const logoSrc =
    profile?.plan?.toLowerCase() === "business" && profile?.logoUrl
      ? profile.logoUrl
      : "/logo/Logo_Long.png";

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-black/40 border-b-2 border-b-white/10 shadow-lg">
      {/* Gradient accent border */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 opacity-60"></div>
      
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative">
        {/* Logo - Left */}
        <div className="flex items-center w-[200px]">
          <Link href="/dashboard">
            {loading ? (
              <div className="w-[140px] h-[36px] bg-white/10 rounded animate-pulse" />
            ) : (
              <Image
                src={logoSrc}
                alt="GlamBooking Logo"
                width={140}
                height={36}
                className="object-contain"
              />
            )}
          </Link>
        </div>

        {/* Dashboard Title - Centered */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <h1 className="text-xl font-semibold text-white hidden md:block">
            Dashboard
          </h1>
        </div>

        {/* Navigation Links - Below on mobile, inline on desktop */}
        <div className="hidden lg:flex gap-6 text-sm font-medium text-gray-300 absolute left-1/2 transform -translate-x-1/2 top-full mt-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || 
              (link.href !== "/dashboard" && pathname.startsWith(link.href));
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`hover:text-pink-400 relative after:content-[''] after:absolute after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-pink-400 after:to-purple-400 after:left-0 after:-bottom-1 hover:after:w-full ${
                  isActive ? "text-pink-400 after:w-full" : ""
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* User Button - Right */}
        <div className="flex items-center justify-end w-[200px]">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-10 h-10 rounded-full ring-2 ring-pink-400/50 hover:ring-pink-400 transition-all",
              },
            }}
          />
        </div>
      </div>

      {/* Mobile Navigation Links */}
      <div className="lg:hidden border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex gap-4 overflow-x-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || 
              (link.href !== "/dashboard" && pathname.startsWith(link.href));
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap text-sm font-medium relative px-3 py-1 rounded-full ${
                  isActive ? "text-pink-400 bg-pink-400/10" : "text-gray-300 hover:text-pink-400 hover:bg-white/5"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
