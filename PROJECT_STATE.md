# TimeVault QA — Project State

> Living handoff doc. Updated at the end of each phase.

## Working mode
- Mentor + pair-programmer model. User writes the code; Kiro teaches concept → approach → task → review.
- Do NOT auto-generate full framework/POMs/suites/fixtures unless explicitly asked. One task at a time.
- Every task must produce real project artifacts aligned with the blueprint (no throwaway exercises).
- Source of truth: `timevault-qa-blueprint.md` (workspace root).
- App under test: `~/Documents/Time-Vault-ecommerce-web-app`, runs on `http://localhost:3000` (`npm start`).

## Key app facts (verified)
- Express + express-session + Passport (Google OAuth) + EJS + MongoDB/Mongoose. Routers at `/` and `/admin`.
- Cart limit = `Math.min(product.quantity, 4)`; returns HTTP 400 when exceeded.
- Login page `/login`: inputs `#email`, `#password` (no `<label>`s), submit button text "Log In",
  heading `<h3>Log in to enter</h3>`, error `div[role=alert]`.
- Missing-auth bug targets (for later API/authz tests): user routes /addWishlist, /removeFromWishlist,
  /createOnlineOrder, /onlinePaymentSuccess, /applyCoupon, /removeCoupon, /wallet/createOrder,
  /wallet/paymentSuccess; admin /admin/dashboard-canceled-data (no auth); admincheckSession vs adminIsLogin.

## Roadmap (13 phases)
1 QA Planning → 2 Project Setup → 3 Framework Foundation (POM/components/fixtures) → 4 Auth tests (storageState)
→ 5 User module → 6 Admin module → 7 API (incl. missing-auth) → 8 E2E + tagging → 9 Allure → 10 Jenkins
→ 11 cross-browser + parallel → 12 bug hunting + RTM → 13 portfolio polish.
Adjustments: treat blueprint test counts as rough capacity, not targets; boundary tests account for min(stock,4) incl. stock=0 and lower edges.

## Completed
- **Phase 1 (QA Planning):** `docs/TEST_PLAN.md` written by user, reviewed. git init, `.gitignore`, `docs/`.
  Commit `d5cd494` "docs: add project blueprint, test plan, and gitignore".
- **Phase 2 (Project Setup):** npm init, Playwright + TypeScript installed, browsers OK.
  `playwright.config.ts` baseURL=http://localhost:3000. `tests/smoke.spec.ts` (2 tests, @smoke, describe block) green.
  npm scripts: test / test:headed / test:ui / report. Commit `4bb5524`.

## Completed (cont.)
- **Phase 3 (Framework Foundation):** DONE.
  - `config/env.config.ts` — config object (baseUrl + user/admin creds, fallbacks). NOTE: `import 'dotenv'` does NOT load `.env`; needs `import 'dotenv/config'` (deferred to Phase 4).
  - `pages/user/login.page.ts` — LoginPage POM. Locators use unique IDs `#email`/`#password` (deployed site has a footer newsletter email field → `getByPlaceholder('email')` caused strict-mode violation; IDs fixed it). Methods: goto, login, expectLoginVisible, expectLoginError, click* helpers.
  - `fixtures/base.fixture.ts` — extends `test` to inject `loginPage`, re-exports `expect`. Working.
  - `tests/smoke.spec.ts` — imports from fixture. Test 1 (login page loads) PASS. Test 2 (valid login) `test.skip` until Phase 4 (needs real account + dotenv).
  - **baseURL switched to deployed Render app:** `https://time-vault-ecommerce-web-app.onrender.com/`. Slower/cold-start → config timeouts raised: test 90s, expect 15s, navigation 60s, action 20s.
  - 6 tests green (1 skipped). `.env` currently empty (loads 0 vars).

## Completed (cont.)
- **Phase 4 (Authentication):** DONE.
  - dotenv wired at top of `playwright.config.ts` (`dotenv.config({ path: ... })`). `.env` loads (5 vars). `.env.example` committed with placeholders.
  - User has a real registered account on the Render site; creds in `.env` (TEST_USER_EMAIL/PASSWORD).
  - `tests/auth.setup.ts` — setup project logs in once via LoginPage, waits `networkidle` then `waitForURL(/\/$/)`, saves `playwright/.auth/user.json` (gitignored). Reliable after adding networkidle wait.
  - `playwright.config.ts` projects: `setup` (testMatch *.setup.ts) → `chromium` depends on setup + uses `storageState: playwright/.auth/user.json`. firefox/webkit left logged-out (no storageState).
  - `tests/smoke.spec.ts` — uses `test.use({ storageState: { cookies: [], origins: [] } })` to force logged-OUT for login-page smoke tests.
  - `tests/auth.spec.ts` — authenticated proof test: goto `/`, assert Logout link visible (session testing). Header is conditional on `user` var; Logout link href=/logout only renders when logged in. FIX APPLIED: import from `../fixtures/base.fixture` (was `@playwright/test`).
  - 8 tests green (setup + smoke on 3 browsers + auth proof on chromium).
  - FINAL config: Pattern B. chromium = full authenticated suite (storageState + dependencies:['setup']). firefox/webkit = logged-out, `grep: /@smoke/` only (fast cross-browser).
  - auth.spec proof uses `#userMenuBtn` visible (Logout link is hidden in a dropdown → not usable for toBeVisible).

## Current phase: 5 — User Module tests (IN PROGRESS)
Build real POMs + tests for user features. Order: shop/browse → product details → cart (boundary: min(stock,4), incl stock=0) → wishlist → address → profile → wallet.
- Shop route: `/shopPage`. Local view `views/user/shop.ejs` (newer "vault" UI; deployed likely matches). Has: search form `#searchInput` name="search" action=/shopPage GET; category filter list; brand chips; price range; product cards + sort + pagination further down.
- Deployed UI differs from older local snapshots — ALWAYS verify selectors against live site (use codegen/inspector), don't trust old EJS reads.

### Phase 5 goal: complete user module in one session
Order (MUST-HAVE core journey):
1. Shop — browse DONE, search +/- DONE; sort test IN PROGRESS (native `#sortSelect`, selectOption, verify ascending prices via `.vault-price-current` parsed).
2. Product Details — `/productDetails?id=...`; verify name/price/stock render; add-to-cart/wishlist buttons.
3. Cart — add, update qty, remove; BOUNDARY: max = min(stock,4), stock=0, qty>limit → HTTP 400. Richest QA.
4. Wishlist — add, remove, move to cart.
5. Address — CRUD (add/edit/delete), 3/page pagination.

DEFERRED (justified): profile image upload (base64/canvas + ephemeral images), wallet top-up (Razorpay OOS), full checkout/orders (E2E phase 8), change email/password (OTP OOS).

Shop selectors: sort `<select id="sortSelect">` values newest|price_asc|price_desc|name_asc|name_desc → sets `?sort=`; price `.vault-price-current` (₹ + Indian commas), original `.vault-price-original`; empty state `<h4>No Timepieces Found</h4>`; card `.vault-product-card`; name `.vault-product-name`; count `#productCount`; search `#searchInput` + title "Execute Search"; detail link `/productDetails?id=<id>`; add-to-cart `a[title="Add to Bag"]`; wishlist `a[title="Save to Wishlist"]`.

## Open decisions / notes
- App also runs locally (`~/Documents/Time-Vault-ecommerce-web-app`, :3000) but tests target deployed Render URL.
- `.env` gitignored; `.env.example` committed.
- Cart boundary rule reminder: max = min(stock, 4); test stock=0, lower edges (0, negatives, non-integers), HTTP 400 on exceed.
- Commit typo in `4bb5524` ("projectwith") — left as-is.

## Phase 11 optimization backlog
- storageState setup re-runs login on EVERY run (setup is a chromium dependency). Correct for CI (fresh session) but wasteful for local single-file iteration. OPTIMIZE in Phase 11: conditionally `setup.skip()` if `playwright/.auth/user.json` exists and is fresh (e.g. < 1h via fs.statSync mtime). Keep always-run default for now; document as deliberate perf improvement.
- Shop sort: used URL-driven `goto('/shopPage?sort=...')` because native `#sortSelect` is hidden behind a custom dropdown widget (selectOption timed out — not visible). URL approach tests sort correctness directly.

## Phase 5 progress
- Shop module COMPLETE: browse, search +/-, sort (price_asc ascending verified). 5 tests green on chromium.
- Product Details, Cart (incl. boundary min(stock,4) → "Limit Reached" SweetAlert), Wishlist, Address modules DONE.
- Phase 5b (view-only pages) DONE: Profile, Wallet, Orders POMs + specs. Full suite 23 green on chromium.

## Environment switch (local vs Render)
- `playwright.config.ts` now reads `baseURL` from `process.env.BASE_URL` (fallback http://localhost:3000). Switch envs by editing ONE line in `.env`.
- Timeouts lowered for local speed: test 60s, expect 10s, navigation 30s, action 15s.
- Local app: `~/Documents/Time-Vault-ecommerce-web-app` `npm start` → http://localhost:3000. Local DB shares same seed as deployed (Titan id 6aad1146c76606074021e7ec resolves on both; test user likely exists on both).
- Render free tier is slow/cold-start → prefer local for dev. For CI/portfolio demo can point BASE_URL back to Render.

## Cart module notes (SweetAlert handling)
- App uses SweetAlert2 everywhere; backdrop blocks Playwright clicks. PATTERN: dismiss the dialog as part of the POM action that triggers it.
  - `addToCart()` clicks "Continue Browsing" after add.
  - `removeFirstItem()` clicks remove → confirm "Remove" → app shows success dialog then `window.location.reload()`; wait for load.
- Cart tests use `test.describe.configure({ mode: 'serial' })` — single shared account cart can't be mutated by parallel workers (was causing detached-element races + count flipping).
- Use web-first `expect(cartItems).toHaveCount(0)` not one-shot `getItemCount()`+toBe (reload is async).
- afterEach `removeAllItems()` for isolation. Count (rows) vs quantity (units in a row) are distinct.

## Phase 7 API authorization targets (confirmed in code)
- `POST /addWishlist` and `POST /removeFromWishlist` have NO `auth.checkSession` (GET /wishlist does). Real authz gap → Phase 7 API test: call these WITHOUT a session, assert they should reject (likely don't → documentable bug).
- Cart boundary matrix for Phase 7 API: `/addToCart` qty 1✅ 4✅ 5→400 0→? ; `/updateCart` qty>stock→400; min(stock,4) low-stock edge (stock=2 → limit 2).
- Wishlist add success dialog title "Vault Wishlist" (default OK button). addToCart success "Allocated to Bag" (Continue Browsing / View Bag).

## Phase 5 progress (cont.)
- Cart module COMPLETE: add, update qty, remove, isolation (serial + afterEach). Case A boundary (stepper clamps at 4) in product-details.spec @boundary. Case B (cart >4 alert) intentionally dropped → covered authoritatively in Phase 7 API.
- NEXT: Wishlist module, then Address. Then commit + close Phase 5.

## PHASE 5 COMPLETE (User Module)
Modules done, all green on chromium (local http://localhost:3000):
- Shop: browse, search +/-, sort (price_asc ascending). 5 tests.
- Product Details: info display, add-to-cart w/ qty, @boundary stepper clamps at 4. 3 tests.
- Cart: add, update qty, remove, isolation (serial + afterEach removeAllItems). SweetAlert dismiss pattern.
- Wishlist: add appears in wishlist (serial + cleanup). wishlistButton via getByTitle('Save to Wishlist'); add dialog "Vault Wishlist" OK.
- Address: add (Faker data) + delete, CRUD. @faker-js/faker installed (devDep). addressCards via getByTitle('Delete Address'). Submit "Save Address". waitForURL(/\/userAddress/) — glob **/userAddress fails on query params ?message=...&status=success.

Key gotchas learned this phase:
- Playwright glob `**/path` anchors to END → breaks with query params; use regex contains or `**/path**`.
- Icon-only buttons: getByTitle or attribute selector (onclick^=), not getByRole name.
- Hidden native <select> behind custom widget → selectOption fails; use URL param or force.
- readonly qty input → drive via +/- buttons, not fill.
- SweetAlert backdrop blocks clicks → dismiss dialog inside the POM action.
- Shared-account mutable state (cart/wishlist/address) → `test.describe.configure({ mode: 'serial' })` + afterEach cleanup.
- web-first `expect(locator).toHaveCount(n)` not one-shot count()+toBe for async changes.
- NEVER import afterEach from 'node:test' — use Playwright test.afterEach.

## Convention: interview questions doc
- `docs/INTERVIEW_QUESTIONS.md` — append a new section at the END of each completed phase (questions + short study answers, grounded in what was built). Phases 1–5 done.

## NEXT: commit Phase 5, then decide Phase 6 (Admin) or Phase 7 (API).
Recommendation: Phase 7 API next while cart/wishlist boundary + missing-auth findings are fresh (addWishlist/removeFromWishlist no auth; /addToCart 400 boundary matrix; /dashboard-canceled-data no auth).

## Phase 5b (Option A): user view-only pages — Profile, Wallet, Orders
Rationale: cover pages that DON'T need a placed order. Order lifecycle (checkout→orders→cancel/return/review) deferred to Phase 8 E2E. Razorpay top-up / OTP / profile image upload stay OUT of scope.
Routes: Profile `/userProfile` (profile.ejs), Wallet `/wallet` (wallet.ejs), Orders `/orders` (userOrders.ejs — NOT /userOrders).
Selectors:
- Profile: name `.profile-name`, referral `#referral-code-text`, "Edit Profile" text.
- Wallet: title heading "Vault Wallet", balance `h2` filter hasText ₹ .first(), section "Ledger & Transactions", empty "No ledger transactions recorded yet.".
- Orders: title "Order History", cards `.vault-card`, empty "No Acquisitions Found".
Tasks: 1 Profile POM+fixture+spec; 2 Wallet; 3 Orders (resilient: if count>0 assert cards else assert empty state).
Concept: resilient assertions for unknown DB data state (assert always-present elements, or either-or for data-dependent).
Then: full npm test, commit "feat: add profile, wallet, and orders view tests", add Phase 5b interview Qs.
AFTER 5b: Phase 6 Admin (needs TEST_ADMIN_EMAIL/PASSWORD in .env + admin.json storageState + separate admin project). admin login `/admin/login` #adminEmail #adminPassword btn "Log In" → /admin/dashboard. BUG target: GET /admin/dashboard-canceled-data has NO auth.

## Phase 5b — Profile / Wallet / Orders (view-only) notes
- Scope: assert only always-present elements (page titles, section headings, user identity) — NOT transactional data that may not exist. No Razorpay/OTP/checkout (deferred).
- Routes verified against app source: `/userProfile`, `/wallet`, `/orders` (all `auth.checkSession`).
- Profile POM: `.profile-name` (h4), `#referral-code-text`, `getByText('Edit Profile')`.
- Wallet POM: title `getByRole('heading',{name:'Vault Wallet'})` (markup is `Vault <span>Wallet</span>` → a11y name concatenates); balance `h2`.filter(hasText '₹').first(); ledger `getByText('Ledger & Transactions')`.
- Orders POM: title `getByRole('heading',{name:'Order History'})`; empty state `getByRole('heading',{name:'No Acquisitions Found'})`.
  - GOTCHA: both real order cards AND the empty-state container use `.vault-card`. Scoped `orderCards` with `.filter({ has: heading /^Order #/ })` so a zero-order account doesn't miscount the empty-state card as 1. Enables the resilient "cards OR empty state" assertion.
- QA concept introduced: resilient assertions for unknown data state (count>0 → cards visible, else → empty state). Test valid regardless of DB seed.


## PHASE 6 — Admin Module (IN PROGRESS)
Two-role storageState architecture DONE and verified (24 passed):
- `pages/admin/admin-login.page.ts` (#adminEmail, #adminPassword, "Log In" → /admin/dashboard).
- `tests/admin.setup.ts` → saves `playwright/.auth/admin.json`.
- playwright.config projects: `setup-user` (auth.setup.ts), `setup-admin` (admin.setup.ts), `chromium` (user, testIgnore tests/admin/, dep setup-user), `admin` (testMatch tests/admin/*.spec.ts, admin.json, dep setup-admin), firefox/webkit @smoke.
- Admin specs import `test` from `@playwright/test` directly (NOT user fixture) + instantiate admin POMs directly (Option A — don't pollute shared fixture). Run with `--project=admin`.
- `.env` has working TEST_ADMIN_EMAIL/PASSWORD (admin login confirmed).

Admin Category selectors (/admin/category): name `#product_name`, desc `#descriptionId`, add submit `form[action="/admin/addCategory"] button[type=submit]`, rows `table.table tbody tr`, list/unlist `#listing-btn-<id>`, edit `a[href^="/admin/editCategory"]`.
Admin routes use mix of adminIsLogin vs admincheckSession (editCategory uses admincheckSession — possible authz quirk, Phase 7). /admin/dashboard-canceled-data has NO auth (bug target).

NEXT admin modules to cover: Categories (add) → Brands → Products → Coupons → Customers block/unblock → Orders status. Use Faker for unique names (duplicate-conflict avoidance). Consider cleanup/isolation (admin CRUD mutates shared DB).

## Phase 6 — Admin Module (IN PROGRESS)
- Plan: `docs/ADMIN_MODULE_PLAN.md` (6 POMs + 6 specs). Admin specs import from `fixtures/admin.fixture.ts` (injects admin POMs, mirrors user base.fixture), run under `admin` project (storageState admin.json via `setup-admin`). Run: `npx playwright test --project=admin`. Add each new admin POM to the admin fixture as built.
- **Categories DONE:** `pages/admin/category.page.ts` + `tests/admin/category.spec.ts`. 1 test green (add category).
  - Add flow is AJAX + SweetAlert success → `location.reload()`; POM dismisses OK then waits for reload.
  - App validation: name letters+spaces 2-50, desc 10-200 → Faker value sanitized (strip non-letters + alpha suffix).
  - Category table PAGINATED (4/page) → row count misleads; assert on true-total label `getTotalCount()` (/\d+ Categories/) + newest name visible. No delete in UI → leaves Faker rows; total-relative assertion stays stable.
- **Brands DONE:** `pages/admin/brand.page.ts` + `tests/admin/brand.spec.ts`. 1 test green (toggle listing status).
  - Real selectors: toggle btn `.toggle-status` (plan guessed wrong), row `tr[data-brand-id]`, badge `.status-cell .tv-badge`.
  - Toggle has NO confirm dialog → fetch + `location.reload()`. Test self-restores (toggle then toggle back) → zero net DB change, repeatable.
  - Add-brand (file upload) skipped for now; toggle covers the module without needing a fixture image.
- **Products DONE:** `pages/admin/product.page.ts` + `tests/admin/product.spec.ts` (3 tests: list loads, search matches, search no-match empty state). Wired into admin fixture as `productPage`.
  - UI block/unblock is NOT testable: `products.ejs` JS references `.block-button`/`.unblock-button` classes never rendered in rows (orphaned). Only Edit + offer controls render. `/blockProduct` `/unblockProduct` routes exist → API-phase candidate.
  - List paginated (8/page, 25 total). Search is GET form (`?search=`). "Classic" matches all seed products; empty-state row has no `data-product-id` so count=0 on no-match.
  - Add deferred (multi-image upload).
- **Coupons DONE:** `pages/admin/coupon.page.ts` + `tests/admin/coupon.spec.ts` (serial: add → delete, self-cleaning). Fixture `couponPage`.
  - Validation gotchas: name ALPHANUMERIC only (no spaces!); offerPrice<minPrice<maxPrice (100/500/1000); dates today-or-future ISO. Inline `.error-message`, NOT SweetAlert, blocks invalid submit.
  - Add AJAX → "Success!" SweetAlert (2s timer) → reload. Delete → confirm "Delete" → AJAX GET deletecoupon → "Deleted!" + OK → reload.
  - COUNT gotcha: 2 badges/row (code `.badge.bg-light` + status badge) → count code badge only.
- **Customers DONE:** `pages/admin/customers.page.ts` + `tests/admin/customers.spec.ts` (block→unblock, self-restoring). Fixture `customersPage`.
  - PROTECTED: vaisakhnofficial@gmail.com (= user.json). TARGET throwaway: svvasudevam@gmail.com. Spec hard-guards TARGET != PROTECTED.
  - Block/unblock: `.blockCustomer`/`.unblockCustomer` → SweetAlert confirm ("Yes, block/unblock user") → fetch → success dialog OK → reload. Status badge `.tv-badge` Active/Blocked. Routes use `admincheckSession` (authz quirk → Phase 7).
  - NOTE: standalone node scripts on admin.json can 302 to login if stale; `admin` project refreshes via setup-admin.
- NEXT (per plan): Dashboard → Orders.
- Full suite: 32 passed (user + admin + cross-browser smoke).


## PHASE 6 COMPLETE (Admin Module)
Full suite: 34 passed, 4 skipped (data-dependent: order status advance, return approval — skip-with-reason when nothing to process). 38 tests total user+admin.
Built (exceeded planned scope): admin-login POM + admin.setup → admin.json. Dedicated `fixtures/admin.fixture.ts` injecting all admin POMs. Admin POMs: category, brand, product, coupon, customers, orders, returns, dashboard. Specs under tests/admin/ run via `admin` project (storageState admin.json, dep setup-admin).
Coverage: Categories (add), Brands (toggle+restore), Products (list, search +/-), Coupons (add+delete serial), Customers (block/unblock a throwaway, PROTECTED_USER guard so never block user-suite account), Orders (list, filter, status-advance skip-if-none), Returns (list, approve skip-if-none), Dashboard (stats view).
Key fixes: address POM — ONE locator for cards (getByTitle('Delete Address')) used by both assertion and count (was mismatched .vault-card vs getByTitle → off-by-one + strict-mode); delete uses .first(). Order status + return approve use test.skip(!condition, reason) for empty data.
Config: setup-user, setup-admin, chromium (user, testIgnore tests/admin/), admin (tests/admin/*.spec.ts), firefox/webkit @smoke.

## NEXT: Phase 7 — API testing (APIRequestContext)
Targets: /addToCart boundary matrix (qty 1,4 pass; 5,0 → 400; min(stock,4) low-stock edge); missing-auth (/addWishlist, /removeFromWishlist, /dashboard-canceled-data — call without session, assert should reject → likely documentable bug); admin authz (admincheckSession vs adminIsLogin quirk). Need to reuse session cookie via request context / storageState.
