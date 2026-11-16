import { Locator, Page } from '@playwright/test';
import { Address } from '../../types';
import { SweetAlertComponent } from '../../components/sweetalert.component';

export class AddressPage {
  readonly page: Page;
  readonly alert: SweetAlertComponent;
  readonly addressCards: Locator;
  readonly addNewButton: Locator;
  readonly nameInput: Locator;
  readonly addressType: Locator;
  readonly city: Locator;
  readonly landMark: Locator;
  readonly state: Locator;
  readonly pincode: Locator;
  readonly phone: Locator;
  readonly altPhone: Locator;
  readonly submitButton: Locator;
  readonly updateButton: Locator;
  readonly emptyMessage: Locator;
  readonly deleteButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.alert = new SweetAlertComponent(page);
    this.addressCards = page.getByTitle('Delete Address');
    this.addNewButton = page.getByRole('link', { name: /Add New Address/ });
    this.nameInput = page.locator('#name');
    this.addressType = page.locator('#addressType');
    this.city = page.locator('#city');
    this.landMark = page.locator('#landMark');
    this.state = page.locator('#state');
    this.pincode = page.locator('#pincode');
    this.phone = page.locator('#phone_no');
    this.altPhone = page.locator('#altPhone_no');
    this.submitButton = page.getByRole('button', { name: /Save|Add/ });
    this.updateButton = page.getByRole('button', { name: 'Update Address' });
    this.emptyMessage = page.getByRole('heading', { name: 'No Addresses Saved' });
    this.deleteButton = page.locator('.ti-trash');
  }

  editLinkByName(name: string): Locator {
    return this.addressCardByName(name).locator('a[href^="/editAddress"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/userAddress');
  }

  async getAddressCount(): Promise<number> {
    return this.addressCards.count();
  }

  addressCardByName(name: string): Locator {
    return this.page.locator('.vault-card').filter({
      has: this.page.getByRole('heading', { name, exact: true }),
    });
  }

  async addAddress(data: Address): Promise<void> {
    await this.page.goto('/addAddress');

    await this.nameInput.fill(data.name);
    await this.addressType.fill(data.addressType);
    await this.city.fill(data.city);
    await this.landMark.fill(data.landMark);
    await this.state.fill(data.state);
    await this.pincode.fill(data.pincode);
    await this.phone.fill(data.phone_no);
    await this.altPhone.fill(data.altPhone_no);

    await this.submitButton.click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForURL(/\/userAddress/);
  }

  /** Opens an address for editing, changes the city, and saves. */
  async editAddressCity(name: string, newCity: string): Promise<void> {
    await this.goto();
    await this.editLinkByName(name).click();
    await this.page.waitForURL(/\/editAddress/);

    await this.city.fill(newCity);
    await this.updateButton.click();

    await this.alert.confirm();
    await this.page.waitForURL(/\/userAddress/);
  }

  /** Submits the add-address form with all fields empty. */
  async submitEmptyAddressForm(): Promise<void> {
    await this.page.goto('/addAddress');
    await this.submitButton.click();
  }

  async deleteAddressByName(name: string): Promise<void> {
    const card = this.addressCardByName(name);
    const deleteButton = card.getByTitle('Delete Address');

    await deleteButton.click();

    const deleted = this.page.waitForResponse(
      (response) =>
        response.url().includes('/deleteAddress') && response.request().method() === 'POST',
    );

    await this.alert.confirm();
    await deleted;
  }

  async deleteFirstAddress(): Promise<void> {
    const previousCount = await this.getAddressCount();

    if (previousCount === 0) return;

    await this.deleteButton.first().click();

    const deleted = this.page.waitForResponse(
      (response) =>
        response.url().includes('/deleteAddress') && response.request().method() === 'POST',
    );

    await this.alert.confirm();
    await deleted;
  }
}
