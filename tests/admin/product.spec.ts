import { test, expect } from '../../fixtures/admin.fixture';

test.describe('TimeVault Admin Product Tests', () => {
  test('@regression product list loads with products', async ({ productPage }) => {
    await productPage.goto();

    await expect(productPage.pageTitle).toBeVisible();
    await expect(productPage.totalCountBadge).toBeVisible();
    expect(await productPage.getProductCount()).toBeGreaterThan(0);
  });

  test('@regression search returns matching products', async ({ productPage }) => {
    await productPage.goto();

    await productPage.search('Classic');

    await expect(productPage.productRows.first()).toBeVisible();
    await expect(productPage.productRows.first()).toContainText('Classic');
  });

  test('@regression search with no matches shows empty state', async ({ productPage }) => {
    await productPage.goto();

    await productPage.search('zzzznonexistentproductxyz');

    await expect(productPage.emptyState).toBeVisible();
    await expect(productPage.productRows).toHaveCount(0);
  });
});
