/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          light: '#f6e27a',
          DEFAULT: '#d4af37',
          dark: '#8a6d3b',
        },
        sand: {
          light: '#f8f4e9',
          DEFAULT: '#e8e0cc',
          dark: '#d5c9a6',
        },
      },
      fontFamily: {
        vazir: ['Vazirmatn', 'sans-serif'],
      },
      backgroundImage: {
        'persian-pattern': "url('/src/assets/pattern.svg')",
      },
    },
  },
  plugins: [],
};