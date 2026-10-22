# TimeVault QA — Test Plan

## 1. Introduction / Objective

This test plan covers the QA automation effort for **TimeVault**, a full-stack e-commerce web application built with Node.js, Express, MongoDB, EJS, and Razorpay.

The goal is to build a maintainable, professional QA automation framework that validates TimeVault's critical business functionality, security boundaries, data integrity, and the integration between application components.

The project aims to:

- Validate critical user and admin workflows from end to end.
- Detect functional, regression, negative, boundary, and authorization defects.
- Automate UI testing using Playwright + TypeScript.
- Validate backend JSON endpoints using Playwright `APIRequestContext`.
- Verify important business rules such as cart quantities, coupons, orders, and wallet calculations.
- Produce professional test documentation, reports, and traceability.
- Integrate automated tests into Jenkins CI/CD.

## 2. Scope

### In Scope

**User Module**

- User signup and login
- Logout
- Blocked-user handling
- Forgot / reset password
- OTP-related validation
- Product browsing and product details
- Search, filtering, sorting, pagination
- Cart add / remove / update
- Cart quantity and stock boundary validation
- Wishlist add / remove / view
- Address CRUD
- Profile management (password / email changes)
- Coupon apply / remove
- Checkout (Cash on Delivery, Wallet payment)
- Order creation, history, and details
- Order cancellation and individual item cancellation
- Return requests
- Review submission
- Wallet and wallet balance
- Referral functionality

**Admin Module**

- Admin login / logout
- Customer management (block / unblock)
- Category CRUD and category offers
- Brand CRUD and brand offers
- Product CRUD, block / unblock, product offers
- Coupon CRUD
- Order management and order status updates
- Return request processing
- Dashboard validation
- Sales reports, report filtering, PDF / Excel download verification

**API Testing**

- API endpoint validation
- HTTP status-code validation
- Response / body validation
- Positive and negative API testing
- Unauthorized-access testing
- Cart, wishlist, coupon, and order-related APIs
- Admin API authorization checks

**QA Techniques Applied**

- Functional testing
- Regression testing
- Smoke testing
- Sanity testing
- End-to-end testing
- Negative testing
- Boundary Value Analysis
- Equivalence Partitioning
- Authorization testing
- Session testing
- Integration testing
- Validation testing
- Cross-browser smoke testing

### Out of Scope

| Area                            | Reason                                                                                                    |
| ------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Full Google OAuth flow          | Requires real Google credentials and is impractical for CI automation.                                    |
| Real Razorpay payment flow      | Depends on an external payment system / iframe and is better handled through controlled / manual testing. |
| Email delivery verification     | Requires mailbox access or a mail-trap service; documented as manual.                                     |
| Reading OTP directly from email | Requires external mailbox access; automation will use a controlled test approach instead.                 |
| PDF / Excel content validation  | File download can be verified, but detailed document-content validation remains manual.                   |
| Performance / load testing      | Not part of the portfolio scope and requires a dedicated performance-testing setup.                       |
| Mobile application testing      | TimeVault is a web application; there is no separate mobile app.                                          |
| Database migration testing      | No database migration mechanism is implemented in the application.                                        |
| Banner management testing       | Banner schema exists, but the corresponding admin CRUD functionality is not implemented.                  |

## 3. Test Approach

The project uses a layered QA approach rather than relying only on browser automation.

### Testing Types

- **Functional Testing** — Validate that each feature behaves according to its requirements.
- **Smoke Testing** — Run a small set of critical tests after a build / deployment to confirm the application is stable enough for further testing.
- **Regression Testing** — Run the broader automated suite after changes to confirm existing functionality is not broken.
- **Sanity Testing** — Run focused tests around a changed or fixed module.
- **End-to-End Testing** — Validate complete business journeys such as: Login → Browse → Product → Cart → Checkout → Order.
- **Negative Testing** — Verify the application rejects invalid data, unauthorized requests, and invalid business actions.
- **Boundary Value Analysis** — Test exact edges such as cart quantity limits, price ranges, pincode, and phone numbers.
- **Equivalence Partitioning** — Divide input data into valid and invalid classes, such as email / password formats.
- **Authorization Testing** — Verify users cannot access admin functionality and that protected operations cannot be performed without appropriate authentication.
- **Session Testing** — Validate login, logout, blocked users, and session expiry behavior.
- **Integration Testing** — Validate interactions such as Cart → Checkout → Order and Return → Wallet Refund.
- **API Testing** — Validate application endpoints independently from the UI.

### Tools

- **Playwright** — UI, E2E, and API automation
- **TypeScript** — automation language
- **Playwright `APIRequestContext`** — API testing
- **Faker** — dynamic test data
- **Allure** — test reporting
- **Playwright HTML Report** — secondary reporting
- **Jenkins** — CI/CD execution
- **Git / GitHub** — source control
- **ESLint + Prettier** — code quality and formatting

### Automation Structure

The framework follows a layered structure:

- **Page Object Model (POM)** — reusable page actions and locators
- **Components** — reusable UI components
- **Fixtures** — authentication, page objects, and shared test setup
- **API Client Layer** — reusable API interactions
- **Test Data Layer** — static and dynamically generated test data
- **Tests** — test scenarios and assertions

### Execution Strategy

Tests are organized using tags such as `@smoke`, `@regression`, `@api`, `@e2e`, `@negative`, `@user`, and `@admin`.

The intended execution model is:

- **Smoke** → fast feedback
- **API** → fast backend validation
- **Regression** → comprehensive validation
- **E2E** → critical business journeys
- **Cross-browser** → selected smoke coverage

CI/CD will eventually execute the Playwright suites through Jenkins and publish test reports.

## 4. Risks

These are risks to the testing project itself, not application defects.

| Risk                                     | Impact                                                     | Mitigation                                                                         |
| ---------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Test data changes or conflicts           | Tests may become flaky or fail unexpectedly.               | Use controlled test data, Faker-generated unique data, and test isolation.         |
| Application unavailable during execution | The entire automation suite may fail.                      | Add environment / health checks and document application startup requirements.     |
| Unstable UI selectors                    | Tests may break after small UI changes.                    | Prefer role / text-based locators and use stable selectors where available.        |
| Authentication / OTP dependencies        | Login-related automation may become blocked.               | Use controlled accounts and reusable authentication state where appropriate.       |
| External payment dependency              | Razorpay automation may be unreliable or impossible in CI. | Focus automated payment coverage on COD / Wallet and document Razorpay separately. |
| CI/CD configuration issues               | Tests may pass locally but fail in Jenkins.                | Build the Jenkins pipeline incrementally and validate each stage separately.       |
| Scope creep                              | The project may become too large to complete.              | Maintain MVP → SHOULD HAVE → ADVANCED priorities.                                  |
| Flaky tests                              | False failures reduce trust in automation.                 | Investigate root causes, isolate tests, use proper waits and controlled retries.   |

## 5. Assumptions

The following conditions must be true for the automation project to work reliably:

1. The TimeVault application is running and accessible in the configured test environment before tests begin.
2. A test MongoDB environment with suitable test data is available, including products, categories, users, and other required records.
3. Valid test user and admin accounts are available for authenticated test scenarios.
4. Test credentials and environment configuration are supplied through environment variables, not hardcoded into the repository.
5. The application behaves consistently enough for deterministic automated testing, particularly for login, cart, checkout, and order workflows.
6. Required Node.js / npm dependencies and Playwright browsers are installed before execution.
7. Services intentionally excluded from automation (real Google OAuth, email delivery, Razorpay) do not block the automated test flows being executed.
8. Test data can be isolated between tests so that one test does not unintentionally affect another.
9. Jenkins, when introduced, has access to the application environment and required credentials / configuration.
10. The application remains available throughout the test run and does not restart unexpectedly during execution.
