import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly heading: Locator;
  readonly errorAlert: Locator;
  readonly forgotPasswordLink: Locator;
  readonly signupLink: Locator;
  readonly googleLoginLink: Locator;

  constructor(page: Page) {
    this.page = page;

    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');

    this.loginButton = page.getByRole('button', { name: 'Log In' });
    this.heading = page.getByRole('heading', { name: 'Log in to enter' });
    this.errorAlert = page.getByRole('alert');
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot Password?' });
    this.signupLink = page.getByRole('link', {
      name: 'Create an Account',
    });

    this.googleLoginLink = page.getByRole('link', { name: /Login with Google/ });
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectLoginVisible(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  async expectLoginError(message?: string): Promise<void> {
    await expect(this.errorAlert).toBeVisible();

    if (message) {
      await expect(this.errorAlert).toContainText(message);
    }
  }

  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }

  async clickCreateAccount(): Promise<void> {
    await this.signupLink.click();
  }

  async clickGoogleLogin(): Promise<void> {
    await this.googleLoginLink.click();
  }

  async togglePasswordVisibility(): Promise<void> {
    await this.page.locator('#togglePassword').click();
  }
}
