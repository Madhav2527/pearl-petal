import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#F1EAE0",
        champagne: {
          DEFAULT: "#D8C5AB",
          light: "#EADDCB",
          dark: "#B8A387",
        },
        taupe: {
          DEFAULT: "#A18A70",
          light: "#BDB09E",
          dark: "#7A6750",
        },
        charcoal: {
          DEFAULT: "#39342F",
          light: "#57514A",
          dark: "#26221E",
        },
        cream: "#FAF8F5",
      },
      fontFamily: {
        serif: ["'Cormorant Garamond'", "Georgia", "serif"],
        sans: ["'DM Sans'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
