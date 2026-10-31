import { COD_SAFE_PRODUCT } from '../../data/checkout-test-data';
import { test, expect } from '../../fixtures/base.fixture';
import { ensureCheckoutAddress, prepareCartForCodCheckout } from '../../utils/checkout.helpers';

test.describe('TimeVault Checkout Tests', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ addressPage, cartPage }) => {
    await ensureCheckoutAddress(addressPage);
    await cartPage.removeAllItems();
  });

  test.afterEach(async ({ cartPage }) => {
    await cartPage.removeAllItems();
  });

  test('@regression checkout shows cart summary and saved address', async ({
    productDetailsPage,
    cartPage,
    checkoutPage,
  }) => {
    await prepareCartForCodCheckout(productDetailsPage, cartPage);
    await checkoutPage.goto();

    await expect(checkoutPage.pageTitle).toBeVisible();
    await expect(checkoutPage.cartItemRows.first()).toContainText(COD_SAFE_PRODUCT.name);
    await expect(checkoutPage.addressRadios.first()).toBeVisible();
    await expect(checkoutPage.grandTotal).toContainText('₹');
  });

  test('@regression @boundary COD is unavailable above ₹5,000', async ({
    productDetailsPage,
    cartPage,
    checkoutPage,
  }) => {
    // Titan is verified above the UI-only ₹5,000 COD limit.
    await productDetailsPage.goto('6aad1146c76606074021e7ec');
    await productDetailsPage.addToCart();
    await cartPage.goto();
    await checkoutPage.goto();

    await expect(checkoutPage.codPayment).toBeDisabled();
  });
});
