import { Page,Locator } from "@playwright/test";


export class ReturnsPage{

    readonly page :Page;
    readonly pageTitle :Locator;
    readonly returnRows :Locator;
    readonly orderLinks :Locator;
    readonly emptyState :Locator;
readonly firstRow :Locator;

    constructor(page :Page){

        this.page = page;

         this.pageTitle = page.getByRole('heading', { name: 'Return Requests' ,exact:true});

    this.orderLinks = page.locator('a[href^="/admin/order/"]');
    this.returnRows = page.locator('table.table tbody tr').filter({ has: this.orderLinks });
    this.firstRow = this.returnRows.first()
    this.emptyState = page.getByText('No pending return requests found');
    }


    async goto():Promise<void>{
        await this.page.goto('/admin/return-requests');

    }

    async getRequestCount():Promise<number>{
        return this.orderLinks.count();
    }

    async approveFirst(): Promise<void> {
    await this.firstRow.getByRole('button', { name: 'Approve' }).click();
    await this.page.getByRole('button', { name: 'Yes, approve' }).click();
    await this.page.getByText('Success').waitFor({ state: 'visible' });
    await this.page.getByRole('button', { name: 'OK' }).click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async declineFirst(): Promise<void> {
    await this.firstRow.getByRole('button', { name: 'Decline' }).click();
    await this.page.getByRole('button', { name: 'Yes, decline' }).click();
    await this.page.getByText('Success').waitFor({ state: 'visible' });
    await this.page.getByRole('button', { name: 'OK' }).click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}