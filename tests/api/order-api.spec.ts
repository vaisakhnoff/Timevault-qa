import { test, expect } from '../../fixtures/api.fixture';
import type { CancelItemResponse } from '../../api/order.api';
import { AuthApi } from '../../api/auth.api';
import { OrderApi } from '../../api/order.api';
import { createAnonymousContext } from '../../api/request-context';
import { COD_SAFE_PRODUCT } from '../../data/checkout-test-data';
import envConfig from '../../config/env.config';

const hasSecondCustomer = !!envConfig.blockableUserEmail && !!envConfig.blockableUserPassword;

test.describe('Order API @api @order', () => {
  test('POST placeOrder empties the cart, so a second order is rejected', async ({
    pendingOrder,
    orderApi,
  }) => {
    expect(pendingOrder.code).toMatch(/^ORD[A-Z0-9]{8}$/);
    const again = await orderApi.placeCodOrder('000000000000000000000000');
    expect(again.status()).toBe(400);
    expect(await again.json()).toEqual({ error: 'Cart is empty' });
  });

  test('POST /order/returnItem rejects an item that is not delivered @negative', async ({
    pendingOrder,
    orderApi,
  }) => {
    const res = await orderApi.returnItem(pendingOrder.id, pendingOrder.itemId);
    expect(res.status()).toBe(400);
    expect(((await res.json()) as CancelItemResponse).message).toBe(
      'Only delivered items can be returned',
    );
  });

  test('POST /order/cancelItem cancels a pending item', async ({ pendingOrder, orderApi }) => {
    const res = await orderApi.cancelItem(pendingOrder.id, pendingOrder.itemId);
    expect(res.status()).toBe(200);
    const body = (await res.json()) as CancelItemResponse;
    expect(body.success).toBe(true);
    expect(body.refundAmount).toBeGreaterThan(0);
    expect(body.newOrderStatus).toBe('Cancelled');
  });

  test('cancelling an item restores product stock', async ({
    pendingOrder,
    orderApi,
    productApi,
  }) => {
    test.fail(true, 'BUG-004: item cancellation does not restore stock');
    const afterOrder = await productApi.getStock(COD_SAFE_PRODUCT.id);
    await orderApi.cancelItem(pendingOrder.id, pendingOrder.itemId);
    expect(await productApi.getStock(COD_SAFE_PRODUCT.id)).toBe(afterOrder + 1);
  });

  // BUG-016: no item.status check, so an item that is already cancelled is cancelled (and refunded) again.
  test('an item cannot be cancelled twice @negative', async ({ pendingOrder, orderApi }) => {
    test.fail(true, 'BUG-016: /order/cancelItem accepts an already cancelled item');
    await orderApi.cancelItem(pendingOrder.id, pendingOrder.itemId);
    const second = await orderApi.cancelItem(pendingOrder.id, pendingOrder.itemId);
    expect(second.status()).toBe(400);
  });

  test('anonymous POST /order/cancelItem is rejected with 401 @security', async ({
    pendingOrder,
    anonOrderApi,
  }) => {
    const res = await anonOrderApi.cancelItem(pendingOrder.id, pendingOrder.itemId);
    expect(res.status()).toBe(401);
  });

  test.describe('another customer @security', () => {
    test.skip(
      !hasSecondCustomer,
      'Set TEST_BLOCKABLE_USER_EMAIL and TEST_BLOCKABLE_USER_PASSWORD in .env.',
    );

    test("cannot cancel someone else's item via /order/cancelItem", async ({ pendingOrder }) => {
      const ctx = await createAnonymousContext();
      try {
        await new AuthApi(ctx).login(envConfig.blockableUserEmail, envConfig.blockableUserPassword);
        const res = await new OrderApi(ctx).cancelItem(pendingOrder.id, pendingOrder.itemId);
        expect(res.status()).toBe(404);
      } finally {
        await ctx.dispose();
      }
    });

    // BUG-015: cancelOrder uses Order.findById(orderId) with no user filter (IDOR).
    test("cannot cancel someone else's order via /cancelOrder", async ({
      pendingOrder,
      orderApi,
    }) => {
      test.fail(true, "BUG-015: /cancelOrder lets any customer cancel another customer's order");
      const ctx = await createAnonymousContext();
      try {
        const login = await new AuthApi(ctx).login(
          envConfig.blockableUserEmail,
          envConfig.blockableUserPassword,
        );
        expect(login.status(), 'second customer must be able to log in').toBe(302);
        await new OrderApi(ctx).cancelOrder(pendingOrder.id);
      } finally {
        await ctx.dispose();
      }
      // If the attack was blocked, the order is still pending and the owner's own cancel succeeds.
      const owner = await orderApi.cancelOrder(pendingOrder.id);
      expect(owner.headers()['location']).not.toContain('error=');
    });
  });

  // BUG-017: placeOrder sets paymentStatus 'Completed' for any non-COD method, with no payment check.
  test('POST /placeOrder refuses a non-COD payment method @security', async ({
    cartApi,
    couponApi,
    orderApi,
  }) => {
    test.fail(true, 'BUG-017: /placeOrder marks an Online order as paid without any payment');
    await couponApi.removeCoupon();
    await cartApi.removeFromCart(COD_SAFE_PRODUCT.id);
    await cartApi.addToCart(COD_SAFE_PRODUCT.id, 1);
    const addressId = await orderApi.checkoutAddressId();
    if (!addressId) throw new Error('The QA user needs a saved address (CHECKOUT_ADDRESS)');

    const res = await orderApi.placeOrder(addressId, 'Online');
    // No cancel cleanup on purpose: cancelling a "Completed" Online order credits the wallet
    // (BUG-017 + refund). While the bug is open, each run leaves one pending order and 1 unit of stock.
    await cartApi.removeFromCart(COD_SAFE_PRODUCT.id);
    expect(res.status()).toBe(400);
  });
});
