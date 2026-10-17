
import { test, expect } from '../../fixtures/admin.fixture';


test.describe('TimeVault Admin Dashboard  Tests',()=>{

    test('@regression dashboard loads with stats', async ({ dashboardPage }) => {
        
    await dashboardPage.goto();

    await expect(dashboardPage.pageTitle).toBeVisible();

    
    await expect(dashboardPage.revenueValue).toBeVisible();
    await expect(dashboardPage.revenueValue).toContainText('₹');

    await expect(dashboardPage.ordersValue).toBeVisible();
    await expect(dashboardPage.globalFilter).toBeVisible();
  });
})