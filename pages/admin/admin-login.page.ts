import { Page, Locator } from '@playwright/test';
import { SweetAlertComponent } from '../../components/sweetalert.component';

export class AdminLoginPage {
  readonly page: Page;
  readonly alert: SweetAlertComponent;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.alert = new SweetAlertComponent(page);
    this.emailInput = page.locator('#adminEmail');
    this.passwordInput = page.locator('#adminPassword');
    this.loginButton = page.getByRole('button', { name: 'Log In' });
    this.emailError = page.locator('#emailError');
    this.passwordError = page.locator('#passwordError');
  }

  async goto(): Promise<void> {
    await this.page.goto('/admin/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
