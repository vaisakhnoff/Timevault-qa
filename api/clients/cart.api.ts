import { APIRequestContext,APIResponse } from '@playwright/test';


export class CartApi {

    constructor(private request : APIRequestContext){}

    async addToCart(id :string,quantity :number):Promise<APIResponse> {

        return this.request.post('/addToCart',{

            data :{id,quantity}
        })
    }

    async removeFromCart (productId :string){

        return this.request.post('/removeFromCart',{
            data :{productId}
        })
    }
}