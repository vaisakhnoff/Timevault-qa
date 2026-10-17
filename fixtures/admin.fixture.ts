import { test as base } from '@playwright/test';
import { CategoryPage } from '../pages/admin/category.page';
import { BrandPage } from '../pages/admin/brand.page';
import { ProductPage } from '../pages/admin/product.page';
import { CouponPage } from '../pages/admin/coupon.page';
import { CustomersPage } from '../pages/admin/customers.page';
import { OrdersPage } from '../pages/admin/orders.page';
import { ReturnsPage } from '../pages/admin/returns.page';
import { DashboardPage } from '../pages/admin/dashboard.page';


type AdminFixtures = {
  categoryPage: CategoryPage;
  brandPage: BrandPage;
  productPage: ProductPage;
  couponPage: CouponPage;
  customersPage: CustomersPage;
  ordersPage :OrdersPage;
    returnsPage: ReturnsPage;
    dashboardPage : DashboardPage

};

export const test = base.extend<AdminFixtures>({

  categoryPage: async ({ page }, use) => {
    await use(new CategoryPage(page));
  },

  brandPage: async ({ page }, use) => {
    await use(new BrandPage(page));
  },

  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },

  couponPage: async ({ page }, use) => {
    await use(new CouponPage(page));
  },

  customersPage: async ({ page }, use) => {
    await use(new CustomersPage(page));
  },
    ordersPage: async ({ page }, use) => {
    await use(new OrdersPage(page));
  },
    returnsPage: async ({ page }, use) => {
    await use(new ReturnsPage(page));
  },
    dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

});

export { expect } from '@playwright/test';
