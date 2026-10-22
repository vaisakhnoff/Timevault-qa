# TimeVault QA — Test Cases (first 50 critical)

Detailed test cases for the highest-risk scenarios in [TEST_SCENARIOS.md](TEST_SCENARIOS.md). Every case traces back to a scenario ID, which is the first link of the traceability chain used by the RTM in Phase 12. Approach and conventions are in [TEST_STRATEGY.md](TEST_STRATEGY.md).

## Conventions

- **ID format:** `TC-<MODULE>-<NNN>` (blueprint §15).
- **Priority:** P0–P3. **Severity** is the impact if the case fails: Critical / High / Medium / Low.
- **Expected results** and messages were taken from the application code. Where the code suggests behaviour that looks wrong, the case states the *correct* expected behaviour and the note says it is a **suspected defect, to be verified**.
- **Automation:** `Automated` (with the spec file), `To Be Automated`, or `Manual`.
- **Actual result and status** are recorded during the execution cycle in Phase 12, not here.
- **Default data:** `USER` = the configured test customer (`TEST_USER_*`); `ADMIN` = `TEST_ADMIN_*`; `PRODUCT-A` = the seeded Titan Classic Analog (stock above 4). Credentials always come from `.env`.

---

## 1. Authentication (TC-AUTH)

| ID | Title | Scenario | P | Sev | Preconditions | Steps | Expected result | Automation | Tags |
|----|-------|----------|---|-----|---------------|-------|-----------------|------------|------|
| TC-AUTH-001 | Login with valid credentials | SC-AUTH-01 | P0 | Critical | Logged out; USER exists and is not blocked | 1. Open `/login`<br>2. Enter USER email and password<br>3. Click **Log In** | Redirected to the home page `/`; header shows the user menu instead of Login/Join Vault | Automated: `tests/smoke.spec.ts` | @smoke @auth @critical |
| TC-AUTH-002 | Login with wrong password | SC-AUTH-03 | P0 | High | Logged out | 1. Open `/login`<br>2. Enter USER email and a wrong password<br>3. Click **Log In** | Stays on the login page; message "Incorrect email or password"; no session created | To Be Automated | @regression @auth @negative |
| TC-AUTH-003 | Login with non-existent email | SC-AUTH-04 | P0 | High | Logged out | 1. Open `/login`<br>2. Enter an email that is not registered and any password<br>3. Click **Log In** | Message "Incorrect email or password"; the message does not reveal whether the email exists | To Be Automated | @regression @auth @negative |
| TC-AUTH-004 | Login with empty fields | SC-AUTH-05 | P1 | Medium | Logged out | 1. Open `/login`<br>2. Leave both fields empty<br>3. Click **Log In** | Login is rejected; user remains logged out and on the login page with an error | To Be Automated | @regression @auth @negative |
| TC-AUTH-005 | Login as a blocked user | SC-AUTH-06 | P1 | High | A throwaway customer exists and is blocked by admin | 1. Open `/login`<br>2. Enter the blocked customer's valid credentials<br>3. Click **Log In** | Message "User is blocked by admin"; no session created | To Be Automated | @regression @auth @negative |
| TC-AUTH-006 | Logout ends the session | SC-AUTH-07 | P0 | High | Logged in as USER | 1. Click the user menu, then **Logout**<br>2. Open `/orders` | After logout the user is sent to the login page; opening `/orders` redirects to `/login` | To Be Automated | @smoke @auth @critical |
| TC-AUTH-007 | Protected page redirects anonymous users | SC-AUTH-08 | P0 | High | Logged out | 1. Open `/cartPage` directly | Redirected to `/login`; cart content is not shown | To Be Automated | @regression @auth @security |
| TC-AUTH-008 | Signup with an existing email | SC-AUTH-12 | P1 | Medium | USER already registered | 1. Open `/signup`<br>2. Fill all fields using USER's email<br>3. Submit | Message "User with this email already exists"; no OTP step; no second account | To Be Automated | @regression @auth @negative |
| TC-AUTH-009 | Signup with mismatched passwords | SC-AUTH-13 | P1 | Medium | Logged out | 1. Open `/signup`<br>2. Enter a new email, password and a different confirm-password<br>3. Submit | Message "Passwords do not match"; no account created | To Be Automated | @regression @auth @negative |
| TC-AUTH-010 | Forgot password with an unknown email | SC-AUTH-17 | P1 | Medium | Logged out | 1. Open `/forgotPassword`<br>2. Enter an unregistered email<br>3. Submit | Message "Email not found"; no OTP is sent | To Be Automated | @regression @auth @negative |

---

## 2. Shop and product details (TC-SHOP, TC-PROD)

| ID | Title | Scenario | P | Sev | Preconditions | Steps | Expected result | Automation | Tags |
|----|-------|----------|---|-----|---------------|-------|-----------------|------------|------|
| TC-SHOP-001 | Shop page lists products | SC-SHOP-01 | P0 | High | Seed products exist | 1. Open `/shopPage` | At least one product card is shown with name, price and stock indicator | Automated: `tests/user/shop.spec.ts` | @smoke @regression @user |
| TC-SHOP-002 | Search returns matching products | SC-SHOP-03 | P1 | Medium | Product containing "titan" exists | 1. Open `/shopPage`<br>2. Search for `titan` | URL contains `search=titan`; at least one result; shown names contain "titan" (case-insensitive) | Automated: `tests/user/shop.spec.ts` | @regression @user |
| TC-SHOP-003 | Search with no match | SC-SHOP-04 | P1 | Medium | None | 1. Open `/shopPage`<br>2. Search for `zxcvbnqqq123` | Zero cards; heading "No Timepieces Found" is shown | Automated: `tests/user/shop.spec.ts` | @regression @user @negative |
| TC-SHOP-004 | Sort by price, low to high | SC-SHOP-09 | P1 | Medium | At least two products with different prices | 1. Open `/shopPage?sort=price_asc` | URL contains `sort=price_asc`; displayed current prices are in ascending order | Automated: `tests/user/shop.spec.ts` | @regression @user |
| TC-PROD-001 | Product details show name and price | SC-PROD-01 | P0 | High | PRODUCT-A exists | 1. Open the details page of PRODUCT-A | Product name (H1) and current price are visible | Automated: `tests/user/product-details.spec.ts` | @smoke @regression @user |
| TC-PROD-002 | Quantity stepper stops at 4 | SC-PROD-05 | P0 | High | PRODUCT-A stock above 4 | 1. Open PRODUCT-A<br>2. Click the "+" button 10 times | Quantity field shows 4 and never exceeds it | Automated: `tests/user/product-details.spec.ts` | @regression @user @boundary |
| TC-PROD-003 | Out-of-stock product cannot be added | SC-PROD-04 | P1 | High | A product with stock 0 exists (seed or set via admin) | 1. Open the out-of-stock product | "Out of Stock" button is shown and disabled; no add-to-cart action is possible | To Be Automated | @regression @user @boundary |

---

## 3. Cart (TC-CART)

Rule under test: the maximum quantity per product is `min(stock, 4)`; the server answers 400 when it is exceeded.

| ID | Title | Scenario | P | Sev | Preconditions | Steps | Expected result | Automation | Tags |
|----|-------|----------|---|-----|---------------|-------|-----------------|------------|------|
| TC-CART-001 | Added item appears in the cart | SC-CART-01 | P0 | Critical | Logged in; cart empty | 1. Open PRODUCT-A and click **Acquire Piece**<br>2. Dismiss the confirmation<br>3. Open `/cartPage` | Confirmation "Allocated to Bag" appears; the cart lists PRODUCT-A | Automated: `tests/user/cart.spec.ts` | @smoke @regression @cart @critical |
| TC-CART-002 | Quantity at the upper limit is accepted | SC-CART-02 | P0 | High | Logged in; PRODUCT-A stock above 4; not in cart | 1. `POST /addToCart` with `{id: PRODUCT-A, quantity: 4}` | HTTP 200 | Automated: `tests/api/cart-api.spec.ts` | @regression @api @cart @boundary |
| TC-CART-003 | Quantity above the limit is rejected | SC-CART-03 | P0 | High | Logged in; PRODUCT-A stock above 4; not in cart | 1. `POST /addToCart` with `{id: PRODUCT-A, quantity: 5}` | HTTP 400; `success` is false; message starts with "Maximum"; cart unchanged | Automated: `tests/api/cart-api.spec.ts` | @regression @api @cart @boundary @negative |
| TC-CART-004 | Limit follows stock when stock is below 4 | SC-CART-04 | P0 | High | Logged in; a product with stock 2 exists | 1. `POST /addToCart` with quantity 2<br>2. Remove it, then `POST /addToCart` with quantity 3 | Quantity 2: HTTP 200. Quantity 3: HTTP 400, message "Maximum 2 quantities allowed per product" | To Be Automated | @regression @api @cart @boundary |
| TC-CART-005 | Zero and negative quantity are not accepted | SC-CART-05 | P1 | High | Logged in | 1. `POST /addToCart` with quantity 0<br>2. `POST /addToCart` with quantity -1<br>3. Open the cart | Both requests are rejected (HTTP 400) and no line with quantity 0 or below exists. **Suspected defect:** the controller uses `parseInt(quantity) \|\| 1` (0 becomes 1) and only checks the upper bound (negative may pass). Verify before reporting | To Be Automated | @regression @api @cart @boundary @negative |
| TC-CART-006 | Anonymous add to cart is rejected | SC-CART-12 | P0 | High | No session | 1. `POST /addToCart` from a context without cookies | HTTP 401, `success: false` | Automated: `tests/api/authorization.spec.ts` | @regression @api @security @cart |
| TC-CART-007 | Removing the only item empties the cart | SC-CART-10 | P0 | High | Logged in; cart contains one item | 1. Open `/cartPage`<br>2. Click the remove icon and confirm | The row disappears; the cart shows no items | Automated: `tests/user/cart.spec.ts` | @regression @cart |

---

## 4. Checkout and payment (TC-CHKOUT)

| ID | Title | Scenario | P | Sev | Preconditions | Steps | Expected result | Automation | Tags |
|----|-------|----------|---|-----|---------------|-------|-----------------|------------|------|
| TC-CHKOUT-001 | Place an order with Cash on Delivery | SC-CHKOUT-02 | P0 | Critical | Logged in; one item in cart; at least one saved address | 1. Open `/cartPage`, proceed to `/checkoutPage`<br>2. Select the address and **COD**<br>3. Place the order | Redirected to `/orderSuccess`; an order exists with payment method COD and payment status Pending; cart is emptied | To Be Automated | @smoke @e2e @order @critical |
| TC-CHKOUT-002 | Order success page shows the order id | SC-CHKOUT-03 | P0 | High | Order just placed (TC-CHKOUT-001) | 1. Read the order success page | The order id is displayed and matches the first order in `/orders` | To Be Automated | @smoke @e2e @order |
| TC-CHKOUT-003 | Wallet payment with insufficient balance | SC-CHKOUT-05 | P1 | High | Logged in; cart total greater than wallet balance | 1. `POST /walletPaymentOrder` with a valid address id | HTTP 400, error "Insufficient wallet balance"; no order created; wallet unchanged | To Be Automated | @regression @api @order @negative |
| TC-CHKOUT-004 | Order with an empty cart | SC-CHKOUT-07 | P2 | Medium | Logged in; cart empty | 1. `POST /placeOrder` with an address and COD | HTTP 400, error "Cart is empty"; no order created | To Be Automated | @regression @api @order @negative |
| TC-CHKOUT-005 | Placing an order reduces product stock | SC-CHKOUT-06 | P1 | High | PRODUCT-A stock known (read from the admin product list) | 1. Add quantity 2 to cart<br>2. Place a COD order<br>3. Re-read PRODUCT-A stock | Stock is lower by exactly 2 | To Be Automated | @regression @e2e @order |

---

## 5. Coupons, user side (TC-COUP)

| ID | Title | Scenario | P | Sev | Preconditions | Steps | Expected result | Automation | Tags |
|----|-------|----------|---|-----|---------------|-------|-----------------|------------|------|
| TC-COUP-001 | Apply a valid coupon | SC-COUP-01 | P1 | High | Active coupon exists (created via admin in setup); cart total at or above its minimum; no coupon applied | 1. `POST /applyCoupon` with the code | `success` true, message "Coupon applied"; response shows the discount and a reduced grand total | To Be Automated | @regression @api @cart |
| TC-COUP-002 | Apply an expired coupon | SC-COUP-02 | P1 | High | A coupon whose end date has passed | 1. `POST /applyCoupon` with its code | HTTP 4xx, message "Coupon has expired"; totals unchanged | To Be Automated | @regression @api @cart @negative |
| TC-COUP-003 | Apply a coupon with cart total below its minimum | SC-COUP-03 | P1 | High | Active coupon with minimum price M; cart total below M | 1. `POST /applyCoupon` with the code | Rejected with "Cart total must be at least ₹M to apply this coupon"; totals unchanged. Also test total exactly equal to M (accepted) | To Be Automated | @regression @api @cart @boundary |

---

## 6. Orders, user side (TC-ORDER)

| ID | Title | Scenario | P | Sev | Preconditions | Steps | Expected result | Automation | Tags |
|----|-------|----------|---|-----|---------------|-------|-----------------|------------|------|
| TC-ORDER-001 | Order history page loads | SC-ORDER-01 | P0 | High | Logged in | 1. Open `/orders` | Heading "Order History"; either order cards ("Order #…") or the empty state "No Acquisitions Found" | Automated: `tests/user/orders.spec.ts` | @smoke @regression @order |
| TC-ORDER-002 | Cancel a pending order | SC-ORDER-03 | P0 | Critical | A Pending order exists (placed in the test) | 1. Open the order<br>2. Cancel it<br>3. Reload `/orders` | Order status shows Cancelled; for wallet/online payments the wallet is refunded and a credit appears in the ledger | To Be Automated | @regression @e2e @order @critical |
| TC-ORDER-003 | Cancel an order that is no longer pending | SC-ORDER-05 | P1 | High | An order in Shipped or later status | 1. `POST /cancelOrder` for that order | The request is rejected; order status unchanged; no refund | To Be Automated | @regression @api @order @negative |
| TC-ORDER-004 | Return an item that is not delivered | SC-ORDER-08 | P1 | High | An order item that is not Delivered | 1. `POST /order/returnItem` for that item | HTTP 400, message "Only delivered items can be returned" | To Be Automated | @regression @api @order @negative |

---

## 7. Admin authentication (TC-ADM-AUTH)

| ID | Title | Scenario | P | Sev | Preconditions | Steps | Expected result | Automation | Tags |
|----|-------|----------|---|-----|---------------|-------|-----------------|------------|------|
| TC-ADM-AUTH-001 | Admin login with valid credentials | SC-ADM-AUTH-01 | P0 | Critical | ADMIN exists | 1. Open `/admin/login`<br>2. Enter ADMIN email and password<br>3. Click **Log In** | Redirected to `/admin/dashboard` | Automated: `tests/admin.setup.ts` (admin login setup) | @smoke @admin @auth @critical |
| TC-ADM-AUTH-002 | Admin login with a wrong password | SC-ADM-AUTH-03 | P0 | High | ADMIN exists | 1. Open `/admin/login`<br>2. Enter ADMIN email and a wrong password | Login fails with message "Invalid password"; stays on the login page | To Be Automated | @regression @admin @auth @negative |
| TC-ADM-AUTH-003 | Customer credentials are rejected on admin login | SC-ADM-AUTH-04 | P0 | Critical | A normal customer account exists | 1. Open `/admin/login`<br>2. Enter the customer's valid email and password | Login fails ("Invalid email address"); the customer never reaches the dashboard | To Be Automated | @regression @admin @auth @security @negative |

---

## 8. Admin orders, coupons, categories, customers (TC-ADM-*)

| ID | Title | Scenario | P | Sev | Preconditions | Steps | Expected result | Automation | Tags |
|----|-------|----------|---|-----|---------------|-------|-----------------|------------|------|
| TC-ADM-ORD-001 | Admin order list loads | SC-ADM-ORD-01 | P0 | High | Logged in as ADMIN | 1. Open `/admin/orders` | Order table or the empty state is shown | Automated: `tests/admin/admin-orders.spec.ts` | @smoke @regression @admin @order |
| TC-ADM-ORD-002 | Advance an order to its next status | SC-ADM-ORD-03 | P0 | High | An order that is not Delivered or Cancelled | 1. Open the order<br>2. Select the next status and update | Message "Order status successfully updated to <status>"; the new status is displayed. Test skips with a reason when no such order exists | Automated: `tests/admin/admin-orders.spec.ts` (skip if no data) | @regression @admin @order |
| TC-ADM-ORD-003 | Invalid status transition is rejected | SC-ADM-ORD-05 | P1 | High | An order in Pending | 1. `POST /admin/update-order-status` with `newStatus: Delivered` | HTTP 400, "Cannot change status from Pending to Delivered"; status unchanged. Allowed chain is Pending → Shipped → Out for Delivery → Delivered | To Be Automated | @regression @api @admin @order @negative |
| TC-ADM-COUP-001 | Add a valid coupon | SC-ADM-COUP-01 | P1 | High | Logged in as ADMIN | 1. Open `/admin/coupon`<br>2. Enter a unique name and code, start today, end in 30 days, offer 100, minimum 500, maximum 1000<br>3. Submit | "Coupon added successfully"; the coupon appears in the list | Automated: `tests/admin/coupon.spec.ts` | @regression @admin |
| TC-ADM-COUP-002 | Coupon with an invalid price range | SC-ADM-COUP-03 | P1 | High | Logged in as ADMIN | 1. Submit a coupon where offer ≥ minimum (for example offer 500, minimum 500) and again where minimum ≥ maximum | HTTP 400, "Invalid price range: Offer Price < Minimum Price < Maximum Price"; no coupon created. Boundary: offer one below minimum is accepted | To Be Automated | @regression @admin @boundary @negative |
| TC-ADM-CAT-001 | Add a category | SC-ADM-CAT-01 | P1 | Medium | Logged in as ADMIN | 1. Open `/admin/category`<br>2. Enter a unique name and a description<br>3. Submit | "Category added successfully"; the total category count increases by 1 and the name is listed | Automated: `tests/admin/category.spec.ts` | @regression @admin |
| TC-ADM-CAT-002 | Add a duplicate category | SC-ADM-CAT-02 | P1 | Medium | A category named X exists | 1. Submit a category named X again | HTTP 400, "Category already exists"; count unchanged | To Be Automated | @regression @admin @negative |
| TC-ADM-CUST-001 | Block then unblock a customer | SC-ADM-CUST-01 | P1 | High | A throwaway customer exists (never the account used for the user session) | 1. Open `/admin/users` and search the customer<br>2. Block<br>3. Unblock | Status badge shows Blocked after step 2 and Active after step 3; the original state is restored | Automated: `tests/admin/customers.spec.ts` | @regression @admin |

---

## 9. Authorization and API security (TC-API)

| ID | Title | Scenario | P | Sev | Preconditions | Steps | Expected result | Automation | Tags |
|----|-------|----------|---|-----|---------------|-------|-----------------|------------|------|
| TC-API-001 | Admin analytics endpoint rejects anonymous callers | SC-SEC-06, SC-ADM-DASH-04 | P0 | High | No session | 1. `GET /admin/dashboard-canceled-data` from a context without cookies | HTTP 401/403 (not 200). **Currently returns 200: BUG-001.** Tracked with `test.fail` | Automated (known failing): `tests/api/authorization.spec.ts` | @regression @api @security |
| TC-API-002 | Customer session cannot use admin endpoints | SC-SEC-07, SC-ADM-AUTH-08 | P0 | Critical | Logged in as USER (not admin) | 1. `GET /admin/users` with the user's cookie<br>2. `GET /admin/orders` with the user's cookie | Both redirect to the admin login and return no admin data | To Be Automated | @regression @api @security |
| TC-API-003 | Block-customer route requires an admin session | SC-SEC-05 | P0 | Critical | A throwaway customer; no session | 1. `GET /admin/blockCustomer?id=<throwaway id>` from a context without cookies<br>2. Check the customer's status as admin | Request is redirected to the admin login and the customer is **not** blocked. **Suspected defect:** `admincheckSession` only checks that some admin account exists, so anonymous callers may pass. Verify with a throwaway customer only; restore state afterwards | To Be Automated | @regression @api @security |

---

## Summary

| Module | Cases | Automated | To be automated |
|--------|-------|-----------|-----------------|
| AUTH | 10 | 1 | 9 |
| SHOP | 4 | 4 | 0 |
| PROD | 3 | 2 | 1 |
| CART | 7 | 5 | 2 |
| CHKOUT | 5 | 0 | 5 |
| COUP | 3 | 0 | 3 |
| ORDER | 4 | 1 | 3 |
| ADM-AUTH | 3 | 1 | 2 |
| ADM-ORD | 3 | 2 | 1 |
| ADM-COUP | 2 | 1 | 1 |
| ADM-CAT | 2 | 1 | 1 |
| ADM-CUST | 1 | 1 | 0 |
| API | 3 | 1 | 2 |
| **Total** | **50** | **20** | **30** |

Suspected defects raised while writing these cases (not yet verified): quantity `0`/negative handling (TC-CART-005) and the `admincheckSession` middleware (TC-API-003). Confirmed: BUG-001 (TC-API-001).
