module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
    tsconfigRootDir: __dirname,
  },
  env: {
    node: true,
    jest: true,
  },
  extends: ['prettier', 'plugin:jest/style'],
  plugins: ['jest'],
  rules: {
    'import/prefer-default-export': 'off',
    'import/no-cycle': 'off',
    'class-methods-use-this': 'off',
    'import/first': ['off', 'disable-absolute-first'], // conflicts with import/order when importing dataloader
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/prefer-to-have-length': 'warn',
    'jest/valid-expect': 'error',
  },
};
