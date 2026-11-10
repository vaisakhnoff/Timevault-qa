import { request, APIRequestContext } from '@playwright/test';
import envConfig from '../config/env.config';

const ADMIN_STATE = 'playwright/.auth/admin.json';

export async function createAnonymousContext(): Promise<APIRequestContext> {
  return request.newContext({
    baseURL: envConfig.baseUrl,
    storageState: { cookies: [], origins: [] },
  });
}

export async function createAdminContext(): Promise<APIRequestContext> {
  return request.newContext({
    baseURL: envConfig.baseUrl,
    storageState: ADMIN_STATE,
  });
}
