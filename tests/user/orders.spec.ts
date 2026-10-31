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

test.describe('TimeVault Order Detail Tests', () => {
  test('@regression order details show items, address, and payment summary', async ({
    ordersPage,
    orderDetailsPage,
  }) => {
    await ordersPage.goto();

    const count = await ordersPage.getOrderCount();
    test.skip(count === 0, 'No order history is available for the test user.');

    await ordersPage.orderCards.first().getByRole('link', { name: 'View Details' }).click();

    await expect(orderDetailsPage.pageTitle).toBeVisible();
    await expect(orderDetailsPage.itemRows.first()).toBeVisible();
    await expect(orderDetailsPage.shippingAddressHeading).toBeVisible();
    await expect(orderDetailsPage.paymentSummaryHeading).toBeVisible();
  });
});
