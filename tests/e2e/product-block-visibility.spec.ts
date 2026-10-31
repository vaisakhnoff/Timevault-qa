import { COD_SAFE_PRODUCT } from '../../data/checkout-test-data';
import { test, expect } from '../../fixtures/e2e.fixture';

test.describe('Admin product block visibility', () => {
  test.describe.configure({ mode: 'serial' });

  test('@e2e blocked product is hidden from shop search and then restored', async ({
    adminPage,
    shopPage,
  }) => {
    const adminApi = adminPage.context().request;

    const blocked = await adminApi.post('/admin/blockProduct', {
      data: { id: COD_SAFE_PRODUCT.id },
    });
    expect(blocked.status()).toBe(200);
    const blockedBody = (await blocked.json()) as { success: boolean };
    expect(blockedBody.success).toBe(true);

    try {
      await shopPage.goto();
      await shopPage.search(COD_SAFE_PRODUCT.name);

      await expect(shopPage.productCards).toHaveCount(0);
      await expect(shopPage.noResultMessage).toBeVisible();
    } finally {
      const unblocked = await adminApi.post('/admin/unblockProduct', {
        data: { id: COD_SAFE_PRODUCT.id },
      });

      expect(unblocked.status()).toBe(200);
      const unblockedBody = (await unblocked.json()) as { success: boolean };
      expect(unblockedBody.success).toBe(true);
    }
  });
});
