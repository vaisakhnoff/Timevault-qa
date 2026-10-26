import { Page, Locator } from '@playwright/test';
import { HeaderComponent } from '../../components/header.component';

export class HomePage {
  readonly page: Page;
  readonly header: HeaderComponent;
  readonly latestReleasesHeading: Locator;
  readonly productCards: Locator;
  readonly categoryTiles: Locator;
  readonly brandLinks: Locator;
  readonly viewFullCatalogLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new HeaderComponent(page);

    this.latestReleasesHeading = page.getByRole('heading', {
      name: 'Latest Vault Releases',
    });

    const latestReleasesSection = page
      .locator('section')
      .filter({ has: this.latestReleasesHeading });

    this.productCards = latestReleasesSection.locator('.vault-product-card');
    this.categoryTiles = page.locator('.vault-cat-card');
    this.brandLinks = page.locator('.vault-brand-pill-card');
    this.viewFullCatalogLink = page.getByRole('link', {
      name: 'View Full Catalog',
      exact: true,
    });
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  categoryTile(name: string): Locator {
    const category = encodeURIComponent(name);

    return this.page.locator(`a.vault-cat-card[href="/shopPage?category=${category}"]`);
  }
}
