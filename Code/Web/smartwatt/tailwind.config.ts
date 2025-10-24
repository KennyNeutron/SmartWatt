// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        smart: {
          bg: "#0C0C0C",
          surface: "#181312",
          panel: "#481E14",
          muted: "#9B3922",
          accent: "#F2613F",
          fg: "#EAEAEA",
          dim: "#A9A9A9",
          border: "rgba(255,255,255,0.08)",
        },
      },
      gridTemplateColumns: {
        shell: "18rem 1fr",
      },
    },
  },
  plugins: [],
} satisfies Config;
