import { test, expect } from '../../fixtures/e2e.fixture';
import { generateProduct } from '../../data/generators';
import { TINY_PNG } from '../../data/api-test-data';

test.describe('Admin product lifecycle @regression @e2e @admin', () => {
  // Never add this product to a cart or order: once an order references it, delete answers 409
  // and the product can no longer be removed.
  test('a product the admin creates is sold in the shop until the admin blocks it', async ({
    adminApi,
    shopPage,
  }) => {
    const product = generateProduct();
    const id = await adminApi.createProduct(product, TINY_PNG);
    try {
      // 1. Customer finds the new product at its sale price.
      await shopPage.goto();
      await shopPage.search(product.name);
      await expect(shopPage.productCards).toHaveCount(1);
      await expect(shopPage.productName.first()).toContainText(product.name);
      // A brand or category offer on Casio / Classic Watches would lower this price.
      expect(await shopPage.getCurrentPrices()).toContain(product.salePrice);

      // 2. Admin blocks it, and the customer can no longer find it.
      const blocked = await adminApi.blockProduct(id);
      expect(blocked.status(), 'block product').toBe(200);
      await shopPage.search(product.name);
      await expect(shopPage.productCards).toHaveCount(0);
      await expect(shopPage.noResultMessage).toBeVisible();
    } finally {
      // Removes the product and its Cloudinary image. A product with no orders always deletes.
      const deleted = await adminApi.deleteProduct(id);
      expect(deleted.status(), 'cleanup delete').toBe(200);
    }
  });
});
