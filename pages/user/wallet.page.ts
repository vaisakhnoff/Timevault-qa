import { Page, Locator } from '@playwright/test';

export class WalletPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly balance: Locator;
  readonly ledgerHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { name: 'Vault Wallet' });
    this.balance = page.locator('h2').filter({ hasText: '₹' }).first();
    this.ledgerHeading = page.getByText('Ledger & Transactions');
  }

  async goto(): Promise<void> {
    await this.page.goto('/wallet');
  }

  async getBalanceText(): Promise<string> {
    return this.balance.innerText();
  }
}
