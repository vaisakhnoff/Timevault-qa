

import { Page, Locator } from '@playwright/test';


export class ProfilePage {

    readonly page: Page;
    readonly profileName: Locator;
    readonly referralCode: Locator;
    readonly editProfileButton: Locator;

    constructor(page: Page) {

        this.page = page;
        this.profileName = page.locator('.profile-name');
        this.referralCode = page.locator('#referral-code-text');
        this.editProfileButton = page.getByText('Edit Profile');
    }

    async goto(): Promise<void> {

        await this.page.goto('/userProfile');
    }
}
