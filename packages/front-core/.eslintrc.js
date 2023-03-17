module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: ['react-app', 'react-app/jest', 'prettier'],
  plugins: ['i18next'],
  rules: {
    'react/self-closing-comp': [
      'error',
      {
        component: true,
        html: true,
      },
    ],
    '@typescript-eslint/no-non-null-assertion': 'off',
    'react/jsx-wrap-multilines': 'off',
    '@typescript-eslint/ban-ts-ignore': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      { devDependencies: ['**/*.stories.tsx', '**/*.mock.tsx'] },
    ],
    'i18next/no-literal-string': [
      'error',
      { onlyAttribute: ['title'], ignore: ['ㅤ', '€', '×', '≈'] },
    ],
  },
};
