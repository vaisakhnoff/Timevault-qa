import { test, expect } from '../../fixtures/admin.fixture';

test.describe('TimeVault Admin Order Tests', () => {
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

    const count = await ordersPage.getOrderCount();
    if (count === 0) {
      await expect(ordersPage.emptyState).toBeVisible();
    } else {
      await expect(ordersPage.ViewLinks.first()).toBeVisible();
    }
  });

  test('@regression admin can advance a pending order to the next status', async ({
    ordersPage,
    page,
  }) => {
    await ordersPage.goto();
    await ordersPage.filterByStatus('Pending');

    if ((await ordersPage.getOrderCount()) === 0) {
      test.skip(true, 'No Pending order is available to advance.');
      return;
    }

    await ordersPage.openFirstOrder();
    await expect(ordersPage.detailStatusSelect).toBeVisible();

    const nextStatus = await ordersPage.getNextStatus();

    if (!nextStatus) {
      test.skip(true, 'The selected order has no valid next status.');
      return;
    }

    await ordersPage.updateStatus(nextStatus);

    await expect(page.getByText(nextStatus, { exact: true }).first()).toBeVisible();
  });
});
