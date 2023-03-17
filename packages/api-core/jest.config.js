module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  coverageDirectory: '../coverage',
  collectCoverageFrom: ['**/*.ts', '!main.ts', '!**/*.{module,entity,type,input}.ts'],
  testEnvironment: 'node',
};
