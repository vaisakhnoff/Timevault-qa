import { BrowserContext, Page } from '@playwright/test';
import path from 'path';
import { test as base } from './base.fixture';
import { CartApi } from '../api/cart.api';
import { AdminApi } from '../api/admin.api';

const adminStorageState = path.resolve(__dirname, '../playwright/.auth/admin.json');

type E2eFixtures = {
  adminContext: BrowserContext;
  adminPage: Page;
  cartApi: CartApi;
  adminApi: AdminApi;
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

  cartApi: async ({ page }, use) => {
    await use(new CartApi(page.request));
  },

  adminApi: async ({ adminContext }, use) => {
    await use(new AdminApi(adminContext.request));
  },
});

export { expect } from '@playwright/test';
