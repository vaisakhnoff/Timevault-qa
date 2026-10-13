import { test, expect } from '../../fixtures/base.fixture';
import { faker } from '@faker-js/faker';
import { Address } from '../../types';


const makeAddress = () :Address =>({

    name : faker.person.fullName(),
    addressType :'Home',
    city :faker.location.city(),
    landMark :faker.location.street(),
    state: faker.location.state(),
  pincode: faker.string.numeric(6),
  phone_no: faker.string.numeric(10),
  altPhone_no: faker.string.numeric(10),


})


test.describe('TimeVault Address Tests',()=>{

    test.describe.configure({mode:'serial'});

    test.afterEach(async ({addressPage})=>{

        await addressPage.goto();

        while(await addressPage.getAddressCount() >0){

            await addressPage.deleteFirstAddress();
            await addressPage.goto()
        }
    })

    test('@regression user can add new address',async ({addressPage})=>{

        await addressPage.goto();
        const before  = await addressPage.getAddressCount();

        await addressPage.addAddress(makeAddress());

        await expect(addressPage.addressCards).toHaveCount(before+1)
    })

})


