import { APIRequestContext, APIResponse } from '@playwright/test';
import { CouponData, NewProductData } from '../types';

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

  // The add-product form posts multipart/form-data. Multipart values must be strings.
  // Pass `image` only for real creates: addProducts uploads images to Cloudinary BEFORE
  // validating category/brand, so a failing request with an image leaves an orphaned upload.
  addProduct(product: NewProductData, image?: Buffer): Promise<APIResponse> {
    return this.request.post('/admin/addProducts', {
      multipart: {
        productName: product.name,
        description: product.description,
        brand: product.brand,
        category: product.category,
        regularPrice: String(product.regularPrice),
        salePrice: String(product.salePrice),
        quantity: String(product.quantity),
        ...(image
          ? { images: { name: 'qa-product.png', mimeType: 'image/png', buffer: image } }
          : {}),
      },
    });
  }

  // addProducts returns no id. Each row on /admin/products links to /admin/editProduct/<id>.
  async findProductId(name: string): Promise<string | undefined> {
    const html = await (
      await this.request.get('/admin/products', { params: { search: name } })
    ).text();
    return html.match(new RegExp(`${escapeRegExp(name)}[\\s\\S]*?editProduct/([a-f0-9]{24})`))?.[1];
  }

  // Proof of deletion: the id's edit link is gone. Never check for the name, because the
  // search box echoes the search term back into the page.
  async productExists(id: string): Promise<boolean> {
    const html = await (await this.request.get('/admin/products')).text();
    return html.includes(`editProduct/${id}`);
  }

  // Creates a product and returns its id. Throws, so a failed setup is reported as setup.
  async createProduct(product: NewProductData, image?: Buffer): Promise<string> {
    const res = await this.addProduct(product, image);
    if (res.status() !== 200)
      throw new Error(`addProducts failed with ${res.status()}: ${await res.text()}`);
    const id = await this.findProductId(product.name);
    if (!id) throw new Error(`created product "${product.name}" not found in the admin list`);
    return id;
  }

  // 200 deleted; 400 invalid id; 404 unknown; 409 product has orders. Cart and wishlist lines are removed too.
  deleteProduct(id: string): Promise<APIResponse> {
    return this.request.delete(`/admin/deleteProduct/${id}`, { maxRedirects: 0 });
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
