/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#3B82F6', // Bright blue
          secondary: '#1E40AF', // Deep blue
          accent: '#22C55E', // Fresh green
          light: '#EFF6FF', // Light blue
          dark: '#1E293B', // Slate blue
        },
      },
    },
  },
  plugins: [],
};