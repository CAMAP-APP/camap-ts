const presets = [
  [
    '@babel/preset-env',
    // {
    //   targets: {
    //     browsers: ['IE 11'],
    //   },
    //   debug: false,
    //   modules: false,
    //   useBuiltIns: 'usage',
    //   bugfixes: true,
    //   corejs: 3,
    // },
  ],
  [
    '@babel/preset-react',
    {
      runtime: 'automatic',
    },
  ],
  '@babel/preset-typescript',
];
const plugins = [
  '@babel/plugin-proposal-class-properties',
  '@babel/plugin-transform-runtime',
];

module.exports = { presets, plugins, sourceType: 'unambiguous' };
