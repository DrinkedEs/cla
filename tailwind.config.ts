import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#07050D",
        night: "#101018",
        panel: "#171320",
        violet: {
          glow: "#8B5CF6",
          electric: "#A855F7",
          deep: "#3B116B"
        },
        mint: "#69F0D7",
        rose: "#F472B6"
      },
      boxShadow: {
        aura: "0 24px 80px rgba(139, 92, 246, 0.28)",
        soft: "0 18px 50px rgba(0, 0, 0, 0.35)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
