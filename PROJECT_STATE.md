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
- NEXT: Product Details module.

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
