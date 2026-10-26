import { Page, Locator, expect } from '@playwright/test';
import { SweetAlertComponent } from '../../components/sweetalert.component';

export class OrdersPage {
  readonly page: Page;
  readonly alert: SweetAlertComponent;
  readonly pageTitle: Locator;
  readonly searchInput: Locator;
  readonly statusFilter: Locator;
  readonly filterButton: Locator;
  readonly orderRows: Locator;
  readonly ViewLinks: Locator;
  readonly emptyState: Locator;

  readonly detailStatusSelect: Locator;
  readonly detailUpdateButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.alert = new SweetAlertComponent(page);
    this.pageTitle = page.getByRole('heading', { name: 'Order Management' });
    this.searchInput = page.locator('input[name="search"]');
    this.statusFilter = page.locator('select[name="status"]');
    this.filterButton = page.getByRole('button', { name: 'Filter' });

    this.ViewLinks = page.locator('a[href^="/admin/order/"]');
    this.orderRows = page.locator('table.table tbody tr').filter({ has: this.ViewLinks });
    this.emptyState = page.getByText('No orders found matching your search or filter');

    this.detailStatusSelect = page.locator('select[name="newStatus"]');
    this.detailUpdateButton = page.getByRole('button', { name: 'Update' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/admin/orders');
  }

  async getOrderCount(): Promise<number> {
    return this.ViewLinks.count();
  }

  async filterByStatus(status: string): Promise<void> {
    await this.statusFilter.selectOption(status);

    await this.filterButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async openFirstOrder(): Promise<void> {
    await this.ViewLinks.first().click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async updateStatus(newStatus: string): Promise<void> {
    await this.detailStatusSelect.selectOption(newStatus);
    await this.detailUpdateButton.click();
    await expect(this.alert.title).toHaveText('Success');
    await this.alert.dismiss();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getNextStatus(): Promise<string | undefined> {
    const options = await this.detailStatusSelect.locator('option').allInnerTexts();

    return options
      .map((option) => option.trim())
      .find((option) => option && option !== 'Select new status');
  }
}
