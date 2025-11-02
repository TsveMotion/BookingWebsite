"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  UsersRound,
  BarChart3,
  Settings,
  CreditCard,
  Wallet,
  LogOut,
  Menu,
  X,
  Sparkles,
  Gift,
  MapPin,
  Shield,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import { LogoSwitcher } from "./LogoSwitcher";
import toast from "react-hot-toast";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  requiredPlan?: string; // 'pro' or 'business' - shows tag if user doesn't have this plan
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Bookings", href: "/dashboard/bookings", icon: Calendar },
  { label: "Calendar", href: "/dashboard/bookings/calendar", icon: Calendar },
  { label: "Clients", href: "/dashboard/clients", icon: Users },
  { label: "Services", href: "/dashboard/services", icon: Scissors },
  { label: "Team", href: "/dashboard/team", icon: UsersRound },
  { label: "Locations", href: "/dashboard/locations", icon: MapPin },
  { label: "Loyalty & Retention", href: "/dashboard/loyalty", icon: Gift, requiredPlan: "pro" },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3, requiredPlan: "pro" },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { label: "Payouts", href: "/dashboard/payouts", icon: Wallet },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const pathname = usePathname();
  const { user } = useUser();
  const [userPlan, setUserPlan] = useState("free");
  const [businessSlug, setBusinessSlug] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [permissions, setPermissions] = useState<any>(null);
  const [filteredNavItems, setFilteredNavItems] = useState<NavItem[]>(navItems);

  // Fetch user plan, business slug, and permissions
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [profileRes, slugRes, permissionsRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/business/slug"),
          fetch("/api/permissions"),
        ]);
        
        const profileData = await profileRes.json();
        setUserPlan(profileData.plan?.toLowerCase() || "free");
        
        if (slugRes.ok) {
          const slugData = await slugRes.json();
          setBusinessSlug(slugData.businessSlug);
          setBusinessName(slugData.businessName);
        }

        if (permissionsRes.ok) {
          const perms = await permissionsRes.json();
          setPermissions(perms);
          
          // Filter navigation based on permissions
          const filtered = navItems.filter((item) => {
            if (item.href === '/dashboard') return true;
            if (item.href === '/dashboard/bookings' || item.href === '/dashboard/bookings/calendar') return perms.canManageBookings;
            if (item.href === '/dashboard/clients') return perms.canManageClients;
            if (item.href === '/dashboard/services') return perms.canManageServices;
            if (item.href === '/dashboard/analytics') return perms.canManageAnalytics;
            if (item.href === '/dashboard/team') return perms.canManageTeam;
            if (item.href === '/dashboard/locations') return perms.canManageLocations;
            if (item.href === '/dashboard/loyalty') return perms.isOwner;
            if (item.href === '/dashboard/billing') return perms.canManageBilling;
            if (item.href === '/dashboard/payouts') return perms.isOwner;
            if (item.href === '/dashboard/settings') return perms.isOwner;
            return true;
          });
          setFilteredNavItems(filtered);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    if (user) fetchUserData();
  }, [user]);

  const handleCopyLink = () => {
    if (businessSlug) {
      const link = `https://glambooking.co.uk/book/${businessSlug}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Booking link copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo & User Greeting */}
      <div className="p-6 border-b border-white/10">
        <Link href="/dashboard" className="block mb-4">
          <LogoSwitcher showText={true} size="md" />
        </Link>
        
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white/70 text-sm"
          >
            Hi, <span className="text-white font-semibold">{user.firstName}</span> 👋
          </motion.div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredNavItems.map((item, index) => {
          const Icon = item.icon;
          
          // Determine if item is active
          let isActive = false;
          if (item.href === '/dashboard') {
            isActive = pathname === '/dashboard';
          } else if (item.href === '/dashboard/bookings/calendar') {
            isActive = pathname === '/dashboard/bookings/calendar';
          } else if (item.href === '/dashboard/bookings') {
            isActive = pathname === '/dashboard/bookings' || (pathname.startsWith('/dashboard/bookings') && pathname !== '/dashboard/bookings/calendar');
          } else {
            isActive = pathname.startsWith(item.href);
          }

          // Determine if we should show a plan tag
          const showTag = item.requiredPlan && (
            (item.requiredPlan === 'pro' && userPlan === 'free') ||
            (item.requiredPlan === 'business' && (userPlan === 'free' || userPlan === 'pro'))
          );
          const tagLabel = item.requiredPlan === 'business' ? 'BUSINESS' : 'PRO';

          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block group"
              >
                <motion.div
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all relative ${
                    isActive
                      ? "bg-luxury-gradient text-white shadow-lg shadow-lavender/30"
                      : "text-white/70 hover:bg-gradient-to-r hover:from-white/10 hover:to-transparent hover:text-white"
                  }`}
                >
                  <motion.div
                    className={isActive ? "drop-shadow-[0_0_8px_rgba(233,181,216,0.5)]" : ""}
                    whileHover={{ scale: 1.1 }}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.div>
                  
                  <span className="font-medium flex-1 text-sm">{item.label}</span>
                  
                  {showTag && (
                    <motion.span
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-gradient-to-r from-yellow-400/20 to-amber-500/20 text-yellow-400 border border-yellow-400/30"
                    >
                      {tagLabel}
                    </motion.span>
                  )}
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-white/10" />

      {/* Business Booking Link */}
      {businessSlug && businessName && (
        <div className="p-4 border-t border-white/10">
          <div className="p-4 bg-luxury-gradient/10 border border-lavender/20 rounded-xl space-y-3">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-lavender mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {businessName}
                </p>
                <p className="text-xs text-white/60 truncate">
                  glambooking.co.uk/book/{businessSlug}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCopyLink}
                className="flex-1 px-3 py-2 bg-luxury-gradient hover:opacity-90 text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy Link
                  </>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.open(`https://glambooking.co.uk/book/${businessSlug}`, "_blank")}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="p-4 space-y-2">
        <SignOutButton>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </motion.button>
        </SignOutButton>

        {/* User Button */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-10 h-10 rounded-full ring-2 ring-lavender/50",
              },
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-white/60 truncate">
              {user?.emailAddresses[0]?.emailAddress}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-3 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </motion.button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:border-r lg:border-white/10 lg:bg-black/80 lg:backdrop-blur-xl">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed inset-y-0 left-0 w-72 border-r border-white/10 bg-black/95 backdrop-blur-xl z-50 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
