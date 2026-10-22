import { APIRequestContext, APIResponse } from '@playwright/test';

export class WishlistApi {
  constructor(private request: APIRequestContext) {}

  addWishlist(id: string): Promise<APIResponse> {
    return this.request.post('/addWishlist', {
      data: {
        id,
      },
    });
  }

  removeFromWishlist(id: string): Promise<APIResponse> {
    return this.request.post('/removeFromWishlist', {
      data: {
        id,
      },
    });
  }
}
