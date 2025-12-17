import { Heading } from 'lucide-react';


/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading1: ['"BBH Bartle"', "sans-serif"],
        heading2: ['"Arial Black"', "sans-serif"],
        heading3: ['"Bebas Neue"'],
        heading4: ['"Montserrat"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
