import { Page, Locator } from '@playwright/test';

export class CustomersPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly customerRows: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('input[name="search"]');
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.customerRows = page.locator('table.table tbody tr');
  }

  async goto(): Promise<void> {
    await this.page.goto('/admin/users');
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  rowByEmail(email: string): Locator {
    return this.customerRows.filter({ hasText: email });
  }

  async getStatusByEmail(email: string): Promise<string> {
    return (await this.rowByEmail(email).locator('.tv-badge').innerText()).trim();
  }

  async blockByEmail(email: string): Promise<void> {
    await this.rowByEmail(email).locator('.blockCustomer').click();
    await this.page.getByRole('button', { name: 'Yes, block user' }).click();
    await this.page.getByText('User Blocked').waitFor({ state: 'visible' });
    await this.page.getByRole('button', { name: 'OK' }).click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async unblockByEmail(email: string): Promise<void> {
    await this.rowByEmail(email).locator('.unblockCustomer').click();
    await this.page.getByRole('button', { name: 'Yes, unblock user' }).click();
    await this.page.getByText('User Unblocked').waitFor({ state: 'visible' });
    await this.page.getByRole('button', { name: 'OK' }).click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
