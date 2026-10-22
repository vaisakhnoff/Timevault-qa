import { test, expect } from '../../fixtures/base.fixture';
import { CartPage } from '../../pages/user/cart.page';

test.describe.configure({ mode: 'serial' });

test.describe('TimeVault Cart Tests', () => {
  test('@regression item added from product page appears in cart', async ({
    cartPage,
    productDetailsPage,
  }) => {
    await productDetailsPage.goto('6aad1146c76606074021e7ec');
    await productDetailsPage.setQuantity(1);
    await productDetailsPage.addToCart();

    await cartPage.goto();

    await expect(cartPage.cartItems.first()).toBeVisible();
    expect(await cartPage.getItemCount()).toBeGreaterThan(0);
  });

  test('@regression updating quantity in cart increases item quantity', async ({
    productDetailsPage,
    cartPage,
  }) => {
    await productDetailsPage.goto('6aad1146c76606074021e7ec');
    await productDetailsPage.addToCart();
    await cartPage.goto();
    const before = parseInt(await cartPage.qtyInput.first().inputValue(), 10);

    await cartPage.increaseButton.first().click();

    await expect(cartPage.qtyInput.first()).toHaveValue(String(before + 1));
  });

  test('@regression removing an item empties the cart', async ({
    productDetailsPage,
    cartPage,
  }) => {
    await productDetailsPage.goto('6aad1146c76606074021e7ec');
    await productDetailsPage.addToCart();
    await cartPage.goto();

    //   expect(await cartPage.getItemCount()).toBeGreaterThan(0);
    //   await cartPage.removeFirstItem();
    //   expect(await cartPage.getItemCount()).toBe(0);

    await expect(cartPage.cartItems).not.toHaveCount(0);
    await cartPage.removeFirstItem();
    await expect(cartPage.cartItems).toHaveCount(0);
  });

  test.afterEach(async ({ cartPage }) => {
    await cartPage.removeAllItems();
  });
});
