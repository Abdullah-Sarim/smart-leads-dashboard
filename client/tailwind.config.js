/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        success: { DEFAULT: '#10b981', 50: '#ecfdf5', 500: '#10b981' },
        warning: { DEFAULT: '#f59e0b', 50: '#fffbeb', 500: '#f59e0b' },
        danger: { DEFAULT: '#ef4444', 50: '#fef2f2', 500: '#ef4444' },
      },
    },
  },
  plugins: [],
};