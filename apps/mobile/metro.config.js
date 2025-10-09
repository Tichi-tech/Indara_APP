// apps/mobile/metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Monorepo support: only watch necessary paths
config.watchFolders = [
  path.resolve(workspaceRoot, 'packages/shared'),
  path.resolve(workspaceRoot, 'packages/tokens'),
];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Exclude unnecessary paths for better performance
config.resolver.blockList = [
  /node_modules\/.*\/node_modules\//,
  /\.git\//,
  /\.vscode\//,
];

module.exports = withNativeWind(config, {
  input: './global.css',
});
