import { Page, Locator } from '@playwright/test';

export class ForgotPasswordPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly submitButton: Locator;
  readonly alert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('#email');
    this.submitButton = page.getByRole('button', {
      name: /Send Recovery Code/,
    });
    this.alert = page.getByRole('alert');
  }

  async goto(): Promise<void> {
    await this.page.goto('/forgotPassword');
  }

  async submitForEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.submitButton.click();
  }
}
