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
          // --- Blue + Yellow Palette ---

          // Background / surfaces (dark blue base)
          bg: "#020617", // main app background (very dark navy)
          surface: "#02081A", // shells / cards
          panel: "#020617", // deeper panels / sidebar

          // Core palette
          primary: "#1D4ED8", // strong blue (primary actions)
          secondary: "#FACC15", // golden yellow (accents / positives)

          // Status / data usage (still only blue & yellow family)
          low: "#60A5FA", // lighter blue (low usage / very efficient)
          normal: "#FDE047", // bright yellow (normal usage)
          warning: "#FACC15", // yellow (warning / high usage)
          danger: "#CA8A04", // deeper yellow/amber (critical usage)
          inactive: "#1E293B", // blue-gray (inactive / standby)

          // Text + borders (blue-tinted)
          fg: "#E5F2FF", // light blue-white (main text)
          muted: "#BFDBFE", // softer blue for secondary text
          accent: "#38BDF8", // cyan-ish blue highlight
          dim: "#7C93C5", // dim / disabled
          border: "rgba(37, 99, 235, 0.45)", // blue border tint
        },
      },
      gridTemplateColumns: {
        shell: "18rem 1fr",
      },
    },
  },
  plugins: [],
} satisfies Config;
