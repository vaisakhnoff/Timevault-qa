import { test, expect } from '../fixtures/base.fixture';


test.describe('Authenticated session @regression', ()=>{

    test('user session is active after storagestate login',async ({page})=>{

        await page.goto('/');


await expect(page.locator('#userMenuBtn')).toBeVisible();

    })
})