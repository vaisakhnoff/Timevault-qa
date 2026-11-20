import { defineConfig } from 'allure';

export default defineConfig({
  name: 'TimeVault QA',
  output: 'allure-report',
  plugins: {
    awesome: {
      options: {
        groupBy: ['epic', 'feature'],
      },
    },
  },
});
