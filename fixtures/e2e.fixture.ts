import { BrowserContext, Page } from '@playwright/test';
import path from 'path';
import { test as base } from './base.fixture';

const adminStorageState = path.resolve(__dirname, '../playwright/.auth/admin.json');

type E2eFixtures = {
  adminContext: BrowserContext;
  adminPage: Page;
};

export const test = base.extend<E2eFixtures>({
  adminContext: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: adminStorageState,
    });

    await use(context);
    await context.close();
  },

  adminPage: async ({ adminContext }, use) => {
    const page = await adminContext.newPage();
    await use(page);
  },
});

export { expect } from '@playwright/test';
