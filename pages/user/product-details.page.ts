import { Page, Locator, expect } from '@playwright/test';
import { SweetAlertComponent } from '../../components/sweetalert.component';

export class ProductDetailsPage {
  readonly page: Page;
  readonly alert: SweetAlertComponent;
  readonly productName: Locator;
  readonly currentPrice: Locator;
  readonly quantityInput: Locator;
  readonly addToCartButton: Locator;
  readonly wishlistButton: Locator;
  readonly cartSuccessDialog: Locator;
  readonly quantityLimitDialog: Locator;
  readonly increaseQtyButton: Locator;
  readonly decreaseQtyButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.alert = new SweetAlertComponent(page);
    this.productName = page.locator('h1');
    this.currentPrice = page.locator('.col-lg-6 .vault-price-current');
    this.quantityInput = page.locator('#sst');
    this.addToCartButton = page.getByText('Acquire Piece', { exact: true });
    this.wishlistButton = page.getByTitle('Save to Wishlist');
    this.cartSuccessDialog = page.getByText('Allocated to Bag');
    this.quantityLimitDialog = page.getByText('Allocation Limit');
    this.increaseQtyButton = page.locator('button[onclick="updateQuantity(\'increase\')"]');
    this.decreaseQtyButton = page.locator('button[onclick="updateQuantity(\'decrease\')"]');
  }

  async goto(id: string): Promise<void> {
    await this.page.goto('/productDetails?id=' + id);
  }

  async getName(): Promise<string> {
    return this.productName.innerText();
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
