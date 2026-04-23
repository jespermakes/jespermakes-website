import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    "text-cream", "text-cream/40", "text-cream/50", "text-cream/60",
    "text-cream/75", "text-cream/80", "text-cream/85",
    "text-wood", "text-wood-light", "text-wood-light/40",
    "text-wood-light/60", "text-wood-light/80",
    "text-forest", "text-forest-light", "text-amber",
    "bg-cream", "bg-white", "bg-wood", "bg-wood/[0.03]",
    "bg-forest", "bg-forest/[0.08]",
    "hover:text-cream", "hover:text-cream/80", "hover:text-forest/80",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FAF7F2",
        wood: "#2C1810",
        "wood-light": "#4A3228",
        forest: "#3F6B4A",
        "forest-dark": "#2F5338",
        "forest-light": "#5C8A69",
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
