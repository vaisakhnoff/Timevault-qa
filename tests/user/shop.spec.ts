import { test, expect } from '../../fixtures/base.fixture';


test.describe('TimeVault Shop Tests', ()=>{

    test('Shop page should display products',async ({shopPage})=>{

        await shopPage.goto();
        
        const productCount = await shopPage.getProductCount();

        expect(productCount).toBeGreaterThan(0);
        
    })

    test('@regression search returns matching products' ,async ({shopPage})=>{

          await shopPage.goto();

          await shopPage.search('titan');

          await expect(shopPage.page).toHaveURL(/search=titan/);

          expect (await shopPage.getProductCount()).toBeGreaterThan(0);

          const names = await shopPage.getProductNames()

          expect (
            names.some(name => name.toLowerCase().includes('titan'))
          ).toBeTruthy();

    })

    test("@regression search with no matches shows empty state ",async ({shopPage})=>{

        await shopPage.goto();

        await shopPage.search('fjfdfjlkdsflk');

        await expect (shopPage.noResultMessage).toBeVisible();

        expect (await shopPage.getProductCount()).toBe(0)
    })
   

    test("@regression sort by price low to high orders products ascending",async ({shopPage})=>{

        await shopPage.goto();
        await shopPage.sortBy('price_asc');
        await expect(shopPage.page).toHaveURL(/sort=price_asc/);

        const prices = await shopPage.getCurrentPrices();
        const sorted = [...prices].sort((a,b)=>a-b);

        expect(prices).toEqual(sorted);




    })

    


})