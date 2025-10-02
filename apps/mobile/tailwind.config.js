/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1', // Indigo
        secondary: '#8b5cf6', // Purple
        background: '#ffffff',
        surface: '#f9fafb',
        text: '#111827',
        'text-secondary': '#6b7280',
      },
    },
  },
  plugins: [],
};
