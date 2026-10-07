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
  - 7 tests green (setup + smoke x? + auth proof).

## Current phase: 5 — User Module tests (NEXT)
Build real POMs + tests for user features. Likely order per blueprint: shop/browse → product details → cart (boundary: min(stock,4), incl stock=0) → wishlist → address → profile → wallet. Authenticated tests reuse storageState; logged-out where appropriate.

### Exact next task
Commit Phase 4, then start Phase 5 with the Shop/Browse page: build `pages/user/shop.page.ts` POM + first browse test. Will need to read deployed shop page (/shopPage) selectors first.

## Open decisions / notes
- App also runs locally (`~/Documents/Time-Vault-ecommerce-web-app`, :3000) but tests target deployed Render URL.
- `.env` gitignored; `.env.example` committed.
- Cart boundary rule reminder: max = min(stock, 4); test stock=0, lower edges (0, negatives, non-integers), HTTP 400 on exceed.
- Commit typo in `4bb5524` ("projectwith") — left as-is.
