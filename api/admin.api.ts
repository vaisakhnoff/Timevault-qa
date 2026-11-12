import { APIRequestContext, APIResponse } from '@playwright/test';
import { CouponData } from '../types';

export class AdminApi {
  constructor(private request: APIRequestContext) {}

  getCanceledAndReturnedData(): Promise<APIResponse> {
    return this.request.get('/admin/dashboard-canceled-data', { maxRedirects: 0 });
  }

  addCoupon(coupon: CouponData): Promise<APIResponse> {
    return this.request.post('/admin/addCoupon', {
      data: {
        couponName: coupon.name,
        couponCode: coupon.code,
        startDate: coupon.startDate,
        endDate: coupon.endDate,
        offerPrice: coupon.offerPrice,
        minimumPrice: coupon.minPrice,
        maxPrice: coupon.maxPrice,
      },
    });
  }

  async findCouponId(couponCode: string): Promise<string | undefined> {
    const html = await (await this.request.get('/admin/coupon')).text();
    const match = html.match(
      new RegExp(`${couponCode}</span>[\\s\\S]*?editCoupon\\?id=([a-f0-9]{24})`),
    );
    return match?.[1];
  }

  deleteCoupon(id: string): Promise<APIResponse> {
    return this.request.get(`/admin/deleteCoupon?id=${id}`, { maxRedirects: 0 });
  }

  async deleteCouponByCode(couponCode: string): Promise<void> {
    const id = await this.findCouponId(couponCode);
    if (id) await this.deleteCoupon(id);
  }
}
