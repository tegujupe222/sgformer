/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx"
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#005A9C',
        'brand-secondary': '#3B7EBF',
        'brand-accent': '#F5A623',
        'brand-dark': '#2c3e50',
        'brand-light': '#f8f9fa'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    }
  },
  plugins: [],
} 