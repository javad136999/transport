import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: "#050D14",
          panel: "#0A1720",
          panel2: "#0F2029",
          border: "#1B3540",
        },
        ink: {
          DEFAULT: "#E9F6F6",
          muted: "#8FB4B8",
          faint: "#547278",
        },
        // نئون آبی — آب / GPS / جریان دیجیتال
        brand: {
          DEFAULT: "#00C2D1",
          light: "#3FE8F5",
          dark: "#00838F",
          glow: "#5DFDFF",
        },
        // سبز محیط‌زیست — تصفیه / تأیید / پایداری
        eco: {
          DEFAULT: "#1FCF7A",
          light: "#5CFFB0",
          dark: "#0E8F52",
          glow: "#7CFFCB",
        },
        status: {
          ok: "#1FCF7A",
          warn: "#F5B942",
          alert: "#FF4D6D",
          progress: "#3FE8F5",
          idle: "#547278",
        },
      },
      fontFamily: {
        vazir: ["var(--font-vazir)", "Tahoma", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        DEFAULT: "8px",
      },
      boxShadow: {
        panel: "0 0 0 1px #1B3540",
        "glow-cyan": "0 0 24px -4px rgba(63,232,245,0.45)",
        "glow-green": "0 0 24px -4px rgba(92,255,176,0.4)",
      },
      backgroundImage: {
        "aqua-eco": "linear-gradient(135deg, #00C2D1 0%, #1FCF7A 100%)",
        "aqua-eco-soft": "linear-gradient(135deg, rgba(0,194,209,0.15) 0%, rgba(31,207,122,0.15) 100%)",
        "grid-lines":
          "linear-gradient(rgba(63,232,245,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(63,232,245,0.06) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
