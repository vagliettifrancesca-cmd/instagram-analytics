/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 400: '#f472b6', 500: '#ec4899', 600: '#db2777', 700: '#be185d' },
        surface: { 900: '#0f0f13', 800: '#16161d', 700: '#1e1e28', 600: '#26262f', 500: '#2e2e3a' },
      },
    },
  },
  plugins: [],
}

