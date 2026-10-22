import { test, expect } from '../../fixtures/base.fixture';

test.describe('TimeVault Orders Tests', () => {
  test('@regression orders page loads and shows orders or empty state', async ({ ordersPage }) => {
    await ordersPage.goto();

    await expect(ordersPage.pageTitle).toBeVisible();

    const count = await ordersPage.getOrderCount();

    if (count > 0) {
      await expect(ordersPage.orderCards.first()).toBeVisible();
    } else {
      await expect(ordersPage.emptyState).toBeVisible();
    }
  });
});
