import { test, expect } from '../../fixtures/e2e.fixture';
import { PRODUCTS } from '../../data/api-test-data';

const TITAN = PRODUCTS.titan;

test.describe('Cart hybrid: API setup, UI check @regression @e2e @hybrid @cart', () => {
  test.beforeEach(async ({ cartApi }) => {
    await cartApi.removeFromCart(TITAN.id);
  });

  test.afterEach(async ({ cartApi }) => {
    await cartApi.removeFromCart(TITAN.id);
  });

  test('an item added through the API shows on the cart page with its quantity', async ({
    cartApi,
    cartPage,
  }) => {
    const added = await cartApi.addToCart(TITAN.id, 2);

    expect(added.status(), 'API setup').toBe(200);

    await cartPage.goto();

    await expect(cartPage.rowFor(TITAN.id)).toBeVisible();
    await expect(cartPage.quantityFor(TITAN.id)).toHaveValue('2');
  });

  test('an item removed in the UI is gone for the API too', async ({ cartApi, cartPage }) => {
    await cartApi.addToCart(TITAN.id, 1);
    await cartPage.goto();
    await expect(cartPage.rowFor(TITAN.id)).toBeVisible();

    await cartPage.rowFor(TITAN.id).locator('.remove-btn').click();
    await cartPage.alert.confirm();
    await expect(cartPage.rowFor(TITAN.id)).toBeHidden();

    const res = await cartApi.addToCart(TITAN.id, TITAN.maxAllowed);
    expect(res.status()).toBe(200);
  });
});
