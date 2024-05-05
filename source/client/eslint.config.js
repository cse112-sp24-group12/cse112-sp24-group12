import js from '@eslint/js';
import jsdoc from 'eslint-plugin-jsdoc';
import prettierConfig from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default [
  js.configs.recommended,
  jsdoc.configs['flat/recommended-error'],
  prettierConfig,
  {
    files: ['./scripts/**/*.js', './__tests__/**/*.js'],
    ignores: ['./scripts/swiper-bundle.min.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: "module",
      globals: {
        ...globals.jest,
        ...globals.browser,
      }
    },
    rules: {},
    root: true,
  }
];