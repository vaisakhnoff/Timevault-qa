import { test, expect } from '../../fixtures/base.fixture';

test('@regression product details page shows product info', async ({ productDetailsPage }) => {
  await productDetailsPage.goto('6aad1146c76606074021e7ec');
  await expect(productDetailsPage.productName).toBeVisible();
  await expect(productDetailsPage.currentPrice).toBeVisible();
});

test('@regression adding product to cart shows success confirmation', async ({
  productDetailsPage,
}) => {
  await productDetailsPage.goto('6aad1146c76606074021e7ec');
  await productDetailsPage.setQuantity(2);
  await productDetailsPage.addToCartAndLeaveDialogOpen();

  await expect(productDetailsPage.alert.title).toHaveText('Allocated to Bag');
  await expect(productDetailsPage.alert.message).toBeVisible();

  await productDetailsPage.alert.cancel();
});

test('@regression @boundary quantity stepper clamps at 4', async ({ productDetailsPage }) => {
  await productDetailsPage.goto('6aad1146c76606074021e7ec');

  for (let i = 0; i < 10; i++) {
    await productDetailsPage.increaseQtyButton.click();
  }

  await expect(productDetailsPage.quantityInput).toHaveValue('4');
});
