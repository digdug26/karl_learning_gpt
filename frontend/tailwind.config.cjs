/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        penguin: "#00A7E1",
        polar: "#F0F9FF",
        comicInk: "#1B1B1B",
      },
      fontFamily: {
        display: ["'Fredoka', sans-serif"],
      },
      borderRadius: {
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};
