import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/user/login.page';
import { ShopPage } from '../pages/user/shop.page';
import { ProductDetailsPage } from '../pages/user/product-details.page';
import { CartPage } from '../pages/user/cart.page';
import {  WishlistPage } from '../pages/user/wishlist.page';
import { AddressPage } from '../pages/user/address.page';


type TestFixtures = {
  loginPage: LoginPage;
  shopPage :ShopPage;
  productDetailsPage : ProductDetailsPage;
  cartPage : CartPage;
  wishlistPage :WishlistPage
  addressPage :AddressPage

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
  cartPage : async({page},use)=>{
    await use(new CartPage(page))
  },
  wishlistPage : async({page},use)=>{
    await use(new WishlistPage(page))
  },
  
 addressPage: async ({ page }, use) => {
  await use(new AddressPage(page));
},

});

export { expect } from '@playwright/test';