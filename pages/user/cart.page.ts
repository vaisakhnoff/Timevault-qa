import { Page, Locator, expect } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly cartItems: Locator;
  readonly qtyInput: Locator;
  readonly increaseButton: Locator;
  readonly decreaseButton: Locator;
  readonly removeButton: Locator;
  readonly subtotal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItems = page.locator('.cart-table tbody tr');
    this.qtyInput = page.locator('.qty');
    this.increaseButton = page.locator('.increase');
    this.decreaseButton = page.locator('.reduced');
    this.removeButton = page.locator('.remove-btn');
    this.subtotal = page.locator('#subtotal');
  }

  async goto(): Promise<void> {
    await this.page.goto('/cartPage');
  }

  async getItemCount(): Promise<number> {
    return this.cartItems.count();
  }

  async removeFirstItem(): Promise<void> {
    await this.removeButton.first().click();

    await this.page.getByRole('button', { name: 'Remove', exact: true }).click();

    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
  }

  async removeAllItems(): Promise<void> {
    await this.goto();

    while ((await this.getItemCount()) > 0) {
      await this.removeFirstItem();
      await this.goto();
    }
  }
}
