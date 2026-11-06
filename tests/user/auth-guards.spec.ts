import { test, expect } from '../../fixtures/base.fixture';

// These pages require a logged-in user. Run them with an empty session so the
// server-side checkSession guard redirects every request to the login page.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('TimeVault Authorization Guards', () => {
  const protectedPages = [
    { name: 'cart', path: '/cartPage' },
    { name: 'wishlist', path: '/wishlist' },
    { name: 'profile', path: '/userProfile' },
    { name: 'address', path: '/userAddress' },
  ];

  for (const { name, path } of protectedPages) {
    test(`@regression @negative anonymous request to ${name} redirects to login`, async ({
      page,
    }) => {
      await page.goto(path);

      await expect(page).toHaveURL(/\/login/);
    });
  }
});
