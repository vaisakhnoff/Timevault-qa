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

## Current phase: 4 — Authentication tests (NEXT)
Goal: real login test + `storageState` reuse. Prereqs:
1. A registered user account on the deployed Render site (signup uses OTP email per blueprint — needs real inbox). USER TO CONFIRM if account exists.
2. Wire dotenv properly (`import 'dotenv/config'` in config, or configure in playwright.config). Populate `.env` with TEST_USER_EMAIL / TEST_USER_PASSWORD (+ admin). Create `.env.example` with placeholders (committed).
3. Un-skip the valid-login test; add storageState setup project so authenticated tests reuse session.

### Exact next task
Awaiting user answer: do they have a usable registered account on the Render site? Then proceed with Phase 4 dotenv + .env.example + auth setup.

## Open decisions / notes
- App also runs locally (`~/Documents/Time-Vault-ecommerce-web-app`, `npm start`, :3000) but testing targets the deployed Render URL now.
- `.env` is gitignored; `.env.example` (placeholders) will be committed in Phase 4.
- Commit typo in `4bb5524` ("projectwith") — left as-is.
