import { test, expect } from '../../fixtures/api.fixture';
import type { DashboardData, ProductToggleResponse } from '../../api/admin.api';
import { AuthApi } from '../../api/auth.api';
import { WishlistApi } from '../../api/wishlist.api';
import { createAnonymousContext } from '../../api/request-context';
import { PRODUCTS, INVALID_PRODUCT_ID } from '../../data/api-test-data';
import envConfig from '../../config/env.config';

const TITAN = PRODUCTS.titan;

test.describe('Admin API @api @admin', () => {
  test.describe('role boundary: customer session on admin endpoints @security', () => {
    test('GET /admin/dashboard-data redirects a customer to admin login', async ({
      userAdminApi,
    }) => {
      const res = await userAdminApi.getDashboardData();
      expect(res.status()).toBe(302);
      expect(res.headers()['location']).toBe('/admin/login');
    });

    test('POST /admin/blockProduct redirects a customer to admin login', async ({
      userAdminApi,
    }) => {
      const res = await userAdminApi.blockProduct(TITAN.id);
      expect(res.status()).toBe(302);
      expect(res.headers()['location']).toBe('/admin/login');
    });
  });

  test('GET /admin/dashboard-data returns the stats contract for an admin', async ({
    adminApi,
  }) => {
    const res = await adminApi.getDashboardData('monthly');
    expect(res.status()).toBe(200);
    const body = (await res.json()) as DashboardData;
    for (const key of [
      'revenue',
      'totalOrders',
      'totalUsers',
      'totalProducts',
      'totalCategories',
    ] as const) {
      expect(typeof body[key], key).toBe('number');
    }
    const { labels, revenueData, orderData } = body.timeSeriesData;
    expect(revenueData).toHaveLength(labels.length);
    expect(orderData).toHaveLength(labels.length);
  });

  test.describe('product block', () => {
    test('blockProduct and unblockProduct toggle isBlocked', async ({ adminApi }) => {
      try {
        const blocked = await adminApi.blockProduct(TITAN.id);
        expect(blocked.status()).toBe(200);
        expect(((await blocked.json()) as ProductToggleResponse).product?.isBlocked).toBe(true);
      } finally {
        const unblocked = await adminApi.unblockProduct(TITAN.id);
        expect(((await unblocked.json()) as ProductToggleResponse).product?.isBlocked).toBe(false);
      }
    });
    test('blockProduct returns 404 for an unknown product @negative', async ({ adminApi }) => {
      const res = await adminApi.blockProduct(INVALID_PRODUCT_ID);
      expect(res.status()).toBe(404);
    });

    // BUG-012: addToCart loads the product but never checks isBlocked.
    test('a blocked product cannot be added to the cart @negative', async ({
      adminApi,
      cartApi,
    }) => {
      test.fail(true, 'BUG-012: /addToCart accepts a product the admin has blocked');
      await cartApi.removeFromCart(TITAN.id);
      try {
        await adminApi.blockProduct(TITAN.id);
        const res = await cartApi.addToCart(TITAN.id, 1);
        expect(res.status()).toBe(400);
      } finally {
        await adminApi.unblockProduct(TITAN.id);
        await cartApi.removeFromCart(TITAN.id);
      }
    });
  });

  test.describe('customer block', () => {
    // BUG-013: blockCustomer never checks that findByIdAndUpdate found a user.
    test('blockCustomer returns 404 for an unknown customer @negative', async ({ adminApi }) => {
      test.fail(true, 'BUG-013: /admin/blockCustomer reports success for an unknown id');
      const res = await adminApi.blockCustomer(INVALID_PRODUCT_ID);
      expect(res.status()).toBe(404);
    });

    // BUG-014: wishlist routes lack auth.checkSession, the middleware that rejects blocked users.
    test('a customer blocked mid-session cannot change their wishlist @security', async ({
      adminApi,
    }) => {
      test.skip(
        !envConfig.blockableUserEmail || !envConfig.blockableUserPassword,
        'Set TEST_BLOCKABLE_USER_EMAIL and TEST_BLOCKABLE_USER_PASSWORD in .env.',
      );
      test.fail(
        true,
        'BUG-014: a blocked customer keeps wishlist write access in an existing session',
      );

      const customerId = await adminApi.findCustomerId(envConfig.blockableUserEmail);
      expect(customerId, 'blockable customer must exist').toBeDefined();

      const ctx = await createAnonymousContext();
      const auth = new AuthApi(ctx);
      const wishlist = new WishlistApi(ctx);

      try {
        const login = await new AuthApi(ctx).login(
          envConfig.blockableUserEmail,
          envConfig.blockableUserPassword,
        );
        expect(login.status(), 'blockable customer must be able to log in').toBe(302);

        await adminApi.blockCustomer(customerId!);
        const res = await new WishlistApi(ctx).addWishlist(TITAN.id);
        expect(res.status()).toBe(401);
      } finally {
        await adminApi.unblockCustomer(customerId!);

        await auth.login(envConfig.blockableUserEmail, envConfig.blockableUserPassword);
        await wishlist.removeFromWishlist(TITAN.id);
        await ctx.dispose();
      }
    });
  });
});
