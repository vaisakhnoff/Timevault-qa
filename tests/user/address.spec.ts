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

  test('@regression user can edit an address', async ({ addressPage }) => {
    // Fixed, edit-valid data: the edit form re-validates every field against strict
    // patterns (phone must be exactly 10 digits), so faker values are avoided here.
    const address = {
      name: 'Edit Test User',
      addressType: 'Home',
      city: 'Kochi',
      landMark: 'Near QA Station',
      state: 'Kerala',
      pincode: '682001',
      phone_no: '9876543210',
      altPhone_no: '9876543211',
    };
    createdAddressName = address.name;
    await addressPage.addAddress(address);

    await addressPage.editAddressCity(address.name, 'Trivandrum');

    await expect(addressPage.addressCardByName(address.name)).toContainText('Trivandrum');
  });

  test('@regression user can delete an address', async ({ addressPage }) => {
    const address = generateAddress();
    await addressPage.addAddress(address);
    const before = await addressPage.getAddressCount();

    await addressPage.deleteAddressByName(address.name);

    await expect(addressPage.addressCards).toHaveCount(before - 1);
    await expect(addressPage.addressCardByName(address.name)).toHaveCount(0);
    createdAddressName = undefined;
  });

  test('@regression @negative submitting an empty address form is rejected', async ({
    addressPage,
    page,
  }) => {
    await addressPage.submitEmptyAddressForm();

    // Required fields block the native submit, so the form never navigates away.
    await expect(page).toHaveURL(/\/addAddress/);
  });
});
