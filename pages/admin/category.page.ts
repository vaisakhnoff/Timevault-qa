import { expect, Locator, Page } from '@playwright/test';
import { SweetAlertComponent } from '../../components/sweetalert.component';

export class CategoryPage {
  readonly page: Page;
  readonly alert: SweetAlertComponent;
  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly addButton: Locator;
  readonly nameError: Locator;
  readonly descriptionError: Locator;
  readonly categoryRows: Locator;
  readonly totalCountLabel: Locator;
  readonly editNameInput: Locator;
  readonly editDescriptionInput: Locator;
  readonly updateButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.alert = new SweetAlertComponent(page);
    this.nameInput = page.locator('#product_name');
    this.descriptionInput = page.locator('#descriptionId');
    this.addButton = page.locator('form[action="/admin/addCategory"] button[type="submit"]');
    this.nameError = page.locator('#name-error');
    this.descriptionError = page.locator('#description-error');
    this.categoryRows = page.locator('table.table tbody tr');
    this.totalCountLabel = page.getByText(/\d+ Categories/);
    this.editNameInput = page.locator('input[name="categoryName"]');
    this.editDescriptionInput = page.locator('textarea[name="description"]');
    this.updateButton = page.getByRole('button', { name: 'Update category' });
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

  rowByName(name: string): Locator {
    return this.categoryRows.filter({ hasText: name });
  }

  statusByName(name: string): Locator {
    return this.rowByName(name).locator('[id^="listing-status-"]');
  }

  async addCategory(name: string, description: string): Promise<void> {
    await this.nameInput.fill(name);
    await this.descriptionInput.fill(description);
    await this.addButton.click();
    await this.alert.dismiss();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async editCategory(name: string, updatedName: string, description: string): Promise<void> {
    await this.rowByName(name).locator('a[href^="/admin/editCategory"]').click();
    await this.editNameInput.fill(updatedName);
    await this.editDescriptionInput.fill(description);

    const updated = this.page.waitForResponse(
      (response) =>
        response.url().includes('/admin/editCategory/') && response.request().method() === 'POST',
    );

    await this.updateButton.click();
    await updated;
    await expect(this.alert.title).toHaveText('Category Updated');
    await this.alert.dismiss();
    await this.goto();
  }

  async toggleListing(name: string): Promise<void> {
    const row = this.rowByName(name);
    const button = row.locator('[id^="listing-btn-"]');
    const endpoint =
      (await button.innerText()).trim() === 'Unlist'
        ? '/admin/listCategory'
        : '/admin/unlistCategory';

    const toggled = this.page.waitForResponse(
      (response) => response.url().includes(endpoint) && response.request().method() === 'GET',
    );

    await button.click();
    await toggled;
    await expect(this.alert.title).toHaveText('Success');
    await this.alert.dismiss();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
