# TimeVault — Defect Reports

Defects found during QA automation of the TimeVault e-commerce application.
Each defect is backed by an automated test and reproducible evidence.

| ID      | Title                                                       | Severity | Type                              | Status                                  |
| ------- | ----------------------------------------------------------- | -------- | --------------------------------- | --------------------------------------- |
| BUG-001 | Admin dashboard endpoint accessible without authentication  | High     | Broken Access Control (OWASP A01) | Fixed, verified by regression test      |
| BUG-002 | Intermittent logged-out state after successful login        | High     | Functional / race condition       | Fixed, verified by repeated setup runs  |
| BUG-003 | Signup rejects valid emails with an ending longer than 4 letters | Medium | Input validation | Open |

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
