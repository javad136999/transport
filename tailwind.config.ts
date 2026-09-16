import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        base: { DEFAULT: "#020812", panel: "#061426", panel2: "#0A1D33", border: "#12365A" },
        ink: { DEFAULT: "#EAF7FF", muted: "#8EAECA", faint: "#54718E" },
        brand: { DEFAULT: "#00BFFF", light: "#55E7FF", dark: "#0088CC", glow: "#75F3FF" },
        eco: { DEFAULT: "#19D9A5", light: "#5BFFD0", dark: "#0B9C77", glow: "#7CFFE0" },
        status: { ok: "#19D9A5", warn: "#FFC857", alert: "#FF5577", progress: "#55E7FF", idle: "#54718E" },
      },
      fontFamily: { vazir: ["var(--font-vazir)", "Tahoma", "sans-serif"], mono: ["var(--font-mono)", "monospace"] },
      borderRadius: { DEFAULT: "10px" },
      boxShadow: {
        panel: "0 0 0 1px #12365A",
        "glow-cyan": "0 0 28px -5px rgba(0,191,255,0.58)",
        "glow-green": "0 0 24px -5px rgba(25,217,165,0.35)",
      },
      backgroundImage: {
        "aqua-eco": "linear-gradient(135deg, #00BFFF 0%, #147DFF 100%)",
        "aqua-eco-soft": "linear-gradient(135deg, rgba(0,191,255,0.14) 0%, rgba(20,125,255,0.10) 100%)",
        "grid-lines": "linear-gradient(rgba(85,231,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(85,231,255,0.055) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
