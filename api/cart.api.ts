import { APIRequestContext, APIResponse } from '@playwright/test';

export type CartResponse = { success: boolean; message: string };
export type CartUpdateItem = { productId: string; quantity: number };

export class CartApi {
  constructor(private request: APIRequestContext) {}

  addToCart(id: string, quantity: number): Promise<APIResponse> {
    return this.request.post('/addToCart', {
      data: { id, quantity },
    });
  }

  removeFromCart(productId: string) {
    return this.request.post('/removeFromCart', {
      data: { productId },
    });
  }

  updateCart(items: CartUpdateItem[]): Promise<APIResponse> {
    return this.request.post('/updateCart', { data: { items } });
  }
}
