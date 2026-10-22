import {test,expect} from '../../api/fixtures/api.fixture';
import { PRODUCTS } from '../../api/data/api-test-data';


const TITAN = PRODUCTS.titan;

test.describe('Authorization - protected endpoints reject anonymous callers @api @security',()=>{

    test('POST /addToCart without a session is rejected (401)',async({anonCartApi})=>{

        const res = await anonCartApi.addToCart(TITAN.id,1);
        expect(res.status()).toBe(401)
    })

    test('POST /addWishlist without a session is rejected (401)',async({anonWishlistApi})=>{

         const res = await anonWishlistApi.addWishlist(TITAN.id);
         expect(res.status()).toBe(401)
    })

    test('POST /removeFromWishlist without a session is rejected',async ({anonWishlistApi})=>{

        const res = await anonWishlistApi.removeFromWishlist(TITAN.id);
        expect(res.status()).toBe(401);
    })

    // KNOWN DEFECT — BUG-001 (docs/BUG_REPORTS.md): this endpoint has no auth
    // middleware and returns 200 to anonymous callers (Broken Access Control / OWASP A01).
    // The assertion below states the EXPECTED (secure) behavior. test.fail marks it as a
    // known failing test so CI stays green; if the app is fixed, this test will
    // "unexpectedly pass" and Playwright will flag it — our cue to remove test.fail.
    test('GET /admin/dashboard-canceled-data without admin session is not accessible @security', async ({ anonAdminApi }) => {
        test.fail(true, 'BUG-001: /admin/dashboard-canceled-data missing auth middleware');

        const res = await anonAdminApi.getCanceledAndReturnedData();
        expect(res.status()).not.toBe(200);
    })
})