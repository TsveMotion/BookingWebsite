"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission?: 'canManageBookings' | 'canManageClients' | 'canManageServices' | 'canManageAnalytics' | 'canManageTeam' | 'canManageBilling' | 'canManageLocations' | 'isOwner';
  fallbackPath?: string;
}

export function PermissionGuard({ 
  children, 
  requiredPermission,
  fallbackPath = '/dashboard' 
}: PermissionGuardProps) {
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkPermission();
  }, [requiredPermission]);

  const checkPermission = async () => {
    try {
      const response = await fetch('/api/permissions');
      if (response.ok) {
        const permissions = await response.json();
        
        // If no specific permission required, allow access
        if (!requiredPermission) {
          setHasPermission(true);
          setLoading(false);
          return;
        }

        // Check if user has required permission
        const allowed = permissions[requiredPermission];
        
        if (allowed) {
          setHasPermission(true);
        } else {
          // Redirect to fallback path if no permission
          setTimeout(() => {
            router.push(fallbackPath);
          }, 2000);
        }
      } else {
        router.push('/sign-in');
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      router.push('/sign-in');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-lavender animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full glass-card p-8 text-center"
        >
          <AlertTriangle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-white/60 mb-6">
            You don't have permission to access this page. Redirecting to dashboard...
          </p>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
