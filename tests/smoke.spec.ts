import { test, expect } from "../fixtures/base.fixture";
import envConfig from "../config/env.config";

test.use({ storageState: { cookies: [], origins: [] } });  


test.describe('User Login Smoke Tests', () => {

  test('user login page should load successfully @smoke', async ({ loginPage }) => {

    await loginPage.goto();
         
    await loginPage.expectLoginVisible()

    await expect(loginPage.page).toHaveURL(/\/login$/);


  });

  test('user should be able to login with valid credentials @smoke', async ({ loginPage }) => {

     await loginPage.goto();

     await loginPage.login(envConfig.userEmail,envConfig.userPassword);


     await expect(loginPage.page).toHaveURL(/\/$/)

    


  });
});