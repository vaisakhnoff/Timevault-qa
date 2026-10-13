

import { Page, Locator } from '@playwright/test';


export class OrdersPage {

    readonly page: Page;
    readonly pageTitle: Locator;
    readonly orderCards: Locator;
    readonly emptyState: Locator;

    constructor(page: Page) {

        this.page = page;
        this.pageTitle = page.getByRole('heading', { name: 'Order History' });
        this.orderCards = page.locator('.vault-card').filter({ has: page.getByRole('heading', { name: /^Order #/ }) });
        this.emptyState = page.getByRole('heading', { name: 'No Acquisitions Found' });
    }

    async goto(): Promise<void> {

        await this.page.goto('/orders');
    }

    async getOrderCount(): Promise<number> {

        return this.orderCards.count();
    }
}
