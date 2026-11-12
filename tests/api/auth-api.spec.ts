import { test, expect } from '../../fixtures/api.fixture';
import type { AdminLoginResponse } from '../../api/auth.api';
import { INVALID_PRODUCT_ID } from '../../data/api-test-data';
import envConfig from '../../config/env.config';
const UNKNOWN_EMAIL = 'nobody.qa@example.com';

test.describe('Auth API @api @auth', () => {
  test.describe('POST /login (customer)', () => {
    test('valid credentials redirect home and set an HttpOnly session cookie', async ({
      authApi,
    }) => {
      const res = await authApi.login(envConfig.userEmail, envConfig.userPassword);
      expect(res.status()).toBe(302);
      expect(res.headers()['location']).toBe('/');
      const cookie = res.headers()['set-cookie'];
      expect(cookie).toContain('connect.sid=');
      expect(cookie).toContain('HttpOnly');
    });

    test('the session from an API login is accepted by a protected endpoint', async ({
      authApi,
      anonCartApi,
    }) => {
      await authApi.login(envConfig.userEmail, envConfig.userPassword);
      const res = await anonCartApi.addToCart(INVALID_PRODUCT_ID, 1);
      expect(res.status()).toBe(404);
    });

    test('wrong password re-renders the login page without a session @negative', async ({
      authApi,
    }) => {
      const res = await authApi.login(envConfig.userEmail, `${envConfig.userPassword}-wrong`);
      expect(res.status()).toBe(200);
      expect(res.headers()['set-cookie']).toBeUndefined();
      expect(await res.text()).toContain('Incorrect email or password');
    });

    test('admin credentials are refused on the customer login @negative @security', async ({
      authApi,
    }) => {
      const res = await authApi.login(envConfig.adminEmail, envConfig.adminPassword);
      expect(res.status()).toBe(200);
      expect(res.headers()['set-cookie']).toBeUndefined();
      expect(await res.text()).toContain('Incorrect email or password');
    });
  });

  test('GET /logout destroys the session', async ({ authApi, anonCartApi }) => {
    await authApi.login(envConfig.userEmail, envConfig.userPassword);

    const res = await authApi.logout();
    expect(res.status()).toBe(302);
    expect(res.headers()['location']).toContain('login');

    const after = await anonCartApi.addToCart(INVALID_PRODUCT_ID, 1);
    expect(after.status()).toBe(401);
  });

  test.describe('POST /admin/login', () => {
    test('valid admin credentials succeed and point to the dashboard', async ({ authApi }) => {
      const res = await authApi.adminLogin(envConfig.adminEmail, envConfig.adminPassword);
      expect(res.status()).toBe(200);
      expect(await res.json()).toEqual({ success: true, redirect: '/admin/dashboard' });
    });

    test('customer credentials are refused @negative @security', async ({ authApi }) => {
      const res = await authApi.adminLogin(envConfig.userEmail, envConfig.userPassword);
      const body = (await res.json()) as AdminLoginResponse;
      expect(body.success).toBe(false);
    });

    // BUG-008: unknown email and wrong password answer different messages (account enumeration).

    test('failure message does not reveal whether the email exists @security', async ({
      authApi,
    }) => {
      test.fail(true, 'BUG-008: /admin/login reveals whether an email is an admin account');

      const unknownEmail = (await (
        await authApi.adminLogin(UNKNOWN_EMAIL, 'x')
      ).json()) as AdminLoginResponse;
      const wrongPassword = (await (
        await authApi.adminLogin(envConfig.adminEmail, 'wrong-password')
      ).json()) as AdminLoginResponse;

      expect(unknownEmail.success).toBe(false);
      expect(wrongPassword.success).toBe(false);
      expect(wrongPassword.message).toBe(unknownEmail.message);
    });
  });
});
