import { test, expect } from '../../fixtures/admin.fixture';

test.describe('TimeVault Admin Order Tests', () => {
  test('@regression orders list loads with orders or empty state', async ({ ordersPage }) => {
    await ordersPage.goto();
    await expect(ordersPage.pageTitle).toBeVisible();

    if ((await ordersPage.getOrderCount()) > 0) {
      await expect(ordersPage.ViewLinks.first()).toBeVisible();
    } else {
      await expect(ordersPage.emptyState).toBeVisible();
    }
  });

  test('@regression filter by status keeps the page valid', async ({ ordersPage, page }) => {
    await ordersPage.goto();
    await ordersPage.filterByStatus('Pending');

    await expect(page).toHaveURL(/status=Pending/);
    await expect(ordersPage.statusFilter).toHaveValue('Pending');

    if ((await ordersPage.getOrderCount()) === 0) {
      await expect(ordersPage.emptyState).toBeVisible();
    } else {
      await expect(ordersPage.ViewLinks.first()).toBeVisible();
    }
  });

  test('@regression admin order details show customer and item information', async ({
    ordersPage,
  }) => {
    await ordersPage.goto();

    test.skip(
      (await ordersPage.getOrderCount()) === 0,
      'No orders are available in the test database.',
    );

    await ordersPage.openFirstOrder();
    await expect(ordersPage.detailPageTitle).toBeVisible();
    await expect(ordersPage.userInformationHeading).toBeVisible();
    await expect(ordersPage.itemsHeading).toBeVisible();
  });

  test('@regression @negative returned order cannot be transitioned again', async ({
    ordersPage,
    page,
  }) => {
    await ordersPage.goto();

    test.skip(
      (await ordersPage.getOrderCount()) === 0,
      'No order is available for invalid-transition validation.',
    );

    const row = ordersPage.orderRows.first();
    test.skip(
      !(await row.innerText()).includes('Returned'),
      'The newest order is not Returned; terminal-transition test needs returned data.',
    );

    const href = await ordersPage.ViewLinks.first().getAttribute('href');
    const orderId = href?.split('/').pop();
    if (!orderId) throw new Error('Could not read order ID from the admin order link.');

    await ordersPage.openOrderById(orderId);
    await expect(ordersPage.detailStatusSelect).toHaveCount(0);
    await expect(ordersPage.detailUpdateButton).toHaveCount(0);

    const response = await page.context().request.post('/admin/update-order-status', {
      data: { orderId, newStatus: 'Pending' },
    });

    expect(response.status()).toBe(400);
    const body = (await response.json()) as { success: boolean; message: string };
    expect(body.success).toBe(false);
    expect(body.message).toContain('Cannot change status from Returned to Pending');
  });
});
