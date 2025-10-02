/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6366f1', // Indigo
          dark: '#4f46e5',
          light: '#818cf8',
        },
        surface: '#f9fafb',
        text: {
          DEFAULT: '#111827',
          muted: '#6b7280',
        },
      },
      spacing: {
        '1.5': '0.375rem',
      },
      fontFamily: {
        sans: ['System'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
};
