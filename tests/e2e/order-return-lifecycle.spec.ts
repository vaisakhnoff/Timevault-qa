import { OrdersPage as AdminOrdersPage } from '../../pages/admin/orders.page';
import { ReturnsPage } from '../../pages/admin/returns.page';
import { COD_SAFE_PRODUCT } from '../../data/checkout-test-data';
import { test, expect } from '../../fixtures/e2e.fixture';
import {
  ensureCheckoutAddress,
  placeCodOrder,
  prepareCartForCodCheckout,
} from '../../utils/checkout.helpers';
import { parsePrice } from '../../utils/helpers';

test.describe('COD order and return lifecycle', () => {
  test.describe.configure({ mode: 'serial' });

  test('@e2e user order is delivered, returned, and refunded', async ({
    adminPage,
    addressPage,
    cartPage,
    checkoutPage,
    orderDetailsPage,
    ordersPage,
    productDetailsPage,
    walletPage,
  }) => {
    await ensureCheckoutAddress(addressPage);

    await productDetailsPage.goto(COD_SAFE_PRODUCT.id);
    const stockBefore = await productDetailsPage.getAvailableStock();

    await walletPage.goto();
    const walletBefore = parsePrice(await walletPage.getBalanceText());

    await prepareCartForCodCheckout(productDetailsPage, cartPage);
    const orderId = await placeCodOrder(checkoutPage);

    await ordersPage.goto();
    await expect(ordersPage.orderCardById(orderId)).toBeVisible();
    await ordersPage.openOrder(orderId);
    await expect(orderDetailsPage.pageTitle).toBeVisible();
    await expect(orderDetailsPage.itemRows).toContainText(COD_SAFE_PRODUCT.name);
    await expect(orderDetailsPage.shippingAddressHeading).toBeVisible();
    await expect(orderDetailsPage.paymentSummaryHeading).toBeVisible();

    const adminOrdersPage = new AdminOrdersPage(adminPage);
    await adminOrdersPage.goto();
    await adminOrdersPage.openOrderById(orderId);

    for (const nextStatus of ['Shipped', 'Out for Delivery', 'Delivered']) {
      await adminOrdersPage.updateStatus(nextStatus);
    }

    await orderDetailsPage.goto(orderId);
    await expect(orderDetailsPage.returnButton).toBeVisible();
    await orderDetailsPage.requestReturnForFirstItem('QA lifecycle return request');

    const returnsPage = new ReturnsPage(adminPage);
    await returnsPage.goto();
    await expect(returnsPage.returnRowByOrderId(orderId)).toBeVisible();
    await returnsPage.approveByOrderId(orderId);
    await expect(returnsPage.returnRowByOrderId(orderId)).toHaveCount(0);

    await walletPage.goto();
    const walletAfter = parsePrice(await walletPage.getBalanceText());
    expect(walletAfter).toBe(walletBefore + COD_SAFE_PRODUCT.observedPrice);

    await productDetailsPage.goto(COD_SAFE_PRODUCT.id);
    expect(await productDetailsPage.getAvailableStock()).toBe(stockBefore);
  });
});
