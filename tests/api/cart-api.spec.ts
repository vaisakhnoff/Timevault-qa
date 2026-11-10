import { test, expect } from '../../fixtures/api.fixture';
import type { CartResponse } from '../../api/cart.api';
import { PRODUCTS, INVALID_PRODUCT_ID } from '../../data/api-test-data';

const TITAN = PRODUCTS.titan;

test.describe('Cart API @api @cart', () => {
  // Every test starts and ends with TITAN absent from the shared QA user's cart.
  test.beforeEach(async ({ cartApi }) => {
    await cartApi.removeFromCart(TITAN.id);
  });

  test.afterEach(async ({ cartApi }) => {
    await cartApi.removeFromCart(TITAN.id);
  });

  test.describe('POST /addToCart', () => {
    test('accepts quantity at the lower limit (1)', async ({ cartApi }) => {
      const res = await cartApi.addToCart(TITAN.id, 1);
      expect(res.status()).toBe(200);
      const body = (await res.json()) as CartResponse;
      expect(body).toEqual({ success: true, message: 'Product added to cart successfully' });
    });

    test('accepts quantity at the upper limit (4)', async ({ cartApi }) => {
      const res = await cartApi.addToCart(TITAN.id, TITAN.maxAllowed);
      expect(res.status()).toBe(200);
    });

    test('rejects quantity above the limit (5) with 400', async ({ cartApi }) => {
      const res = await cartApi.addToCart(TITAN.id, TITAN.maxAllowed + 1);
      expect(res.status()).toBe(400);
      const body = (await res.json()) as CartResponse;
      expect(body.success).toBe(false);
      expect(body.message).toContain('Maximum');
    });

    test('rejects a top-up that pushes the line over the limit (3 + 2)', async ({ cartApi }) => {
      const first = await cartApi.addToCart(TITAN.id, 3);
      expect(first.status()).toBe(200);

      const second = await cartApi.addToCart(TITAN.id, 2);
      expect(second.status()).toBe(400);
      const body = (await second.json()) as CartResponse;
      expect(body.message).toContain(`maximum of ${TITAN.maxAllowed}`);
    });

    // BUG-006: parseInt(0) || 1 turns 0 into 1, so the line is added instead of rejected.
    test.fail('rejects quantity 0 with 400 @negative', async ({ cartApi }) => {
      const res = await cartApi.addToCart(TITAN.id, 0);
      expect(res.status()).toBe(400);
    });

    // BUG-006: no lower-bound check; the cart schema (min: 1) throws on save, caught as 500.
    test.fail('rejects a negative quantity (-1) with 400 @negative', async ({ cartApi }) => {
      const res = await cartApi.addToCart(TITAN.id, -1);
      expect(res.status()).toBe(400);
    });

    test('returns 404 for a non-existent product', async ({ cartApi }) => {
      const res = await cartApi.addToCart(INVALID_PRODUCT_ID, 1);
      expect(res.status()).toBe(404);
    });
  });

  test.describe('POST /updateCart', () => {
    // updateCart skips lines that are not in the cart, so put TITAN there first.
    test.beforeEach(async ({ cartApi }) => {
      const res = await cartApi.addToCart(TITAN.id, 1);
      expect(res.status()).toBe(200);
    });

    test('rejects quantity above stock with 400', async ({ cartApi }) => {
      const res = await cartApi.updateCart([{ productId: TITAN.id, quantity: TITAN.stock + 1 }]);
      expect(res.status()).toBe(400);
      const body = (await res.json()) as CartResponse;
      expect(body.message).toContain('exceeds stock');
    });

    // BUG-005: updateCart compares only against stock, so the 4-per-product rule is bypassed.
    test.fail(
      'rejects quantity above the per-product limit (5) with 400 @negative',
      async ({ cartApi }) => {
        const res = await cartApi.updateCart([
          { productId: TITAN.id, quantity: TITAN.maxAllowed + 1 },
        ]);
        expect(res.status()).toBe(400);
      },
    );
  });

  test('POST /removeFromCart returns a success body', async ({ cartApi }) => {
    await cartApi.addToCart(TITAN.id, 1);
    const res = await cartApi.removeFromCart(TITAN.id);
    expect(res.status()).toBe(200);
    const body = (await res.json()) as CartResponse;
    expect(body).toEqual({ success: true, message: 'Item removed successfully' });
  });
});
