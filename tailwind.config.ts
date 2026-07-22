import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./services/**/*.{ts,tsx}",
    "./stores/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        neon: {
          red: "#ff2638",
          pink: "#22d3ee",
          fuchsia: "#38bdf8",
          ember: "#ff4b3e",
          cyan: "#22d3ee",
          blue: "#38bdf8",
          wine: "#3a0712"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      boxShadow: {
        glow: "0 0 35px rgba(255, 38, 56, 0.22)",
        pinkGlow: "0 0 40px rgba(34, 211, 238, 0.18)",
        cyanGlow: "0 0 34px rgba(34, 211, 238, 0.2)"
      },
      backgroundImage: {
        "fitness-radial":
          "radial-gradient(circle at top left, rgba(255, 38, 56, 0.22), transparent 32%), radial-gradient(circle at 85% 0%, rgba(34, 211, 238, 0.11), transparent 26%), linear-gradient(135deg, #06070a 0%, #21070e 48%, #050506 100%)"
      }
    }
  },
  plugins: [animate]
};

export default config;
