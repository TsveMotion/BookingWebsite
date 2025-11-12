import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        black: "#0B0B0D",
        white: "#FFFFFF",
        rose: {
          gold: "#D4A574",
          light: "#F6C7B6",
        },
        blush: {
          pink: "#FFC9D0",
          light: "#FFE5E9",
        },
        lavender: {
          DEFAULT: "#CBA6F7",
          light: "#E8DAFF",
        },
        beige: {
          soft: "#F5F0EB",
        },
        // New gradient colors
        glam: {
          purple: "#b38cff",
          pink: "#ffb3ec",
        },
      },
      fontFamily: {
        heading: ["var(--font-inter-tight)", "Inter Tight", "sans-serif"],
        body: ["var(--font-manrope)", "Manrope", "sans-serif"],
      },
      backgroundImage: {
        "accent-gradient": "linear-gradient(90deg, #CBA6F7, #F6C7B6)",
        "rose-gradient": "linear-gradient(135deg, #D4A574 0%, #F6C7B6 100%)",
        "lavender-gradient": "linear-gradient(135deg, #CBA6F7 0%, #E8DAFF 100%)",
        "blush-gradient": "linear-gradient(135deg, #FFC9D0 0%, #FFE5E9 100%)",
        "luxury-gradient": "linear-gradient(135deg, #CBA6F7 0%, #F6C7B6 50%, #FFC9D0 100%)",
        // New GlamBooking brand gradient
        "glam-gradient": "linear-gradient(135deg, #b38cff 0%, #ffb3ec 100%)",
        "glam-gradient-radial": "radial-gradient(circle at center, #b38cff, #ffb3ec)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
