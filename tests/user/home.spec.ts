import { test, expect } from '../../fixtures/base.fixture';

test.describe('TimeVault Home Tests', () => {
  test('@smoke home page title contains TIME VAULT', async ({ homePage }) => {
    await homePage.goto();

    await expect(homePage.page).toHaveTitle(/TIME VAULT/i);
  });

  test('@regression latest releases shows one to four products', async ({ homePage }) => {
    await homePage.goto();

    await expect(homePage.latestReleasesHeading).toBeVisible();
    await expect(homePage.productCards.first()).toBeVisible();

    const productCount = await homePage.productCards.count();
    expect(productCount).toBeGreaterThanOrEqual(1);
    expect(productCount).toBeLessThanOrEqual(4);
  });

  test('@regression luxury category tile navigates to filtered shop', async ({ homePage }) => {
    await homePage.goto();

    await homePage.categoryTile('Luxury Watches').click();

    await expect(homePage.page).toHaveURL(/category=Luxury%20Watches/);
  });
});

test.describe('Home page, logged out', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('@smoke logged-out header shows Login and Join Vault', async ({ homePage }) => {
    await homePage.goto();

    await expect(homePage.header.loginLink).toBeVisible();
    await expect(homePage.header.signupLink).toBeVisible();
    await expect(homePage.header.userMenuButton).not.toBeVisible();
  });
});
