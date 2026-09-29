/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#bae0ff',
          300: '#7cc2ff',
          400: '#369eff',
          500: '#0975f6',
          600: '#0058d2',
          700: '#0045ab',
          800: '#043b8b',
          900: '#0a326f',
        }
      }
    },
  },
  plugins: [],
}
