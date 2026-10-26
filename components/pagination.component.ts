import { expect, Locator } from '@playwright/test';
import { promises } from 'node:dns';

export class PaginationComponent {
  readonly pages: Locator;
  readonly activePage: Locator;
  readonly nextButton: Locator;
  readonly previousButton: Locator;

  constructor(private readonly root: Locator) {
    this.pages = root.locator('.vault-page-pill').filter({
      hasText: /^\d+$/,
    });

    this.activePage = root.locator('.vault-page-pill.active');

    this.nextButton = root.locator('.vault-page-pill:has(.ti-arrow-right');
    this.previousButton = root.locator('.vault-page-pill:has(.ti-arrow-left)');
  }

  async goToPage(pageNumber: number): Promise<void> {
    const pageLink = this.root.getByRole('link', {
      name: String(pageNumber),
      exact: true,
    });

    await pageLink.click();

    await expect(this.activePage).toHaveText(String(pageNumber));
  }

  async next(): Promise<void> {
    await this.nextButton.click();
    await expect(this.activePage).toBeVisible();
  }

  async previous(): Promise<void> {
    await this.previousButton.click();
    await expect(this.activePage).toBeVisible();
  }
}
