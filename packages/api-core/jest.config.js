module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts', 'node'],
  rootDir: 'src',
  testRegex: '.spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  coverageDirectory: '../coverage',
  collectCoverageFrom: ['**/*.ts', '!main.ts', '!**/*.{module,entity,type,input}.ts'],
  testEnvironment: '<rootDir>/../test/jest-node-environment.js',
  // Resolve absolute imports such as `src/users/models/user.entity`
  modulePaths: ['<rootDir>/..'],
  // Jest 27 ignores package.json `exports`: map the affected entry points by hand
  moduleNameMapper: {
    // axios resolves to its ESM build by default, which Jest 27 cannot load
    '^axios$': '<rootDir>/../node_modules/axios/dist/node/axios.cjs',
    // sharp loads its prebuilt binary through `@img/sharp-<platform>/sharp.node`
    '^@img/(sharp-[^/]+)/sharp\\.node$': '<rootDir>/../node_modules/@img/$1/lib/$1.node',
  },
};
