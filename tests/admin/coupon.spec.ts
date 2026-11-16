import { test, expect } from '../../fixtures/admin.fixture';

import { generateCoupon } from '../../data/generators';
const data = generateCoupon();
test.describe.configure({ mode: 'serial' });

test.describe('TimeVault Admin Coupon Tests', () => {
  test('@regression admin can add a coupon', async ({ couponPage }) => {
    await couponPage.goto();
    await expect(couponPage.rowByCode(data.code)).toHaveCount(0);

    await couponPage.addCoupon(data);

    await expect(couponPage.rowByCode(data.code)).toHaveCount(1);
  });

  test('@regression admin can delete a coupon', async ({ couponPage }) => {
    await couponPage.goto();
    await expect(couponPage.rowByCode(data.code)).toHaveCount(1);

    await couponPage.deleteCouponByCode(data.code);

    await expect(couponPage.rowByCode(data.code)).toHaveCount(0);
  });
});

test.describe('Admin Coupon Validation Tests', () => {
  test.describe.configure({ mode: 'serial' });

  test('@regression @negative invalid price order is blocked in the browser', async ({
    couponPage,
  }) => {
    await couponPage.goto();
    await couponPage.fillCouponForm(
      generateCoupon({ offerPrice: 500, minPrice: 500, maxPrice: 1000 }),
    );
    await couponPage.submit();

    await expect(couponPage.offerPriceError).toContainText(
      'Discount amount must be less than Minimum Purchase amount',
    );
  });

  test('@regression @negative past coupon start date is blocked in the browser', async ({
    couponPage,
  }) => {
    await couponPage.goto();
    await couponPage.fillCouponForm(
      generateCoupon({
        startDate: '2020-01-01',
      }),
    );
    await couponPage.submit();

    expect(
      await couponPage.startDate.evaluate(
        (input: HTMLInputElement) => input.validity.rangeUnderflow,
      ),
    ).toBe(true);
  });

  test('@regression @negative duplicate active coupon is rejected by the server', async ({
    couponPage,
  }) => {
    const coupon = generateCoupon();
    await couponPage.goto();
    await couponPage.addCoupon(coupon);

    try {
      await couponPage.fillCouponForm(coupon);

      const duplicate = couponPage.page.waitForResponse(
        (response) =>
          response.url().includes('/admin/addCoupon') && response.request().method() === 'POST',
      );

      await couponPage.submit();
      await duplicate;

      await expect(couponPage.alert.title).toHaveText('Error');
      await expect(couponPage.alert.message).toContainText(
        'Active coupon with this name or code already exists',
      );
      await couponPage.alert.dismiss();
    } finally {
      await couponPage.goto();
      if ((await couponPage.rowByCode(coupon.code).count()) > 0) {
        await couponPage.deleteCouponByCode(coupon.code);
      }
    }
  });
});
