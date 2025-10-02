const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// watch workspace packages
config.watchFolders = [path.resolve(workspaceRoot, 'packages')];

// prefer node_modules from app and workspace root
config.resolver.unstable_enableSymlinks = true;
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// force a single React / RN instance
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  react: path.resolve(workspaceRoot, 'node_modules/react'),
  'react-native': path.resolve(workspaceRoot, 'node_modules/react-native'),
};

// some libs ship .cjs
if (!config.resolver.sourceExts.includes('cjs')) {
  config.resolver.sourceExts.push('cjs');
}

module.exports = withNativeWind(config, { input: './global.css' });
