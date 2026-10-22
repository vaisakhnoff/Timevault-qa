import { test, expect } from '../../fixtures/base.fixture';

test.describe('TimeVault Wishlist Tests', () => {
  test.describe.configure({ mode: 'serial' });

  test.afterEach(async ({ wishlistPage }) => {
    await wishlistPage.goto();
    while ((await wishlistPage.getItemCount()) > 0) {
      await wishlistPage.removeFirstItem();
      await wishlistPage.goto();
    }
  });

  test('@regression item added to wishlist appears in wishlist', async ({
    productDetailsPage,
    wishlistPage,
  }) => {
    await productDetailsPage.goto('6aad1146c76606074021e7ec');
    await productDetailsPage.addToWishlist();
    await wishlistPage.goto();
    await expect(wishlistPage.wishlistCards).not.toHaveCount(0);
  });
});
