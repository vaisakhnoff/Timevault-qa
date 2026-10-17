import { test as setup } from '@playwright/test';
import { AdminLoginPage } from '../pages/admin/admin-login.page';
import envConfig from '../config/env.config';
import path from 'path';

const adminAuthFile = path.join(__dirname, '../playwright/.auth/admin.json');

setup('authenticate as admin', async ({ page }) => {
  const adminLogin = new AdminLoginPage(page);
  await adminLogin.goto();
  await adminLogin.login(envConfig.adminEmail, envConfig.adminPassword);
  await page.waitForURL(/\/admin\/dashboard/);
  await page.context().storageState({ path: adminAuthFile });
});
