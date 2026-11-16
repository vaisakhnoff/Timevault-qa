import { test, expect } from '../../fixtures/base.fixture';

// Uses the default customer session (user.json) of this project.
const adminPaths = [
  '/admin/dashboard',
  '/admin/users',
  '/admin/orders',
  '/admin/category',
  '/admin/brands',
  '/admin/coupon',
  '/admin/products',
  '/admin/return-requests',
];

test.describe('Customer session on admin pages', () => {
  for (const path of adminPaths) {
    test(`@auth @security a logged-in customer cannot open ${path}`, async ({ page }) => {
      await page.goto(path);

      await expect(page).toHaveURL(/\/admin\/login/);
    });
  }
});
