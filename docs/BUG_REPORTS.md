# TimeVault — Defect Reports

Defects found during QA automation of the TimeVault e-commerce application.
Each defect is backed by an automated test and reproducible evidence.

| ID      | Title                                                       | Severity | Type                              | Status                                  |
| ------- | ----------------------------------------------------------- | -------- | --------------------------------- | --------------------------------------- |
| BUG-001 | Admin dashboard endpoint accessible without authentication  | High     | Broken Access Control (OWASP A01) | Fixed, verified by regression test      |
| BUG-002 | Intermittent logged-out state after successful login        | High     | Functional / race condition       | Fixed, verified by repeated setup runs  |
| BUG-003 | Signup rejects valid emails with an ending longer than 4 letters | Medium | Input validation | Open |
| BUG-004 | Cancelling an individual pending order item does not restore product stock | High | Data integrity / inventory management | Open |
| BUG-005 | `/updateCart` bypasses the 4-per-product cart limit | Medium | Business rule bypass | Open |
| BUG-006 | `/addToCart` does not validate non-positive quantities | Low | Input validation | Open |
| BUG-007 | `/addWishlist` stores product ids that do not exist | Low | Input validation / data integrity | Open |

Application builds referenced below are commits of the TimeVault application repository.

---

## BUG-001: Admin dashboard endpoint accessible without authentication

- **Severity:** High
- **Type:** Broken Access Control (OWASP A01:2021)
- **Status:** Fixed, verified by regression test
- **Component:** Admin → Dashboard analytics
- **Endpoint:** `GET /admin/dashboard-canceled-data`
- **Environment:** Local — `http://localhost:3000` (Node/Express + MongoDB)
- **Found by:** Automated API authorization test — `tests/api/authorization.spec.ts`
- **Fixed in:** application commit `c00e6ca` ("fix(admin): require admin session on remaining admin routes")

### Description

The admin analytics endpoint `GET /admin/dashboard-canceled-data` had no authentication
middleware. An unauthenticated caller (no session cookie) received `HTTP 200` and the
admin dashboard analytics payload. Every sibling admin dashboard route
(`/admin/dashboard`, `/admin/dashboard-data`, `/admin/best-selling`,
`/admin/download-report`) was protected with `auth.adminIsLogin`; this route was not.

### Steps to reproduce (before the fix)

1. Ensure you are NOT logged in (no session cookie).
2. Send: `GET http://localhost:3000/admin/dashboard-canceled-data`
3. Observe the response.

```
curl -i http://localhost:3000/admin/dashboard-canceled-data
```

### Expected result

The endpoint requires an authenticated admin session, consistent with all other
`/admin/*` dashboard routes. An anonymous caller must not receive data.

### Actual result (before the fix)

```
HTTP 200
{"labels":[],"canceledData":[],"returnedData":[]}
```

The endpoint executed and returned the analytics structure with no authentication.
The arrays were empty in the test database, but the endpoint would return
cancelled/returned order analytics whenever such data existed.

### Impact

Any unauthenticated party could reach an admin-only analytics endpoint. Beyond the data
itself, it signalled a gap in access-control enforcement that could apply to other routes.

### Fix

Add the admin auth middleware to the route, matching the other dashboard routes:

```js
router.get(
  '/dashboard-canceled-data',
  auth.adminIsLogin,
  dashboardController.getCanceledAndReturnedData,
);
```

The same commit also added `auth.adminIsLogin` to `POST /admin/addProductOffer`,
`POST /admin/removeProductOffer`, and replaced `auth.admincheckSession` on
`GET /admin/blockCustomer`, `GET /admin/unblockCustomer` and
`POST /admin/editCategory/:id`. `admincheckSession` only checks that _some_ admin account
exists in the database, not that the caller is logged in, so it does not protect a route.
Those additional routes were identified from code review and were not exploited before
the fix; they are tracked as scenarios SC-SEC-04 and SC-SEC-05 for API verification.

### Verification

Regression test `tests/api/authorization.spec.ts` →
"anonymous caller is redirected to admin login from /admin/dashboard-canceled-data".
The API client does **not** follow redirects (`maxRedirects: 0`) so the test sees the
real response: it asserts `302` with a `Location` header containing `/admin/login`.
Result after the fix: passing; the endpoint answers `302 → /admin/login`.

> Note: an earlier version of this test followed redirects, so a fixed endpoint would
> still have appeared to return `200` (the login page). It could not detect the fix.
> That version was corrected before this verification.

---

## BUG-002: Intermittent logged-out state after successful login

- **Severity:** High
- **Type:** Functional defect / race condition (session persistence)
- **Status:** Fixed, verified by repeated setup runs
- **Component:** User authentication → login
- **Endpoint:** `POST /login`
- **Environment:** Local — `http://localhost:3000`; session store `connect-mongo` (MongoDB)
- **Found by:** Authentication setup in `tests/auth.setup.ts`, run repeatedly
  (`--repeat-each=20 --workers=1`)
- **Introduced by:** application commit `ff2f2ce` ("Improve load speed: … Mongo session
  store …", 2026-10-26), which moved sessions from the default in-memory store to MongoDB
- **Fixed in:** application commit `e5b560d` ("fix(auth): save session before redirect after login")

### Description

After a login with valid credentials, the user is sometimes redirected to the home page
**still logged out** (header shows "Login" / "Join Vault" instead of the user menu). The
login controller assigned the session and redirected in the same step:

```js
req.session.user = findUser._id;
res.redirect('/');
```

With an asynchronous session store the redirected request can reach `/` before the
session has been written, so the server sees no session for that request.

### Steps to reproduce (before the fix)

1. Run the application with the MongoDB session store (commit `ff2f2ce`).
2. Log in with valid credentials through the browser, repeatedly (a new browser context
   each time). The Playwright setup does exactly this:
   ```
   npx playwright test --project=setup-user --repeat-each=20 --workers=1
   ```
3. Count how many attempts land on `/` without the user menu (`#userMenuBtn`).

### Expected result

Every successful login lands on the home page as an authenticated user.

### Actual result (before the fix)

Intermittent failures. Observed in two 20-run samples: **7 of 20** and **6 of 20** attempts
failed (about 30–35 %). Failing attempts ended on `/` with the Login and Join Vault links
visible. A plain HTTP client (`curl`) did not reproduce it in the few checks made, most
likely because it waits for the whole response before the next request, whereas a browser
follows the redirect immediately.

### Impact

Real users would intermittently appear logged out right after entering correct
credentials, which makes the core sign-in flow unreliable. It also made every
authenticated automated test unreliable, because they all depend on that login.

### Fix

Save the session explicitly and redirect only after the store confirms the write:

```js
req.session.user = findUser._id;

req.session.save((error) => {
  if (error) {
    console.error('Session save error:', error);
    return res.render('login', { message: 'Login failed, Please try again later' });
  }
  return res.redirect('/');
});
```

This is the pattern the `express-session` documentation recommends for redirects.

### Verification

After the fix the same command passed **20 of 20** runs. Result: stable for the tested
sample (a sample can show absence of failure, not prove it).

### Related observation (code review, not tested)

The Google OAuth callback in `controllers/user/userController.js` uses the same pattern
(`req.session.user = user._id;` followed immediately by `res.redirect('/')`) and was not
changed. It likely has the same race. Google login is out of scope for automation (see
`docs/TEST_PLAN.md`), so this is recorded as a recommendation: apply the same
`req.session.save()` before redirecting.

---

## BUG-003: Signup rejects valid emails with an ending longer than 4 letters

- **Severity:** Medium
- **Type:** Input validation (client-side, over-restrictive)
- **Status:** Open
- **Component:** User authentication → signup
- **Page:** `GET /signup` (client-side validation in `views/user/signup.ejs`)
- **Environment:** Local — `http://localhost:3000`, Chromium
- **Found by:** Boundary analysis of the signup email rule, confirmed in a browser and tracked by
  `tests/user/signup-forgot-password.spec.ts` ("email ending of 7 letters is accepted by signup validation")

### Description

The signup form validates the email with a pattern that allows only 2 to 4 letters after the
final dot (`\.[a-zA-Z]{2,4}$`). Many valid, in-use endings are longer (`.photos`, `.store`,
`.digital`, `.travel`, `.museum`), so real customers with such addresses cannot register.
The admin login form in the same application allows 2 to 6 letters, so the two rules are
also inconsistent with each other.

### Steps to reproduce

1. Open `/signup`.
2. Type `qa@example.photos` (or `qa@example.digital`) into the email field and leave the field.
3. Observe the inline message under the field.

### Expected result

No inline error. The address is syntactically valid.

### Actual result

Inline error "Email is invalid" under the email field, and the form cannot be submitted.

| Email | Result |
| --- | --- |
| `qa@example.com` | accepted |
| `qa@example.info` (4 letters) | accepted |
| `qa@example.photos` (6 letters) | **rejected** |
| `qa@example.digital` (7 letters) | **rejected** |

### Impact

Customers with longer, legitimate email endings cannot create an account. This silently turns
away users and is hard for them to diagnose, because the address is correct.

### Recommendation

Allow endings of at least 2 letters without an upper limit that excludes real endings, for
example `[a-zA-Z]{2,}`, and use the same rule in signup and admin login.

### Evidence

- Browser probe against the running application (table above).
- Automated test: `tests/user/signup-forgot-password.spec.ts`. The 4-letter boundary test
  passes. The 7-letter test asserts the correct behaviour and is marked `test.fail('BUG-003')`,
  so the suite stays green while the defect is open and the test is flagged as soon as it is
  fixed.

### Scope note

Only the browser-side rule was tested. Whether the server also rejects such addresses was not
checked, because a full signup would send a real OTP email.


---

## BUG-004: Cancelling an individual pending order item does not restore product stock

- **Severity:** High
- **Type:** Data integrity / inventory management
- **Status:** Open
- **Component:** User orders → item cancellation
- **Endpoint:** `POST /order/cancelItem`
- **Environment:** Local — `http://localhost:3000`
- **Found by:** Phase 5/6 checkout and order-lifecycle test design review

### Description

The user-facing order-detail page exposes only **Cancel Item**. Its handler marks the item as
`Cancelled` and may credit a wallet refund for completed Online/Wallet payments, but it never
increments the related product's `quantity`. A cancelled COD order therefore permanently reduces
available inventory.

### Expected result

Cancelling a pending item should restore the cancelled quantity to product stock, matching the
legacy whole-order cancellation handler's inventory behavior.

### Actual result

`cancelOrderItem` sets `item.status = 'Cancelled'` and saves the order without updating the
Product record. The only controller path that restores stock is the legacy whole-order
`cancelOrder` action, which has no UI control in `orderDetails.ejs`.

### Impact

Repeated customer cancellations reduce stock until a product appears out of stock despite the
items never being fulfilled. Automated tests cannot safely use item cancellation as cleanup.

### Recommended fix

In the successful `cancelOrderItem` path, increment the product stock before saving the order:

```js
await Product.findByIdAndUpdate(item.productId, {
  $inc: { quantity: item.quantity },
});
```

Then cover the behavior with a regression test: order quantity decreases stock, cancellation
restores it, and the final stock matches its initial value.

---

## BUG-005: `/updateCart` bypasses the 4-per-product cart limit
- **Severity:** Medium
- **Type:** Business rule bypass
- **Status:** Open
- **Component:** User cart → quantity update
- **Endpoint:** `POST /updateCart`
- **Environment:** Local — `http://localhost:3000`, application build `c00e6ca`
- **Found by:** Phase 7 API boundary tests (`tests/api/cart-api.spec.ts`)
### Description
`/addToCart` limits each product line to `Math.min(product.quantity, 4)`. `/updateCart` only
compares the requested quantity against product stock, so a direct request can set a line to any
quantity up to the full stock level.
### Steps to reproduce
1. Log in as a customer.
2. `POST /addToCart` with `{ "id": "6aad1146c76606074021e7ec", "quantity": 1 }` (product stock 18).
3. `POST /updateCart` with `{ "items": [{ "productId": "6aad1146c76606074021e7ec", "quantity": 5 }] }`.
4. Open `/cartPage`.
### Expected result
Step 3 answers `400` with a message that at most 4 units are allowed per product.
### Actual result
Step 3 answers `200 {"success":true,"message":"Cart updated successfully"}`. The cart page renders
the line with quantity 5. A follow-up `POST /addToCart` with quantity 1 answers
`400 "You can only have a maximum of 4 quantities of this product in your cart"`, which confirms
the stored quantity is already above the limit. Reproduced on two consecutive runs.
### Impact
Customers can order more units of a product than the per-product rule allows by calling the
endpoint directly. The UI hides the issue because the quantity stepper clamps at 4.
### Root cause
`controllers/user/cartController.js` `updateCart` checks only
`updatedItem.quantity > product.quantity`. It never applies the `Math.min(product.quantity, 4)`
limit used by `addToCart`, and it has no lower bound.
### Recommended fix
Apply the same limit as `addToCart` before updating the line:
```js
const maxAllowed = Math.min(product.quantity, 4);
if (!Number.isInteger(updatedItem.quantity) || updatedItem.quantity < 1 || updatedItem.quantity > maxAllowed) {
  return res.status(400).json({
    success: false,
    message: `Maximum ${maxAllowed} quantities allowed per product`,
  });
}
```
### Regression test
`Cart API › POST /updateCart › rejects quantity above the per-product limit (5) with 400`,
marked `test.fail('BUG-005')` while the defect is open.

---

## BUG-006: `/addToCart` does not validate non-positive quantities
- **Severity:** Low
- **Type:** Input validation
- **Status:** Open
- **Component:** User cart → add item
- **Endpoint:** `POST /addToCart`
- **Environment:** Local — `http://localhost:3000`, application build `c00e6ca`
- **Found by:** Phase 7 API boundary tests (`tests/api/cart-api.spec.ts`)
### Description
The handler reads `parseInt(req.body.quantity) || 1` and checks only the upper limit.
- Quantity `0` is falsy, so `|| 1` silently turns it into `1` and the item is added.
- Quantity `-1` passes the handler. The cart schema (`quantity: { min: 1 }`) then throws a
  Mongoose `ValidationError` on `cart.save()`, and the `catch` block answers `500`.
### Steps to reproduce
1. Log in as a customer. Make sure product `6aad1146c76606074021e7ec` is not in the cart.
2. `POST /addToCart` with `{ "id": "6aad1146c76606074021e7ec", "quantity": 0 }`.
3. `POST /addToCart` with the same id and `"quantity": 3`, then again with `"quantity": 1`.
4. Remove the product from the cart, then `POST /addToCart` with `"quantity": -1`.
### Expected result
Steps 2 and 4 answer `400` with a validation message for any quantity below 1.
### Actual result
- Step 2: `200 {"success":true,"message":"Product added to cart successfully"}`.
- Step 3: quantity 3 is accepted, then quantity 1 is rejected with
  `400 "You can only have a maximum of 4 quantities ..."`. This proves step 2 stored 1 unit.
- Step 4: `500 {"success":false,"message":"Error adding item to cart"}`.
- Reproduced on two consecutive runs.
### Impact
No invalid data is stored, because the schema guards the database. Clients still get a misleading
success for quantity 0 and a server-error status for bad input, and every negative request
writes an error to the server log.
### Root cause
`controllers/user/cartController.js` `addToCart` has no lower-bound check, and the `|| 1`
fallback treats `0` the same as a missing value.
### Recommended fix
Validate the quantity before any database work:
```js
const quantity = Number.parseInt(req.body.quantity, 10);
if (!Number.isInteger(quantity) || quantity < 1) {
  return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
}
```
### Regression tests
`Cart API › POST /addToCart › rejects quantity 0 with 400 @negative` and
`rejects a negative quantity (-1) with 400 @negative`, both marked `test.fail('BUG-006')` while
the defect is open.

---

## BUG-007: `/addWishlist` stores product ids that do not exist
- **Severity:** Low
- **Type:** Input validation / data integrity
- **Status:** Open
- **Component:** User wishlist → add item
- **Endpoint:** `POST /addWishlist`
- **Environment:** Local — `http://localhost:3000`, application build `c00e6ca`
- **Found by:** Phase 7 API tests (`tests/api/wishlist-api.spec.ts`)
### Description
`addWishlist` pushes `req.body.id` into the wishlist without checking that a product with that id
exists. A well-formed but unknown ObjectId is saved. A malformed id fails the ObjectId cast on
save and is answered as a server error.
### Steps to reproduce
1. Log in as a customer.
2. `POST /addWishlist` with `{ "id": "000000000000000000000000" }`.
3. Send the same request again.
4. Open `/wishlist`.
5. `POST /addWishlist` with `{ "id": "not-an-id" }`.
### Expected result
Step 2 answers `404 Product not found`, the same way `/addToCart` handles an unknown product.
Step 5 answers `400` for a malformed id.
### Actual result
- Step 2: `200 {"success":true,"message":"Product added to wishlist"}`.
- Step 3: `200 {"success":false,"message":"Product already exists in wishlist"}`. This proves
  the unknown id was stored.
- Step 4: the page renders `200` and does not show the entry, because `populate` returns `null`
  and the view filters it out.
- Step 5: `500 {"success":false,"message":"Error adding product to wishlist"}`.
- Reproduced on two consecutive runs.
### Impact
Orphan entries accumulate in the `wishlists` collection and are invisible to the customer, so
they cannot remove them from the UI. The success response misleads API clients. Malformed ids
write a server error to the log.
### Root cause
`controllers/user/wishlistController.js` `addWishlist` validates only that `id` is present. It
never calls `Product.findById`, and it does not validate the id format.
### Recommended fix
Validate the id and the product before saving:
```js
if (!mongoose.isValidObjectId(id)) {
  return res.status(400).json({ success: false, message: 'Invalid product id' });
}
const exists = await Product.exists({ _id: id });
if (!exists) {
  return res.status(404).json({ success: false, message: 'Product not found' });
}
```
### Regression test
`Wishlist API › POST /addWishlist rejects a non-existent product with 404 @negative`, marked
`test.fail('BUG-007')` while the defect is open.
