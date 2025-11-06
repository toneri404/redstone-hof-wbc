/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        brand: ['"SequelSansBody"', 'system-ui', 'sans-serif'],
        mono: ['"Roboto Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        redstone: {
          bg:  "#180606",
          300: "#ff8080",
          400: "#fb7185",
          500: "#ef4444",
          600: "#d32f2f",
          700: "#b71c1c",
          800: "#7f1010",
        },
      },
      boxShadow: {
        "rs-card": "0 8px 40px rgba(255,0,0,0.10)",
      },
      transitionProperty: {
        glow: "color, background-color, box-shadow, transform",
      },
    },
  },
  plugins: [],
};
