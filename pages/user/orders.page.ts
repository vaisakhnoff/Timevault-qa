import { Locator, Page } from '@playwright/test';

export class OrdersPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly orderCards: Locator;
  readonly emptyState: Locator;
  readonly paginationLinks: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { name: 'Order History' });
    this.orderCards = page
      .locator('.vault-card')
      .filter({ has: page.getByRole('heading', { name: /^Order #/ }) });
    this.emptyState = page.getByRole('heading', { name: 'No Acquisitions Found' });
    this.paginationLinks = page.locator('a[href*="?page="]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/orders');
  }

  async getOrderCount(): Promise<number> {
    return this.orderCards.count();
  }

  orderCardById(orderId: string): Locator {
    return this.orderCards.filter({ hasText: `Order #${orderId}` });
  }

  orderLinkById(orderId: string): Locator {
    return this.page.locator(`a[href="/order/${orderId}"]`);
  }

  async openOrder(orderId: string): Promise<void> {
    await this.orderLinkById(orderId).click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
