import { test, expect } from '../../fixtures/admin.fixture';

import { generateCoupon } from '../../data/generators';
const data = generateCoupon();
test.describe.configure({ mode: 'serial' });

test.describe('TimeVault Admin Coupon Tests', () => {
  test('@regression admin can add a coupon', async ({ couponPage }) => {
    await couponPage.goto();
    const before = await couponPage.getCouponCount();

    await couponPage.addCoupon(data);

    await expect(couponPage.rowByCode(data.code)).toBeVisible();
    expect(await couponPage.getCouponCount()).toBe(before + 1);
  });

  test('@regression admin can delete a coupon', async ({ couponPage }) => {
    await couponPage.goto();
    const before = await couponPage.getCouponCount();

    await couponPage.deleteCouponByCode(data.code);

    await expect(couponPage.rowByCode(data.code)).toHaveCount(0);
    expect(await couponPage.getCouponCount()).toBe(before - 1);
  });
});
