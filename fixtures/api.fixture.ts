import { test as base, APIRequestContext } from '@playwright/test';
import { CartApi } from '../api/cart.api';
import { createAnonymousContext } from '../api/request-context';
import { WishlistApi } from '../api/wishlist.api';
import { AdminApi } from '../api/admin.api';


type ApiFixtures = {
  cartApi: CartApi;
  anonContext: APIRequestContext;
  anonCartApi: CartApi;
  anonWishlistApi: WishlistApi;
  anonAdminApi: AdminApi;
};

export const test = base.extend<ApiFixtures>({
  cartApi: async ({ request }, use) => {
    await use(new CartApi(request));
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
});

export { expect } from '@playwright/test';
