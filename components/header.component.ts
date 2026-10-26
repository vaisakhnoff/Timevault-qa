import { expect, Locator, Page } from '@playwright/test';

export class HeaderComponent {
  readonly page: Page;
  readonly root: Locator;

  readonly userMenuButton: Locator;
  readonly loginLink: Locator;
  readonly signupLink: Locator;
  readonly cartLink: Locator;
  readonly wishlistLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.getByRole('banner');

    this.userMenuButton = this.root.locator('#userMenuBtn');

    this.loginLink = this.root.getByRole('link', {
      name: 'Login',
      exact: true,
    });

    this.signupLink = this.root.getByRole('link', {
      name: 'Join Vault',
      exact: true,
    });

    this.cartLink = this.root.getByTitle('Bag', {
      exact: true,
    });

    this.wishlistLink = this.root.getByTitle('Wishlist', {
      exact: true,
    });
  }

  async openUserMenu(): Promise<void> {
    await this.userMenuButton.click();
    await expect(this.userMenuButton).toHaveAttribute('aria-expanded', 'true');
  }

  async logout(): Promise<void> {
    await this.openUserMenu();

    const logoutLink = this.root.getByRole('link', {
      name: 'Logout',
      exact: true,
    });

    await logoutLink.click();
    await this.page.waitForURL(/\/login/);
  }
}
