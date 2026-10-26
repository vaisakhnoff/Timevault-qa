import { test, expect } from '../../fixtures/base.fixture';

test.describe('TimeVault Wallet Tests', () => {
  test('@regression wallet page loads with balance and ledger', async ({ walletPage }) => {
    await walletPage.goto();

    await expect(walletPage.pageTitle).toBeVisible();
    await expect(walletPage.balance).toBeVisible();
    await expect(walletPage.balance).toContainText('₹');
    await expect(walletPage.ledgerHeading).toBeVisible();
  });
});
