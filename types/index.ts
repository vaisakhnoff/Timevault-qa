/**
 * Shared TypeScript types for the TimeVault QA framework.
 * Mirrors the relevant fields of the application's Mongoose schemas,
 * but only the parts the tests actually need.
 */

/** A product as surfaced to the user-facing storefront. */
export interface Product {
  productName: string;
  description: string;
  regularPrice: number;
  salePrice: number;
  productOffer: number;
  /** Available stock. Cart limit is Math.min(quantity, 4). */
  quantity: number;
  productImage: string[];
  isBlocked: boolean;
  status: string;
}

/** Credentials used by authentication flows (sourced from env, never hardcoded). */
export interface Credentials {
  email: string;
  password: string;
}
