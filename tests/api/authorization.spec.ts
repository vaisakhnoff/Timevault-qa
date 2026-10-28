import { test, expect } from '../../fixtures/api.fixture';
import { PRODUCTS } from '../../data/api-test-data';

const TITAN = PRODUCTS.titan;

test.describe('Authorization - protected endpoints reject anonymous callers @api @security', () => {
  test('POST /addToCart without a session is rejected (401)', async ({ anonCartApi }) => {
    const res = await anonCartApi.addToCart(TITAN.id, 1);
    expect(res.status()).toBe(401);
  });

  test('POST /addWishlist without a session is rejected (401)', async ({ anonWishlistApi }) => {
    const res = await anonWishlistApi.addWishlist(TITAN.id);
    expect(res.status()).toBe(401);
  });

  test('POST /removeFromWishlist without a session is rejected', async ({ anonWishlistApi }) => {
    const res = await anonWishlistApi.removeFromWishlist(TITAN.id);
    expect(res.status()).toBe(401);
  });

  // Regression test for BUG-001 (docs/BUG_REPORTS.md): this endpoint once answered 200 with
  // analytics data to anonymous callers. It must redirect to the admin login instead.
  test('anonymous caller is redirected to admin login from /admin/dashboard-canceled-data @security', async ({
    anonAdminApi,
  }) => {
    const res = await anonAdminApi.getCanceledAndReturnedData();

    expect(res.status()).toBe(302);
    expect(res.headers()['location']).toContain('/admin/login');
  });
});
