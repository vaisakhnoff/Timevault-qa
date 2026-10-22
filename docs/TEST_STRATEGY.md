# TimeVault QA — Test Strategy

How we test TimeVault. The [Test Plan](TEST_PLAN.md) says *what* is in and out of scope; this document is the rulebook for *how* testing is done: levels, techniques, tools, data, environments, criteria, and defect handling.

Related documents: [TEST_PLAN.md](TEST_PLAN.md) · [TEST_SCENARIOS.md](TEST_SCENARIOS.md) · [TEST_CASES.md](TEST_CASES.md) · [BUG_REPORTS.md](BUG_REPORTS.md)

---

## 1. Purpose

- Define a consistent approach so that every test, manual or automated, is designed, tagged, executed and reported the same way.
- Make the reasoning behind tooling and structure explicit, so the framework can be maintained and extended by someone who did not write it.

## 2. System under test (summary)

TimeVault is a server-rendered e-commerce app: Node.js, Express, EJS views, MongoDB (Mongoose), `express-session` cookie authentication, Passport (Google OAuth), Razorpay for online payments. It has two roles with separate sessions (customer and administrator). Most user actions are AJAX calls that return JSON, which makes an API test layer practical.

## 3. Test levels

| Level | What it covers | Why | Target share |
|-------|----------------|-----|--------------|
| **API / integration** | JSON endpoints called directly with `APIRequestContext` (status codes, response bodies, business rules, authorization) | Fast, deterministic, tests the authoritative server-side rules without UI fragility | ~50% |
| **UI (page level)** | One page or module at a time through the browser: rendering, forms, navigation, validation messages | Confirms what the user actually sees and can do | ~35% |
| **End-to-end** | Multi-step journeys across modules (browse → cart → checkout → order → cancel/refund; admin product lifecycle) | Confirms modules work together; expensive, so only critical flows | ~15% |

The shares are **design targets taken from the blueprint, not measured results**. Actual counts are reported only from real runs. The API layer is currently the smallest relative to target and is being expanded.

**Rule of thumb for placing a test:** if the rule is enforced by the server (HTTP 400/401, calculations, state transitions), test it at the API level. If it is about what the user sees or can click, test it at UI level. If it needs several modules, it is E2E.

## 4. Test types and techniques

| Type / technique | Where it applies in TimeVault |
|------------------|-------------------------------|
| Functional | Every module; each feature behaves per its rules |
| Smoke | Critical path: login, browse, add to cart, checkout (COD), order list, admin login/dashboard. Target under 5 minutes |
| Regression | Full automated suite after any change |
| Sanity | Focused re-check of one module after a fix (for example cart fix → cart + checkout + orders) |
| Negative | Wrong password, blocked user, expired coupon, invalid IDs, malformed bodies |
| Boundary Value Analysis | Cart quantity `min(stock, 4)` (0, 1, 4, 5, and the stock-below-4 edge); coupon `offer < minimum < maximum`; price filter; pincode/phone length |
| Equivalence Partitioning | Valid/invalid classes for email, password, price range, OTP |
| Authorization | Anonymous and wrong-role access to protected user and admin endpoints |
| Session | Login/logout, session destruction, blocked-mid-session behaviour |
| Integration | Cart → checkout → order → stock; cancel/return → wallet refund; coupon → order total |
| Cross-browser | Chromium full suite; Firefox/WebKit smoke subset only |

## 5. Tools and rationale

| Tool | Purpose | Why this and not an alternative |
|------|---------|--------------------------------|
| Playwright Test | UI + API runner | One tool for both layers; auto-waiting, fixtures, traces, projects |
| TypeScript (strict) | Test code | Catches mistakes (for example a missing `await`) before runtime |
| `APIRequestContext` | API testing | Built in; no need for Axios |
| `@faker-js/faker` | Dynamic test data | Unique values avoid duplicate-record conflicts |
| `dotenv` | Configuration | Keeps credentials and URLs out of the code |
| Allure | Primary report | Steps, severities, history (Phase 9) |
| Playwright HTML report | Secondary report | Zero-config, local debugging |
| ESLint + Prettier | Code quality | Consistent, reviewable code |
| Git + GitHub | Source control | `main` ← `develop` ← `feature/*` with pull requests |
| Jenkins | CI/CD | Pipeline as code (Phase 10) |

Deliberately not used: Zod/Ajv (too few endpoints to justify), Docker (not needed yet), Husky (solo project). Tools are added only with a clear reason.

## 6. Framework architecture (testing approach)

- **Page Object Model** — one class per page holding locators and actions. Specs contain intent and assertions, not selectors.
- **Fixtures** — page objects and API clients are injected into tests, so specs never construct them or open contexts themselves. There are separate user, admin and API fixtures.
- **API clients** — one class per resource (`CartApi`, `WishlistApi`, `AdminApi`); endpoints are typed methods.
- **Assertions** — web-first assertions (`expect(locator)…`) that auto-wait; no fixed sleeps.
- **Locators** — prefer role, label, title and text; use stable IDs where the markup has no accessible name; avoid positional CSS and XPath.
- **Assertions vs page objects** — page objects expose locators and actions; the *test* decides what to assert.

## 7. Test environments

| Environment | URL | Use |
|-------------|-----|-----|
| Local (primary) | `http://localhost:3000` | Day-to-day development and regression; fast and stable |
| Deployed (Render free tier) | set in `BASE_URL` | Demonstration only; slow cold starts, **ephemeral filesystem** so uploaded images disappear on restart |

The environment is chosen by a single `BASE_URL` value in `.env`. Tests never hardcode hosts. Runtime: Node.js LTS, Chromium primary, Firefox/WebKit for smoke.

## 8. Test data strategy

- Static seed data (products, categories, brands) is assumed present in the test database; tests do not create products.
- Dynamic data (names, coupon codes, addresses) is generated with Faker and made unique per run.
- **Each test cleans up what it creates** (delete the address, remove the cart item, delete the coupon) or restores what it toggles (brand status, customer block).
- **Protected account:** the account used by the user session is never blocked or modified by admin tests; a separate throwaway customer is used for block/unblock.
- Tests must not assert on uploaded image files (not reliable on the deployed host); assert on data.
- Credentials and URLs come from environment variables only. `.env` is git-ignored; `.env.example` documents the required keys.
- Tests do not manipulate the database directly; all data is created through the application.

## 9. Authentication strategy

| Need | Approach |
|------|----------|
| Authenticated user tests | A setup project logs in once and saves `storageState` (`user.json`); the user project reuses it |
| Authenticated admin tests | A second setup project saves `admin.json`; the admin project reuses it |
| Logged-out UI tests | Override with an empty `storageState` for that file |
| Authorization (anonymous) API tests | A request context created with an **explicitly empty** `storageState` |

TimeVault authenticates with a **session cookie**, not a token, so the reusable artifact is the cookie in `storageState`. An anonymous context must be created with an empty state; otherwise it can silently inherit the project's session and produce false results (this happened once and is why the rule exists).

## 10. Test organisation and tagging

Folders: `tests/user`, `tests/admin`, `tests/api`, `tests/e2e`. Tags go in test titles: `@smoke`, `@regression`, `@sanity`, `@api`, `@e2e`, `@user`, `@admin`, `@negative`, `@boundary`, `@security`, per-module tags (`@auth`, `@cart`, `@order`).

Run selection by tag (`--grep`). Smoke runs on every push; regression nightly.

## 11. Parallelism and isolation

TimeVault uses one shared database and tests share one user account, so:

- Spec files that mutate shared per-user state (cart, wishlist, addresses) run **serially** inside the file, with cleanup before/after.
- Different files may run in parallel; admin CRUD uses unique data per spec.
- Assertions on mutable state assert the **change** (before + 1) rather than an absolute value that depends on what ran before.

## 12. Entry and exit criteria

**Entry (testing can start):**
- Application running and reachable at `BASE_URL`; database seeded.
- Valid user and admin credentials in `.env`.
- Dependencies and Playwright browsers installed; project type-checks and lints.

**Exit (a cycle is complete):**
- All P0 scenarios automated and passing.
- No open Critical or High defect without a documented decision.
- Smoke suite under 5 minutes.
- Known defects tracked in `BUG_REPORTS.md` and marked in automation (see §13).
- Skipped tests have a stated reason (for example no pending return exists).

## 13. Defect management

| Severity | Meaning | Example |
|----------|---------|---------|
| Critical | Data loss, security breach, system unusable | Payment/order corruption |
| High | Major feature broken or access control missing | Admin endpoint open to anonymous callers (BUG-001) |
| Medium | Feature partly broken, workaround exists | Wrong total in an edge case |
| Low | Cosmetic or minor | Typo, spacing |

- Every defect is written up in `BUG_REPORTS.md` with steps, expected vs actual, evidence and impact.
- Only **verified** defects are reported. Before reporting, the test harness is checked first (for example the leaked-session false alarm).
- A confirmed, still-open defect is kept in automation with `test.fail(true, 'BUG-ID …')`. The assertion keeps stating the *correct* behaviour; the test is expected to fail, CI stays green, and Playwright flags the test as soon as the bug is fixed so the marker can be removed. Asserting the buggy behaviour is not allowed.

## 14. Failure, retry and flaky-test policy

- Retries: **1 in CI, 0 locally**, so flakiness shows up immediately during development.
- Artifacts: screenshot on failure; trace and video on first retry.
- A retry never replaces root-cause analysis. A flaky test is tagged `@flaky`, investigated (waiting on the wrong signal, shared data, ambiguous locator), fixed, and its cause recorded.
- Data-dependent tests use `test.skip(condition, 'reason')` instead of failing when the data is absent.

## 15. Risks and mitigations

See [TEST_PLAN.md](TEST_PLAN.md) §4. Strategy-level notes:

- Shared mutable data → serial files, cleanup, unique data.
- Third-party UI (SweetAlert dialogs block clicks) → dismiss the dialog inside the page-object action that causes it.
- Slow/ephemeral hosting → use local for development; tolerant timeouts; never assert on uploaded files.

## 16. Reporting and metrics

- Allure (primary) and Playwright HTML (secondary), archived per CI run.
- Only measured numbers are reported: tests run, passed, failed, skipped, known-failing. Coverage claims are made against the scenario list in [TEST_SCENARIOS.md](TEST_SCENARIOS.md), not against invented percentages.

## 17. Out of scope

As listed in [TEST_PLAN.md](TEST_PLAN.md) §2: full Google OAuth, real Razorpay payment, email delivery/OTP reading, PDF/Excel content, performance/load, mobile, migrations, banner management.
