import { Page, Locator } from '@playwright/test';


export class OrdersPage{

    readonly page :Page;
    readonly pageTitle : Locator;
    readonly searchInput : Locator;
    readonly statusFilter :Locator;
    readonly filterButton  : Locator;
    readonly orderRows : Locator;
    readonly ViewLinks :Locator;
    readonly emptyState :Locator;

    readonly detailStatusSelect: Locator;
  readonly detailUpdateButton: Locator;

  constructor(page :Page){
    
    this.page = page;
    this.pageTitle = page.getByRole('heading', { name: 'Order Management' });
    this.searchInput =  page.locator('input[name="search"]');
    this.statusFilter = page.locator('select[name="status"]');
    this.filterButton = page.getByRole('button', { name: 'Filter' });;
    
    this.ViewLinks = page.locator('a[href^="/admin/order/"]');
    this.orderRows = page.locator('table.table tbody tr').filter({ has: this.ViewLinks });
    this.emptyState = page.getByText('No orders found matching your search or filter');

    this.detailStatusSelect = page.locator('select[name="newStatus"]');
    this.detailUpdateButton = page.getByRole('button', { name: 'Update' });


  }


  async goto():Promise<void>{

    await this.page.goto('/admin/orders');
  }

  async getOrderCount():Promise<number>{

    return this.ViewLinks.count();
  }

  async filterByStatus(status : string):Promise<void>{

    await this.statusFilter.selectOption(status);

    await this.filterButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async openFirstOrder():Promise<void>{

    await this.ViewLinks.first().click();
    await this.page.waitForLoadState('domcontentloaded');
  }


  async updateStatus(newStatus :string):Promise<void>{

    await this.detailStatusSelect.selectOption(newStatus);
    await this.detailUpdateButton.click();
    await  this.page.getByRole('heading', { name: 'Success' }).waitFor({state:'visible'});
    
    await this.page.getByRole('button',{name :'OK'}).click();
    await this.page.waitForLoadState('domcontentloaded')
  }

    async getNextStatus(): Promise<string> {
    const options = await this.detailStatusSelect.locator('option').allInnerTexts();
    return options
      .map(o => o.trim())
      .filter(o => o && o !== 'Select new status')[0];
  }


}