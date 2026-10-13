import { test, expect } from '../../fixtures/base.fixture';


test.describe('TimeVault Profile Tests', () => {

    test('@regression profile page loads with user details', async ({ profilePage, page }) => {

        await profilePage.goto();

        await expect(profilePage.profileName).toBeVisible();
        await expect(profilePage.referralCode).toBeVisible();
        await expect(page).toHaveURL(/\/userProfile/);
    });
});
