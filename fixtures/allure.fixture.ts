import { test as base } from '@playwright/test';
import { applyAllureLabels } from '../utils/allure-labels';

/**
 * Base for every fixture file. The auto fixture runs before each test (no test has to ask for it)
 * and sets the Allure epic, feature and severity labels.
 */
export const test = base.extend<{ allureLabels: void }>({
  allureLabels: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use, testInfo) => {
      await applyAllureLabels(testInfo);
      await use();
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
