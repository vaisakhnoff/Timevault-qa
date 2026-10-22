import { test, expect } from '../../fixtures/api.fixture';
import { PRODUCTS,INVALID_PRODUCT_ID } from '../../data/api-test-data';

const TITAN = PRODUCTS.titan;

test.describe('Cart API - boundry @api', () => {
  test.beforeEach(async ({ cartApi }) => {
    await cartApi.removeFromCart(TITAN.id);
  });

  test.afterEach(async ({ cartApi }) => {
    await cartApi.removeFromCart(TITAN.id);
  });

  test('accepts quantity at the upper limit(4)', async ({ cartApi }) => {
    const res = await cartApi.addToCart(TITAN.id, TITAN.maxAllowed);
    expect(res.status()).toBe(200);
  });

  test('reject quantity above the limit (5) with 400', async ({ cartApi }) => {
    const res = await cartApi.addToCart(TITAN.id, TITAN.maxAllowed + 1);

    expect(res.status()).toBe(400);

    const body = (await res.json()) as { success: boolean; message: string };
    expect(body.success).toBe(false);
    expect(body.message).toContain('Maximum');
  });

  test('returns 404 for a non-existent product', async ({ cartApi }) => {
    const res = await cartApi.addToCart(INVALID_PRODUCT_ID, 1);
    expect(res.status()).toBe(404);
  });
});
