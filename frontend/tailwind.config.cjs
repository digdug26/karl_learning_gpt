/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        comicInk: "#1B1B1B",
        sky: { 500: "#38BDF8", 600: "#0EA5E9" },
        amber: { 400: "#FBBF24", 500: "#F59E0B" },
        grass: { 400: "#34D399", 500: "#10B981" },
      },
      fontFamily: {
        display: ["'Fredoka', sans-serif"],
      },
      borderRadius: { xl: "1rem", "2xl": "1.5rem" },
    },
  },
  plugins: [],
};
