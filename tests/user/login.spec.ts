import { faker } from '@faker-js/faker';
import { test, expect } from '../../fixtures/base.fixture';
import envConfig from '../../config/env.config';

const protectedPaths = [
  '/cartPage',
  '/wishlist',
  '/orders',
  '/userProfile',
  '/userAddress',
  '/wallet',
  '/checkoutPage',
];

test.describe('User Authentication Tests', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('@auth @negative @regression wrong password is rejected', async ({ loginPage }) => {
    await loginPage.goto();

    const wrongPassword = faker.internet.password();

    await loginPage.login(envConfig.userEmail, wrongPassword);
    await expect(loginPage.page).toHaveURL(/\/login/);
    await loginPage.expectLoginError('Incorrect email or password');
  });

  test('@auth @negative @regression unknown email is rejected', async ({ loginPage }) => {
    await loginPage.goto();

    const unknownEmail = `${faker.string.uuid()}@example.invalid`;
    const password = faker.internet.password();

    await loginPage.login(unknownEmail, password);

    await expect(loginPage.page).toHaveURL(/\/login/);
    await loginPage.expectLoginError('Incorrect email or password');
  });

  test('@auth @negative @regression empty credentials are rejected', async ({
    loginPage,
    header,
  }) => {
    await loginPage.goto();

    await loginPage.login('', '');

    await expect(loginPage.page).toHaveURL(/\/login/);
    await loginPage.expectLoginError('Incorrect email or password');
    await expect(header.userMenuButton).not.toBeVisible();
  });

  for (const path of protectedPaths) {
    test(`@auth @security anonymous visit to ${path} redirects to login`, async ({ page }) => {
      await page.goto(path);

      await expect(page).toHaveURL(/\/login/);
    });
  }

  test('@auth @regression logout ends the user session', async ({ page, loginPage, header }) => {
    await loginPage.goto();
    await loginPage.login(envConfig.userEmail, envConfig.userPassword);

    await expect(page).toHaveURL(/\/$/);
    await expect(header.userMenuButton).toBeVisible();

    await header.logout();

    await expect(page).toHaveURL(/\/login/);

    await page.goto('/orders');

    await expect(page).toHaveURL(/\/login/);
  });
});
