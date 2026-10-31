import { test, expect } from '../../fixtures/admin.fixture';

test.describe('TimeVault Admin Return Request Tests', () => {
  test('@regression return requests page loads with requests or empty state', async ({
    returnsPage,
  }) => {
    await returnsPage.goto();
    await expect(returnsPage.pageTitle).toBeVisible();

    if ((await returnsPage.getRequestCount()) > 0) {
      await expect(returnsPage.returnRows.first()).toBeVisible();
    } else {
      await expect(returnsPage.emptyState).toBeVisible();
    }
  });

  // Approval is tested with exact user/admin data in:
  // tests/e2e/order-return-lifecycle.spec.ts
  // Do not process an arbitrary existing request here.
});
