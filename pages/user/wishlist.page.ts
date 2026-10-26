import { Page, Locator } from '@playwright/test';

export class WishlistPage {
  readonly page: Page;
  readonly wishlistCards: Locator;
  readonly removeButton: Locator;
  readonly emptyMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.wishlistCards = page.locator('.wishlist-card');
    this.removeButton = page.locator('.wishlist-remove-btn');
    this.emptyMessage = page.getByRole('heading', { name: 'Your Wishlist is Empty' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/wishlist');
  }

  async getItemCount(): Promise<number> {
    return await this.wishlistCards.count();
  }

  async removeFirstItem(): Promise<void> {
    const previousCount = await this.getItemCount();

    if (previousCount === 0) return;

    await this.removeButton.first().click();
  }
}
