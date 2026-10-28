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
        navy: {
          50: '#F0F3F9',
          100: '#E1E7F2',
          800: '#1E293B',
          900: '#111827',
          950: '#0B0F19',
        },
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#4F46E5', // Primary Indigo
          600: '#4338CA', // Indigo Hover
          700: '#3730A3',
          800: '#312E81',
          900: '#1E1B4B',
        },
        accent: {
          purple: '#7C3AED',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#EF4444',
        },
        page: '#F8FAFC',
        card: '#FFFFFF',
        slateBorder: '#E2E8F0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px -2px rgba(17, 24, 39, 0.05), 0 1px 3px -1px rgba(17, 24, 39, 0.03)',
        'premium': '0 10px 25px -5px rgba(17, 24, 39, 0.06), 0 8px 10px -6px rgba(17, 24, 39, 0.04)',
        'glow': '0 0 20px -3px rgba(79, 70, 229, 0.25)',
      },
    },
  },
  plugins: [],
}
