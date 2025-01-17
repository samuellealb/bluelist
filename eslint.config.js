import { defineConfig } from 'eslint-define-config';
import prettierConfig from 'eslint-config-prettier';

export default defineConfig([
  prettierConfig,
  {
    languageOptions: {
      globals: {
        node: true,
        process: true,
        console: true,
      },

      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': 'error',
      'no-undef': 'error',
    },
    ignores: ['.gitignore'],
  },
]);
