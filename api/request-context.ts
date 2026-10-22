
import { request, APIRequestContext } from '@playwright/test';
import envConfig from '../config/env.config';

export async function createAnonymousContext():Promise<APIRequestContext>{

    return request.newContext({baseURL :envConfig.baseUrl,
        storageState: { cookies: [], origins: [] }
    });
}

