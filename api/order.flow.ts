import { CartApi } from './cart.api';
import { CouponApi } from './coupon.api';
import { OrderApi, type OrderRef } from './order.api';

type OrderClients = { cart: CartApi; coupon: CouponApi; order: OrderApi };

export async function placePendingCodOrder(
  { cart, coupon, order }: OrderClients,
  productId: string,
): Promise<OrderRef> {
  await coupon.removeCoupon();
  await cart.removeFromCart(productId);

  const added = await cart.addToCart(productId, 1);
  if (added.status() !== 200) throw new Error(`addToCart failed with ${added.status()}`);

  const addressId = await order.checkoutAddressId();
  if (!addressId) throw new Error('The QA user needs a saved address (CHECKOUT_ADDRESS)');

  const placed = await order.placeCodOrder(addressId);
  if (placed.headers()['location'] !== '/orderSuccess') {
    throw new Error(`placeOrder failed with ${placed.status()}`);
  }

  const ref = await order.latestOrder();
  if (!ref) throw new Error('Could not find the order that was just placed');
  return ref;
}
