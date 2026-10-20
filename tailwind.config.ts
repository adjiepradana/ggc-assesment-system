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
        "ggc-dark": "#063424",
        "ggc": "#0B4632",
        "ggc-light": "#126348",
        "ggc-subtle": "#EBF4F0",
        "ggc-tint": "#F3F8F5",
        "ggc-gold": "#C5A869",
        "ggc-gold-dark": "#A6863F",
        "ggc-gold-subtle": "#FAF6ED",
        // Also support nested syntax e.g. ggc.gold.subtle
        ggc_palette: {
          dark: "#063424",
          DEFAULT: "#0B4632",
          light: "#126348",
          subtle: "#EBF4F0",
          tint: "#F3F8F5",
          gold: "#C5A869",
          "gold-dark": "#A6863F",
          "gold-subtle": "#FAF6ED",
        },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta-sans)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-plus-jakarta-sans)", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
