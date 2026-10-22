import { test as base, APIRequestContext } from '@playwright/test';
import { CartApi } from '../clients/cart.api';
import { createAnonymousContext } from '../request-context';
import { WishlistApi } from '../clients/wishlist.api';
import { AdminApi } from '../clients/admin.api';

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
