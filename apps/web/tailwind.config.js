/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
    "./src/**/*.{js,jsx}",
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
      colors: {
        cream: {
          DEFAULT: "#E8D2B5",
          light: "#F2E3CE",
          dark: "#D8BE9B",
        },
        sage: {
          DEFAULT: "#A5A79B",
          light: "#C3C5BB",
          dark: "#6F7263",
        },
        burgundy: {
          DEFAULT: "#590907",
          light: "#7A1512",
          dark: "#3F0605",
          deeper: "#2B0403",
        },
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
        "background-dark": "hsl(var(--background-dark) / <alpha-value>)",
        "background-darker": "hsl(var(--background-darker) / <alpha-value>)",
        "accent-green": {
          DEFAULT: "hsl(var(--accent-green) / <alpha-value>)",
          dark: "hsl(var(--accent-green-dark) / <alpha-value>)",
        },
        "warning-orange": "hsl(var(--warning-orange) / <alpha-value>)",
        "success-green": "hsl(var(--success-green) / <alpha-value>)",
        "civic-novice": "hsl(var(--civic-novice) / <alpha-value>)",
        "civic-champion": "hsl(var(--civic-champion) / <alpha-value>)",
        "civic-guardian": "hsl(var(--civic-guardian) / <alpha-value>)",
        "qr-success": {
          DEFAULT: "hsl(var(--qr-success) / <alpha-value>)",
          foreground: "hsl(var(--qr-success-foreground) / <alpha-value>)",
        },
        "qr-warning": {
          DEFAULT: "hsl(var(--qr-warning) / <alpha-value>)",
          foreground: "hsl(var(--qr-warning-foreground) / <alpha-value>)",
        },
        "qr-error": {
          DEFAULT: "hsl(var(--qr-error) / <alpha-value>)",
          foreground: "hsl(var(--qr-error-foreground) / <alpha-value>)",
        },
        "qr-container": "hsl(var(--qr-container) / <alpha-value>)",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
