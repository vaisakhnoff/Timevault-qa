import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly revenueValue: Locator;
  readonly ordersValue: Locator;
  readonly globalFilter: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { name: 'Business Overview' });
    this.revenueValue = page.locator('#revenueValue');
    this.ordersValue = page.locator('#ordersValue');
    this.globalFilter = page.locator('#globalFilter');
  }

  async goto(): Promise<void> {
    await this.page.goto('/admin/dashboard');
  }
}
