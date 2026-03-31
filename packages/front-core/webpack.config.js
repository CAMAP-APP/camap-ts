const path = require('path');
const { execSync } = require('child_process');
const dotenv = require('dotenv');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');

dotenv.config({ path: path.join(__dirname, '../../.env') });
const MODE = 'production';
const DIST_PATH = path.resolve(__dirname, '../../public/neostatic');

function getCacheKey() {
  if (process.env.GIT_COMMIT_SHORT) {
    return process.env.GIT_COMMIT_SHORT.trim();
  }

  try {
    return execSync('git rev-parse --short HEAD', {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
  } catch (err) {
    return 'unknown';
  }
}

module.exports = {
  mode: MODE,
  entry: {
    neo: './src/neo.tsx',
    app: './src/app.ts',
  },
  // devtool: 'eval', // in dev mode, uncomment this line to get sourcemaps
  resolve: {
    plugins: [new TsconfigPathsPlugin()],
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.mjs$/,
        type: 'javascript/auto',
      },
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      // Needed to be able to compile react-leaflet.
      // see https://github.com/PaulLeCam/react-leaflet/issues/891
      {
        test: /\.m?js$/,
        include: [
          /node_modules\/@react-leaflet/,
          /node_modules\/react-leaflet/,
        ],
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              '@babel/plugin-proposal-optional-chaining',
              '@babel/plugin-proposal-nullish-coalescing-operator',
            ],
          },
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new WebpackManifestPlugin(),
    new webpack.DefinePlugin({
      // On ne fige plus FRONT_URL / FRONT_GRAPHQL_URL / CAMAP_HOST / MAPBOX_KEY ici :
      // tout ce qui est URL / tokens front est désormais lu via __APP_CONFIG__ côté browser.
      'process.env.NODE_ENV': JSON.stringify(MODE),
      '__CACHE_KEY__': JSON.stringify(getCacheKey()),
    }),
    new FileManagerPlugin({
      events: {
        onStart: {
          copy: [
            {
              source: `src/theme/${process.env.THEME_ID}/palette.ts`,
              destination: 'src/palette.ts',
            },
          ],
        },
        onEnd: {
          copy: [
            {
              source: 'src/theme/default/palette.ts',
              destination: 'src/palette.ts',
            },
          ],
        },
      },
    }),
  ],
  output: {
    filename: '[name].[contenthash].bundle.js',
    path: DIST_PATH,
    libraryTarget: 'var',
    library: '[name]',
    crossOriginLoading: 'anonymous',
    // PUBLIC PATH RUNTIME :
    // - valeur build-time neutre
    // - surchargée au runtime par src/set-public-path.ts via __webpack_require__.p
    publicPath: '/neostatic/',
  },
  optimization: {
    minimize: true,
    runtimeChunk: 'single',
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