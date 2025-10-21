const path = require('path');
const dotenv = require('dotenv');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

dotenv.config({ path: path.join(__dirname, '../../.env') });
const MODE = 'development';
const DIST_PATH = path.resolve(__dirname, '../../public/neostatic');

module.exports = {
  mode: MODE,
	cache: { type: 'memory' },
  devtool :"eval",
  entry: { neo: './src/neo.tsx' },
  resolve: {
    plugins: [new TsconfigPathsPlugin()],
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  module: {
    rules: [
      // {
      //   test: /\.mjs$/,
      //   type: 'javascript/auto',
      // },
      {
        test: /\.(ts|js)x?$/,
				include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
        loader: 'babel-loader',
				options: {
					babelrc: true,
					cacheDirectory: true
			}
      },
      // Needed to be able to compile react-leaflet.
      // see https://github.com/PaulLeCam/react-leaflet/issues/891
      // {
      //   test: /\.m?js$/,
      //   include: [
      //     /node_modules\/@react-leaflet/,
      //     /node_modules\/react-leaflet/,
      //   ],
      //   use: {
      //     loader: 'babel-loader',
      //     options: {
      //       plugins: [
      //         '@babel/plugin-proposal-optional-chaining',
      //         '@babel/plugin-proposal-nullish-coalescing-operator',
      //       ],
      //     },
      //   },
      // },
    ],
  },
  plugins: [
    // new CleanWebpackPlugin(),
    new WebpackManifestPlugin(),
    new webpack.DefinePlugin({
      'process.env.FRONT_URL': JSON.stringify(process.env.FRONT_URL),
      'process.env.FRONT_GRAPHQL_URL': JSON.stringify(
        process.env.FRONT_GRAPHQL_URL,
      ),
      'process.env.CAMAP_HOST': JSON.stringify(process.env.CAMAP_HOST),
      'process.env.MAPBOX_KEY': JSON.stringify(process.env.MAPBOX_KEY),
    }),
		new HtmlWebpackPlugin({
      title: 'Dév - Neo',
     }),
    // new FileManagerPlugin({
    //   events: {
    //     onStart: {
    //       copy: [
    //         {
    //           source: `src/theme/${process.env.THEME_ID}/palette.ts`,
    //           destination: 'src/palette.ts',
    //         },
    //       ],
    //     },
    //     onEnd: {
    //       copy: [
    //         {
    //           source: 'src/theme/default/palette.ts',
    //           destination: 'src/palette.ts',
    //         },
    //       ],
    //     },
    //   },
    // }),
  ],
  output: {
    filename: '[name].[contenthash].bundle.js',
    path: DIST_PATH,
    libraryTarget: 'var',
    library: '[name]',
    crossOriginLoading: 'anonymous',
    publicPath: process.env.FRONT_URL + '/neostatic/',
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
          // enforce: true,
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          // chunks: 'all',
          // enforce: true,
        },
      },
    },
  },
};
