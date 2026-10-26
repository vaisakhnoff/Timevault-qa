import { Page, Locator, expect } from '@playwright/test';
import { CouponData } from '../../types';
import { SweetAlertComponent } from '../../components/sweetalert.component';

export class CouponPage {
  readonly page: Page;
  readonly alert: SweetAlertComponent;
  readonly nameInput: Locator;
  readonly codeInput: Locator;
  readonly startDate: Locator;
  readonly endDate: Locator;
  readonly offerPrice: Locator;
  readonly minPrice: Locator;
  readonly maxPrice: Locator;
  readonly addButton: Locator;
  readonly couponRows: Locator;

  constructor(page: Page) {
    this.page = page;
    this.alert = new SweetAlertComponent(page);
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

    await expect(this.alert.title).toHaveText('Success!');

    await expect(this.alert.popup).toBeVisible();
    await expect(this.alert.popup).toBeHidden();
  }

  async deleteCouponByCode(code: string): Promise<void> {
    const row = this.rowByCode(code);
    await row.getByRole('button', { name: 'Delete' }).click();
    await this.alert.confirm();
    await expect(this.alert.title).toHaveText('Deleted!');
    await this.alert.dismiss();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
