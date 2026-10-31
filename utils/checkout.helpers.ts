import { AddressPage } from '../pages/user/address.page';
import { CartPage } from '../pages/user/cart.page';
import { CheckoutPage } from '../pages/user/checkout.page';
import { ProductDetailsPage } from '../pages/user/product-details.page';
import { CHECKOUT_ADDRESS, COD_SAFE_PRODUCT } from '../data/checkout-test-data';

/** Ensures the shared QA account has one persistent address for order details. */
export async function ensureCheckoutAddress(addressPage: AddressPage): Promise<void> {
  await addressPage.goto();

  if ((await addressPage.getAddressCount()) === 0) {
    await addressPage.addAddress(CHECKOUT_ADDRESS);
  }
}

/** Clears the cart, then adds the verified COD-safe product at quantity one. */
export async function prepareCartForCodCheckout(
  productDetailsPage: ProductDetailsPage,
  cartPage: CartPage,
): Promise<void> {
  await cartPage.removeAllItems();
  await productDetailsPage.goto(COD_SAFE_PRODUCT.id);
  await productDetailsPage.addToCart();
}

/** Places one COD order and returns its visible business order ID. */
export async function placeCodOrder(checkoutPage: CheckoutPage): Promise<string> {
  await checkoutPage.goto();
  await checkoutPage.selectFirstAddress();
  await checkoutPage.selectCod();

  return checkoutPage.placeCodOrder();
}
