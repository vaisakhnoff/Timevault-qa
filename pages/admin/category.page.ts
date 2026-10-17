import { Page, Locator } from '@playwright/test';

export class CategoryPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly addButton: Locator;
  readonly categoryRows: Locator;
  readonly totalCountLabel: Locator;
  readonly successDialog: Locator;
  readonly dialogConfirmButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.locator('#product_name');
    this.descriptionInput = page.locator('#descriptionId');
    this.addButton = page.locator('form[action="/admin/addCategory"] button[type="submit"]');
    this.categoryRows = page.locator('table.table tbody tr');
    this.totalCountLabel = page.getByText(/\d+ Categories/);
    this.successDialog = page.getByText('Category added successfully');
    this.dialogConfirmButton = page.getByRole('button', { name: 'OK' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/admin/category');
  }

  async getCategoryCount(): Promise<number> {
    return this.categoryRows.count();
  }

  async getTotalCount(): Promise<number> {
    const text = await this.totalCountLabel.innerText();
    return parseInt(text.replace(/\D/g, ''), 10);
  }

  async addCategory(name: string, description: string): Promise<void> {
    await this.nameInput.fill(name);
    await this.descriptionInput.fill(description);
    await this.addButton.click();

    await this.successDialog.waitFor({ state: 'visible' });
    await this.dialogConfirmButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
