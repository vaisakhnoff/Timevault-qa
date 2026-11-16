import { BrowserContext } from '@playwright/test';
import envConfig from '../../config/env.config';
import { CustomersPage } from '../../pages/admin/customers.page';
import { LoginPage } from '../../pages/user/login.page';
import { test, expect } from '../../fixtures/e2e.fixture';

test.describe('Blocked customer login', () => {
  test.describe.configure({ mode: 'serial' });

  test('@e2e @security blocked customer cannot log in', async ({ adminPage, browser }) => {
    test.skip(
      !envConfig.blockableUserEmail || !envConfig.blockableUserPassword,
      'Set TEST_BLOCKABLE_USER_EMAIL and TEST_BLOCKABLE_USER_PASSWORD in .env.',
    );

    const customersPage = new CustomersPage(adminPage);
    await customersPage.goto();
    await customersPage.search(envConfig.blockableUserEmail);
    await expect(customersPage.rowByEmail(envConfig.blockableUserEmail)).toBeVisible();

    if ((await customersPage.getStatusByEmail(envConfig.blockableUserEmail)) === 'Blocked') {
      await customersPage.unblockByEmail(envConfig.blockableUserEmail);
    }

    let customerContext: BrowserContext | undefined;

    try {
      await customersPage.blockByEmail(envConfig.blockableUserEmail);

      customerContext = await browser.newContext({
        storageState: { cookies: [], origins: [] },
      });
      const customerPage = await customerContext.newPage();
      const loginPage = new LoginPage(customerPage);

      await loginPage.goto();
      await loginPage.login(envConfig.blockableUserEmail, envConfig.blockableUserPassword);
      await loginPage.expectLoginError('User is blocked by admin');
    } finally {
      await customerContext?.close();
      await customersPage.goto();
      await customersPage.search(envConfig.blockableUserEmail);

      if ((await customersPage.getStatusByEmail(envConfig.blockableUserEmail)) === 'Blocked') {
        await customersPage.unblockByEmail(envConfig.blockableUserEmail);
      }
    }
  });
});
