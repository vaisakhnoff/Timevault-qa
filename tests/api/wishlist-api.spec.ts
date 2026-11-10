import { test, expect } from '../../fixtures/api.fixture';
import { WishlistResponse } from '../../api/wishlist.api';
import { PRODUCTS, INVALID_PRODUCT_ID } from '../../data/api-test-data';

const TITAN = PRODUCTS.titan;

test.describe('Wishlist API @api @wishlist', () => {
  test.beforeEach(async ({ wishlistApi }) => {
    await wishlistApi.removeFromWishlist(TITAN.id);
  });

  test.afterEach(async ({ wishlistApi }) => {
    await wishlistApi.removeFromWishlist(TITAN.id);

    await wishlistApi.removeFromWishlist(INVALID_PRODUCT_ID);
  });

  test('POST /addWishlist adds a product', async ({ wishlistApi }) => {
    const res = await wishlistApi.addWishlist(TITAN.id);
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ success: true, message: 'Product added to wishlist' });
  });

  test('POST /addWishlist reports a duplicate instead of adding it twice', async ({
    wishlistApi,
  }) => {
    await wishlistApi.addWishlist(TITAN.id);

    const res = await wishlistApi.addWishlist(TITAN.id);
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({
      success: false,
      message: 'Product already exists in wishlist',
    });
  });

  test('POST /removeFromWishlist removes the product', async ({ wishlistApi }) => {
    await wishlistApi.addWishlist(TITAN.id);

    const res = await wishlistApi.removeFromWishlist(TITAN.id);
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ success: true, message: 'Product removed from wishlist' });

    // No JSON read endpoint exists: a fresh add succeeding proves the product is gone.
    const again = await wishlistApi.addWishlist(TITAN.id);
    expect(((await again.json()) as WishlistResponse).success).toBe(true);
  });

  test('POST /addWishlist without a product id is rejected with 400 @negative', async ({
    request,
  }) => {
    // Malformed on purpose, so it bypasses the client, which only builds valid requests.
    const res = await request.post('/addWishlist', { data: {} });
    expect(res.status()).toBe(400);
  });

  test.fail(
    'POST /addWishlist rejects a non-existent product with 404 @negative',
    async ({ wishlistApi }) => {
      const res = await wishlistApi.addWishlist(INVALID_PRODUCT_ID);
      expect(res.status()).toBe(404);
    },
  );
});
