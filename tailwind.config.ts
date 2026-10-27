import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#00d992",
          soft: "#2fd6a1",
          deep: "#10b981",
          on: "#101010",
        },
        canvas: {
          DEFAULT: "#101010",
          soft: "#1a1a1a",
          textSoft: "#f5f6f7",
        },
        hairline: {
          DEFAULT: "#3d3a39",
          soft: "#b8b3b0",
        },
        ink: {
          DEFAULT: "#f2f2f2",
          strong: "#ffffff",
        },
        body: "#bdbdbd",
        mute: "#8b949e",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ['"JetBrains Mono"', "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        pill: "9999px",
      },
    },
  },
  plugins: [],
};

export default config;
