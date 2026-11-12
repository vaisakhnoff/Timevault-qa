import { APIRequestContext, APIResponse } from '@playwright/test';
import { CouponData } from '../types';

export type DashboardData = {
  revenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  totalCategories: number;
  timeSeriesData: { labels: string[]; revenueData: number[]; orderData: number[] };
};

export type ProductToggleResponse = {
  success: boolean;
  message?: string;
  product?: { isBlocked: boolean };
};

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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

  getDashboardData(filter = 'weekly'): Promise<APIResponse> {
    return this.request.get('/admin/dashboard-data', { params: { filter }, maxRedirects: 0 });
  }

  blockProduct(id: string): Promise<APIResponse> {
    return this.request.post('/admin/blockProduct', { data: { id }, maxRedirects: 0 });
  }

  unblockProduct(id: string): Promise<APIResponse> {
    return this.request.post('/admin/unblockProduct', { data: { id }, maxRedirects: 0 });
  }

  blockCustomer(id: string): Promise<APIResponse> {
    return this.request.get('/admin/blockCustomer', { params: { id } });
  }

  unblockCustomer(id: string): Promise<APIResponse> {
    return this.request.get('/admin/unblockCustomer', { params: { id } });
  }

  async findCustomerId(email: string): Promise<string | undefined> {
    const res = await this.request.get('/admin/users', { params: { search: email } });
    const html = await res.text();
    return html.match(new RegExp(`${escapeRegExp(email)}[\\s\\S]*?data-id="([a-f0-9]{24})"`))?.[1];
  }
}
