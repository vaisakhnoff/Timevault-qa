
import {Page ,Locator} from  "@playwright/test";


export class ShopPage {

    readonly page :Page;

    readonly productCards :Locator;
    readonly productCount :Locator;
    readonly searchInput :Locator;
    readonly searchButton :Locator;
    readonly noResultMessage : Locator;
    readonly productName : Locator
    readonly sortSelector : Locator
    readonly currentPrices :Locator;
    
    constructor(page : Page){

        this.page = page;


        this.productCards = page.locator('.vault-product-card');
        this.productCount = page.locator('#productCount');
        this.searchInput =page.locator('#searchInput');
        this.searchButton = page.getByTitle('Execute Search');
        this.productName = page.locator('.vault-product-name')
        this.noResultMessage = page.getByRole('heading', { name: 'No Timepieces Found',});
        this.sortSelector = page.locator('#sortSelect');
        this.currentPrices = page.locator('.vault-price-current');




    }

    async goto () :Promise<void>{
     
        await this.page.goto('/shopPage');
    }

    async getProductCount(): Promise<number>{
        return this.productCards.count();
    }

    async search (term : string):Promise<void>{

        await this.searchInput.fill(term);
        await this.searchButton.click();
    }


    async getDisplayedCount() : Promise<number>{
        const text = await this.productCount.innerText();
        return parseInt(text.trim(),10);
    }


    async getProductNames() : Promise<string[]> {

        return this.productName.allInnerTexts();
    }


    async sortBy(value :string) : Promise<void>{

        await this.sortSelector.selectOption(value ,{force: true});
        await this.page.waitForURL(/sort=/);

    }

    async getCurrentPrices():Promise<number[]>{

        const texts = await this.currentPrices.allInnerTexts();

        return texts.map(t=>parseInt(t.replace(/[₹,\s]/g, ''), 10))
    }

}