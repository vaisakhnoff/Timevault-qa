import { Page, Locator } from '@playwright/test';
import { CouponData } from '../../types';

export class CouponPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly codeInput: Locator;
  readonly startDate: Locator;
  readonly endDate: Locator;
  readonly offerPrice: Locator;
  readonly minPrice: Locator;
  readonly maxPrice: Locator;
  readonly addButton: Locator;
  readonly couponRows: Locator;
  readonly successDialog: Locator;
  readonly deletedDialog: Locator;
  readonly confirmDeleteButton: Locator;
  readonly okButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.locator('#coupon-name');
    this.codeInput = page.locator('#coupon-code');
    this.startDate = page.locator('#startingDate');
    this.endDate = page.locator('#expiringDate');
    this.offerPrice = page.locator('#offer-price');
    this.minPrice = page.locator('#minimum-price');
    this.maxPrice = page.locator('#max-price');
    this.addButton = page.locator('#coupon-form button[type="submit"]');

    this.couponRows = page
      .locator('table.table tbody tr')
      .filter({ has: page.locator('.badge.bg-light') });
    this.successDialog = page.getByText('Success!');
    this.deletedDialog = page.getByText('Deleted!');
    this.confirmDeleteButton = page.getByRole('button', { name: 'Delete' });
    this.okButton = page.getByRole('button', { name: 'OK' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/admin/coupon');
  }

  async getCouponCount(): Promise<number> {
    return this.page.locator('table.table tbody tr td .badge.bg-light').count();
  }
  // .badge.badge-success

  rowByCode(code: string): Locator {
    return this.page.locator('table.table tbody tr').filter({ hasText: code });
  }

  async addCoupon(data: CouponData): Promise<void> {
    await this.nameInput.fill(data.name);
    await this.codeInput.fill(data.code);
    await this.startDate.fill(data.startDate);
    await this.endDate.fill(data.endDate);
    await this.offerPrice.fill(String(data.offerPrice));
    await this.minPrice.fill(String(data.minPrice));
    await this.maxPrice.fill(String(data.maxPrice));
    await this.addButton.click();

    await this.successDialog.waitFor({ state: 'visible' });
    await this.page.waitForLoadState('domcontentloaded');
  }

  async deleteCouponByCode(code: string): Promise<void> {
    const row = this.rowByCode(code);
    await row.getByRole('button', { name: 'Delete' }).click();
    await this.confirmDeleteButton.click();
    await this.deletedDialog.waitFor({ state: 'visible' });
    await this.okButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
