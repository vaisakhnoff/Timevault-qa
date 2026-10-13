import {test as setup} from '@playwright/test';
import { LoginPage } from '../pages/user/login.page';
import envConfig from '../config/env.config';
import path from 'path';


const userAuthFile = path.join(__dirname, '../playwright/.auth/user.json');



setup('authenticate as user',async ({page})=>{

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(envConfig.userEmail,envConfig.userPassword);

    // Login success signal: redirect to the homepage. The user menu button
    // only renders when authenticated, so wait for it before saving state.
    await page.waitForURL(/\/$/);
    await page.locator('#userMenuBtn').waitFor({ state: 'visible' });


 await page.context().storageState({
    path: userAuthFile,
  })

})