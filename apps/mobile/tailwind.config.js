const tokensPreset = require('../../packages/tokens/tailwind.preset.cjs');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    // '../../packages/ui/src/**/*.{js,jsx,ts,tsx}', // removed - package doesn't exist yet
  ],
  presets: [require('nativewind/preset'), tokensPreset],
  plugins: [],
};
