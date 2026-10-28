import { faker } from '@faker-js/faker';
import { test, expect } from '../../fixtures/admin.fixture';
import envConfig from '../../config/env.config';

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

// A password that passes the browser-side length rule (8+ characters) but is wrong.
const wrongPassword = () => faker.internet.password({ length: 12 });
const unknownAdminEmail = () => `${faker.string.uuid()}@example.com`;

test.describe('Admin login, logged out', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('@admin @auth @negative invalid email format shows an inline error', async ({
    adminLoginPage,
    page,
  }) => {
    await adminLoginPage.goto();
    // Passes the browser's own type="email" check but has a 1-letter ending, so the page's
    // custom validation (2-6 letters) is the one that rejects it.
    await adminLoginPage.login('qa@example.c', wrongPassword());

    await expect(adminLoginPage.emailError).toHaveText('Invalid email format');
    await expect(adminLoginPage.alert.popup).toBeHidden();
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('@admin @auth @negative @boundary password of 7 characters is blocked in the browser', async ({
    adminLoginPage,
    page,
  }) => {
    await adminLoginPage.goto();
    await adminLoginPage.login(unknownAdminEmail(), faker.internet.password({ length: 7 }));

    await expect(adminLoginPage.passwordError).toHaveText(
      'Password should contain at least 8 characters',
    );
    await expect(adminLoginPage.alert.popup).toBeHidden();
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('@admin @auth @negative @boundary password of 8 characters reaches the server', async ({
    adminLoginPage,
  }) => {
    await adminLoginPage.goto();
    await adminLoginPage.login(unknownAdminEmail(), faker.internet.password({ length: 8 }));

    await expect(adminLoginPage.passwordError).toHaveText('');
    await expect(adminLoginPage.alert.title).toHaveText('Login Failed');
  });

  test('@admin @auth @negative unknown admin email is rejected', async ({ adminLoginPage }) => {
    await adminLoginPage.goto();
    await adminLoginPage.login(unknownAdminEmail(), wrongPassword());

    await expect(adminLoginPage.alert.title).toHaveText('Login Failed');
    await expect(adminLoginPage.alert.message).toHaveText('Invalid email address');
  });

  test('@admin @auth @negative wrong password for the real admin is rejected', async ({
    adminLoginPage,
  }) => {
    await adminLoginPage.goto();
    await adminLoginPage.login(envConfig.adminEmail, wrongPassword());

    await expect(adminLoginPage.alert.title).toHaveText('Login Failed');
    await expect(adminLoginPage.alert.message).toHaveText('Invalid password');
  });

  test('@admin @auth @negative @security customer credentials are rejected on admin login', async ({
    adminLoginPage,
    page,
  }) => {
    await adminLoginPage.goto();
    await adminLoginPage.login(envConfig.userEmail, envConfig.userPassword);

    await expect(adminLoginPage.alert.title).toHaveText('Login Failed');
    await expect(adminLoginPage.alert.message).toHaveText('Invalid email address');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  for (const path of adminPaths) {
    test(`@admin @auth @security anonymous visit to ${path} redirects to admin login`, async ({
      page,
    }) => {
      await page.goto(path);

      await expect(page).toHaveURL(/\/admin\/login/);
    });
  }

  // Logging out destroys the server-side session, so this test signs in on its own
  // and never touches the shared admin.json used by the other admin tests.
  test('@admin @auth @regression admin logout ends the admin session', async ({
    adminLoginPage,
    page,
  }) => {
    await adminLoginPage.goto();
    await adminLoginPage.login(envConfig.adminEmail, envConfig.adminPassword);
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    await page.goto('/admin/logout');
    await expect(page).toHaveURL(/\/admin\/login/);

    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});

test.describe('Admin login, logged in as admin', () => {
  test('@admin @auth @regression logged-in admin opening the login page goes to the dashboard', async ({
    page,
  }) => {
    await page.goto('/admin/login');

    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });
});

test.describe('Customer session on admin pages', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  for (const path of adminPaths) {
    test(`@admin @auth @security customer session cannot open ${path}`, async ({ page }) => {
      await page.goto(path);

      await expect(page).toHaveURL(/\/admin\/login/);
    });
  }
});
