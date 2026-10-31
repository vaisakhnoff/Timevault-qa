import { expect, Locator, Page } from '@playwright/test';
import { SweetAlertComponent } from '../../components/sweetalert.component';

export class OrderDetailsPage {
  readonly page: Page;
  readonly alert: SweetAlertComponent;
  readonly pageTitle: Locator;
  readonly orderIdHeading: Locator;
  readonly itemRows: Locator;
  readonly shippingAddressHeading: Locator;
  readonly paymentSummaryHeading: Locator;
  readonly cancelItemButton: Locator;
  readonly returnButton: Locator;
  readonly itemStatusBadges: Locator;

  constructor(page: Page) {
    this.page = page;
    this.alert = new SweetAlertComponent(page);
    this.pageTitle = page.getByRole('heading', {
      name: /^Order Allocation #ORD/,
    });
    this.orderIdHeading = this.pageTitle;
    this.itemRows = page.locator('.order-items tbody tr');
    this.shippingAddressHeading = page.getByRole('heading', { name: 'Shipping Address' });
    this.paymentSummaryHeading = page.getByRole('heading', { name: 'Payment Summary' });
    this.cancelItemButton = page.getByRole('button', { name: 'Cancel Item' });
    this.returnButton = page.getByRole('button', { name: 'Return', exact: true });
    this.itemStatusBadges = page.locator('.order-actions .badge');
  }

  async goto(orderId: string): Promise<void> {
    await this.page.goto(`/order/${orderId}`);
  }

  async cancelFirstPendingItem(): Promise<void> {
    await this.cancelItemButton.first().click();

    const cancelled = this.page.waitForResponse(
      (response) =>
        response.url().includes('/order/cancelItem') && response.request().method() === 'POST',
    );

    await this.alert.confirm();
    await cancelled;

    await expect(this.alert.title).toHaveText('Cancelled');
    await this.alert.dismiss();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async requestReturnForFirstItem(reason: string): Promise<void> {
    await this.returnButton.first().click();
    await expect(this.alert.popup).toBeVisible();

    await this.alert.popup.locator('#return-reason').fill(reason);

    const requested = this.page.waitForResponse(
      (response) =>
        response.url().includes('/order/returnItem') && response.request().method() === 'POST',
    );

    await this.alert.confirm();
    await requested;

    await expect(this.alert.title).toHaveText('Return Request Submitted');
    await this.alert.dismiss();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
