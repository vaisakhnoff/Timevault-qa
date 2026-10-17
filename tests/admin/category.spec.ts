import { test, expect } from '../../fixtures/admin.fixture';
import { faker } from '@faker-js/faker';


test.describe('TimeVault Admin Category Tests', () => {

  test('@regression admin can add a new category', async ({ categoryPage }) => {
    await categoryPage.goto();

    const before = await categoryPage.getTotalCount();

    const suffix = faker.string.alpha({ length: 5 });
    const name = `${faker.commerce.productMaterial().replace(/[^a-zA-Z ]/g, '')} ${suffix}`.trim();
    const description = faker.commerce.productDescription().slice(0, 190);

    await categoryPage.addCategory(name, description);

    await expect(categoryPage.totalCountLabel).toHaveText(`${before + 1} Categories`);
    await expect(categoryPage.page.getByText(name, { exact: false })).toBeVisible();
  });
});
