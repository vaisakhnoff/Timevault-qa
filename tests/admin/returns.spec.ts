import { test, expect } from '../../fixtures/admin.fixture';


test.describe('TimeVault Admin Return Request Tests', () => {

  test('@regression return requests page loads with requests or empty state', async ({ returnsPage }) => {
    await returnsPage.goto();

    await expect(returnsPage.pageTitle).toBeVisible();

    const count = await returnsPage.getRequestCount();
    if (count > 0) {
      await expect(returnsPage.returnRows.first()).toBeVisible();
    } else {
      await expect(returnsPage.emptyState).toBeVisible();
    }
  });

  test('@regression admin can approve a return request', async ({ returnsPage }) => {
    await returnsPage.goto();

    
    const before = await returnsPage.getRequestCount();
    test.skip(before === 0, 'No pending return request to process.');

    await returnsPage.approveFirst();

    await expect(returnsPage.orderLinks).toHaveCount(before - 1);
  });
});