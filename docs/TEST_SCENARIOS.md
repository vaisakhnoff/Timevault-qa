# TimeVault QA — Test Scenarios

High-level scenarios for every module, by type and priority. Scenarios are *what* to verify; detailed steps and expected results are in [TEST_CASES.md](TEST_CASES.md). The strategy behind the layers and priorities is in [TEST_STRATEGY.md](TEST_STRATEGY.md).

## How to read this document

**Priority**

| P | Meaning |
|---|---------|
| P0 | Business-critical; failure blocks release. Smoke candidates |
| P1 | Important feature or rule; core regression |
| P2 | Secondary behaviour or edge case |
| P3 | Low risk / cosmetic |

**Layer** — where the scenario should be tested (see Strategy §3): `UI`, `API`, `E2E`.

**Status** (reflects the repository today, not intent)

| Status | Meaning |
|--------|---------|
| Automated | A passing automated test exists |
| Planned | Should be automated; not written yet. This is the gap list |
| Manual | Verified by hand: needs email/OTP, images or another external dependency |
| Out of scope | Excluded in the Test Plan |

**Source of rules:** expected messages and rules were read from the application code (controllers and middleware), not assumed.

---

## 1. User side

### AUTH — Authentication

| ID | Scenario | Type | P | Layer | Status |
|----|----------|------|---|-------|--------|
| SC-AUTH-01 | Login with valid credentials redirects to home | Positive | P0 | UI | Automated |
| SC-AUTH-02 | Login page renders email, password and Log In button | Positive | P0 | UI | Automated |
| SC-AUTH-03 | Login with wrong password shows "Incorrect email or password" | Negative | P0 | UI | Planned |
| SC-AUTH-04 | Login with non-existent email shows "Incorrect email or password" | Negative | P0 | UI | Planned |
| SC-AUTH-05 | Login with empty fields is rejected, user stays logged out | Negative / Validation | P1 | UI | Planned |
| SC-AUTH-06 | Login as blocked user shows "User is blocked by admin" | Negative | P1 | UI | Planned |
| SC-AUTH-07 | Logout destroys the session; protected page then redirects to login | Session | P0 | UI | Planned |
| SC-AUTH-08 | Anonymous request to a protected page redirects to `/login` | Authorization | P0 | UI | Planned |
| SC-AUTH-09 | Saved session is active (user menu visible) after storageState login | Session | P0 | UI | Automated |
| SC-AUTH-10 | Blocked-mid-session user is logged out on next protected request | Session | P1 | API | Planned |
| SC-AUTH-11 | Signup with valid data reaches the OTP page | Positive | P0 | UI | Manual |
| SC-AUTH-12 | Signup with an existing email shows "User with this email already exists" | Negative | P1 | UI | Planned |
| SC-AUTH-13 | Signup with mismatched passwords shows "Passwords do not match" | Negative / Validation | P1 | UI | Planned |
| SC-AUTH-14 | Signup with invalid referral code shows "Invalid referral code" | Negative | P2 | UI | Planned |
| SC-AUTH-15 | Signup with valid referral code credits the bonus | Integration | P2 | E2E | Manual |
| SC-AUTH-16 | Invalid or expired OTP shows the matching error | Negative | P1 | UI | Manual |
| SC-AUTH-17 | Forgot password with unknown email shows "Email not found" | Negative | P1 | UI | Planned |
| SC-AUTH-18 | Forgot password → OTP → reset → login | Positive | P1 | E2E | Manual |
| SC-AUTH-19 | Google OAuth login | Positive | P2 | UI | Out of scope |

### HOME — Homepage

| ID | Scenario | Type | P | Layer | Status |
|----|----------|------|---|-------|--------|
| SC-HOME-01 | Homepage loads with the TIME VAULT title | Positive | P0 | UI | Planned |
| SC-HOME-02 | Latest products section shows products (max 4) | Positive | P1 | UI | Planned |
| SC-HOME-03 | Header shows the user menu when logged in | Session | P1 | UI | Automated |
| SC-HOME-04 | Header shows Login and Join Vault when logged out | Session | P1 | UI | Planned |
| SC-HOME-05 | Category and brand tiles open the filtered shop page | Positive | P2 | UI | Planned |
| SC-HOME-06 | Banner carousel renders | Positive | P3 | UI | Planned |

### SHOP — Browse, search, filter, sort

| ID | Scenario | Type | P | Layer | Status |
|----|----------|------|---|-------|--------|
| SC-SHOP-01 | Shop page lists products | Positive | P0 | UI | Automated |
| SC-SHOP-02 | Pagination shows 6 products per page and navigates | Positive | P1 | UI | Planned |
| SC-SHOP-03 | Search with a matching term returns matching products and sets the URL | Positive | P1 | UI | Automated |
| SC-SHOP-04 | Search with no match shows "No Timepieces Found" | Negative | P1 | UI | Automated |
| SC-SHOP-05 | Filter by category narrows results | Positive | P1 | UI | Planned |
| SC-SHOP-06 | Filter by brand narrows results | Positive | P1 | UI | Planned |
| SC-SHOP-07 | Price range filter returns only products within min and max | Boundary | P1 | UI | Planned |
| SC-SHOP-08 | Price range with min greater than max or negative values is handled | Boundary / Negative | P2 | UI | Planned |
| SC-SHOP-09 | Sort by price low to high orders ascending | Positive | P1 | UI | Automated |
| SC-SHOP-10 | Sort by price high to low orders descending | Positive | P1 | UI | Planned |
| SC-SHOP-11 | Sort by name A–Z and Z–A | Positive | P2 | UI | Planned |
| SC-SHOP-12 | Search, filter and sort combined | Integration | P2 | UI | Planned |
| SC-SHOP-13 | Reset clears all filters | Positive | P2 | UI | Planned |
| SC-SHOP-14 | Blocked products and unlisted categories are not shown | Business rule | P1 | UI | Planned |
| SC-SHOP-15 | Result count label matches the number of cards | Data validation | P2 | UI | Planned |

### PROD — Product details

| ID | Scenario | Type | P | Layer | Status |
|----|----------|------|---|-------|--------|
| SC-PROD-01 | Details page shows name and price | Positive | P0 | UI | Automated |
| SC-PROD-02 | Sale price, original price and discount are shown when on offer | Data validation | P1 | UI | Planned |
| SC-PROD-03 | Stock indicator reflects available quantity | Data validation | P1 | UI | Planned |
| SC-PROD-04 | Out-of-stock product shows a disabled "Out of Stock" button | Boundary | P1 | UI | Planned |
| SC-PROD-05 | Quantity stepper stops at 4 | Boundary | P0 | UI | Automated |
| SC-PROD-06 | Quantity stepper does not go below 1 | Boundary | P1 | UI | Planned |
| SC-PROD-07 | Add to cart with quantity shows the "Allocated to Bag" confirmation | Positive | P0 | UI | Automated |
| SC-PROD-08 | Add to cart while logged out redirects to login | Authorization | P1 | UI | Planned |
| SC-PROD-09 | Invalid product id is handled without a server error | Negative | P2 | UI | Planned |
| SC-PROD-10 | Related products are listed | Positive | P3 | UI | Planned |
| SC-PROD-11 | Reviews section shows ratings or the empty message | Positive | P2 | UI | Planned |

### CART — Cart

Rule under test: maximum per product is `min(stock, 4)`.

| ID | Scenario | Type | P | Layer | Status |
|----|----------|------|---|-------|--------|
| SC-CART-01 | Item added from the product page appears in the cart | Positive | P0 | UI | Automated |
| SC-CART-02 | Add quantity at the upper limit (4) is accepted | Boundary | P0 | API | Automated |
| SC-CART-03 | Add quantity above the limit (5) returns 400 with "Maximum" message | Boundary / Negative | P0 | API | Automated |
| SC-CART-04 | Product with stock below 4: limit equals stock (stock 2 → 3 rejected) | Boundary | P0 | API | Planned |
| SC-CART-05 | Quantity 0, negative or non-integer is handled | Boundary / Negative | P1 | API | Planned |
| SC-CART-06 | Unknown product id returns 404 | Negative | P1 | API | Automated |
| SC-CART-07 | Adding the same product again increments; cumulative total above limit returns 400 | Business rule | P1 | API | Planned |
| SC-CART-08 | Increasing quantity in the cart changes the item quantity | Positive | P1 | UI | Automated |
| SC-CART-09 | Cart total and item total recalculate after a quantity change | Data validation | P1 | UI | Planned |
| SC-CART-10 | Remove item empties the cart | Positive | P0 | UI | Automated |
| SC-CART-11 | Empty cart shows the empty state | Boundary | P2 | UI | Planned |
| SC-CART-12 | Anonymous add to cart returns 401 | Authorization | P0 | API | Automated |
| SC-CART-13 | Update quantity above stock returns 400 | Boundary | P1 | API | Planned |
| SC-CART-14 | Cart persists across page navigation | Session | P2 | UI | Planned |
| SC-CART-15 | Cart page loads for a logged-in user; anonymous request redirects to login | Authorization | P1 | UI | Planned |

### CHKOUT — Checkout and payment

| ID | Scenario | Type | P | Layer | Status |
|----|----------|------|---|-------|--------|
| SC-CHKOUT-01 | Checkout page shows cart summary and saved addresses | Positive | P0 | UI | Planned |
| SC-CHKOUT-02 | Place order with address and Cash on Delivery reaches the order success page | Positive | P0 | E2E | Planned |
| SC-CHKOUT-03 | Order success page shows the order id | Positive | P0 | UI | Planned |
| SC-CHKOUT-04 | Place order with wallet payment debits the wallet | Integration | P1 | E2E | Planned |
| SC-CHKOUT-05 | Wallet payment with insufficient balance returns "Insufficient wallet balance" | Negative | P1 | API | Planned |
| SC-CHKOUT-06 | Placing an order decrements product stock | Integration | P1 | E2E | Planned |
| SC-CHKOUT-07 | Place order with an empty cart returns "Cart is empty" | Negative | P2 | API | Planned |
| SC-CHKOUT-08 | Place order without selecting an address is rejected | Negative | P1 | UI | Planned |
| SC-CHKOUT-09 | Add a new address from checkout | Positive | P2 | UI | Planned |
| SC-CHKOUT-10 | Checkout page and place order require login | Authorization | P1 | API | Planned |
| SC-CHKOUT-11 | Online payment through Razorpay | Positive | P1 | E2E | Out of scope |

### COUP — Coupons (user side)

| ID | Scenario | Type | P | Layer | Status |
|----|----------|------|---|-------|--------|
| SC-COUP-01 | Apply a valid coupon: discount and grand total update | Positive | P1 | API | Planned |
| SC-COUP-02 | Expired coupon returns "Coupon has expired" | Negative | P1 | API | Planned |
| SC-COUP-03 | Cart total below the coupon minimum returns "Cart total must be at least ₹…" | Boundary | P1 | API | Planned |
| SC-COUP-04 | Second coupon returns "A coupon is already applied" | Negative | P2 | API | Planned |
| SC-COUP-05 | Remove coupon restores the original total | Positive | P1 | API | Planned |
| SC-COUP-06 | Empty code returns "Please enter a coupon code"; unknown code returns "Coupon not found" | Negative | P2 | API | Planned |
| SC-COUP-07 | Removing when none applied returns "No coupon applied" | Negative | P3 | API | Planned |
| SC-COUP-08 | Coupon discount is carried into the placed order total | Integration | P1 | E2E | Planned |

### ORDER — Orders

| ID | Scenario | Type | P | Layer | Status |
|----|----------|------|---|-------|--------|
| SC-ORDER-01 | Order history loads with orders or the empty state | Positive | P0 | UI | Automated |
| SC-ORDER-02 | Order details show items, status, address and totals | Positive | P0 | UI | Planned |
| SC-ORDER-03 | Cancel a pending order sets status to Cancelled | Positive | P0 | E2E | Planned |
| SC-ORDER-04 | Cancelling a wallet or online order refunds the wallet | Integration | P1 | E2E | Planned |
| SC-ORDER-05 | Cancelling a non-pending order is rejected | Negative | P1 | API | Planned |
| SC-ORDER-06 | Cancel a single item from an order | Positive | P1 | API | Planned |
| SC-ORDER-07 | Return a delivered item returns "Return request submitted successfully" | Positive | P1 | API | Planned |
| SC-ORDER-08 | Return an item that is not delivered returns "Only delivered items can be returned" | Negative | P1 | API | Planned |
| SC-ORDER-09 | A user cannot cancel or view another user's order | Authorization | P1 | API | Planned |
| SC-ORDER-10 | Status set by admin is reflected on the user's order page | Integration | P1 | E2E | Planned |
| SC-ORDER-11 | Order history pagination (3 per page) | Positive | P2 | UI | Planned |
| SC-ORDER-12 | Anonymous cancel or return returns 401 | Authorization | P1 | API | Planned |

### PROF — Profile

| ID | Scenario | Type | P | Layer | Status |
|----|----------|------|---|-------|--------|
| SC-PROF-01 | Profile shows name, email and referral code | Positive | P2 | UI | Automated |
| SC-PROF-02 | Edit profile name and phone | Positive | P2 | UI | Planned |
| SC-PROF-03 | Edit profile with invalid values is rejected | Negative / Validation | P2 | UI | Planned |
| SC-PROF-04 | Anonymous request to profile redirects to login | Authorization | P1 | UI | Planned |
| SC-PROF-05 | Change email with OTP | Positive | P2 | UI | Manual |
| SC-PROF-06 | Change password with OTP | Positive | P2 | UI | Manual |
| SC-PROF-07 | Profile image upload | Positive | P3 | UI | Out of scope |

### ADDR — Address management

| ID | Scenario | Type | P | Layer | Status |
|----|----------|------|---|-------|--------|
| SC-ADDR-01 | Add a valid address and it appears in the list | Positive | P1 | UI | Automated |
| SC-ADDR-02 | Delete an address after confirming; list shrinks by one | Positive | P1 | UI | Planned |
| SC-ADDR-03 | Edit an address and the change is saved | Positive | P1 | UI | Planned |
| SC-ADDR-04 | Required fields empty prevents saving | Negative / Validation | P1 | UI | Planned |
| SC-ADDR-05 | Phone and pincode length boundaries | Boundary | P2 | UI | Planned |
| SC-ADDR-06 | Address list pagination (3 per page) | Positive | P2 | UI | Planned |
| SC-ADDR-07 | Empty state shows "No Addresses Saved" | Boundary | P2 | UI | Planned |
| SC-ADDR-08 | A user cannot edit or delete another user's address | Authorization | P1 | API | Planned |
| SC-ADDR-09 | Anonymous request to address pages redirects to login | Authorization | P1 | UI | Planned |

### WISH — Wishlist

| ID | Scenario | Type | P | Layer | Status |
|----|----------|------|---|-------|--------|
| SC-WISH-01 | Product saved from details appears in the wishlist | Positive | P1 | UI | Automated |
| SC-WISH-02 | Remove an item from the wishlist | Positive | P1 | UI | Planned |
| SC-WISH-03 | Adding a duplicate is handled | Negative | P2 | API | Planned |
| SC-WISH-04 | Move wishlist item to cart | Positive | P1 | UI | Planned |
| SC-WISH-05 | Empty wishlist shows "Your Wishlist is Empty" | Boundary | P2 | UI | Planned |
| SC-WISH-06 | Anonymous add and remove return 401 | Authorization | P1 | API | Automated |
| SC-WISH-07 | Anonymous request to the wishlist page redirects to login | Authorization | P1 | UI | Planned |

### WALLET — Wallet

| ID | Scenario | Type | P | Layer | Status |
|----|----------|------|---|-------|--------|
| SC-WALLET-01 | Wallet shows balance and ledger section | Positive | P2 | UI | Automated |
| SC-WALLET-02 | Ledger lists transactions or "No ledger transactions recorded yet." | Boundary | P2 | UI | Planned |
| SC-WALLET-03 | Refund from a cancelled order appears as a credit and raises the balance | Integration | P1 | E2E | Planned |
| SC-WALLET-04 | Wallet pagination (5 per page) | Positive | P3 | UI | Planned |
| SC-WALLET-05 | Top up through Razorpay | Positive | P2 | UI | Out of scope |

### REV, REF, CONTACT

| ID | Scenario | Type | P | Layer | Status |
|----|----------|------|---|-------|--------|
| SC-REV-01 | Review page opens for a delivered, not-yet-reviewed item | Positive | P2 | E2E | Planned |
| SC-REV-02 | Submit a review with rating, title and text; it shows on the product page | Positive | P2 | E2E | Planned |
| SC-REV-03 | Only delivered, non-reviewed items can be reviewed | Negative | P2 | API | Planned |
| SC-REV-04 | Review image upload (max 3) | Positive | P3 | UI | Manual |
| SC-REF-01 | Referral page shows the user's code | Positive | P3 | UI | Planned |
| SC-REF-02 | Referred users list loads | Positive | P3 | UI | Planned |
| SC-REF-03 | ₹100 bonus credited to referrer and referee on signup | Integration | P2 | E2E | Manual |
| SC-CONTACT-01 | Contact page loads | Positive | P3 | UI | Planned |
| SC-CONTACT-02 | Submit with valid data succeeds | Positive | P3 | UI | Planned |
| SC-CONTACT-03 | Required fields empty is rejected | Negative / Validation | P3 | UI | Planned |

---

## 2. Admin side

### ADM-AUTH — Admin authentication

| ID | Scenario | Type | P | Layer | Status |
|----|----------|------|---|-------|--------|
| SC-ADM-AUTH-01 | Admin login with valid credentials reaches the dashboard | Positive | P0 | UI | Automated |
| SC-ADM-AUTH-02 | Unknown email shows "Invalid email address" | Negative | P0 | UI | Planned |
| SC-ADM-AUTH-03 | Wrong password shows "Invalid password" | Negative | P0 | UI | Planned |
| SC-ADM-AUTH-04 | A normal customer's credentials are rejected on the admin login | Authorization | P0 | UI | Planned |
| SC-ADM-AUTH-05 | Admin logout ends the admin session | Session | P1 | UI | Planned |
| SC-ADM-AUTH-06 | Logged-in admin visiting the login page is redirected to the dashboard | Positive | P2 | UI | Planned |
| SC-ADM-AUTH-07 | Anonymous request to admin pages redirects to the admin login | Authorization | P0 | API | Planned |
| SC-ADM-AUTH-08 | A customer session cannot access admin pages or endpoints | Authorization | P0 | API | Planned |

### ADM-DASH — Dashboard

| ID | Scenario | Type | P | Layer | Status |
|----|----------|------|---|-------|--------|
| SC-ADM-DASH-01 | Dashboard loads with revenue, orders and filter | Positive | P0 | UI | Automated |
| SC-ADM-DASH-02 | Changing the filter updates the figures | Positive | P2 | UI | Planned |
| SC-ADM-DASH-03 | Best-selling data loads for an admin | Positive | P2 | API | Planned |
| SC-ADM-DASH-04 | `GET /admin/dashboard-canceled-data` rejects anonymous callers | Authorization | P0 | API | Automated |

> SC-ADM-DASH-04 is automated as a **known failing test** tracking BUG-001 (`test.fail`): the endpoint currently returns 200 to anonymous callers.

### ADM-CUST — Customers

| ID | Scenario | Type | P | Layer | Status |
|----|----------|------|---|-------|--------|
| SC-ADM-CUST-01 | Block then unblock a customer; status badge updates both times | Positive | P1 | UI | Automated |
| SC-ADM-CUST-02 | Search customers by name or email | Positive | P2 | UI | Planned |
| SC-ADM-CUST-03 | A blocked customer cannot log in | Integration | P1 | E2E | Planned |
| SC-ADM-CUST-04 | Customer list pagination | Positive | P3 | UI | Planned |

### ADM-CAT — Categories

| ID | Scenario | Type | P | Layer | Status |
|----|----------|------|---|-------|--------|
| SC-ADM-CAT-01 | Add a category; the total count increases | Positive | P1 | UI | Automated |
| SC-ADM-CAT-02 | Duplicate category returns "Category already exists" | Negative | P1 | API | Planned |
| SC-ADM-CAT-03 | Empty name or description returns "Name and description are required" | Negative / Validation | P1 | API | Planned |
| SC-ADM-CAT-04 | Edit a category | Positive | P1 | UI | Planned |
| SC-ADM-CAT-05 | List and unlist a category | Positive | P1 | UI | Planned |
| SC-ADM-CAT-06 | Add an offer within 1–99 % | Boundary | P2 | API | Planned |
| SC-ADM-CAT-07 | Offer of 0, 100 or negative is rejected ("valid offer percentage between 1 and 99") | Boundary / Negative | P2 | API | Planned |
| SC-ADM-CAT-08 | Remove an offer | Positive | P2 | API | Planned |
| SC-ADM-CAT-09 | An unlisted category is hidden from the shop | Integration | P1 | E2E | Planned |

### ADM-BRAND — Brands

| ID | Scenario | Type | P | Layer | Status |
|----|----------|------|---|-------|--------|
| SC-ADM-BRAND-01 | Toggle a brand's listing status and restore it | Positive | P2 | UI | Automated |
| SC-ADM-BRAND-02 | Add a brand with an image | Positive | P2 | UI | Planned |
| SC-ADM-BRAND-03 | Edit a brand | Positive | P2 | UI | Planned |
| SC-ADM-BRAND-04 | Delete a brand | Positive | P2 | UI | Planned |
| SC-ADM-BRAND-05 | Add and remove a brand offer | Positive | P2 | API | Planned |
| SC-ADM-BRAND-06 | A blocked brand is hidden from the shop | Integration | P2 | E2E | Planned |

### ADM-PROD — Products

| ID | Scenario | Type | P | Layer | Status |
|----|----------|------|---|-------|--------|
| SC-ADM-PROD-01 | Product list loads | Positive | P1 | UI | Automated |
| SC-ADM-PROD-02 | Search returns matching products | Positive | P1 | UI | Automated |
| SC-ADM-PROD-03 | Search with no match shows the empty result | Negative | P1 | UI | Automated |
| SC-ADM-PROD-04 | Block and unblock a product | Positive | P1 | UI | Planned |
| SC-ADM-PROD-05 | A blocked product is hidden from and not purchasable by users | Integration | P1 | E2E | Planned |
| SC-ADM-PROD-06 | Edit a product | Positive | P1 | UI | Planned |
| SC-ADM-PROD-07 | Add and remove a product offer; boundary 1–99 % | Boundary | P2 | API | Planned |
| SC-ADM-PROD-08 | Add a product with four images | Positive | P1 | UI | Manual |

### ADM-COUP — Coupons

| ID | Scenario | Type | P | Layer | Status |
|----|----------|------|---|-------|--------|
| SC-ADM-COUP-01 | Add a valid coupon | Positive | P1 | UI | Automated |
| SC-ADM-COUP-02 | Delete a coupon | Positive | P1 | UI | Automated |
| SC-ADM-COUP-03 | Price order must be Offer < Minimum < Maximum; otherwise "Invalid price range" | Boundary / Negative | P1 | API | Planned |
| SC-ADM-COUP-04 | Start date in the past is rejected | Negative | P1 | API | Planned |
| SC-ADM-COUP-05 | Coupon code equal to coupon name is rejected | Negative | P2 | API | Planned |
| SC-ADM-COUP-06 | Duplicate active coupon name or code is rejected | Negative | P1 | API | Planned |
| SC-ADM-COUP-07 | Edit a coupon | Positive | P2 | UI | Planned |
| SC-ADM-COUP-08 | A new coupon can be applied by a customer at checkout | Integration | P1 | E2E | Planned |

### ADM-ORD — Orders

Allowed transitions (from code): Pending → Shipped → Out for Delivery → Delivered. Delivered and Cancelled are final.

| ID | Scenario | Type | P | Layer | Status |
|----|----------|------|---|-------|--------|
| SC-ADM-ORD-01 | Order list loads with orders or the empty state | Positive | P0 | UI | Automated |
| SC-ADM-ORD-02 | Filter by status updates the URL and filter value | Positive | P1 | UI | Automated |
| SC-ADM-ORD-03 | Advance an order to its next status | Positive | P0 | UI | Automated |
| SC-ADM-ORD-04 | Full chain Pending → Shipped → Out for Delivery → Delivered | Positive | P0 | E2E | Planned |
| SC-ADM-ORD-05 | Invalid transition returns "Cannot change status from X to Y" | Negative | P1 | API | Planned |
| SC-ADM-ORD-06 | A Delivered or Cancelled order is not editable | Negative | P1 | UI | Planned |
| SC-ADM-ORD-07 | Order detail page shows items and customer | Positive | P1 | UI | Planned |
| SC-ADM-ORD-08 | Search orders | Positive | P2 | UI | Planned |

> SC-ADM-ORD-03 skips with a stated reason when no advanceable order exists in the database.

### ADM-RET — Returns

| ID | Scenario | Type | P | Layer | Status |
|----|----------|------|---|-------|--------|
| SC-ADM-RET-01 | Return requests list loads with requests or the empty state | Positive | P1 | UI | Automated |
| SC-ADM-RET-02 | Approve a return request removes it from the pending list | Positive | P1 | UI | Automated |
| SC-ADM-RET-03 | Approval credits the customer's wallet | Integration | P1 | E2E | Planned |
| SC-ADM-RET-04 | Decline a return request | Positive | P1 | UI | Planned |
| SC-ADM-RET-05 | Processing an already processed request returns "already been processed" | Negative | P2 | API | Planned |

> SC-ADM-RET-02 skips with a stated reason when no pending return exists.

### ADM-SALES — Sales report

| ID | Scenario | Type | P | Layer | Status |
|----|----------|------|---|-------|--------|
| SC-ADM-SALES-01 | Sales report page loads | Positive | P2 | UI | Planned |
| SC-ADM-SALES-02 | Filter by date range | Positive | P2 | UI | Planned |
| SC-ADM-SALES-03 | PDF and Excel downloads return the right content type and a non-empty file | Positive | P3 | API | Planned |
| SC-ADM-SALES-04 | Downloaded document content | Data validation | P3 | UI | Out of scope |

---

## 3. End-to-end journeys

| ID | Scenario | Type | P | Layer | Status |
|----|----------|------|---|-------|--------|
| SC-E2E-01 | Purchase: login → browse → product → cart → checkout (COD) → order success → order in history | Positive | P0 | E2E | Planned |
| SC-E2E-02 | Order cancel and refund: place wallet order → cancel → status Cancelled → wallet refunded | Integration | P0 | E2E | Planned |
| SC-E2E-03 | Admin product lifecycle: block product → hidden for user → unblock → visible | Integration | P1 | E2E | Planned |
| SC-E2E-04 | Order lifecycle: customer orders → admin advances to Delivered → customer returns → admin approves → wallet credited | Integration | P1 | E2E | Planned |

---

## 4. Suspected authorization defects (to verify, not confirmed)

Found by reading the route definitions and middleware. Each is a **hypothesis**: it becomes a defect only after an anonymous or wrong-role request proves it. Some inline checks exist in controllers, so a route without middleware is not automatically vulnerable. For example, `/addWishlist` has no middleware but its controller returns 401, and the API test confirms it.

| ID | Hypothesis | Basis | Layer | Status |
|----|-----------|-------|-------|--------|
| SC-SEC-01 | `POST /applyCoupon` and `/removeCoupon` accept anonymous calls | No `checkSession` on route | API | Planned |
| SC-SEC-02 | `POST /createOnlineOrder` and `/onlinePaymentSuccess` accept anonymous calls | No `checkSession` on route | API | Planned |
| SC-SEC-03 | `POST /wallet/createOrder` and `/wallet/paymentSuccess` accept anonymous calls | No `checkSession` on route | API | Planned |
| SC-SEC-04 | `POST /admin/addProductOffer` and `/removeProductOffer` accept anonymous calls | No admin middleware on route | API | Planned |
| SC-SEC-05 | `admincheckSession` routes (`blockCustomer`, `unblockCustomer`, `editCategory`) are reachable without an admin session | Middleware only checks that *an admin account exists*, not who the caller is | API | Planned |
| SC-SEC-06 | `GET /admin/dashboard-canceled-data` accepts anonymous calls | **Confirmed**, see BUG-001 | API | Automated |
| SC-SEC-07 | A customer (user) session can call admin endpoints | Separate session keys; verify both | API | Planned |

---

## 5. Coverage summary

**Totals: 210 scenarios**

| Status | Count |
|--------|-------|
| Automated | 41 |
| Planned (backlog) | 155 |
| Manual | 9 |
| Out of scope | 5 |

By priority (the seven SC-SEC rows carry no priority column, so 203 + 7 = 210):

| Priority | Scenarios | Automated | Planned |
|----------|-----------|-----------|---------|
| P0 | 38 | 18 | 19 |
| P1 | 96 | 19 | 73 |
| P2 | 55 | 3 | 46 |
| P3 | 14 | 0 | 11 |

By recommended layer: UI 131 · API 54 · E2E 25.

By module:

| Module | Total | Automated | Planned | Manual | Out of scope |
|--------|-------|-----------|---------|--------|--------------|
| AUTH | 19 | 3 | 11 | 4 | 1 |
| HOME | 6 | 1 | 5 | 0 | 0 |
| SHOP | 15 | 4 | 11 | 0 | 0 |
| PROD | 11 | 3 | 8 | 0 | 0 |
| CART | 15 | 7 | 8 | 0 | 0 |
| CHKOUT | 11 | 0 | 10 | 0 | 1 |
| COUP | 8 | 0 | 8 | 0 | 0 |
| ORDER | 12 | 1 | 11 | 0 | 0 |
| PROF | 7 | 1 | 3 | 2 | 1 |
| ADDR | 9 | 1 | 8 | 0 | 0 |
| WISH | 7 | 2 | 5 | 0 | 0 |
| WALLET | 5 | 1 | 3 | 0 | 1 |
| REV | 4 | 0 | 3 | 1 | 0 |
| REF | 3 | 0 | 2 | 1 | 0 |
| CONTACT | 3 | 0 | 3 | 0 | 0 |
| ADM-AUTH | 8 | 1 | 7 | 0 | 0 |
| ADM-DASH | 4 | 2 | 2 | 0 | 0 |
| ADM-CUST | 4 | 1 | 3 | 0 | 0 |
| ADM-CAT | 9 | 1 | 8 | 0 | 0 |
| ADM-BRAND | 6 | 1 | 5 | 0 | 0 |
| ADM-PROD | 8 | 3 | 4 | 1 | 0 |
| ADM-COUP | 8 | 2 | 6 | 0 | 0 |
| ADM-ORD | 8 | 3 | 5 | 0 | 0 |
| ADM-RET | 5 | 2 | 3 | 0 | 0 |
| ADM-SALES | 4 | 0 | 3 | 0 | 1 |
| E2E | 4 | 0 | 4 | 0 | 0 |
| SEC | 7 | 1 | 6 | 0 | 0 |

**Reading the numbers**
- Biggest gaps: **CHKOUT, COUP, ORDER** (almost nothing automated) and **AUTH negatives** and **ADM-AUTH**. All are P0/P1 areas.
- 19 of 38 P0 scenarios are still planned. These come first.
- Scenarios are not tests. The 41 automated scenarios map to the 39 existing tests like this: some tests cover two scenarios (the session-active check covers SC-AUTH-09 and SC-HOME-03; the BUG-001 test covers SC-ADM-DASH-04 and SC-SEC-06), the two anonymous-wishlist tests cover one scenario (SC-WISH-06), and SC-ADM-AUTH-01 is exercised by the admin login setup project rather than a spec.

Counts are of scenarios in this document, not of test cases or tests. One scenario can need several test cases. The "Planned" rows are the backlog that drives the next phases.
