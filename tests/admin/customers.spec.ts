import { test, expect } from '../../fixtures/admin.fixture';

const TARGET_CUSTOMER = 'svvasudevam@gmail.com';
const PROTECTED_USER = 'vaisakhnofficial@gmail.com';


test.describe('TimeVault Admin Customer Tests', () => {

  test('@regression admin can block then unblock a customer', async ({ customersPage }) => {

    expect(TARGET_CUSTOMER).not.toBe(PROTECTED_USER);

    await customersPage.goto();
    await customersPage.search(TARGET_CUSTOMER);

    const row = customersPage.rowByEmail(TARGET_CUSTOMER);
    await expect(row).toBeVisible();


    const initial = await customersPage.getStatusByEmail(TARGET_CUSTOMER);
    if (initial === 'Blocked') {
      await customersPage.unblockByEmail(TARGET_CUSTOMER);
    }
    await expect(row.locator('.tv-badge')).toHaveText('Active');


    await customersPage.blockByEmail(TARGET_CUSTOMER);
    await expect(row.locator('.tv-badge')).toHaveText('Blocked');


    await customersPage.unblockByEmail(TARGET_CUSTOMER);
    await expect(row.locator('.tv-badge')).toHaveText('Active');
  });
});
