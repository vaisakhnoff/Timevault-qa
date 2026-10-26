import { expect, Locator, Page } from '@playwright/test';

export class SweetAlertComponent {
  readonly popup: Locator;
  readonly title: Locator;
  readonly message: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.popup = page.locator('.swal2-popup');
    this.title = this.popup.locator('.swal2-title');
    this.message = this.popup.locator('.swal2-html-container');
    this.confirmButton = this.popup.locator('.swal2-confirm');
    this.cancelButton = this.popup.locator('.swal2-cancel');
  }

  async confirm(): Promise<void> {
    await expect(this.popup).toBeVisible();
    await this.confirmButton.click();
  }

  async cancel(): Promise<void> {
    await expect(this.popup).toBeVisible();
    await this.cancelButton.click();
  }

  async dismiss(): Promise<void> {
    await expect(this.popup).toBeVisible();
    await this.confirmButton.click();
    await expect(this.popup).toBeHidden();
  }
}
