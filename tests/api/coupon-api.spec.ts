import { test, expect } from '../../fixtures/api.fixture';
import type { CouponResponse } from '../../api/coupon.api';
import { generateCoupon } from '../../data/generators';
import { PRODUCTS } from '../../data/api-test-data';
import { dateFromToday } from '../../utils/helpers';

const TITAN = PRODUCTS.titan;

const VALID = generateCoupon({ offerPrice: 10, minPrice: 100, maxPrice: 100_000 });
const HIGH_MIN = generateCoupon({ offerPrice: 100, minPrice: 9_000_000, maxPrice: 9_999_999 });

const EXPIRED = generateCoupon({ endDate: dateFromToday(-1) });

test.describe('Coupon API @api @coupon', () => {
  test.beforeAll(async ({ workerAdminApi }) => {
    for (const coupon of [VALID, HIGH_MIN, EXPIRED]) {
      const res = await workerAdminApi.addCoupon(coupon);
      expect(res.status(), `create ${coupon.code}`).toBe(200);
    }
  });

  test.afterAll(async ({ workerAdminApi }) => {
    for (const coupon of [VALID, HIGH_MIN, EXPIRED]) {
      await workerAdminApi.deleteCouponByCode(coupon.code);
    }
  });

  test.beforeEach(async ({ couponApi, cartApi }) => {
    await couponApi.removeCoupon();
    await cartApi.removeFromCart(TITAN.id);
    await cartApi.addToCart(TITAN.id, 1);
  });

  test.afterEach(async ({ couponApi, cartApi }) => {
    await couponApi.removeCoupon();
    await cartApi.removeFromCart(TITAN.id);
  });

  test.describe('POST /applyCoupon', () => {
    test('applies a valid coupon and returns the discounted total', async ({ couponApi }) => {
      const res = await couponApi.applyCoupon(VALID.code);
      expect(res.status()).toBe(200);
      const body = (await res.json()) as CouponResponse;
      expect(body.success).toBe(true);
      expect(body.coupon?.code).toBe(VALID.code);
      expect(body.discount).toBe(VALID.offerPrice);
      expect(body.grandTotal).toBe(body.cartTotal - VALID.offerPrice);
    });

    test('matches the code case-insensitively', async ({ couponApi }) => {
      const res = await couponApi.applyCoupon(VALID.code.toLowerCase());
      expect(res.status()).toBe(200);
    });

    test('rejects a second coupon while one is applied @negative', async ({ couponApi }) => {
      await couponApi.applyCoupon(VALID.code);
      const res = await couponApi.applyCoupon(VALID.code);
      expect(res.status()).toBe(400);
      expect(((await res.json()) as CouponResponse).message).toBe('A coupon is already applied');
    });

    test('returns 404 for an unknown code @negative', async ({ couponApi }) => {
      const res = await couponApi.applyCoupon('NOSUCHCOUPON1');
      expect(res.status()).toBe(404);
    });

    test('rejects an expired coupon @negative', async ({ couponApi }) => {
      const res = await couponApi.applyCoupon(EXPIRED.code);
      expect(res.status()).toBe(400);
      expect(((await res.json()) as CouponResponse).message).toBe('Coupon has expired');
    });

    test('rejects a cart below the minimum price @negative @boundary', async ({ couponApi }) => {
      const res = await couponApi.applyCoupon(HIGH_MIN.code);
      expect(res.status()).toBe(400);
      expect(((await res.json()) as CouponResponse).message).toContain(
        `at least ₹${HIGH_MIN.minPrice}`,
      );
    });

    test('rejects a coupon on an empty cart @negative', async ({ couponApi, cartApi }) => {
      await cartApi.removeFromCart(TITAN.id);
      const res = await couponApi.applyCoupon(VALID.code);
      expect(res.status()).toBe(400);
      expect(((await res.json()) as CouponResponse).message).toBe('Your cart is empty');
    });

    // BUG-009: the code is pasted into new RegExp(), so regex syntax is interpreted.
    test('treats regex wildcards as plain text @security', async ({ couponApi }) => {
      test.fail(true, 'BUG-009: /applyCoupon interprets the code as a regular expression');
      const res = await couponApi.applyCoupon(`${VALID.code.slice(0, 6)}.*`);
      expect(res.status()).toBe(404);
    });

    test('answers an invalid regex character with 404, not 500 @security', async ({
      couponApi,
    }) => {
      test.fail(true, 'BUG-009: an unbalanced "(" makes new RegExp() throw, answered as 500');
      const res = await couponApi.applyCoupon('(');
      expect(res.status()).toBe(404);
    });
  });

  test.describe('POST /removeCoupon', () => {
    test('removes the coupon and restores the full total', async ({ couponApi }) => {
      await couponApi.applyCoupon(VALID.code);
      const res = await couponApi.removeCoupon();
      expect(res.status()).toBe(200);
      const body = (await res.json()) as CouponResponse;
      expect(body.discount).toBe(0);
      expect(body.grandTotal).toBe(body.cartTotal);
    });

    test('rejects removal when no coupon is applied @negative', async ({ couponApi }) => {
      const res = await couponApi.removeCoupon();
      expect(res.status()).toBe(400);
      expect(((await res.json()) as CouponResponse).message).toBe('No coupon applied');
    });
  });

  // BUG-010: no auth.checkSession on the coupon routes, so anonymous callers can probe codes.
  test('anonymous POST /applyCoupon is rejected with 401 @security', async ({ anonCouponApi }) => {
    test.fail(true, 'BUG-010: /applyCoupon has no auth.checkSession');
    const res = await anonCouponApi.applyCoupon(VALID.code);
    expect(res.status()).toBe(401);
  });

  // BUG-011: addCoupon validates the start date but never compares it with the end date.
  test('admin cannot create a coupon that ends before it starts @negative', async ({
    adminApi,
  }) => {
    test.fail(true, 'BUG-011: /admin/addCoupon accepts an end date before the start date');
    const coupon = generateCoupon({ startDate: dateFromToday(1), endDate: dateFromToday(0) });
    const res = await adminApi.addCoupon(coupon);
    await adminApi.deleteCouponByCode(coupon.code);
    expect(res.status()).toBe(400);
  });
});
