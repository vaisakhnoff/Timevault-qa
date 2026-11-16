import { APIRequestContext, APIResponse } from '@playwright/test';

export type CouponResponse = {
  success: boolean;
  message: string;
  coupon?: { code: string; offerPrice: number; minimumPrice: number };
  cartTotal: number;
  discount?: number;
  grandTotal?: number;
};

export class CouponApi {
  constructor(private request: APIRequestContext) {}

  applyCoupon(couponCode: string): Promise<APIResponse> {
    return this.request.post('/applyCoupon', { data: { couponCode } });
  }

  removeCoupon(): Promise<APIResponse> {
    return this.request.post('/removeCoupon');
  }
}
