import { APIRequestContext, APIResponse } from '@playwright/test';

export type OrderRef = { code: string; id: string; itemId: string };

export type CancelItemResponse = {
  success: boolean;
  message: string;
  refundAmount?: number;
  newOrderStatus?: string;
};

export class OrderApi {
  constructor(private request: APIRequestContext) {}

  async checkoutAddressId(): Promise<string | undefined> {
    const html = await (await this.request.get('/checkoutPage')).text();
    return html.match(/name="addressId"\s+value="([a-f0-9]{24})"/)?.[1];
  }

  placeCodOrder(addressId: string): Promise<APIResponse> {
    return this.request.post('/placeOrder', {
      data: { addressId, paymentMethod: 'COD' },
      maxRedirects: 0,
    });
  }

  async latestOrder(): Promise<OrderRef | undefined> {
    const list = await (await this.request.get('/orders')).text();
    const code = list.match(/href="\/order\/(ORD[A-Z0-9]+)"/)?.[1];
    if (!code) return undefined;
    const detail = await (await this.request.get(`/order/${code}`)).text();
    const ids = detail.match(/cancelOrderItem\('([a-f0-9]{24})', '([a-f0-9]{24})'\)/);
    return ids ? { code, id: ids[1], itemId: ids[2] } : undefined;
  }

  cancelItem(orderId: string, itemId: string, reason = 'QA API cancel'): Promise<APIResponse> {
    return this.request.post('/order/cancelItem', {
      data: { orderId, itemId, reason },
      maxRedirects: 0,
    });
  }

  returnItem(orderId: string, itemId: string, reason = 'QA API return'): Promise<APIResponse> {
    return this.request.post('/order/returnItem', { data: { orderId, itemId, reason } });
  }

  cancelOrder(orderId: string): Promise<APIResponse> {
    return this.request.post('/cancelOrder', { form: { orderId }, maxRedirects: 0 });
  }

  placeOrder(addressId: string, paymentMethod: string): Promise<APIResponse> {
    return this.request.post('/placeOrder', {
      data: { addressId, paymentMethod },
      maxRedirects: 0,
    });
  }
}
