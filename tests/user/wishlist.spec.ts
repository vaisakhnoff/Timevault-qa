import { test, expect } from '../../fixtures/base.fixture';

test.describe('TimeVault Wishlist Tests', () => {
  test.describe.configure({ mode: 'serial' });

  test.afterEach(async ({ cartPage, wishlistPage }) => {
    await wishlistPage.goto();
    while ((await wishlistPage.getItemCount()) > 0) {
      await wishlistPage.removeFirstItem();
      await wishlistPage.goto();
    }

    await cartPage.removeAllItems();
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

  test('@regression user can remove an item from the wishlist', async ({
    productDetailsPage,
    wishlistPage,
  }) => {
    await productDetailsPage.goto('6aad1146c76606074021e7ec');
    await productDetailsPage.addToWishlist();
    await wishlistPage.goto();

    await expect(wishlistPage.wishlistCards).toHaveCount(1);
    await wishlistPage.removeFirstItem();
    await expect(wishlistPage.wishlistCards).toHaveCount(0);
    await expect(wishlistPage.emptyMessage).toBeVisible();
  });

  test('@regression user can move a wishlist item to the cart', async ({
    productDetailsPage,
    wishlistPage,
    cartPage,
  }) => {
    await productDetailsPage.goto('6aad1146c76606074021e7ec');
    await productDetailsPage.addToWishlist();
    await wishlistPage.goto();

    await wishlistPage.moveFirstItemToBag();
    await expect(wishlistPage.wishlistCards).toHaveCount(0);

    await cartPage.goto();
    await expect(cartPage.cartItems).toHaveCount(1);
  });
});
