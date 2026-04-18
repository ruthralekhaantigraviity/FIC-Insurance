/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E3A8A',
          hover: '#1D4ED8',
          soft: '#60A5FA',
        },
        neutral: {
          bg: '#F9FAFB',
          card: '#FFFFFF',
          border: '#E5E7EB',
        },
        status: {
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#0EA5E9',
        }
      }
    },
  },
  plugins: [],
}
