import { generateAddress } from '../../data/generators';
import { test, expect } from '../../fixtures/base.fixture';

test.describe('TimeVault Address Tests', () => {
  test.describe.configure({ mode: 'serial' });

  test.afterEach(async ({ addressPage }) => {
    await addressPage.goto();

    while ((await addressPage.getAddressCount()) > 0) {
      await addressPage.deleteFirstAddress();
      await addressPage.goto();
    }
  });

  test('@regression user can add new address', async ({ addressPage }) => {
    await addressPage.goto();
    const before = await addressPage.getAddressCount();

    await addressPage.addAddress(generateAddress());

    await expect(addressPage.addressCards).toHaveCount(before + 1);
  });
});
