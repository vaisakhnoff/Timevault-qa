import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    // Generated output: reports and test artifacts are built by tools, not written by us.
    ignores: [
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
      'allure-results/**',
      'allure-report/**',
    ],
  },

  js.configs.recommended,

  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      'no-restricted-properties': [
        'error',
        {
          object: 'page',
          property: 'waitForTimeout',
          message: 'Avoid fixed waits; use Playwright auto-waiting or assertions.',
        },
      ],
    },
  },

  eslintConfigPrettier,
);
