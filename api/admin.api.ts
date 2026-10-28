import { APIRequestContext, APIResponse } from '@playwright/test';

export class AdminApi {
  constructor(private request: APIRequestContext) {}

  getCanceledAndReturnedData(): Promise<APIResponse> {
    // Do not follow redirects: an auth middleware answers with 302 -> /admin/login, and
    // following it would turn that into the login page's 200 and hide the real result.
    return this.request.get('/admin/dashboard-canceled-data', { maxRedirects: 0 });
  }
}
