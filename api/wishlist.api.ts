import { APIRequestContext, APIResponse } from '@playwright/test';

export type WishlistResponse = { success: boolean; message: string };

export class WishlistApi {
  constructor(private request: APIRequestContext) {}

  addWishlist(id: string): Promise<APIResponse> {
    return this.request.post('/addWishlist', {
      data: {
        id,
      },
    });
  }

  removeFromWishlist(productId: string): Promise<APIResponse> {
    return this.request.post('/removeFromWishlist', {
      data: {
        productId,
      },
    });
  }
}
