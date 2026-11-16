import { CouponPage } from '../../pages/admin/coupon.page';
import { generateCoupon } from '../../data/generators';
import { test, expect } from '../../fixtures/e2e.fixture';
import { ensureCheckoutAddress, prepareCartForCodCheckout } from '../../utils/checkout.helpers';

test.describe('Checkout coupon integration', () => {
  test.describe.configure({ mode: 'serial' });

  test('@e2e a temporary admin coupon applies and is removed at checkout', async ({
    adminPage,
    addressPage,
    cartPage,
    checkoutPage,
    productDetailsPage,
  }) => {
    const coupon = generateCoupon({
      offerPrice: 100,
      minPrice: 500,
      maxPrice: 1000,
    });
    const adminCouponPage = new CouponPage(adminPage);

    await adminCouponPage.goto();
    await adminCouponPage.addCoupon(coupon);

    try {
      await ensureCheckoutAddress(addressPage);
      await prepareCartForCodCheckout(productDetailsPage, cartPage);
      await checkoutPage.goto();

      await expect(checkoutPage.couponDropdown).toBeVisible();
      await checkoutPage.applyCoupon(coupon.code);
      await expect(checkoutPage.alert.title).toHaveText('Success');
      await expect(checkoutPage.alert.message).toHaveText('Coupon applied');
      await checkoutPage.alert.dismiss();
      await expect(checkoutPage.orderSummary).toContainText('Coupon Discount: ₹100.00');

      await checkoutPage.removeCoupon();
      await expect(checkoutPage.orderSummary).toContainText('Coupon Discount: ₹0.00');
    } finally {
      await cartPage.removeAllItems();
      await adminCouponPage.goto();

      if ((await adminCouponPage.rowByCode(coupon.code).count()) > 0) {
        await adminCouponPage.deleteCouponByCode(coupon.code);
      }
    }
  });
});
