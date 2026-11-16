import { expect, Locator, Page } from '@playwright/test';
import { SweetAlertComponent } from '../../components/sweetalert.component';

export class CheckoutPage {
  readonly page: Page;
  readonly alert: SweetAlertComponent;
  readonly pageTitle: Locator;
  readonly cartItemRows: Locator;
  readonly addressRadios: Locator;
  readonly noAddressMessage: Locator;
  readonly codPayment: Locator;
  readonly onlinePayment: Locator;
  readonly walletPayment: Locator;
  readonly placeOrderButton: Locator;
  readonly couponSelect: Locator;
  readonly couponDropdown: Locator;
  readonly applyCouponButton: Locator;
  readonly removeCouponButton: Locator;
  readonly orderSummary: Locator;
  readonly grandTotal: Locator;
  readonly orderSuccessHeading: Locator;
  readonly orderId: Locator;

  constructor(page: Page) {
    this.page = page;
    this.alert = new SweetAlertComponent(page);
    this.pageTitle = page.getByRole('heading', { name: 'Secure Checkout' });
    this.cartItemRows = page.locator('.cart_products tbody tr');
    this.addressRadios = page.locator('input[name="addressId"]');
    this.noAddressMessage = page.getByText('No addresses found. Please add a delivery address.');
    this.codPayment = page.locator('#cod');
    this.onlinePayment = page.locator('#online');
    this.walletPayment = page.locator('#wallet');
    this.placeOrderButton = page.locator('#checkout-form button[type="submit"]');
    this.couponSelect = page.locator('#coupon-select');
    this.couponDropdown = page.locator('#coupon-select + .nice-select');
    this.applyCouponButton = page.locator('#apply-coupon-btn');
    this.removeCouponButton = page.locator('#remove-coupon-btn');
    this.orderSummary = page.locator('.order-summary');
    this.grandTotal = this.orderSummary.getByRole('heading', { name: /Grand Total:/ });
    this.orderSuccessHeading = page.getByRole('heading', { name: 'Allocation Confirmed' });
    this.orderId = page.locator('strong').filter({ hasText: /^#ORD/ }).first();
  }

  async goto(): Promise<void> {
    await this.page.goto('/checkoutPage');
  }

  async selectFirstAddress(): Promise<void> {
    await expect(this.addressRadios.first()).toBeVisible();
    await this.addressRadios.first().check();
  }

  async selectCod(): Promise<void> {
    await expect(this.codPayment).toBeEnabled();
    await this.codPayment.check();
  }

  async selectWallet(): Promise<void> {
    await this.walletPayment.check();
  }

  async applyCoupon(code: string): Promise<void> {
    await this.couponDropdown.click();
    await this.couponDropdown.locator(`.option[data-value="${code}"]`).click();

    const applied = this.page.waitForResponse(
      (response) =>
        response.url().includes('/applyCoupon') && response.request().method() === 'POST',
    );

    await this.applyCouponButton.click();
    await applied;
  }

  async removeCoupon(): Promise<void> {
    const removed = this.page.waitForResponse(
      (response) =>
        response.url().includes('/removeCoupon') && response.request().method() === 'POST',
    );

    await this.removeCouponButton.click();
    await removed;
    await expect(this.alert.title).toHaveText('Success');
    await this.alert.dismiss();
  }

  async placeCodOrder(): Promise<string> {
    const orderSuccess = this.page.waitForURL(/\/orderSuccess/);

    await this.placeOrderButton.click();
    await orderSuccess;

    await expect(this.orderSuccessHeading).toBeVisible();

    const text = await this.orderId.innerText();
    const orderId = text.trim().replace(/^#/, '');

    if (!/^ORD[A-Z0-9]+$/.test(orderId)) {
      throw new Error(`Could not read a valid order ID from "${text}".`);
    }

    return orderId;
  }
}
