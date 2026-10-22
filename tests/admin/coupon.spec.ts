import { test, expect } from '../../fixtures/admin.fixture';
import { faker } from '@faker-js/faker';
import { CouponData } from '../../types';

test.describe.configure({ mode: 'serial' });

test.describe('TimeVault Admin Coupon Tests', () => {
  const code = `TEST${faker.string.alpha({ length: 6, casing: 'upper' })}`;

  function isoDate(offsetDays: number): string {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  }

  const data: CouponData = {
    name: 'TestCoupon' + code,
    code,
    startDate: isoDate(0),
    endDate: isoDate(30),
    offerPrice: 100,
    minPrice: 500,
    maxPrice: 1000,
  };

  test('@regression admin can add a coupon', async ({ couponPage }) => {
    await couponPage.goto();
    const before = await couponPage.getCouponCount();

    await couponPage.addCoupon(data);

    await expect(couponPage.rowByCode(code)).toBeVisible();
    expect(await couponPage.getCouponCount()).toBe(before + 1);
  });

  test('@regression admin can delete a coupon', async ({ couponPage }) => {
    await couponPage.goto();
    const before = await couponPage.getCouponCount();

    await couponPage.deleteCouponByCode(code);

    await expect(couponPage.rowByCode(code)).toHaveCount(0);
    expect(await couponPage.getCouponCount()).toBe(before - 1);
  });
});
