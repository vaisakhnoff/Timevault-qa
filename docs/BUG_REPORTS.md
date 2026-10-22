# TimeVault — Defect Reports

Defects found during QA automation of the TimeVault e-commerce application.
Each defect is backed by an automated test and reproducible evidence.

| ID      | Title                                                      | Severity | Type                              | Status |
| ------- | ---------------------------------------------------------- | -------- | --------------------------------- | ------ |
| BUG-001 | Admin dashboard endpoint accessible without authentication | High     | Broken Access Control (OWASP A01) | Open   |

---

## BUG-001: Admin dashboard endpoint accessible without authentication

- **Severity:** High
- **Type:** Broken Access Control (OWASP A01:2021)
- **Component:** Admin → Dashboard analytics
- **Endpoint:** `GET /admin/dashboard-canceled-data`
- **Environment:** Local — `http://localhost:3000` (Node/Express + MongoDB)
- **Found by:** Automated API authorization test — `tests/api/authorization.spec.ts`

### Description

The admin analytics endpoint `GET /admin/dashboard-canceled-data` has no
authentication middleware. An unauthenticated caller (no session cookie) receives
`HTTP 200` and the admin dashboard analytics payload. Every sibling admin dashboard
route (`/admin/dashboard`, `/admin/dashboard-data`, `/admin/best-selling`,
`/admin/download-report`) is protected with `auth.adminIsLogin`; this route is not.

### Steps to reproduce

1. Ensure you are NOT logged in (no session cookie).
2. Send: `GET http://localhost:3000/admin/dashboard-canceled-data`
3. Observe the response.

Reproduced via `curl`:

```
curl -i http://localhost:3000/admin/dashboard-canceled-data
```

### Expected result

`401 Unauthorized` (or `403 Forbidden`). The endpoint should require an authenticated
admin session, consistent with all other `/admin/*` routes.

### Actual result

```
HTTP 200
{"labels":[],"canceledData":[],"returnedData":[]}
```

The endpoint executes and returns the analytics structure with no authentication.
Arrays are empty in the current test DB, but the endpoint runs and would return
cancelled/returned order analytics whenever such data exists.

### Evidence

- Automated test: `tests/api/authorization.spec.ts` →
  "GET /admin/dashboard-canceled-data without admin session".
  The test asserts the current (vulnerable) `200` and references this report; it should
  be flipped to assert `401/403` once the fix lands.
- Route definition registers the handler without `auth.adminIsLogin`, unlike its siblings.

### Impact

Any unauthenticated party can reach an admin-only analytics endpoint. Beyond the data
itself, it signals a gap in access-control enforcement that could apply to other routes.
With real cancelled/returned orders present, operational/business data is exposed.

### Recommendation

Add the admin auth middleware to the route so it matches the other dashboard routes:

```js
router.get(
  '/dashboard-canceled-data',
  auth.adminIsLogin,
  dashboardController.getCanceledAndReturnedData,
);
```

### Verification after fix

Re-run `tests/api/authorization.spec.ts`; update the assertion to
`expect(res.status()).not.toBe(200)` (expecting 401/403). Test should pass once the
middleware is added.
