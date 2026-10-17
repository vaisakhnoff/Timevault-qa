import { Page, Locator } from '@playwright/test';

export class BrandPage {
  readonly page: Page;
  readonly brandRows: Locator;
  readonly firstRow: Locator;
  readonly firstRowStatus: Locator;
  readonly firstRowToggleButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.brandRows = page.locator('table.table tbody tr');
    this.firstRow = this.brandRows.first();
    // Status badge ("Listed" / "Unlisted") and the toggle button, scoped to the first row.
    this.firstRowStatus = this.firstRow.locator('.status-cell .tv-badge');
    this.firstRowToggleButton = this.firstRow.locator('.toggle-status');
  }

  async goto(): Promise<void> {
    await this.page.goto('/admin/brands');
  }

  async getBrandCount(): Promise<number> {
    return this.brandRows.count();
  }

  async getFirstStatusText(): Promise<string> {
    return (await this.firstRowStatus.innerText()).trim();
  }

  async toggleFirstBrandStatus(): Promise<void> {
    await this.firstRowToggleButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
