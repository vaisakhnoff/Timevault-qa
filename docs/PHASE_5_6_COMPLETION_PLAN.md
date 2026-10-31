# Phase 5 + Phase 6 Completion Plan

> Created 2026-10-06. Supersedes the "PHASE 5 COMPLETE" and "PHASE 6 COMPLETE" notes in `PROJECT_STATE.md`.
> Those phases were closed early. A cross-check against `timevault-qa-blueprint.md` and `docs/TEST_SCENARIOS.md`
> found missing coverage, mainly **checkout and the order lifecycle**. This file lists what is left, how to build it,
> and how to know each part is done.

---

## 1. Where we are (verified 2026-10-06)

| | Blueprint target | Today | Verdict |
|---|---|---|---|
| **Phase 5** user tests | 30 to 40 | **22** (home 4, shop 7, product-details 3, cart 3, wishlist 1, address 1, profile 1, wallet 1, orders 1) | Not done |
| Phase 5 specs named in blueprint | shop, cart, **checkout**, orders, wishlist, address, profile, wallet | `checkout.spec.ts` and `checkout.page.ts` **do not exist**; `orders.spec.ts` only checks the page loads | Not done |
| **Phase 6** admin tests | 20 to 30 | **about 38** across 9 spec files (all 7 blueprint specs exist) | Target met, but shallow |
| Phase 6 depth | n/a | 39 admin scenarios still `Planned` (18 are P1) | Gaps |

### Why Phase 5 must finish before the Phase 6 depth work
The blueprint lists Phase 6 as depending on Phase 5. The code shows the same thing:

- `admin-orders.spec.ts` "advance a pending order" and `returns.spec.ts` "approve a return" **skip today** because no order exists. Checkout creates the orders.
- Admin coupon scenario SC-ADM-COUP-08 (a customer applies a new coupon) needs a cart and the checkout page.
- The full order chain crosses both roles: user checkout, admin marks Delivered, user requests a return, admin approves, wallet is credited.

Order of work: **Phase 5 core, then Phase 6 core, then optional depth in both.**

---

## 2. App facts that shape the tests (read from the app source)

| Area | Fact |
|---|---|
| Checkout page | `GET /checkoutPage` (login required). Form `#checkout-form`; address radios `name="addressId"`; payment radios `#cod`, `#online`, `#wallet` (`name="paymentMethod"`); coupon `#coupon-select`, `#apply-coupon-btn`, `#remove-coupon-btn`. |
| COD | `POST /placeOrder` (JSON `{addressId, paymentMethod}`), then redirect to `/orderSuccess`. **COD is blocked when the grand total is above ₹5,000** (SweetAlert "Cash on Delivery Not Available"). The test product must fit under this, or tests must use Wallet. |
| Wallet payment | `POST /walletPaymentOrder`. Fails with "Insufficient wallet balance". Wallet can only be topped up through Razorpay (out of scope), so a balance has to come from an approved return or a refund. |
| Online | Razorpay. **Out of scope.** |
| Order success | `/orderSuccess` shows "Allocation Confirmed" and `#<orderId>`. Link "Track Order" goes to `/orders`. |
| Order list | `/orders`, 3 per page, each card links to `/order/<orderId>`. |
| Order details | `/order/:id`. Per-item buttons: **Cancel** (only while the order and item are Pending) and **Return** (only when Delivered). I found **no whole-order cancel button** in `orderDetails.ejs` or `userOrders.ejs`; `POST /cancelOrder` has no UI. Confirm on the live app in step 5.0. |
| Cancel rules | `POST /order/cancelItem`: "Item cancelled successfully". Wallet refund **only for Online and Wallet** orders, not COD. Stock is restored. All items cancelled makes the order Cancelled. |
| Return rules | `POST /order/returnItem`: "Return request submitted successfully". Non-delivered item: "Only delivered items can be returned". |
| Statuses | Pending, Shipped, Out for Delivery, Delivered. Branches: Cancelled, Return Requested, Returned, Return Declined. |
| Coupon messages | "Please enter a coupon code", "A coupon is already applied", "Coupon not found", "Coupon has expired", "Your cart is empty", "Cart total must be at least ₹N to apply this coupon", "Coupon applied", "No coupon applied", "Coupon removed successfully". |
| Auth gaps (Phase 7) | `/applyCoupon`, `/removeCoupon`, `/createOnlineOrder`, `/onlinePaymentSuccess` have no `checkSession`. |
| Known UI limit | In the product list, block/unblock buttons are not rendered (orphaned JS in `products.ejs`). Re-verify in step 6.0. |

---

## 3. Ground rules (apply to every part below)

1. **Follow the existing conventions:** POM per page in `pages/user/` or `pages/admin/`, registered in `fixtures/base.fixture.ts` or `fixtures/admin.fixture.ts`; specs import `test` and `expect` from the fixtures; tags `@regression`, `@smoke`, `@boundary`, plus `@e2e` for cross-role chains.
2. **Never fabricate selectors.** Open the live page (codegen or inspector), confirm every locator, then write the POM. The deployed UI has differed from the EJS before.
3. **Shared-account state:** specs that mutate the single test account (cart, wishlist, address, orders) use `test.describe.configure({ mode: 'serial' })` and clean up in `afterEach`.
4. **Web-first assertions** (`toHaveCount`, `toBeVisible`), no `waitForTimeout`.
5. **Dismiss SweetAlert inside the POM action** that triggers it.
6. **Skip-with-reason only for genuinely unavailable data.** Once checkout exists, order-dependent tests create their own data instead of skipping.
7. **Before each commit:** `npm run check` is clean and the touched spec passes (`npx playwright test <file> --project=chromium` or `--project=admin`).
8. **One commit per part** (5B, 5C, ...), message style `feat: add <thing> tests`.
9. If many tests suddenly fail with 500s, check that the app and its database are up before theorising (lesson from the retracted BUG-002/003).

---

## 4. Test data and isolation strategy

This is the riskiest design point, so it is decided first (step 5.0).

| Concern | Decision |
|---|---|
| **Test product** | Use one fixed product that is in stock and priced so a quantity-1 order is **at most ₹5,000** (COD limit). Record its id in `data/` or `.env`. Check price and stock in 5.0. The existing Titan id `6aad1146c76606074021e7ec` is the starting candidate. |
| **Stock drain** | Each order lowers stock. Every test that creates an order **cancels it in `afterEach`** (per-item cancel restores stock). Tests that need a Delivered order use the admin chain and cannot be undone, so keep those to one or two. |
| **Address** | Checkout needs a saved address. Create one in a `beforeAll` or a helper, and **do not delete it after an order is placed**. Fix `address.spec.ts` cleanup so it deletes only the address it created (it currently deletes all). |
| **Wallet balance** | Cannot be topped up. Seed it through the chain: place a COD order, admin sets it Delivered, user requests a return, admin approves, wallet is credited. Wallet-payment tests read the balance first and skip with a reason if it is too low. |
| **Cross-role tests** | The `chromium` (user) and `admin` projects run in parallel and do not share a session. For flows that need both roles, use **one test with two browser contexts**: the user page, and a second context created with `storageState: 'playwright/.auth/admin.json'`. Provide this as `fixtures/e2e.fixture.ts` exposing `adminPage` next to the user fixtures. |
| **Orders cannot be deleted** | Each run leaves order history. Assertions must be relative (count before and after, or find the order by its id), never absolute. |
| **Blockable customer (6B)** | Customer block tests need a throwaway account with **known credentials**. Add `TEST_BLOCKABLE_USER_EMAIL/PASSWORD` to `.env` and `.env.example`. Never block the account in `user.json`. |

---

# PHASE 5: finish the user module

Target after this phase: **about 38 user tests** (22 now plus about 16).

## 5.0 Foundations (no new tests, prerequisite for 5B to 5E)

| Task | Output |
|---|---|
| Confirm the test product's price and stock, and the COD limit | product id and quantity recorded; decision noted here |
| Confirm on the live UI whether a whole-order cancel button exists | updates the SC-ORDER-03 approach |
| Confirm the current wallet balance of the test user | knows whether wallet tests can run before the chain |
| Create `pages/user/checkout.page.ts` and `pages/user/order-details.page.ts`; register `checkoutPage` and `orderDetailsPage` in `base.fixture.ts` | POMs ready |
| Create `fixtures/e2e.fixture.ts` with an `adminPage` second context | cross-role helper |
| Create helpers: `ensureAddress()`, `placeCodOrder()` (setup shortcut using the real UI or API), `cancelAllPendingOrders()` | `utils/helpers.ts` |
| Fix `address.spec.ts` cleanup to delete only its own address | no collateral deletes |
| Add `OrdersPage` locators: order link by id, pagination | needed by 5C |

Done when: the POMs compile (`npm run check`), a throwaway script can add to cart, reach `/checkoutPage` and place a COD order, and the findings above are written into section 2.

## 5B Checkout (new `checkout.spec.ts`), about 6 tests

| Test (tag `@regression` unless noted) | Scenario | Key assertions |
|---|---|---|
| checkout page shows cart summary and saved addresses | SC-CHKOUT-01 (P0) | item name and total visible, at least one address radio |
| place a COD order reaches the success page with an order id | SC-CHKOUT-02 + 03 (P0) | URL `/orderSuccess`, "Allocation Confirmed", order id matches `#\d+`; `afterEach` cancels the order |
| placing an order decrements product stock | SC-CHKOUT-06 (P1) | stock before minus quantity equals stock after (read from product page or admin product list) |
| placing an order without an address is rejected | SC-CHKOUT-08 (P1) | stays on checkout, no order created |
| COD above ₹5,000 is blocked | **new SC-CHKOUT-11** | SweetAlert "Cash on Delivery Not Available"; use quantity 4 of a higher-priced product, or skip with reason if no product exceeds the limit |
| wallet payment debits the wallet | SC-CHKOUT-04 (P1) | balance before minus total equals balance after; skip with reason if balance is too low until the 6E chain has run |

Optional (P2): SC-CHKOUT-09 add a new address from checkout. SC-CHKOUT-05/07/10 are API tests and belong to Phase 7.

Done when: all pass on `chromium` twice in a row, with no leftover Pending orders after the run.

## 5C Orders (extend `orders.spec.ts`), about 4 tests

| Test | Scenario | Key assertions |
|---|---|---|
| order details show items, status, address and totals | SC-ORDER-02 (P0) | Pending status, product name, address block, payment summary |
| cancel a pending order item | SC-ORDER-03 (P0) | per-item Cancel, SweetAlert confirm "Yes, cancel it!", status becomes Cancelled, stock restored |
| cancelling a wallet order refunds the wallet | SC-ORDER-04 (P1) | needs wallet balance (see section 4); balance returns to its start value |
| status set by the admin shows on the user's order page | SC-ORDER-10 (P1) | two-context test: admin sets Shipped, user page shows Shipped |

Optional (P2): SC-ORDER-11 order history pagination (3 per page). API scenarios ORDER-05/06/07/08/09/12 go to Phase 7.

Done when: each test creates its own order, passes twice in a row, and leaves no Pending orders.

## 5D Coupons at checkout, about 1 to 2 tests

| Test | Scenario | Key assertions |
|---|---|---|
| a coupon discount is carried into the placed order total | SC-COUP-08 (P1) | apply an existing active coupon with `#coupon-select`, see discount and grand total change, place a COD order, order details total equals the discounted total |
| (optional) expired or below-minimum coupon shows the error | SC-COUP-02/03 | SweetAlert text from the table in section 2 |

The coupon needs a code that exists and is active. Create one through the admin coupon POM in a `beforeAll`, or reuse the admin spec's Faker approach. API coupon cases (COUP-01 to 07) go to Phase 7.

## 5E Cart, wallet and wishlist gaps, about 5 tests

| Spec | Test | Scenario |
|---|---|---|
| cart | cart total and item total recalculate after a quantity change | SC-CART-09 (P1) |
| cart | anonymous request to the cart redirects to login | SC-CART-15 (P1) |
| wallet | refund from a cancelled order appears as a credit and raises the balance | SC-WALLET-03 (P1), after 5C |
| wishlist | remove an item from the wishlist | SC-WISH-02 (P1) |
| wishlist | move a wishlist item to the cart | SC-WISH-04 (P1) |

## 5F Optional depth (only if time allows; none of it is needed for the blueprint target)

| Spec | Scenarios |
|---|---|
| shop | SHOP-02 pagination, 05 category filter, 06 brand filter, 07 price range, 10 sort descending, 14 blocked items hidden |
| product-details | PROD-02 offer price, 03 stock indicator, 04 out-of-stock button, 06 stepper minimum, 08 logged-out redirect |
| address | ADDR-02 delete, 03 edit, 04 empty fields, 09 anonymous redirect |
| home | HOME-01 title, 02 latest products, 04 logged-out header |
| profile, wishlist, wallet | PROF-04, WISH-07 anonymous redirects, WALLET-02 ledger |

## Phase 5 definition of done
- [ ] 5.0 foundations complete
- [ ] 5B checkout (6 tests)
- [ ] 5C orders (4 tests)
- [ ] 5D coupons (1 to 2 tests)
- [ ] 5E cart, wallet, wishlist (5 tests)
- [ ] User suite totals at least 35 tests, all green on `chromium`, twice in a row
- [ ] `checkout.spec.ts` exists and `orders.spec.ts` covers details and cancel
- [ ] No stray Pending orders after a full run; stock of the test product unchanged
- [ ] `TEST_SCENARIOS.md` and `TEST_CASES.md` statuses updated for every scenario above
- [ ] `PROJECT_STATE.md` Phase 5 entry corrected; interview questions section updated

---

# PHASE 6: finish the admin module

Target after this phase: all P1 admin scenarios automated (about 20 more tests). The blueprint count (20 to 30) is already met.

## 6.0 Verify before writing (30 minutes of looking, no tests)
- Is block/unblock for products still not rendered in `/admin/products`? If yes, plan SC-ADM-PROD-04/05 as hybrid tests: call `POST /blockProduct` through `APIRequestContext` with the admin session, then check the shop UI.
- Does the admin order detail page offer only valid next statuses? If yes, SC-ADM-ORD-05 (invalid transition) can only be tested through the endpoint.
- Is the status control hidden or disabled on Delivered and Cancelled orders (SC-ADM-ORD-06)?
- Does `edit-product.ejs` require image upload to save? This decides whether SC-ADM-PROD-06 is feasible.
- Set up the blockable customer credentials (section 4).

## 6A Categories, about 5 tests (`category.spec.ts`)

| Scenario | Test |
|---|---|
| SC-ADM-CAT-02 | duplicate category name shows "Category already exists" |
| SC-ADM-CAT-03 | empty name or description shows "Name and description are required" |
| SC-ADM-CAT-04 | edit a category and the new name is saved (use a Faker category created in the test) |
| SC-ADM-CAT-05 | list and unlist a category toggles the status badge (self-restoring) |
| SC-ADM-CAT-09 | an unlisted category is hidden from the shop (hybrid: admin unlists, user shop page checked, restore in `finally`) |

Optional (P2): CAT-06/07/08 offers (valid 1 to 99 %, invalid 0, 100, negative, remove).

## 6B Products and customers, about 4 tests

| Scenario | Test |
|---|---|
| SC-ADM-PROD-04 | block and unblock a product (UI or hybrid, per 6.0), self-restoring |
| SC-ADM-PROD-05 | a blocked product is hidden from the shop and not purchasable |
| SC-ADM-PROD-06 | edit a product and the change shows in the list (if feasible per 6.0) |
| SC-ADM-CUST-03 | a blocked customer cannot log in (admin blocks the throwaway account, a fresh login context is rejected, then unblock in `finally`) |

Optional (P2/P3): PROD-07 product offer boundaries, CUST-02 search, CUST-04 pagination, brand tests BRAND-02 to 06.

## 6C Coupons, about 4 tests (`coupon.spec.ts`)

| Scenario | Test |
|---|---|
| SC-ADM-COUP-03 | price order must be Offer < Minimum < Maximum, otherwise "Invalid price range" |
| SC-ADM-COUP-04 | a start date in the past is rejected |
| SC-ADM-COUP-06 | a duplicate active coupon name or code is rejected |
| SC-ADM-COUP-08 | a new coupon can be applied by a customer at checkout (two-context test, reuses 5D, delete the coupon in `finally`) |

Optional (P2): COUP-05 code equal to name rejected, COUP-07 edit coupon. Remember the coupon form rules in section 3 ("Coupons") of `ADMIN_MODULE_PLAN.md` (alphanumeric name, offer < minimum < maximum, dates today or later).

## 6D Orders and returns, about 6 tests (needs Phase 5 done)

| Scenario | Test |
|---|---|
| SC-ADM-ORD-07 | order detail page shows items and customer |
| SC-ADM-ORD-05 | an invalid transition returns "Cannot change status from X to Y" (endpoint or UI, per 6.0) |
| SC-ADM-ORD-06 | a Delivered or Cancelled order is not editable |
| SC-ADM-ORD-04 | full chain Pending, Shipped, Out for Delivery, Delivered (optional P2, doubles as setup for returns) |
| SC-ADM-RET-03 | approving a return credits the customer's wallet (**also seeds the wallet balance for 5B and 5C**) |
| SC-ADM-RET-04 | declining a return request |

Also **convert the two skipping tests** in `admin-orders.spec.ts` and `returns.spec.ts` so they create their own data through the e2e fixture and no longer need `test.skip`.

Suggested chain test (`@e2e`): user places a COD order, admin moves it to Delivered, user requests a return with a reason, admin approves, user wallet balance rises by the item amount.

## 6E Optional depth
- Dashboard: DASH-02 filter changes figures, DASH-03 best-selling data loads.
- Sales report: SALES-01 page loads, 02 date range, 03 PDF and Excel return a non-empty file with the right content type.
- Orders: ORD-08 search. Returns: RET-05 "already been processed".

## Phase 6 definition of done
- [ ] 6.0 findings written into this file
- [ ] 6A categories (5 tests)
- [ ] 6B products and customers (4 tests)
- [ ] 6C coupons (4 tests)
- [ ] 6D orders and returns (about 6 tests), skipping tests converted
- [ ] All 18 P1 admin scenarios automated; `admin` project green twice in a row
- [ ] No leftover blocked product, unlisted category or blocked customer after a run
- [ ] `TEST_SCENARIOS.md` and `TEST_CASES.md` statuses updated
- [ ] `PROJECT_STATE.md` Phase 6 entry corrected

---

## 5. Execution order and commits

| # | Part | Why this position | Commit message |
|---|---|---|---|
| 1 | 5.0 Foundations | everything below needs the checkout POM, helpers and data decisions | `feat: add checkout and order-details page objects and e2e fixture` |
| 2 | 5B Checkout | creates the first real orders | `feat: add checkout tests` |
| 3 | 5C Orders | uses 5B helpers | `feat: add order details and cancel tests` |
| 4 | 5D Coupons | builds on checkout | `feat: add coupon checkout tests` |
| 5 | 6.0 Verify | settles the open admin questions | (no commit; notes only) |
| 6 | 6D Orders and returns | creates the wallet balance; unblocks the skipping tests | `feat: add admin order and return tests` |
| 7 | 5C wallet refund + 5B wallet payment + 5E | now a balance exists | `feat: add wallet payment and refund tests` |
| 8 | 6A, 6B, 6C | independent admin depth | `feat: add admin category/product/coupon negative tests` |
| 9 | 5F, 6E | optional depth | per module |
| 10 | Docs | statuses, state file, interview questions | `docs: update scenario status and project state` |

Run before each commit:
```
npm run check
npx playwright test <changed spec> --project=chromium    # user specs
npx playwright test <changed spec> --project=admin       # admin specs
```
Run the full suite (`npm test`) after steps 4, 8 and 10.

## 6. Risks and watch-outs

| Risk | Mitigation |
|---|---|
| Test product price above ₹5,000 makes COD unavailable | decide in 5.0; otherwise use a cheaper product or the wallet path |
| Orders drain product stock | cancel in `afterEach`; assert stock is back to its starting value at the end of 5B |
| Wallet balance is zero | seed it with the 6D return chain before the wallet tests; skip with a reason otherwise |
| User and admin projects run in parallel on shared data | cross-role tests use two contexts in one test; keep order-mutating specs serial |
| Throwaway customer password unknown | add dedicated credentials to `.env` (section 4) |
| Server or database down causes false failures | check app health first; re-run once before investigating |
| Local and Render data differ | develop against the local app (`BASE_URL` in `.env`); re-run on Render before the final portfolio screenshots |

## 7. Not in this plan (belongs to later phases)

The 22 API-layer user scenarios go to Phase 7 (`cart-api`, `coupon-api`, `order-api`): CART-04/05/07/13, CHKOUT-05/07/10, COUP-01 to 07, ORDER-05/06/07/08/09/12, ADDR-08, WISH-03. The missing-auth findings (SC-SEC) also stay in Phase 7. Razorpay payments, OTP flows and image upload remain out of scope.


---

## Execution findings — 2026-10-12

### 5.0 foundations

- COD-safe product confirmed: **Casio Vintage Classic**, id `6aad1146c76606074021e7e6`, price ₹4,799, stock 20 at inspection time.
- Titan (`6aad1146c76606074021e7ec`) costs ₹6,799. COD UI correctly disables it above ₹5,000.
- Test user wallet was ₹45,281.00 at inspection time. Values are not hardcoded in assertions except the controlled single-item refund amount.
- A persistent checkout address is created only when the QA account has no address. Address tests now delete only their own generated address.
- `fixtures/e2e.fixture.ts` provides one user page plus an authenticated `adminPage` context. The `e2e` project depends on both setup projects and runs with one worker.
- Per-item **Cancel Item** does not restore stock. Documented as BUG-004. It is not used for order cleanup.

### 5B–5E implemented

- Checkout summary/address test and COD-over-₹5,000 UI boundary test.
- COD order → admin delivery → user return request → admin approval lifecycle. It verifies user order detail, wallet credit, and stock restoration after approved return.
- Coupon checkout integration creates a temporary admin coupon, applies/removes it, and deletes it in `finally`.
- Cart item total/subtotal recalculation test.
- Wishlist remove and move-to-cart tests.
- User order-detail view coverage.

### 6.0 findings

- Product block/unblock controls are still absent from `/admin/products`; orphan JavaScript references `.block-button` / `.unblock-button`. Hybrid admin API → user shop test implemented and self-restores product state.
- Admin order detail offers only legal forward transitions. Invalid transition validation uses `POST /admin/update-order-status` and verifies HTTP 400.
- Returned orders hide status select/update controls.
- Category list/unlist works and self-restores. Unlisting removes category filter visibility but does **not** hide category products from shop results. Do not encode the false expectation until app behavior is fixed.
- Product block hides a product from shop search but direct product detail/add-to-cart remains possible. Treat “not purchasable” as a defect candidate, not a passing expectation.
- Product edit retains existing images and is feasible, but no test added because restoring all mutable product fields safely needs isolated product data.

### Phase 6 implementation status

- Category: add, duplicate, empty-client validation, edit, list/unlist restore.
- Product: list/search plus hybrid block/unblock/search visibility restore.
- Coupon: add/delete, UI price-order validation, native past-date validation, server duplicate validation, checkout apply/remove.
- Orders: list/filter, customer/item detail, terminal control hidden, invalid server transition.
- Returns: list/empty state. Approval covered by targeted lifecycle test. Decline remains deferred: it leaves a permanently fulfilled item and reduces stock, so it needs disposable inventory/reset data.
- Customer block/login test exists and skips until `TEST_BLOCKABLE_USER_EMAIL` and `TEST_BLOCKABLE_USER_PASSWORD` are configured. It never targets `TEST_USER_EMAIL`.

### Remaining prerequisites before literal Phase 5/6 definition-of-done

1. Provide separate blockable-user credentials.
2. Provide disposable/resettable product data for declined-return and product-edit tests.
3. Decide whether to fix BUG-004 before adding repeatable cancellation/stock-restoration automation.
4. Update `TEST_SCENARIOS.md`, `TEST_CASES.md`, and `PROJECT_STATE.md` after final execution.
