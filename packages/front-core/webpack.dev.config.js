const path = require('path');
const dotenv = require('dotenv');
const webpack = require('webpack');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

dotenv.config({ path: path.join(__dirname, '../../.env') });
const MODE = 'development';
const DIST_PATH = path.resolve(__dirname, '../../public/neostatic');

module.exports = {
  mode: MODE,
  cache: { type: 'memory' },
  devtool: 'eval',
  entry: { neo: './src/neo.tsx' },
  resolve: {
    plugins: [new TsconfigPathsPlugin()],
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          babelrc: true,
          cacheDirectory: true,
        },
      },
    ],
  },
  plugins: [
    new WebpackManifestPlugin(),
    new webpack.DefinePlugin({
      // On ne fige plus FRONT_URL / FRONT_GRAPHQL_URL / CAMAP_HOST / MAPBOX_KEY.
      // La config front (URLs, clés) est désormais injectée AU RUNTIME via window.__APP_CONFIG__.
      'process.env.NODE_ENV': JSON.stringify(MODE),
    }),
    new HtmlWebpackPlugin({
      title: 'Dév - Neo',
    }),
  ],
  output: {
    filename: '[name].[contenthash].bundle.js',
    path: DIST_PATH,
    libraryTarget: 'var',
    library: '[name]',
    crossOriginLoading: 'anonymous',
    // Public path neutre, surchargé au runtime par src/set-public-path.ts
    publicPath: '/neostatic/',
  },
  optimization: {
    sideEffects: true,
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: {
      cacheGroups: {
        reactlibs: {
          test: /[\\/]node_modules[\\/](react|react-dom|@mui\/material)[\\/]/,
          name: 'reactlibs',
          chunks: 'all',
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
        },
      },
    },
  },
};
