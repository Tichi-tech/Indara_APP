// Single source of truth for ALL packages/apps
module.exports = function (api) {
  api.cache(true);
  return {
    // Stop Babel from reading any .babelrc or "babel" in package.json
    babelrc: false,
    // Minimal, correct setup for Expo + expo-router + NativeWind
    presets: ['babel-preset-expo'],
    plugins: ['expo-router/babel', 'nativewind/babel'],
  };
};
