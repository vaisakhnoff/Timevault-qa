import { Page, Locator, expect } from '@playwright/test';
import { SweetAlertComponent } from '../../components/sweetalert.component';

export class ProductDetailsPage {
  readonly page: Page;
  readonly alert: SweetAlertComponent;
  readonly productName: Locator;
  readonly currentPrice: Locator;
  readonly stockText: Locator;
  readonly quantityInput: Locator;
  readonly addToCartButton: Locator;
  readonly wishlistButton: Locator;
  readonly increaseQtyButton: Locator;
  readonly decreaseQtyButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.alert = new SweetAlertComponent(page);
    this.productName = page.locator('h1');
    this.currentPrice = page.locator('.col-lg-6 .vault-price-current');
    this.stockText = page.locator('.text-muted').filter({ hasText: /units available/ });
    this.quantityInput = page.locator('#sst');
    this.addToCartButton = page.getByText('Acquire Piece', { exact: true });
    this.wishlistButton = page.getByTitle('Save to Wishlist');
    this.increaseQtyButton = page.locator('button[onclick="updateQuantity(\'increase\')"]');
    this.decreaseQtyButton = page.locator('button[onclick="updateQuantity(\'decrease\')"]');
  }

  async goto(id: string): Promise<void> {
    await this.page.goto('/productDetails?id=' + id);
  }

  async getName(): Promise<string> {
    return this.productName.innerText();
  }

  async getAvailableStock(): Promise<number> {
    const text = await this.stockText.innerText();
    const match = text.match(/(\d+) units available/);

    if (!match) {
      throw new Error(`Could not read available stock from "${text}".`);
    }

    return Number(match[1]);
  }

  async setQuantity(n: number): Promise<void> {
    for (let i = 1; i < n; i++) {
      await this.increaseQtyButton.click();
    }
  }

  async addToCartAndLeaveDialogOpen(): Promise<void> {
    await this.addToCartButton.click();
    await expect(this.alert.popup).toBeVisible();
  }

  async addToCart(): Promise<void> {
    await this.addToCartAndLeaveDialogOpen();

    await this.alert.cancel();
  }

  async addToWishlist(): Promise<void> {
    await this.wishlistButton.click();
  }
}
