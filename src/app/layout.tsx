import type { Metadata } from "next";
import { Inter_Tight, Manrope } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { autoInitialize } from "@/lib/auto-init";
import "./globals.css";

// Auto-initialize on app startup
if (typeof window === 'undefined') {
  autoInitialize().catch(console.error);
}

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  weight: ["700", "800", "900"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "GlamBooking - Your Business Deserves Better Booking",
  description: "Luxury booking platform for beauty professionals with the lowest UK booking fees, 24/7 support, and unlimited bookings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${interTight.variable} ${manrope.variable}`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
