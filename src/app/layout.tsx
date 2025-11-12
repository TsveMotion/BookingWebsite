import type { Metadata } from "next";
import { Inter_Tight, Manrope } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import { autoInitialize } from "@/lib/auto-init";
import { SchemaMarkup } from "@/components/schema-markup";
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
  title: "GlamBooking — The #1 UK Salon Booking & Management Software",
  description: "Book beauty, wellness, and barbershop appointments instantly. Built for professionals who want to grow smarter — with no commissions and full control.",
  keywords: "salon software, barber booking, beauty appointment system, UK booking platform, glam booking, tsvweb, beauty salon management, spa booking system, wellness appointments",
  authors: [{ name: "TsvWeb", url: "https://tsvweb.co.uk" }],
  creator: "TsvWeb",
  publisher: "GlamBooking",
  icons: {
    icon: '/logo/LOGO_FAVICON_NEW.png',
    shortcut: '/logo/LOGO_FAVICON_NEW.png',
    apple: '/logo/LOGO_FAVICON_NEW.png',
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://glambooking.co.uk",
    title: "GlamBooking — The #1 UK Salon Booking & Management Software",
    description: "Book beauty, wellness, and barbershop appointments instantly. Built for professionals who want to grow smarter — with no commissions and full control.",
    siteName: "GlamBooking",
    images: [
      {
        url: "/logo/Logo_Long.png",
        width: 1200,
        height: 630,
        alt: "GlamBooking - Beauty & Wellness Booking Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GlamBooking — The #1 UK Salon Booking & Management Software",
    description: "Book beauty, wellness, and barbershop appointments instantly. Built for professionals who want to grow smarter — with no commissions and full control.",
    images: ["/logo/Logo_Long.png"],
    creator: "@glambooking",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <head>
          <SchemaMarkup />
        </head>
        <body className={`${interTight.variable} ${manrope.variable}`}>
          <Toaster position="top-right" />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
