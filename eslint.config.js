import { defineConfig } from 'eslint-define-config';
import prettierConfig from 'eslint-config-prettier';

export default defineConfig([
  prettierConfig,
  {
    languageOptions: {
      globals: {
        browser: true,
        es2021: true,
      },
      parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': 'error',
      'no-undef': 'error',
    },
    ignores: ['.gitignore'],
  },
  {
    files: ['commitlint.config.js'],
    languageOptions: {
      globals: {
        node: true,
      },
    },
  },
]);
