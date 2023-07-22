const webpack = require('webpack');
const path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  webpack: {
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
      new MonacoWebpackPlugin({
        languages: ['yaml'],
        customLanguages: [
          {
            label: 'yaml',
            entry: 'monaco-yaml',
            worker: {
              id: 'monaco-yaml/yamlWorker',
              entry: 'monaco-yaml/yaml.worker',
            },
          },
        ],
      }),
    ],
    configure: {
      externals: {
        'node:crypto': 'crypto',
      },
      resolve: {
        alias: {
          perf_hooks: path.resolve(__dirname, 'src/perf_hooks.ts'),
          fetch: path.resolve(__dirname, 'src/fetch.ts'),
        },
        extensions: ['.tsx', '.ts', '.js', '.jsx', '.json', '.png', '.jpg', '.jpeg', '.gif'],
        fallback: {
          buffer: require.resolve('buffer'),
          crypto: false,
          events: false,
          path: false,
          stream: false,
          string_decoder: false,
        },
      },
      ignoreWarnings: [
        ({ module, details }) => {
          // Here we check if warnings are coming from node_modules and are type od source-map
          // Than we remove it from console because we don't have any impact on those warnings
          // All other warnings that are coming from App will yield to the dev console
          return module?.resource?.includes('node_modules') && details?.includes('source-map-loader');
        },
      ],
    },
  },
};
