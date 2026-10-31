import { expect, Locator, Page } from '@playwright/test';
import { SweetAlertComponent } from '../../components/sweetalert.component';

export class WishlistPage {
  readonly page: Page;
  readonly alert: SweetAlertComponent;
  readonly wishlistCards: Locator;
  readonly removeButton: Locator;
  readonly moveToBagButton: Locator;
  readonly emptyMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.alert = new SweetAlertComponent(page);
    this.wishlistCards = page.locator('.wishlist-card');
    this.removeButton = page.locator('.wishlist-remove-btn');
    this.moveToBagButton = page.getByRole('button', { name: 'Move to Bag' });
    this.emptyMessage = page.getByRole('heading', { name: 'Your Wishlist is Empty' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/wishlist');
  }

  async getItemCount(): Promise<number> {
    return this.wishlistCards.count();
  }

  async removeFirstItem(): Promise<void> {
    if ((await this.getItemCount()) === 0) return;

    const removed = this.page.waitForResponse(
      (response) =>
        response.url().includes('/removeFromWishlist') && response.request().method() === 'POST',
    );

    await this.removeButton.first().click();
    await removed;
    await expect(this.alert.title).toHaveText('Removed');
    await expect(this.alert.popup).toBeHidden();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async moveFirstItemToBag(): Promise<void> {
    const added = this.page.waitForResponse(
      (response) => response.url().includes('/addToCart') && response.request().method() === 'POST',
    );

    await this.moveToBagButton.first().click();
    await added;
    await expect(this.alert.title).toHaveText('Allocated to Bag');
    await this.alert.dismiss();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
