const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.unstable_enablePackageExports = false;

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  path: require.resolve('path-browserify'),
};

module.exports = config;