import { APIRequestContext, APIResponse } from '@playwright/test';

export class AdminApi {
  constructor(private request: APIRequestContext) {}

  getCanceledAndReturnedData(): Promise<APIResponse> {
    return this.request.get('/admin/dashboard-canceled-data');
  }
}
