module.exports = {
  root: true,
  extends: ['next/core-web-vitals', 'plugin:tailwindcss/recommended'],
  plugins: ['tailwindcss'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  settings: {
    tailwindcss: {
      callees: ['cn', 'clsx'],
      config: 'tailwind.config.js',
    },
  },
  rules: {
    'tailwindcss/classnames-order': 'warn',
    'tailwindcss/enforces-negative-arbitrary-values': 'warn',
    'tailwindcss/enforces-shorthand': 'off',
    'tailwindcss/migration-from-tailwind-2': 'off',
    'tailwindcss/no-arbitrary-value': 'off',
    'tailwindcss/no-custom-classname': 'off',
  },
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'dist/',
    'out/',
  ],
};
