module.exports = {
  extends: ['../../packages/config/eslint-config.js', 'react-app', 'react-app/jest'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
  },
  overrides: [
    {
      files: ['src/**/*.test.{js,jsx}'],
      env: {
        jest: true,
      },
    },
  ],
};
