/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          50: 'rgb(var(--theme-rgb) / 0.1)',
          100: 'rgb(var(--theme-rgb) / 0.2)',
          200: 'rgb(var(--theme-rgb) / 0.3)',
          300: 'rgb(var(--theme-rgb) / 0.4)',
          400: 'rgb(var(--theme-rgb) / 0.6)',
          500: 'rgb(var(--theme-rgb) / 0.8)',
          600: 'rgb(var(--theme-rgb) / 1)',
          700: 'rgb(var(--theme-rgb) / 0.9)',
          800: 'rgb(var(--theme-rgb) / 0.8)',
          900: 'rgb(var(--theme-rgb) / 0.7)',
        },
        purple: {
          400: 'rgb(var(--theme-rgb) / 0.7)',
          500: 'rgb(var(--theme-rgb) / 0.85)',
          600: 'rgb(var(--theme-rgb) / 1)',
          700: 'rgb(var(--theme-rgb) / 0.9)',
          800: 'rgb(var(--theme-rgb) / 0.8)',
        }
      }
    },
  },
  plugins: [],
}
