import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/user/login.page';
import { ShopPage } from '../pages/user/shop.page';
import { ProductDetailsPage } from '../pages/user/product-details.page';


type TestFixtures = {
  loginPage: LoginPage;
  shopPage :ShopPage;
  productDetailsPage : ProductDetailsPage
};

export const test = base.extend<TestFixtures>({


  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  shopPage : async ({page},use)=>{
    await use(new ShopPage(page))
  },

  productDetailsPage : async ({page},use)=>{
    await use(new ProductDetailsPage(page))
  },


});

export { expect } from '@playwright/test';