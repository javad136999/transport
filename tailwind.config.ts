import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        base: { DEFAULT: "#effcff", panel: "#ffffff", panel2: "#f4fcff", border: "#bfeaf2" },
        ink: { DEFAULT: "#000000", muted: "#111827", faint: "#374151" },
        brand: { DEFAULT: "#00BFFF", light: "#55E7FF", dark: "#0077B6", glow: "#75F3FF" },
        eco: { DEFAULT: "#08A879", light: "#24C99A", dark: "#087F5B", glow: "#66E0BC" },
        status: { ok: "#07885F", warn: "#C77700", alert: "#DC2626", progress: "#008FD5", idle: "#627D98" },
      },
      fontFamily: { vazir: ["var(--font-vazir)", "Tahoma", "sans-serif"], mono: ["var(--font-mono)", "monospace"] },
      borderRadius: { DEFAULT: "10px" },
      boxShadow: {
        panel: "0 0 0 1px #bfeaf2",
        "glow-cyan": "0 0 28px -5px rgba(0,191,255,0.58)",
        "glow-green": "0 0 24px -5px rgba(8,168,121,0.30)",
        "glow-red": "0 0 24px -5px rgba(220,38,38,0.35)",
      },
      backgroundImage: {
        "aqua-eco": "linear-gradient(135deg, #00BFFF 0%, #147DFF 100%)",
        "aqua-eco-soft": "linear-gradient(135deg, rgba(0,191,255,0.14) 0%, rgba(20,125,255,0.10) 100%)",
        "grid-lines": "linear-gradient(rgba(0,191,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,191,255,0.08) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
