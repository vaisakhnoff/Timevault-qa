import { APIRequestContext, APIResponse } from '@playwright/test';

export type AdminLoginResponse = { success: boolean; message: string; redirect?: string };

export class AuthApi {
  constructor(private request: APIRequestContext) {}

  login(email: string, password: string): Promise<APIResponse> {
    return this.request.post('/login', { form: { email, password }, maxRedirects: 0 });
  }

  logout(): Promise<APIResponse> {
    return this.request.get('/logout', { maxRedirects: 0 });
  }

  adminLogin(email: string, password: string): Promise<APIResponse> {
    return this.request.post('/admin/login', { data: { email, password } });
  }
}
