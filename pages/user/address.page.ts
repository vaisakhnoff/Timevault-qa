import { Page, Locator } from '@playwright/test';
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
    this.emptyMessage = page.getByRole('heading', { name: 'No Addresses Saved' });
    this.deleteButton = page.locator('.ti-trash');
  }

  async goto(): Promise<void> {
    await this.page.goto('/userAddress');
  }

  async getAddressCount(): Promise<number> {
    return this.addressCards.count();
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

  async deleteFirstAddress(): Promise<void> {
    const previousCount = await this.getAddressCount();

    if (previousCount === 0) return;

    await this.deleteButton.first().click();

    await this.alert.confirm();

    await this.page.waitForResponse(
      (res) => res.url().includes('/deleteAddress') && res.request().method() === 'POST',
    );
  }
}
