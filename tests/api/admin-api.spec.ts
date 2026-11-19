import { test, expect } from '../../fixtures/api.fixture';
import type { DashboardData, ProductToggleResponse } from '../../api/admin.api';
import { AuthApi } from '../../api/auth.api';
import { WishlistApi } from '../../api/wishlist.api';
import { createAnonymousContext } from '../../api/request-context';
import { PRODUCTS, INVALID_PRODUCT_ID } from '../../data/api-test-data';
import envConfig from '../../config/env.config';
import { generateProduct } from '../../data/generators';
import { COD_SAFE_PRODUCT } from '../../data/checkout-test-data';
import { TINY_PNG } from '../../data/api-test-data';

const TITAN = PRODUCTS.titan;

test.describe('Admin API @regression @api @admin', () => {
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

  test.describe('product create and delete', () => {
    test('a created product can be deleted, and is then gone', async ({ adminApi }) => {
      const id = await adminApi.createProduct(generateProduct(), TINY_PNG);
      try {
        const res = await adminApi.deleteProduct(id);
        expect(res.status()).toBe(200);
        expect(await res.json()).toEqual({
          success: true,
          message: 'Product deleted successfully',
        });

        expect(await adminApi.productExists(id), 'admin list after delete').toBe(false);
        expect((await adminApi.deleteProduct(id)).status(), 'second delete').toBe(404);
      } finally {
        await adminApi.deleteProduct(id); // no-op when the test already deleted it
      }
    });

    test('deleteProduct rejects an invalid id with 400 @negative', async ({ adminApi }) => {
      expect((await adminApi.deleteProduct('not-an-id')).status()).toBe(400);
    });

    test('deleteProduct returns 404 for an unknown product @negative', async ({ adminApi }) => {
      expect((await adminApi.deleteProduct(INVALID_PRODUCT_ID)).status()).toBe(404);
    });

    // RISK: if this guard ever breaks, the request really deletes COD_SAFE_PRODUCT, which most order
    // and checkout specs depend on. It has to be re-created by hand. That loss is the defect the test catches.
    test('a product with orders cannot be deleted (409) @negative', async ({ adminApi }) => {
      const res = await adminApi.deleteProduct(COD_SAFE_PRODUCT.id);
      expect(res.status()).toBe(409);
      expect(await adminApi.productExists(COD_SAFE_PRODUCT.id), 'COD product must survive').toBe(
        true,
      );
    });

    test('deleteProduct redirects a customer to admin login @security', async ({
      userAdminApi,
    }) => {
      const res = await userAdminApi.deleteProduct(INVALID_PRODUCT_ID);
      expect(res.status()).toBe(302);
      expect(res.headers()['location']).toBe('/admin/login');
    });

    // No image: these fail validation, and an image would be uploaded before that check runs.
    test('addProducts rejects a duplicate name with 400 @negative', async ({ adminApi }) => {
      const product = generateProduct();
      const id = await adminApi.createProduct(product);
      try {
        const res = await adminApi.addProduct(product);
        expect(res.status()).toBe(400);
        expect(((await res.json()) as { message: string }).message).toBe(
          'Product with this name already exists',
        );
      } finally {
        await adminApi.deleteProduct(id);
      }
    });

    test('addProducts rejects an unknown category with 400 @negative', async ({ adminApi }) => {
      const res = await adminApi.addProduct(generateProduct({ category: 'No Such Category QA' }));
      expect(res.status()).toBe(400);
      expect(((await res.json()) as { message: string }).message).toBe('Invalid category selected');
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
    test(
      'a blocked product cannot be added to the cart @negative',
      { tag: '@known-bug' },
      async ({ adminApi, cartApi }) => {
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
      },
    );
  });

  test.describe('customer block', () => {
    // BUG-013: blockCustomer never checks that findByIdAndUpdate found a user.
    test(
      'blockCustomer returns 404 for an unknown customer @negative',
      { tag: '@known-bug' },
      async ({ adminApi }) => {
        test.fail(true, 'BUG-013: /admin/blockCustomer reports success for an unknown id');
        const res = await adminApi.blockCustomer(INVALID_PRODUCT_ID);
        expect(res.status()).toBe(404);
      },
    );

    // BUG-014: wishlist routes lack auth.checkSession, the middleware that rejects blocked users.
    test(
      'a customer blocked mid-session cannot change their wishlist @security',
      { tag: '@known-bug' },
      async ({ adminApi }) => {
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
      },
    );
  });
});
