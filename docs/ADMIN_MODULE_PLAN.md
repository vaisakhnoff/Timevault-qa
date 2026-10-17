# Phase 6 — Admin Module Plan

> Complete build plan for the admin test suite. Each section lists the Page Object (locators + methods) and the spec (tests + assertions). Selectors verified against the real app views. Admin specs import `test`/`expect` from `fixtures/admin.fixture.ts`, which injects admin POMs (like the user `base.fixture.ts` does); they run under the `admin` project (uses `playwright/.auth/admin.json` via the `setup-admin` dependency).

## Architecture (already done)
- `pages/admin/admin-login.page.ts` — admin login POM.
- `tests/admin.setup.ts` — logs in admin → saves `admin.json`.
- `fixtures/admin.fixture.ts` — extends Playwright `test` to inject admin POMs (`categoryPage`, `brandPage`, …). Re-exports `expect`. Admin specs import from here, mirroring the user `base.fixture.ts`. Add each new POM here as it's built.
- Config projects: `setup-admin` → `admin` (testMatch `tests/admin/*.spec.ts`, storageState admin.json).
- Run admin suite: `npx playwright test --project=admin`.

## Isolation rule (all admin CRUD)
Admin CRUD mutates the shared DB. Use **Faker** for unique names/codes to avoid duplicate conflicts. Where a delete exists, clean up in `afterEach`. Serial mode per spec if a module's tests depend on shared ordering.

---

## Files to create

| Page Object (`pages/admin/`) | Spec (`tests/admin/`) | Module |
|------------------------------|------------------------|--------|
| `category.page.ts` (DONE) | `category.spec.ts` (DONE) | Categories |
| `brand.page.ts` (DONE) | `brand.spec.ts` (DONE) | Brands |
| `product.page.ts` (DONE) | `product.spec.ts` (DONE) | Products (list + search) |
| `coupon.page.ts` | `coupon.spec.ts` | Coupons |
| `customers.page.ts` | `customers.spec.ts` | Customers |
| `admin-orders.page.ts` | `admin-orders.spec.ts` | Orders |
| `dashboard.page.ts` | `dashboard.spec.ts` | Dashboard |

Total: **7 Page Objects + 7 specs**. ~15–18 tests.
Deferred: Products add (image upload — hard), Return requests (needs returned order → Phase 8 E2E), Sales report download (ADVANCED → Phase 12).

---

## 1b. Products — `/admin/products` (list + search; add deferred)

### POM `product.page.ts` (DONE)
Locators:
- `pageTitle` → `getByRole('heading', { name: 'Product Management' })`
- `totalCountBadge` → `getByText(/Total Products:/)`
- `searchInput` → `input[name="search"]`
- `searchButton` → `getByRole('button', { name: 'Search' })`
- `productRows` → `tr[data-product-id]`
- `emptyState` → `getByText('No products found matching your search')`

Methods: `goto()` → `/admin/products`; `getProductCount()`; `search(term)` (GET form submit → `?search=`).

### Spec `product.spec.ts` (@regression) — DONE
- **list loads** — title + total badge visible, rows > 0.
- **search returns matches** — search "Classic" (every seed product name contains it), first row visible + contains term.
- **search no match** — gibberish term → empty state visible, 0 `data-product-id` rows.

#### Implementation notes (learned building it)
- Block/unblock is NOT testable via UI here: `products.ejs` has orphaned JS referencing `.block-button`/`.unblock-button` classes that are never rendered in the row markup (only Edit + offer buttons render). Routes `/blockProduct` `/unblockProduct` exist (API phase could cover them). So Products UI = list + search only.
- List is paginated (8/page, verified 25 total). Empty-state `<tr>` has no `data-product-id`, so `productRows` scoped to `tr[data-product-id]` correctly counts 0 on no-match.
- Add deferred: `/addProducts` needs `uploads.array('images',4)` multi-file upload.

---

## 1. Categories — `/admin/category`

### POM `category.page.ts`
Locators:
- `nameInput` → `#product_name`
- `descriptionInput` → `#descriptionId`
- `addButton` → `form[action="/admin/addCategory"] button[type="submit"]`
- `categoryRows` → `table.table tbody tr`

Methods:
- `goto()` → `/admin/category`
- `getCategoryCount()` → `categoryRows.count()`
- `addCategory(name, description)` → fill both, click add

### Spec `category.spec.ts` (@regression) — DONE
- **add category** — DONE. Faker name (letters+spaces only, 2-50 chars per app validation), desc 10-200.
- (optional) **list/unlist toggle** — not yet done.

#### Implementation notes (learned building it)
- Add is AJAX (`fetch POST /admin/addCategory`) → SweetAlert "Category added successfully" → `location.reload()`. POM must dismiss the dialog (OK button) then wait for reload.
- Client validation: name = letters + spaces only (no digits/punctuation), 2-50 chars; description 10-200 chars. Faker's raw values can violate this → strip non-letters and append a `faker.string.alpha` suffix.
- GOTCHA: the category table is PAGINATED (4 rows/page, "Showing 1 to 4 of 6 entries"). `categoryRows.count()` only sees the current page, so `toHaveCount(before+1)` fails. Assert instead on the true-total label (`/\d+ Categories/` → `getTotalCount()`) and that the new (newest-first) category name is visible on page 1.
- No delete in this UI flow → each run leaves a Faker category. Assertion is total-relative (before+1), so it stays green run-over-run. No cleanup needed/possible here.

---

## 2. Brands — `/admin/brands` (add at `/admin/add-brand`)

NOTE: add-brand requires a `brandImage` file upload (`#brandImage`, `name=brandImage`). Use `setInputFiles` with a small fixture image, OR skip add and test toggle/delete on existing brands. Recommended: test TOGGLE status (no upload needed) + optionally add with a fixture image.

### POM `brand.page.ts`
Locators:
- `addBrandLink` → `a[href="/admin/add-brand"]`
- `brandNameInput` → `#brandName`
- `brandImageInput` → `#brandImage`
- `addButton` → `button:has-text("Add Brand")`
- `brandRows` → `table.table tbody tr`
- `toggleStatusButton` (per row) → button that posts to `/toggle-brand-status/<id>` (scope by row)

Methods:
- `goto()` → `/admin/brands`
- `getBrandCount()` → `brandRows.count()`
- `addBrand(name, imagePath)` → go to add page, fill name, `setInputFiles(imagePath)`, submit
- `toggleFirstBrandStatus()` → click first toggle, handle SweetAlert confirm

### Spec `brand.spec.ts` (@regression) — DONE
- **toggle brand status** — DONE. Flip first brand, assert badge flips, then flip back to restore state.
- **add brand** (upload) — SKIPPED for now (needs fixture image via setInputFiles); toggle gives coverage without it.

#### Implementation notes (learned building it)
- Real selectors (plan guesses were off): toggle button class is `.toggle-status` (NOT `.toggle-brand-status`); each row is `tr[data-brand-id]`; status badge is `.status-cell .tv-badge`.
- Status semantics: `isBlocked=false` → badge "Listed", button "Unlist"; `isBlocked=true` → badge "Unlisted", button "List".
- Toggle flow has NO confirm dialog (unlike delete): fetch → on success `location.reload()`. POM just clicks + waits for load. (Delete uses a SweetAlert confirm.)
- Test is self-restoring: capture original badge text, toggle → assert opposite, toggle back → assert original. Zero net DB change, fully repeatable.
- Brands list is also paginated (same as categories), but toggle test only touches the first row so pagination is irrelevant here.

---

## 3. Coupons — `/admin/coupon` — DONE

### POM `coupon.page.ts` (DONE)
Locators: `#coupon-name`, `#coupon-code`, `#startingDate`, `#expiringDate`, `#offer-price`, `#minimum-price`, `#max-price`, add `#coupon-form button[type="submit"]`. Rows filtered by code badge `.badge.bg-light`.
Methods: `goto()`, `getCouponCount()` (counts `.badge.bg-light`), `rowByCode()`, `addCoupon(data)`, `deleteCouponByCode(code)`.

### Spec `coupon.spec.ts` (@regression, serial) — DONE
- **add coupon** — unique Faker code; assert row visible + count+1.
- **delete coupon** — delete same code; assert count-1 (serial, self-cleaning).

#### Implementation notes (learned building it)
- VALIDATION gotchas (client-side, block submit with inline `.error-message`, NO SweetAlert):
  - Coupon **name** must be ALPHANUMERIC only — NO spaces ("TestCoupon" ok, "Test Coupon" rejected). 1-50 chars.
  - Price rule: `offerPrice < minimumPrice < maxPrice` (strict). Used 100/500/1000.
  - Dates must be today-or-future, end >= start. Used ISO yyyy-mm-dd, today & +30d.
- Add is AJAX (`fetch POST /admin/addCoupon`) → success SweetAlert "Success!" (auto-timer 2s, no confirm button) → `location.reload()`. POM waits for the dialog text then for load.
- Delete: button `confirmDelete()` → SweetAlert confirm "Delete" → AJAX GET `/admin/deletecoupon?id=` → "Deleted!" + OK → reload.
- COUNTING gotcha: each row has TWO badges (code badge `.badge.bg-light` + status badge `.badge-success`/`-danger`). Count the code badge only, else you double-count. Empty-state is a colspan `tr` with no code badge.
- Payload keys match form `name` attrs: couponName, couponCode, startDate, endDate, offerPrice, minimumPrice, maxPrice.

---

## 4. Customers — `/admin/users`

Block/unblock are GET links/buttons with `data-id`; buttons have classes `blockCustomer` / `unblockCustomer`. Routes use `admincheckSession` (note: possible authz quirk vs adminIsLogin — Phase 7).

### POM `customers.page.ts`
Locators:
- `customerRows` → `table.table tbody tr`
- `blockButton` → `button.blockCustomer` (per row, by data-id)
- `unblockButton` → `button.unblockCustomer`
- `searchInput` → the search `input[name="search"]`

Methods:
- `goto()` → `/admin/users`
- `search(term)` → fill + submit (to target a specific test customer)
- `blockFirst()` / `unblockFirst()` → click, handle confirm/reload

### Spec `customers.spec.ts` (@regression) — DONE
- **block then unblock a customer** — search throwaway customer, ensure Active, block → assert "Blocked", unblock → assert "Active". Self-restoring.
IMPORTANT: never block the account used by `user.json`. Hard guard in spec asserts TARGET != PROTECTED_USER.

#### Implementation notes (learned building it)
- Live customers (local DB): `vaisakhnofficial@gmail.com` = TEST_USER (user.json) → PROTECTED. `svvasudevam@gmail.com` = safe throwaway TARGET.
- Selectors: search `input[name="search"]` (GET → `?search=`); row status badge `.tv-badge` ("Active"/"Blocked"); block btn `.blockCustomer`, unblock btn `.unblockCustomer` (event-delegated, data-id).
- Block flow: click `.blockCustomer` → SweetAlert confirm "Yes, block user" → fetch `/admin/blockCustomer?id=` → success "User Blocked" + OK → `location.reload()`. Unblock symmetric ("Yes, unblock user" / "User Unblocked").
- Routes use `admincheckSession` (vs `adminIsLogin` elsewhere) — authz quirk noted for Phase 7.
- GOTCHA: standalone node scripts using `admin.json` can 302 to /admin/login if the saved state is stale; the `admin` project refreshes it via `setup-admin` dependency, so tests are fine. Refresh manually with `--project=setup-admin` if debugging outside the suite.
- Test normalizes to Active first (unblocks if found Blocked) so it's robust to prior interrupted runs.

---

## 5. Orders (admin) — `/admin/orders`

### POM `admin-orders.page.ts`
Locators:
- `statusFilter` → `select[name="status"]`
- `orderRows` → `table.table tbody tr`
- `pageTitle` / heading
- `viewLink` (per row) → `a[href^="/admin/order/"]`
- `statusUpdateControl` → the status `<select>`/button on order detail (posts `/update-order-status`)
- `emptyState` → "no orders" text (verify)

Methods:
- `goto()` → `/admin/orders`
- `getOrderCount()`
- `filterByStatus(status)` → selectOption on `statusFilter`, assert URL/rows
- `openFirstOrder()` → click first view link
- `updateStatus(newStatus)` → on detail page, change status, confirm

### Spec `admin-orders.spec.ts` (@regression)
- **orders list loads** — goto, assert title + (rows OR empty state).
- **filter by status** — select "Pending", assert URL has status / rows match (resilient if none).
- **update order status** (only if an order exists) — open an order, advance status, assert it changed. May need a seeded order; if none, mark skipped with reason.

---

## 6. Dashboard — `/admin/dashboard`

View-only. Stats are AJAX-loaded (ids `#revenueValue`, `#ordersValue`).

### POM `dashboard.page.ts`
Locators:
- `pageTitle` → heading "Business Overview"
- `revenueValue` → `#revenueValue`
- `ordersValue` → `#ordersValue`
- `globalFilter` → `#globalFilter`

Methods:
- `goto()` → `/admin/dashboard`

### Spec `dashboard.spec.ts` (@regression)
- **dashboard loads with stats** — goto, assert title visible, assert `revenueValue` contains "₹", assert `ordersValue` visible. (web-first assertions auto-wait for AJAX load.)

---

## Build order & commits
1. Categories (finish) → run `--project=admin` → commit.
2. Dashboard (quick view-only) → commit.
3. Coupons (add+delete, Faker) → commit.
4. Customers (block/unblock a throwaway user) → commit.
5. Brands (toggle; add w/ fixture image if doing upload) → commit.
6. Orders (list + filter + status if seeded) → commit.
7. Full `npm test` green → add Phase 6 interview Qs → push.

## Risks / watch-outs
- SweetAlert confirms on delete/toggle/block → dismiss inside POM action (established pattern).
- Shared DB mutations → Faker unique data + afterEach cleanup where delete exists.
- NEVER block the user-suite account.
- Some adds (brand) need file upload → `setInputFiles`; keep a tiny fixture image in `tests/fixtures/`.
- Order status update needs an existing order; skip-with-reason if DB has none.
