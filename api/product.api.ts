import { APIRequestContext } from '@playwright/test';

export class ProductApi {
  constructor(private request: APIRequestContext) {}

  async getStock(id: string): Promise<number> {
    const html = await (await this.request.get('/productDetails', { params: { id } })).text();
    const match = html.match(/(\d+)\s+units available/);
    if (!match) throw new Error(`stock not found on product page ${id}`);
    return Number(match[1]);
  }
}
