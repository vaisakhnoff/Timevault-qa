import { Page, Locator } from '@playwright/test';
import { SweetAlertComponent } from '../../components/sweetalert.component';

export class CategoryPage {
  readonly page: Page;
  readonly alert: SweetAlertComponent;
  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly addButton: Locator;
  readonly categoryRows: Locator;
  readonly totalCountLabel: Locator;

  constructor(page: Page) {
    this.page = page;
    this.alert = new SweetAlertComponent(page);
    this.nameInput = page.locator('#product_name');
    this.descriptionInput = page.locator('#descriptionId');
    this.addButton = page.locator('form[action="/admin/addCategory"] button[type="submit"]');
    this.categoryRows = page.locator('table.table tbody tr');
    this.totalCountLabel = page.getByText(/\d+ Categories/);
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

    await this.alert.dismiss();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
