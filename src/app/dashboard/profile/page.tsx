"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to settings page
    router.push("/dashboard/settings");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-white text-lg"
      >
        Redirecting to settings...
      </motion.div>
    </div>
  );
}
