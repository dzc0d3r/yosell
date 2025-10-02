import {config as libraryConfig} from '@workspace/eslint-config/base'; // adjust path if needed
import tsParser from '@typescript-eslint/parser';

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
  // include your shared config first
  ...libraryConfig,

  {
    ignores: ['apps/**', 'packages/**'],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: true,
      },
    },
  },
];

export default config;
