import { Address } from '../types';

// Verified on the local app on 2026-10-12. The price is recorded for planning only;
// assertions read the rendered UI instead of assuming it remains unchanged.
export const COD_SAFE_PRODUCT = {
  id: '6aad1146c76606074021e7e6',
  name: 'Casio Vintage Classic',
  observedPrice: 4799,
} as const;

// This address is deliberately retained after checkout tests because completed orders
// refer to the embedded address ID. It is shared only by the dedicated QA account.
export const CHECKOUT_ADDRESS: Address = {
  name: 'TimeVault QA Checkout',
  addressType: 'Home',
  city: 'Kochi',
  landMark: 'QA Automation Address',
  state: 'Kerala',
  pincode: '682001',
  phone_no: '9876543210',
  altPhone_no: '9876543211',
};
