import { expect, Locator, Page } from '@playwright/test';
import { NewUserData } from '../../types';

export class SignupPage {
  readonly page: Page;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly referralCodeInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly alert: Locator;
  readonly firstNameError: Locator;
  readonly lastNameError: Locator;
  readonly emailError: Locator;
  readonly phoneError: Locator;
  readonly passwordError: Locator;
  readonly confirmPasswordError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.locator('#firstName');
    this.lastNameInput = page.locator('#lastName');
    this.emailInput = page.locator('#email');
    this.phoneInput = page.locator('#phoneNumber');
    this.referralCodeInput = page.locator('#referalCode');
    this.passwordInput = page.locator('#password');
    this.confirmPasswordInput = page.locator('#confirmPassword');
    this.submitButton = page.locator('#signupForm button[type="submit"]');
    this.alert = page.getByRole('alert');
    this.firstNameError = page.locator('#error1');
    this.lastNameError = page.locator('#error2');
    this.emailError = page.locator('#error3');
    this.phoneError = page.locator('#error4');
    this.passwordError = page.locator('#error5');
    this.confirmPasswordError = page.locator('#error6');
  }

  async goto(): Promise<void> {
    await this.page.goto('/signup');
  }

  async fillForm(user: NewUserData): Promise<void> {
    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
    await this.emailInput.fill(user.email);
    await this.phoneInput.fill(user.phoneNumber);
    await this.referralCodeInput.fill(user.referalCode ?? '');
    await this.passwordInput.fill(user.password);
    await this.confirmPasswordInput.fill(user.confirmPassword);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async expectSignupPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/signup/);
  }
}
