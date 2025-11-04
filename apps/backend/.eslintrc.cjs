module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:n/recommended',
    'plugin:promise/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'script',
  },
  plugins: ['n', 'promise'],
  settings: {
    node: {
      version: '>=20.0.0',
    },
  },
  rules: {
    'no-console': ['warn', { allow: ['error', 'warn', 'info'] }],
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', ignoreRestSiblings: true }],
    'promise/always-return': 'off',
  },
  overrides: [
    {
      files: ['tests/**/*.js'],
      env: {
        node: true,
      },
      rules: {
        'n/no-unpublished-require': 'off',
        'promise/param-names': 'off',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'coverage/',
    'dist/',
    'tmp/',
  ],
};
