const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const { mergeConfig, loadEnv } = require('vite');
const tsconfigPaths = require('vite-tsconfig-paths').default;

module.exports = {
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },

  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)', '../stories/**/*.stories.@(js|jsx|ts|tsx)'],

  addons: [
    '@storybook/addon-links',
    {
      name: '@storybook/addon-essentials',
      options: {
        docs: false,
      },
    },
  ],

  core: {
    disableTelemetry: true,
  },

  typescript: {
    reactDocgen: 'none',
  },

  managerWebpack: (config) => {
    config.resolve.plugins = [
      ...(config.resolve.plugins || []),
      new TsconfigPathsPlugin({
        configFile: path.join(__dirname, '../tsconfig.json'),
      }),
    ];
    return config;
  },

  async viteFinal(config, { configType }) {
    const env = loadEnv(configType, path.resolve(__dirname, '../../..'), [
      'FRONT_',
      'CAMAP_',
      'MAPBOX_KEY',
    ]);
    return mergeConfig(config, {
      plugins: [
        tsconfigPaths({
          projects: [path.resolve(__dirname, '../tsconfig.json')],
        }),
      ],
      define: {
        'process.env.IS_STORY': true,
        'process.env.FRONT_URL': JSON.stringify(env.FRONT_URL),
        'process.env.MAPBOX_KEY': JSON.stringify(env.MAPBOX_KEY),
        'process.env.FRONT_GRAPHQL_URL': JSON.stringify(env.FRONT_GRAPHQL_URL),
        'process.env.CAMAP_HOST': JSON.stringify(env.CAMAP_HOST),
      },
      optimizeDeps: {
        include: [
          'camap-common',
          '@mui/x-date-pickers/AdapterDateFns',
          '@mui/x-date-pickers/LocalizationProvider',
          'date-fns/locale/fr',
          '@mui/material/styles/ThemeProvider',
        ],
      },
      build: {
        commonjsOptions: {
          include: [/camap-common/],
        },
      },
    });
  },

  staticDirs: ['../../../../camap-hx/www/'],

  docs: {
    autodocs: true
  }
};
