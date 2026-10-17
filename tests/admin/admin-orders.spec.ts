import { test, expect } from '../../fixtures/admin.fixture';


test.describe.skip('TimeVault Admin Order Tests', () => {

  test('@regression orders list loads with orders or empty state', async ({ ordersPage }) => {
    await ordersPage.goto();

    await expect(ordersPage.pageTitle).toBeVisible();

    const count = await ordersPage.getOrderCount();
    if (count > 0) {
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


  });

  test('@regression admin can advance an order status', async ({ ordersPage, page }) => {
    await ordersPage.goto();
    await ordersPage.openFirstOrder();

    const nextStatus = await ordersPage.getNextStatus();

    await ordersPage.updateStatus(nextStatus);

    await expect(page.getByText(nextStatus, { exact: true }).first()).toBeVisible();

  })
});