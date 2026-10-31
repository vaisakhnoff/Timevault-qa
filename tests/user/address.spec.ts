import { generateAddress } from '../../data/generators';
import { test, expect } from '../../fixtures/base.fixture';

test.describe('TimeVault Address Tests', () => {
  test.describe.configure({ mode: 'serial' });

  let createdAddressName: string | undefined;

  test.afterEach(async ({ addressPage }) => {
    if (!createdAddressName) return;

    await addressPage.goto();

    if ((await addressPage.addressCardByName(createdAddressName).count()) > 0) {
      await addressPage.deleteAddressByName(createdAddressName);
    }

    createdAddressName = undefined;
  });

  test('@regression user can add new address', async ({ addressPage }) => {
    await addressPage.goto();
    const before = await addressPage.getAddressCount();
    const address = generateAddress();
    createdAddressName = address.name;

    await addressPage.addAddress(address);

    await expect(addressPage.addressCards).toHaveCount(before + 1);
    await expect(addressPage.addressCardByName(address.name)).toBeVisible();
  });
});
