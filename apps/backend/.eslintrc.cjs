module.exports = {
  env: {
    node: true,
    es2022: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'script',
  },
  rules: {
    'no-console': 'off',
  },
  overrides: [
    {
      files: ['tests/**/*.js'],
      env: {
        node: true,
      },
    },
  ],
};
