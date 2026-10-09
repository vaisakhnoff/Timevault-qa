import { test, expect } from '../../fixtures/base.fixture';



test('@regression product details page shows product info', async ({productDetailsPage }) => {
  
  await productDetailsPage.goto('6aad1146c76606074021e7ec'); 
  await expect(productDetailsPage.productName).toBeVisible();
  await expect(productDetailsPage.currentPrice).toBeVisible();
});

test('@regression adding product to cart shows success confirmation', async ({productDetailsPage }) => {
  
  await productDetailsPage.goto('6aad1146c76606074021e7ec'); 
  await productDetailsPage.setQuantity(2);
  await productDetailsPage.addToCart();
  await expect(productDetailsPage.cartSuccessDialog).toBeVisible();
});
