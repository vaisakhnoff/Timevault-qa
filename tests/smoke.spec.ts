import {test,expect} from "@playwright/test";   



test.describe('Smoke - app availability', () => {

  test('homepage loads successfully @smoke', async ({ page }) => {

    await page.goto("/");
         
    await expect(page).toHaveTitle(/TIME VAULT/); 

  });

  test('login page loads successfully @smoke', async ({ page }) => {

     await page.goto("/login");

    
    await expect(page.getByRole('button', { name: 'Log In' })).toBeVisible();


  });
});