import { test, expect } from '../../fixtures/base.fixture';

test.describe('Authenticated session @regression', () => {
  test('user session is active after storagestate login', async ({ header }) => {
    await header.page.goto('/');

    await expect(header.userMenuButton).toBeVisible();
  });
});
