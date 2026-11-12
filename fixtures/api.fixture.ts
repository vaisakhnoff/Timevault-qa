import { test as base, APIRequestContext } from '@playwright/test';
import { CartApi } from '../api/cart.api';
import { createAnonymousContext, createAdminContext } from '../api/request-context';
import { WishlistApi } from '../api/wishlist.api';
import { AdminApi } from '../api/admin.api';
import { AuthApi } from '../api/auth.api';
import { CouponApi } from '../api/coupon.api';

type ApiFixtures = {
  cartApi: CartApi;
  anonContext: APIRequestContext;
  anonCartApi: CartApi;
  anonWishlistApi: WishlistApi;
  anonAdminApi: AdminApi;
  adminContext: APIRequestContext;
  adminApi: AdminApi;
  wishlistApi: WishlistApi;
  authApi: AuthApi;
  couponApi: CouponApi;
  anonCouponApi: CouponApi;
};

type ApiWorkerFixtures = {
  workerAdminApi: AdminApi;
};

export const test = base.extend<ApiFixtures, ApiWorkerFixtures>({
  cartApi: async ({ request }, use) => {
    await use(new CartApi(request));
  },
  wishlistApi: async ({ request }, use) => {
    await use(new WishlistApi(request));
  },
  // Playwright requires destructuring syntax for fixture args, even when none are used.
  // eslint-disable-next-line no-empty-pattern
  anonContext: async ({}, use) => {
    const ctx = await createAnonymousContext();
    await use(ctx);
    await ctx.dispose();
  },
  anonCartApi: async ({ anonContext }, use) => {
    await use(new CartApi(anonContext));
  },
  anonWishlistApi: async ({ anonContext }, use) => {
    await use(new WishlistApi(anonContext));
  },
  anonAdminApi: async ({ anonContext }, use) => {
    await use(new AdminApi(anonContext));
  },
  // Playwright requires destructuring syntax for fixture args, even when none are used.
  // eslint-disable-next-line no-empty-pattern
  adminContext: async ({}, use) => {
    const ctx = await createAdminContext();
    await use(ctx);
    await ctx.dispose();
  },
  adminApi: async ({ adminContext }, use) => {
    await use(new AdminApi(adminContext));
  },
  authApi: async ({ anonContext }, use) => {
    await use(new AuthApi(anonContext));
  },
  couponApi: async ({ request }, use) => {
    await use(new CouponApi(request));
  },
  anonCouponApi: async ({ anonContext }, use) => {
    await use(new CouponApi(anonContext));
  },

  workerAdminApi: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const ctx = await createAdminContext();
      await use(new AdminApi(ctx));
      await ctx.dispose();
    },
    { scope: 'worker' },
  ],
});

export { expect } from '@playwright/test';
