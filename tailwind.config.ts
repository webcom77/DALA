import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", '"Plus Jakarta Sans"', "sans-serif"],
        serif: ["var(--font-serif)", '"Cormorant Garamond"', "serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brand: {
          50: "#FDF8F7",
          100: "#FAF0F2",
          200: "#F5DEE3",
          300: "#EBBDC7",
          500: "#C26D85",
          700: "#9C2A4A",
          800: "#84233D",
          900: "#541425",
        },
        nude: {
          50: "#FCFAF8",
          100: "#F8F4EE",
          200: "#EEE6DC",
          600: "#8C827A",
          800: "#4A443E",
        },
        luxury: {
          title: "#241E24",
          body: "#605862",
          muted: "#968E98",
          card: "#FFFFFF",
          border: "#F2E8EB",
        },
      },
      boxShadow: {
        soft: "0 4px 25px -4px rgba(156, 42, 74, 0.04), 0 2px 10px -2px rgba(0, 0, 0, 0.02)",
        "card-hover": "0 12px 30px -6px rgba(156, 42, 74, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)",
        pill: "0 2px 8px rgba(156, 42, 74, 0.06)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
