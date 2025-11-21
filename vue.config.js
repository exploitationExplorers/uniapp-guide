const { codeInspectorPlugin } = require('code-inspector-plugin');

module.exports = {
  // ...other code
  chainWebpack: (config) => {
    config.plugin('code-inspector-plugin').use(
      codeInspectorPlugin({
        bundler: 'webpack',
      })
    );
  },
};