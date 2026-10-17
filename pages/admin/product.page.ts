import { Page, Locator } from '@playwright/test';

export class ProductPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly totalCountBadge: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly productRows: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { name: 'Product Management' });
    this.totalCountBadge = page.getByText(/Total Products:/);
    this.searchInput = page.locator('input[name="search"]');
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.productRows = page.locator('tr[data-product-id]');
    this.emptyState = page.getByText('No products found matching your search');
  }

  async goto(): Promise<void> {
    await this.page.goto('/admin/products');
  }

  async getProductCount(): Promise<number> {
    return this.productRows.count();
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
