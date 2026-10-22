# TimeVault — QA Automation Project Blueprint

> **Version:** 1.0  
> **Date:** 2026-09-30  
> **Status:** AWAITING APPROVAL — DO NOT IMPLEMENT YET  
> **Author:** QA Automation Architect

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Application Analysis](#2-application-analysis)
3. [Feature / Module Map](#3-feature--module-map)
4. [QA Objectives](#4-qa-objectives)
5. [Scope & Out of Scope](#5-scope--out-of-scope)
6. [Test Strategy](#6-test-strategy)
7. [Testing Pyramid](#7-testing-pyramid)
8. [Recommended Technology Stack](#8-recommended-technology-stack)
9. [Framework Architecture](#9-framework-architecture)
10. [Directory Structure](#10-directory-structure)
11. [Page Object Architecture](#11-page-object-architecture)
12. [Fixture Strategy](#12-fixture-strategy)
13. [Authentication Strategy](#13-authentication-strategy)
14. [Test Data Strategy](#14-test-data-strategy)
15. [Test Case Strategy](#15-test-case-strategy)
16. [Test Scenario Strategy](#16-test-scenario-strategy)
17. [API Testing Strategy](#17-api-testing-strategy)
18. [Test Tagging Strategy](#18-test-tagging-strategy)
19. [Browser Strategy](#19-browser-strategy)
20. [Parallel Execution Strategy](#20-parallel-execution-strategy)
21. [Retry & Failure Strategy](#21-retry--failure-strategy)
22. [Reporting Strategy](#22-reporting-strategy)
23. [Jenkins CI/CD Strategy](#23-jenkins-cicd-strategy)
24. [Git / GitHub Strategy](#24-git--github-strategy)
25. [Code Quality Strategy](#25-code-quality-strategy)
26. [Bug Management Strategy](#26-bug-management-strategy)
27. [RTM Strategy](#27-rtm-strategy)
28. [Documentation Strategy](#28-documentation-strategy)
29. [Portfolio Strategy](#29-portfolio-strategy)
30. [Implementation Roadmap](#30-implementation-roadmap)
31. [MVP vs Advanced](#31-mvp-vs-advanced)
32. [Final Technology Stack](#32-final-technology-stack)
33. [Final Architecture Diagram](#33-final-architecture-diagram)
34. [Final Deliverables Checklist](#34-final-deliverables-checklist)
35. [Risks and Mitigations](#35-risks-and-mitigations)
36. [Recommended First Step](#36-recommended-first-step)

---

## 1. Executive Summary

**TimeVault** is a full-stack e-commerce web application built with Node.js/Express, MongoDB, EJS templates, and Razorpay payment integration. It has two distinct user roles — **Customer (User)** and **Administrator** — each with extensive functionality spanning authentication, product catalog, cart/checkout, order management, wallet, wishlist, coupons, reviews, returns, referrals, and comprehensive admin dashboards with sales reporting.

**Project Objective:**  
Build a maintainable, end-to-end QA automation framework for the TimeVault e-commerce application that combines manual QA documentation, UI automation with Playwright, API testing, test reporting with Allure, and CI/CD with Jenkins — designed as a portfolio-grade project that demonstrates professional QA Engineering practices.

**Key findings from the repository analysis:**

- The application is **server-side rendered** (EJS) with AJAX/JSON endpoints for many user actions (add-to-cart, wishlist, coupon, payment, reviews, etc.)
- Authentication uses **express-session** (cookie-based sessions) with **bcrypt** password hashing, **Google OAuth 2.0**, and **OTP via email** (Nodemailer)
- Payment is integrated with **Razorpay** (online + wallet top-up)
- There are **no REST API endpoints** explicitly designed for external consumption — all routes serve HTML views or JSON responses for frontend AJAX calls
- Admin authentication is **session-based** with a simple `isAdmin: true` flag in the user document
- The application uses **MongoDB** exclusively (no SQL)

---

## 2. Application Analysis

### 2.1 Technology Stack

| Layer            | Technology                                                |
| ---------------- | --------------------------------------------------------- |
| Runtime          | Node.js                                                   |
| Framework        | Express.js 4.x                                            |
| View Engine      | EJS (Server-Side Rendering)                               |
| Database         | MongoDB via Mongoose 8.x                                  |
| Authentication   | express-session + bcrypt + Passport.js (Google OAuth 2.0) |
| Email            | Nodemailer (Gmail SMTP)                                   |
| Payment          | Razorpay SDK                                              |
| Image Processing | Sharp                                                     |
| File Uploads     | Multer                                                    |
| PDF Generation   | PDFKit + pdfkit-table                                     |
| Spreadsheet      | ExcelJS + xlsx                                            |
| Caching          | nocache middleware                                        |
| Unique IDs       | uuid                                                      |

### 2.2 Backend Architecture

- **Entry point:** `app.js` — Express server with session config, Passport init, static file serving, two route files
- **Routes:** `userRouter.js` (117 lines, ~47 endpoints) and `adminRouter.js` (105 lines, ~35 endpoints)
- **Controllers (User):** `userController.js`, `productController.js`, `profileController.js`, `cartController.js`, `orderController.js`, `wishlistController.js`, `walletController.js`
- **Controllers (Admin):** `adminController.js`, `customerController.js`, `categoryController.js`, `productController.js`, `couponController.js`, `orderController.js`, `dashboardController.js`, `brandController.js`, `salesReportController.js`
- **Middleware:** User auth (`checkSession`) and Admin auth (`adminIsLogin`, `admincheckSession`, `adminAlreadyLoggedIn`)

### 2.3 Database Models (11 schemas)

| Model               | Key Fields                                                                                                                                                                                         |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `User`              | firstName, lastName, email, password, googleId, isBlocked, isAdmin, wallet, referalCode, redeemedUsers, profileImage                                                                               |
| `Product`           | productName, description, category (ref), brand (ref), regularPrice, salePrice, productOffer, quantity, productImage[], isBlocked, status, reviews[]                                               |
| `Category`          | name, description, isListed, categoryOffer                                                                                                                                                         |
| `Brand`             | brandName, brandOffer, brandImage, isBlocked                                                                                                                                                       |
| `Cart`              | userId (ref), items[{productId, quantity, price, totalPrice}]                                                                                                                                      |
| `Order`             | orderId (UUID), user (ref), items[{productId, quantity, price, status, returnReason...}], address (ref), paymentMethod (COD/Online/Wallet), paymentStatus, orderStatus, coupon fields, totalAmount |
| `Address`           | userId (ref), address[{addressType, name, city, landMark, state, pincode, phone_no, altPhone_no}]                                                                                                  |
| `Coupon`            | name, couponCode, expireOn, offerPrice, minimumPrice, maxPrice, isList, userId[]                                                                                                                   |
| `Wishlist`          | userId (ref), products[{productId, addedOn}]                                                                                                                                                       |
| `WalletTransaction` | userId, amount, type (Credit/Debit), description                                                                                                                                                   |
| `Banner`            | (schema exists but no controller routes found — unused)                                                                                                                                            |

### 2.4 Authentication Mechanisms

1. **Email/Password Login** — bcrypt hash comparison, session stores `req.session.user = userId`
2. **Google OAuth 2.0** — Passport.js strategy, creates user if new, blocks if `isBlocked`
3. **OTP Email Verification** — 6-digit OTP for signup, forgot password, change email, change password
4. **Admin Login** — separate session key `req.session.admin`, checks `isAdmin: true` in User collection
5. **Session Config** — `httpOnly: true`, `secure: false`, 24-hour maxAge, stored server-side

### 2.5 User Roles

| Role     | Session Key         | Auth Middleware                                          |
| -------- | ------------------- | -------------------------------------------------------- |
| Customer | `req.session.user`  | `checkSession` — verifies user exists and is not blocked |
| Admin    | `req.session.admin` | `adminIsLogin` — checks `req.session.admin` exists       |

### 2.6 Payment Implementation

- **COD (Cash on Delivery)** — `paymentStatus: 'Pending'`
- **Online (Razorpay)** — Create Razorpay order → frontend payment → verify signature → save order with `paymentStatus: 'Completed'`
- **Wallet** — Debit from `user.wallet` field, record `WalletTransaction`
- **Wallet Top-up** — Via Razorpay → credit to `user.wallet`
- **Refunds** — Cancellation/return refunds go to wallet (not back to payment source)

### 2.7 Key Constraints & Observations

- **Max 4 items per product** in cart (hardcoded in `cartController.js`)
- **6 products per page** on shop page; **3 orders per page** on user orders
- **Sort options:** price_asc, price_desc, name_asc, name_desc, brand_asc, brand_desc, newest
- **Filter options:** category, brand, price range (minPrice/maxPrice), search text
- **Coupon rules:** offerPrice < minimumPrice < maxPrice; can't apply if already applied; checks expiry
- **Order status flow:** Pending → Shipped → Out for Delivery → Delivered
- **Return flow:** Only delivered items can be returned → status becomes 'Return Requested' → Admin approves/declines
- **Cancel flow:** Only pending orders can be cancelled; online/wallet orders get wallet refund
- **Review:** Can only review delivered, non-reviewed items; supports image upload (max 3)
- **Referral system:** 6-char alphanumeric code, ₹100 bonus to both referrer and referee
- **Profile image:** Uploaded as base64, saved as PNG on server

### 2.8 Functionality That Is Difficult to Automate

| Area                    | Challenge                                             | Mitigation                                                       |
| ----------------------- | ----------------------------------------------------- | ---------------------------------------------------------------- |
| Google OAuth            | Requires real Google account, consent screen          | Skip in CI; test redirect URL manually; use session injection    |
| OTP Email               | Requires real email delivery + reading OTP            | Intercept OTP from server console logs or mock in test env       |
| Razorpay Payment        | Requires Razorpay test keys, frontend SDK interaction | Use Razorpay test mode; test COD as primary; mock payment for CI |
| Image Upload (Cropping) | Client-side cropping with canvas → base64             | Send pre-cropped base64 directly via API                         |
| PDF/Excel Download      | Downloads files, not rendered HTML                    | Verify response headers + content-type; check file existence     |

### 2.9 Security-Sensitive Areas

- Admin routes lack proper session validation in some cases (e.g., `admincheckSession` checks `User.findOne({isAdmin:true})` — any admin user, not the logged-in one)
- Some routes missing `auth.checkSession` (e.g., `POST /createOnlineOrder`, `POST /onlinePaymentSuccess`, `POST /addWishlist`, `POST /removeFromWishlist`)
- `GET /dashboard-canceled-data` has no auth middleware at all
- These are real potential bugs worth documenting

---

## 3. Feature / Module Map

```
TIMEVAULT E-COMMERCE APPLICATION
│
├── USER SIDE
│   ├── AUTH
│   │   ├── Signup (email + password + phone + referral code)
│   │   ├── OTP Verification (signup)
│   │   ├── Resend OTP
│   │   ├── Login (email/password)
│   │   ├── Google OAuth Login
│   │   ├── Forgot Password → OTP → Reset Password
│   │   ├── Logout
│   │   └── Blocked User Handling
│   │
│   ├── HOME PAGE
│   │   ├── Latest Products Display (max 4)
│   │   └── Banner Carousel
│   │
│   ├── SHOP / PRODUCT BROWSING
│   │   ├── Product Listing (paginated, 6/page)
│   │   ├── Search (by product name)
│   │   ├── Filter by Category
│   │   ├── Filter by Brand
│   │   ├── Filter by Price Range
│   │   ├── Sort (price, name, brand, newest)
│   │   └── AJAX pagination
│   │
│   ├── PRODUCT DETAILS
│   │   ├── Product Info Display
│   │   ├── Product Images
│   │   ├── Reviews Display
│   │   ├── Related Products
│   │   └── Add to Cart / Wishlist from Details
│   │
│   ├── CART
│   │   ├── View Cart
│   │   ├── Add to Cart (with quantity, max 4)
│   │   ├── Update Quantity
│   │   ├── Remove Item
│   │   └── Move from Wishlist to Cart
│   │
│   ├── CHECKOUT
│   │   ├── View Checkout
│   │   ├── Select/Add Address
│   │   ├── Apply Coupon
│   │   ├── Remove Coupon
│   │   ├── Available Coupons Display
│   │   ├── Payment Method Selection (COD/Online/Wallet)
│   │   └── Place Order
│   │
│   ├── PAYMENT
│   │   ├── COD Order Placement
│   │   ├── Razorpay Online Payment
│   │   └── Wallet Payment
│   │
│   ├── ORDERS
│   │   ├── Order History (paginated, 3/page)
│   │   ├── Order Details View
│   │   ├── Cancel Order (whole order, pending only)
│   │   ├── Cancel Individual Item
│   │   ├── Return Individual Item (delivered only)
│   │   └── Order Success Page
│   │
│   ├── PROFILE
│   │   ├── View Profile
│   │   ├── Edit Profile Image (base64 upload)
│   │   ├── Change Email (OTP verification)
│   │   └── Change Password (OTP verification)
│   │
│   ├── ADDRESS MANAGEMENT
│   │   ├── View Addresses (paginated, 3/page)
│   │   ├── Add Address
│   │   ├── Edit Address
│   │   └── Delete Address
│   │
│   ├── WISHLIST
│   │   ├── View Wishlist
│   │   ├── Add to Wishlist
│   │   ├── Remove from Wishlist
│   │   └── Move to Cart
│   │
│   ├── WALLET
│   │   ├── View Balance & Transactions (paginated, 5/page)
│   │   ├── Add Money (via Razorpay)
│   │   └── Referral Earnings Display
│   │
│   ├── REVIEWS
│   │   ├── Write Review (rating + title + text + images)
│   │   └── View Reviews on Product Page
│   │
│   ├── REFERRALS
│   │   ├── View Referral Code
│   │   ├── View Referred Users (paginated)
│   │   └── Referral Bonus (₹100 on signup)
│   │
│   ├── CONTACT
│   │   ├── Contact Form
│   │   └── Email Notification
│   │
│   └── 404 PAGE
│       └── Custom Not Found Page
│
├── ADMIN SIDE
│   ├── AUTH
│   │   ├── Admin Login (email/password, isAdmin check)
│   │   ├── Already Logged In Redirect
│   │   └── Admin Logout
│   │
│   ├── DASHBOARD
│   │   ├── Stats Overview
│   │   ├── Dashboard Data API (AJAX)
│   │   ├── Best Selling Data
│   │   ├── Cancelled/Returned Data
│   │   └── Download Report
│   │
│   ├── CUSTOMER MANAGEMENT
│   │   ├── List Customers
│   │   ├── Block Customer
│   │   └── Unblock Customer
│   │
│   ├── CATEGORY MANAGEMENT
│   │   ├── List Categories
│   │   ├── Add Category
│   │   ├── Edit Category
│   │   ├── List/Unlist Category
│   │   ├── Add Category Offer (%)
│   │   └── Remove Category Offer
│   │
│   ├── BRAND MANAGEMENT
│   │   ├── List Brands
│   │   ├── Add Brand (with image)
│   │   ├── Edit Brand
│   │   ├── Delete Brand
│   │   ├── Toggle Brand Status (block/unblock)
│   │   ├── Add Brand Offer
│   │   └── Remove Brand Offer
│   │
│   ├── PRODUCT MANAGEMENT
│   │   ├── List Products
│   │   ├── Add Product (with 4 images, sharp resize)
│   │   ├── Edit Product
│   │   ├── Block/Unblock Product
│   │   ├── Add Product Offer (%)
│   │   └── Remove Product Offer
│   │
│   ├── COUPON MANAGEMENT
│   │   ├── List Coupons
│   │   ├── Add Coupon
│   │   ├── Edit Coupon
│   │   └── Delete Coupon
│   │
│   ├── ORDER MANAGEMENT
│   │   ├── List Orders (paginated, search, filter by status)
│   │   ├── View Order Details
│   │   └── Update Order Status (Pending→Shipped→OutForDelivery→Delivered)
│   │
│   ├── RETURN REQUESTS
│   │   ├── List Return Requests
│   │   ├── Approve Return (refund to wallet)
│   │   └── Decline Return
│   │
│   └── SALES REPORTS
│       ├── View Sales Report
│       ├── Filter Report (date range, etc.)
│       └── Download Report (PDF/Excel)
```

---

## 4. QA Objectives

### Primary Objectives

1. **Validate critical business flows** — Signup → Browse → Add to Cart → Checkout → Payment → Order Confirmation
2. **Ensure authentication & authorization integrity** — Session handling, blocked users, admin-only access
3. **Verify data integrity** — Product quantities, wallet balances, coupon rules, order calculations
4. **Catch regression bugs** before deployment through automated test suites
5. **Document all test scenarios** with proper traceability

### Quality Goals

- **Automated smoke suite** executable in < 5 minutes
- **Regression suite** covering 80%+ of critical and high-priority scenarios
- **API tests** validating all JSON endpoints independently from UI
- **Zero hardcoded credentials** in test code or repository

---

## 5. Scope & Out of Scope

### In Scope

| Area                                                   | Coverage           |
| ------------------------------------------------------ | ------------------ |
| User authentication (email, Google redirect, OTP flow) | Manual + Automated |
| Product browsing, search, filter, sort, pagination     | Automated          |
| Cart CRUD operations                                   | Automated          |
| Checkout flow (COD, Wallet)                            | Automated          |
| Order management (view, cancel, return)                | Automated          |
| Profile management                                     | Automated          |
| Address CRUD                                           | Automated          |
| Wishlist CRUD                                          | Automated          |
| Wallet (view, balance verification)                    | Automated          |
| Coupon apply/remove                                    | Automated          |
| Admin login/logout                                     | Automated          |
| Admin CRUD (Categories, Brands, Products, Coupons)     | Automated          |
| Admin order status updates                             | Automated          |
| Admin return request processing                        | Automated          |
| Admin customer block/unblock                           | Automated          |
| API endpoint validation (JSON responses)               | Automated          |
| Negative/boundary testing                              | Automated          |
| Cross-browser smoke testing                            | Automated          |

### Out of Scope

| Area                                  | Reason                                                              |
| ------------------------------------- | ------------------------------------------------------------------- |
| Google OAuth full flow                | Requires real Google credentials, impractical in CI                 |
| Razorpay real payment                 | Requires test card interaction with external SDK iframe             |
| Email delivery verification           | Requires mailbox access or mail trap service — documented as manual |
| OTP reading from email                | Same as above; OTP will be intercepted from session/console         |
| PDF/Excel download content validation | File download verification only (headers, size); content = manual   |
| Performance/load testing              | Not practical with single MongoDB instance; out of portfolio scope  |
| Mobile app testing                    | No mobile app exists                                                |
| Database migration testing            | No migration scripts exist                                          |
| Banner management                     | Schema exists but no admin CRUD routes are implemented              |

---

## 6. Test Strategy

### 6.1 Testing Types

| Testing Type                 | Relevance                                         | TimeVault Features                                                   | Manual / Automated     | Priority |
| ---------------------------- | ------------------------------------------------- | -------------------------------------------------------------------- | ---------------------- | -------- |
| **Functional Testing**       | Core — validates every feature works correctly    | All modules                                                          | Both                   | P0       |
| **Smoke Testing**            | Quick validation that critical paths are working  | Login, Browse, Add to Cart, Checkout, Admin Login                    | Automated              | P0       |
| **Regression Testing**       | Ensure existing features aren't broken by changes | All modules                                                          | Automated              | P0       |
| **Sanity Testing**           | Quick check after bug fix on specific module      | Targeted module                                                      | Automated (subset)     | P1       |
| **End-to-End Testing**       | Full user journeys across multiple modules        | Signup→Browse→Cart→Checkout→Order→Review                             | Automated              | P0       |
| **Negative Testing**         | Invalid inputs, unauthorized access, edge cases   | Login, Signup, Cart limits, Coupon validation, Address fields        | Automated              | P1       |
| **Boundary Value Analysis**  | Min/max values for quantities, prices, fields     | Cart qty (1-4), coupon amounts, price filters, pincode, phone        | Automated              | P1       |
| **Equivalence Partitioning** | Valid/invalid data classes                        | Email formats, password strength, price ranges, OTP formats          | Automated              | P2       |
| **Authorization Testing**    | Access control between roles                      | User accessing admin routes, admin session validation gaps           | Automated (API)        | P1       |
| **Session Testing**          | Session expiry, concurrent sessions, blocked user | Login/logout, session timeout, blocked mid-session                   | Manual + Automated     | P1       |
| **API Testing**              | Validate JSON endpoint contracts                  | Cart, Wishlist, Coupon, Order cancel/return, Admin status update     | Automated              | P0       |
| **Integration Testing**      | Component interactions                            | Cart→Checkout→Order→Wallet refund, Coupon→Order discount calculation | Automated              | P1       |
| **Cross-Browser Testing**    | Consistent behavior across browsers               | UI rendering, form submissions                                       | Automated (smoke only) | P2       |
| **Validation Testing**       | Form field validation                             | Signup, Address, Coupon, Product add forms                           | Automated              | P1       |

### 6.2 Testing Types NOT Included (with justification)

| Testing Type              | Reason for Exclusion                                                                |
| ------------------------- | ----------------------------------------------------------------------------------- |
| Visual Regression Testing | EJS templates with manual CSS — high maintenance; consider as advanced stretch goal |
| Accessibility Testing     | Not a stated requirement; could add as advanced phase                               |
| Performance Testing       | Single-server app; meaningful load testing requires dedicated infrastructure        |
| Responsive Testing        | Desktop-focused testing is sufficient for portfolio; responsive is a stretch goal   |

---

## 7. Testing Pyramid

```
         ╱ ╲
        ╱ E2E ╲        (~15% — 10-15 tests)
       ╱  Tests  ╲      Full user journeys: signup→order→review
      ╱───────────╲
     ╱  UI Tests    ╲   (~35% — 30-40 tests)
    ╱   (Page-level)  ╲  Individual page functionality
   ╱───────────────────╲
  ╱   API / Integration  ╲  (~50% — 45-55 tests)
 ╱       Tests             ╲  JSON endpoint validation, auth checks
╱───────────────────────────╲
```

### Recommended Ratio

| Level              | % of Automated Tests | Count (est.) | Reason                                                   |
| ------------------ | -------------------- | ------------ | -------------------------------------------------------- |
| API / Integration  | 50%                  | 45-55        | Fast, reliable, test business logic without UI fragility |
| UI (Page-level)    | 35%                  | 30-40        | Validate rendering, forms, navigation for each page      |
| E2E (Full journey) | 15%                  | 10-15        | Cover critical multi-step business flows                 |

**Why this ratio:**

- TimeVault has many JSON endpoints (cart, wishlist, coupon, order actions) that are ideal for API testing
- Server-side rendering means many validations happen on the backend — API tests catch these efficiently
- UI tests are still needed for form interactions, navigation, and visual confirmation
- E2E tests are expensive to maintain; only the most critical flows warrant them

---

## 8. Recommended Technology Stack

### Evaluated Tools

| Tool                | Purpose              | Benefit                                                     | Complexity | Verdict               | Where Used             |
| ------------------- | -------------------- | ----------------------------------------------------------- | ---------- | --------------------- | ---------------------- |
| **Playwright**      | UI + API automation  | First-party API testing, multi-browser, auto-wait, fixtures | Medium     | ✅ Include            | Core framework         |
| **TypeScript**      | Language             | Type safety, autocomplete, catches errors early             | Medium     | ✅ Include            | All test code          |
| **Node.js 18+**     | Runtime              | Same ecosystem as app under test                            | Low        | ✅ Include            | Everything             |
| **npm**             | Package manager      | Standard for Node.js                                        | Low        | ✅ Include            | Dependencies           |
| **@faker-js/faker** | Test data generation | Dynamic, realistic data; avoids duplicate conflicts         | Low        | ✅ Include            | Test data              |
| **dotenv**          | Environment config   | Secure credential management                                | Low        | ✅ Include            | Config                 |
| **Allure Report**   | Test reporting       | Rich reports with steps, screenshots, categories            | Medium     | ✅ Include            | Reporting              |
| **ESLint**          | Linting              | Catches code issues, enforces consistency                   | Low        | ✅ Include            | Code quality           |
| **Prettier**        | Formatting           | Consistent code style                                       | Low        | ✅ Include            | Code quality           |
| **Git + GitHub**    | Version control      | Industry standard                                           | Low        | ✅ Include            | Everything             |
| **Jenkins**         | CI/CD                | Industry-standard CI, pipeline as code                      | Medium     | ✅ Include            | CI/CD                  |
| Axios               | HTTP client          | Playwright has built-in `APIRequestContext`                 | —          | ❌ Exclude            | Not needed             |
| Zod/Ajv             | Schema validation    | Only ~10 JSON endpoints; inline assertions sufficient       | —          | ❌ Exclude            | Overkill               |
| Winston/Pino        | Logging              | Playwright has built-in test info logging + console         | —          | ❌ Exclude            | Overkill               |
| Excel/CSV utilities | Data-driven testing  | Test data can be managed with TypeScript objects + faker    | —          | ❌ Exclude            | Unnecessary complexity |
| Husky + lint-staged | Pre-commit hooks     | Nice but adds setup complexity for portfolio project        | —          | ❌ Exclude (Advanced) | Optional               |
| Docker              | Containerization     | Useful for CI but requires Docker knowledge + infra         | —          | ❌ Exclude (Advanced) | Optional               |
| SonarQube           | Code analysis        | Overkill for test project                                   | —          | ❌ Exclude            | Not needed             |
| GitHub Actions      | CI alternative       | Jenkins already chosen; adding both is redundant            | —          | ❌ Exclude            | Stick with Jenkins     |

---

## 9. Framework Architecture

### Core Design Principles

1. **Page Object Model (POM)** — Each page gets a class encapsulating locators and actions
2. **Component Model** — Reusable UI components (Header, Pagination, Toast) shared across pages
3. **Fixtures** — Playwright custom fixtures for auth state, test data, page objects
4. **API Client Layer** — Separate classes for API calls using `APIRequestContext`
5. **Test Data Layer** — Centralized, typed test data with faker generation
6. **Configuration Layer** — Environment-based config via dotenv + `playwright.config.ts`
7. **Strict Separation** — Tests NEVER interact with the database directly

### Architecture Layers

```
┌──────────────────────────────────────────────┐
│                 TEST SPECS                    │
│  (tests/user/*.spec.ts, tests/admin/*.spec.ts│
│   tests/api/*.spec.ts)                       │
├──────────────────────────────────────────────┤
│               FIXTURES                        │
│  (Authentication, Page Object injection,      │
│   Test Data setup)                            │
├──────────────────────────────────────────────┤
│          PAGE OBJECTS + COMPONENTS            │
│  (pages/user/*.page.ts, pages/admin/*.page.ts│
│   components/*.component.ts)                  │
├──────────────────────────────────────────────┤
│            API CLIENTS                        │
│  (api/auth.api.ts, api/cart.api.ts, etc.)    │
├──────────────────────────────────────────────┤
│          UTILITIES & HELPERS                  │
│  (utils/helpers.ts, utils/assertions.ts)     │
├──────────────────────────────────────────────┤
│          TEST DATA & TYPES                    │
│  (data/test-data.ts, types/index.ts)         │
├──────────────────────────────────────────────┤
│          CONFIGURATION                        │
│  (config/env.config.ts, playwright.config.ts)│
└──────────────────────────────────────────────┘
              ↕ HTTP(S) ↕
┌──────────────────────────────────────────────┐
│     TIMEVAULT APPLICATION (localhost:3000)    │
│     Node.js + Express + MongoDB              │
└──────────────────────────────────────────────┘
```

---

## 10. Directory Structure

```
timevault-qa/
├── .env                          # Local env vars (NEVER committed)
├── .env.example                  # Template for env vars
├── .eslintrc.json                # ESLint config
├── .prettierrc                   # Prettier config
├── .gitignore                    # Git ignore rules
├── Jenkinsfile                   # Jenkins pipeline definition
├── playwright.config.ts          # Playwright configuration
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
├── README.md                     # Project overview & setup
│
├── config/
│   └── env.config.ts             # Centralized environment configuration
│
├── pages/
│   ├── user/
│   │   ├── login.page.ts
│   │   ├── signup.page.ts
│   │   ├── home.page.ts
│   │   ├── shop.page.ts
│   │   ├── product-details.page.ts
│   │   ├── cart.page.ts
│   │   ├── checkout.page.ts
│   │   ├── order-success.page.ts
│   │   ├── orders.page.ts
│   │   ├── order-details.page.ts
│   │   ├── profile.page.ts
│   │   ├── address.page.ts
│   │   ├── wishlist.page.ts
│   │   ├── wallet.page.ts
│   │   ├── contact.page.ts
│   │   └── forgot-password.page.ts
│   │
│   └── admin/
│       ├── admin-login.page.ts
│       ├── dashboard.page.ts
│       ├── customers.page.ts
│       ├── categories.page.ts
│       ├── brands.page.ts
│       ├── products.page.ts
│       ├── product-add.page.ts
│       ├── coupons.page.ts
│       ├── orders.page.ts
│       ├── return-requests.page.ts
│       └── sales-report.page.ts
│
├── components/
│   ├── header.component.ts       # User site header/nav
│   ├── admin-header.component.ts # Admin sidebar/nav
│   ├── pagination.component.ts   # Reusable pagination
│   ├── toast.component.ts        # Toast/alert notifications
│   └── product-card.component.ts # Product card on shop/home
│
├── api/
│   ├── auth.api.ts               # Login, session management
│   ├── cart.api.ts               # Cart CRUD endpoints
│   ├── wishlist.api.ts           # Wishlist endpoints
│   ├── coupon.api.ts             # Coupon apply/remove
│   ├── order.api.ts              # Order cancel, return
│   ├── admin-auth.api.ts         # Admin login
│   └── admin-order.api.ts        # Admin order status update
│
├── fixtures/
│   ├── base.fixture.ts           # Extended test with page objects
│   ├── auth.fixture.ts           # Authenticated user/admin fixtures
│   └── test-data.fixture.ts      # Dynamic test data fixture
│
├── data/
│   ├── test-users.ts             # Test account credentials
│   ├── test-data.ts              # Static test data (addresses, products)
│   └── generators.ts             # Faker-based dynamic data generators
│
├── types/
│   └── index.ts                  # TypeScript interfaces & types
│
├── utils/
│   ├── helpers.ts                # Common utility functions
│   └── custom-assertions.ts      # Reusable assertion helpers
│
├── tests/
│   ├── user/
│   │   ├── auth.spec.ts          # Login, signup, logout
│   │   ├── home.spec.ts          # Homepage tests
│   │   ├── shop.spec.ts          # Shop browsing, search, filter, sort
│   │   ├── product-details.spec.ts
│   │   ├── cart.spec.ts          # Cart operations
│   │   ├── checkout.spec.ts      # Checkout flow
│   │   ├── orders.spec.ts        # Order management
│   │   ├── profile.spec.ts       # Profile operations
│   │   ├── address.spec.ts       # Address CRUD
│   │   ├── wishlist.spec.ts      # Wishlist operations
│   │   └── wallet.spec.ts        # Wallet operations
│   │
│   ├── admin/
│   │   ├── admin-auth.spec.ts    # Admin login/logout
│   │   ├── customers.spec.ts     # Customer management
│   │   ├── categories.spec.ts    # Category CRUD
│   │   ├── brands.spec.ts        # Brand CRUD
│   │   ├── products.spec.ts      # Product CRUD
│   │   ├── coupons.spec.ts       # Coupon CRUD
│   │   ├── orders.spec.ts        # Order management
│   │   └── returns.spec.ts       # Return processing
│   │
│   ├── api/
│   │   ├── cart-api.spec.ts      # Cart JSON endpoints
│   │   ├── wishlist-api.spec.ts  # Wishlist JSON endpoints
│   │   ├── coupon-api.spec.ts    # Coupon JSON endpoints
│   │   ├── order-api.spec.ts     # Order action endpoints
│   │   ├── auth-api.spec.ts      # Auth-related endpoints
│   │   └── admin-api.spec.ts     # Admin JSON endpoints
│   │
│   └── e2e/
│       ├── user-purchase-flow.spec.ts
│       ├── order-cancel-refund.spec.ts
│       └── admin-product-lifecycle.spec.ts
│
├── auth/                         # Saved auth state files (gitignored)
│   ├── user-state.json
│   └── admin-state.json
│
├── docs/
│   ├── TEST_PLAN.md
│   ├── TEST_STRATEGY.md
│   ├── AUTOMATION_ARCHITECTURE.md
│   ├── CI_CD.md
│   ├── TEST_DATA.md
│   └── BUG_REPORTS.md
│
├── test-artifacts/               # Test scenario & case files
│   ├── TEST_SCENARIOS.md
│   ├── TEST_CASES.md
│   └── RTM.md
│
└── reports/                      # Generated reports (gitignored)
    ├── allure-results/
    ├── allure-report/
    └── playwright-report/
```

### Directory Explanations

| Directory         | Purpose                                                                    |
| ----------------- | -------------------------------------------------------------------------- |
| `config/`         | Environment configuration — reads from `.env`, exports typed config object |
| `pages/`          | Page Object Model classes organized by user/admin role                     |
| `components/`     | Reusable UI component classes shared across pages                          |
| `api/`            | API client classes using `APIRequestContext` for JSON endpoint testing     |
| `fixtures/`       | Playwright custom fixtures for DI of page objects, auth state, test data   |
| `data/`           | Test data definitions — static values and faker-based generators           |
| `types/`          | TypeScript interfaces for test data, API responses, page parameters        |
| `utils/`          | Shared helper functions and custom assertion utilities                     |
| `tests/`          | Test specifications organized by domain (user/admin/api/e2e)               |
| `auth/`           | Saved browser storage state for session reuse (gitignored)                 |
| `docs/`           | QA documentation files                                                     |
| `test-artifacts/` | Test case and scenario documentation                                       |
| `reports/`        | Generated test reports (gitignored)                                        |

---

## 11. Page Object Architecture

### User-Side Page Objects

| Page Object          | Source View           | Key Actions                                                                                                                |
| -------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `LoginPage`          | `login.ejs`           | enterEmail(), enterPassword(), clickLogin(), getErrorMessage(), clickGoogleLogin()                                         |
| `SignupPage`         | `signup.ejs`          | fillSignupForm(), clickSignup(), getValidationError()                                                                      |
| `HomePage`           | `home.ejs`            | getProductCards(), navigateToShop(), getProductCount()                                                                     |
| `ShopPage`           | `shop.ejs`            | searchProduct(), filterByCategory(), filterByBrand(), filterByPrice(), sortBy(), getProducts(), goToPage(), getPageCount() |
| `ProductDetailsPage` | `product-details.ejs` | getProductName(), getPrice(), addToCart(), addToWishlist(), getReviews()                                                   |
| `CartPage`           | `cart.ejs`            | getCartItems(), updateQuantity(), removeItem(), getCartTotal(), proceedToCheckout()                                        |
| `CheckoutPage`       | `checkoutPage.ejs`    | selectAddress(), addNewAddress(), applyCoupon(), removeCoupon(), selectPaymentMethod(), placeOrder()                       |
| `OrderSuccessPage`   | `orderSuccess.ejs`    | getOrderId(), getOrderSummary()                                                                                            |
| `OrdersPage`         | `userOrders.ejs`      | getOrders(), viewOrder(), getPageCount()                                                                                   |
| `OrderDetailsPage`   | `orderDetails.ejs`    | getOrderStatus(), cancelOrder(), cancelItem(), returnItem(), writeReview()                                                 |
| `ProfilePage`        | `profile.ejs`         | getUserInfo(), navigateToEditProfile(), navigateToChangeEmail(), navigateToChangePassword()                                |
| `AddressPage`        | `userAddress.ejs`     | getAddresses(), addAddress(), editAddress(), deleteAddress()                                                               |
| `WishlistPage`       | `wishlistPage.ejs`    | getWishlistItems(), removeItem(), moveToCart()                                                                             |
| `WalletPage`         | `wallet.ejs`          | getBalance(), getTransactions(), addMoney()                                                                                |
| `ContactPage`        | `contact.ejs`         | fillContactForm(), submitForm(), getMessage()                                                                              |
| `ForgotPasswordPage` | `forgotPassword.ejs`  | enterEmail(), submit()                                                                                                     |

### Admin-Side Page Objects

| Page Object               | Source View           | Key Actions                                                                                                 |
| ------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `AdminLoginPage`          | `admin-login.ejs`     | enterEmail(), enterPassword(), clickLogin(), getErrorMessage()                                              |
| `AdminDashboardPage`      | `dashboard.ejs`       | getStats(), getChartData(), downloadReport()                                                                |
| `AdminCustomersPage`      | `customers.ejs`       | getCustomers(), blockCustomer(), unblockCustomer()                                                          |
| `AdminCategoriesPage`     | `category.ejs`        | getCategories(), addCategory(), editCategory(), listCategory(), unlistCategory(), addOffer(), removeOffer() |
| `AdminBrandsPage`         | `brands.ejs`          | getBrands(), addBrand(), editBrand(), deleteBrand(), toggleStatus(), addOffer(), removeOffer()              |
| `AdminProductsPage`       | `products.ejs`        | getProducts(), blockProduct(), unblockProduct(), addOffer(), removeOffer()                                  |
| `AdminProductAddPage`     | `product-add.ejs`     | fillProductForm(), uploadImages(), submitProduct()                                                          |
| `AdminCouponsPage`        | `coupon.ejs`          | getCoupons(), addCoupon(), editCoupon(), deleteCoupon()                                                     |
| `ordersPage`              | `orderManagement.ejs` | getOrders(), viewOrder(), updateStatus(), searchOrder(), filterByStatus()                                   |
| `AdminReturnRequestsPage` | `returnRequests.ejs`  | getRequests(), approveReturn(), declineReturn()                                                             |
| `AdminSalesReportPage`    | `sales-report.ejs`    | filterReport(), downloadReport()                                                                            |

### Reusable Components

| Component              | Used By                            | Key Actions                                                                            |
| ---------------------- | ---------------------------------- | -------------------------------------------------------------------------------------- |
| `HeaderComponent`      | All user pages                     | navigateToCart(), navigateToWishlist(), navigateToProfile(), searchProduct(), logout() |
| `AdminHeaderComponent` | All admin pages                    | navigateTo(section), getActiveSection(), logout()                                      |
| `PaginationComponent`  | Shop, Orders, Address, Wallet      | goToPage(), getCurrentPage(), getTotalPages(), hasNext(), hasPrevious()                |
| `ToastComponent`       | Various pages (after AJAX actions) | getMessage(), getType(), waitForToast(), dismiss()                                     |
| `ProductCardComponent` | Home, Shop                         | getProductName(), getPrice(), clickProduct(), addToCart(), addToWishlist()             |

### Page Object ↔ Component Interaction

```typescript
// Example: ShopPage uses PaginationComponent and ProductCardComponent
class ShopPage {
  readonly pagination: PaginationComponent;

  constructor(private page: Page) {
    this.pagination = new PaginationComponent(page);
  }

  async getProductCards(): Promise<ProductCardComponent[]> {
    // Returns array of ProductCardComponent instances
  }
}
```

---

## 12. Fixture Strategy

### Custom Fixtures Design

```typescript
// fixtures/base.fixture.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/user/login.page';
import { HomePage } from '../pages/user/home.page';
// ... other page imports

type PageFixtures = {
  loginPage: LoginPage;
  homePage: HomePage;
  shopPage: ShopPage;
  cartPage: CartPage;
  // ... all page objects
};

export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  // ... etc
});
```

### Auth Fixtures

```typescript
// fixtures/auth.fixture.ts
// Provides pre-authenticated browser contexts

type AuthFixtures = {
  userPage: Page; // Page with user session
  adminPage: Page; // Page with admin session
};

// Uses storageState saved from setup project
```

### Test Data Fixtures

```typescript
// fixtures/test-data.fixture.ts
type DataFixtures = {
  testUser: UserCredentials;
  testAddress: AddressData;
  uniqueEmail: string; // Faker-generated for each test
};
```

---

## 13. Authentication Strategy

### Decision Matrix

| Test Type               | Auth Method                        | Reason                                   |
| ----------------------- | ---------------------------------- | ---------------------------------------- |
| Login/Signup tests      | Real UI login                      | Testing the login flow itself            |
| Smoke tests (first run) | UI login + save `storageState`     | One-time login, reused for session       |
| All other user tests    | `storageState` reuse               | Fast, avoids repeated login overhead     |
| All admin tests         | `storageState` reuse               | Same — login once in setup               |
| API tests               | Cookie-based session via API login | `POST /login` then reuse session cookies |
| Auth boundary tests     | No auth (fresh context)            | Testing unauthenticated access           |

### Implementation Plan

1. **Setup project** in `playwright.config.ts` runs login once, saves state to `auth/user-state.json` and `auth/admin-state.json`
2. **Test projects** reference saved state via `storageState`
3. **API tests** use `APIRequestContext` with cookies extracted from a login call
4. **Never hardcode passwords** — credentials come from `.env` → `config/env.config.ts`

### Test Account Management

| Account       | Purpose                      | How Created                                                        |
| ------------- | ---------------------------- | ------------------------------------------------------------------ |
| Test User     | Standard user tests          | Pre-created in DB via app signup (one-time manual or setup script) |
| Test Admin    | Admin tests                  | Pre-existing admin record in DB (seeded)                           |
| Dynamic Users | Signup tests, referral tests | Created via faker during test, cleaned up if needed                |

### Credential Protection

- `.env` file with `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`, `TEST_ADMIN_EMAIL`, `TEST_ADMIN_PASSWORD`
- `.env` is in `.gitignore`
- `.env.example` documents required variables without values
- Jenkins uses credential binding (masked environment variables)

---

## 14. Test Data Strategy

### Static Test Data

```typescript
// data/test-data.ts
export const TEST_ADDRESS = {
  addressType: 'Home',
  name: 'Test User',
  city: 'Kochi',
  landMark: 'Near Metro Station',
  state: 'Kerala',
  pincode: 682001,
  phone_no: 9876543210,
  altPhone_no: 9876543211,
};

export const VALID_COUPON = {
  // Will be created during test setup or pre-seeded
  code: 'TESTCOUP10',
  offerPrice: 100,
  minimumPrice: 500,
  maxPrice: 10000,
};
```

### Dynamic Test Data (Faker)

```typescript
// data/generators.ts
import { faker } from '@faker-js/faker';

export function generateUser() {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    phoneNumber: faker.string.numeric(10),
    password: 'Test@12345', // Consistent password format
  };
}

export function generateAddress() {
  return {
    addressType: faker.helpers.arrayElement(['Home', 'Work', 'Other']),
    name: faker.person.fullName(),
    city: faker.location.city(),
    landMark: `Near ${faker.company.name()}`,
    state: faker.location.state(),
    pincode: faker.number.int({ min: 100000, max: 999999 }),
    phone_no: Number(faker.string.numeric(10)),
    altPhone_no: Number(faker.string.numeric(10)),
  };
}
```

### Test Data Isolation Rules

1. **Each test creates its own data** — never depend on data from another test
2. **Use faker for unique values** — avoids duplicate key conflicts (e.g., email uniqueness)
3. **Cleanup when necessary** — delete addresses created during tests; cart items cleared after checkout
4. **No direct database manipulation** — all data created through app endpoints
5. **Coupon/Product data** — pre-seeded in test environment; tests don't create new products (admin creates in admin tests)

---

## 15. Test Case Strategy

### Test Case ID Format

```
TC-[MODULE]-[NUMBER]

Examples:
TC-AUTH-001    User login with valid credentials
TC-CART-005   Add product exceeding max quantity
TC-ADM-CAT-003  Admin edit category
```

### Module Naming Convention

| Module Code | Module Name             |
| ----------- | ----------------------- |
| AUTH        | User Authentication     |
| HOME        | Homepage                |
| SHOP        | Shop / Product Browsing |
| PROD        | Product Details         |
| CART        | Cart                    |
| CHKOUT      | Checkout                |
| ORDER       | Orders                  |
| PROF        | Profile                 |
| ADDR        | Address Management      |
| WISH        | Wishlist                |
| WALLET      | Wallet                  |
| COUP        | Coupons                 |
| REV         | Reviews                 |
| REF         | Referrals               |
| CONTACT     | Contact Page            |
| ADM-AUTH    | Admin Authentication    |
| ADM-DASH    | Admin Dashboard         |
| ADM-CUST    | Admin Customers         |
| ADM-CAT     | Admin Categories        |
| ADM-BRAND   | Admin Brands            |
| ADM-PROD    | Admin Products          |
| ADM-COUP    | Admin Coupons           |
| ADM-ORD     | Admin Orders            |
| ADM-RET     | Admin Returns           |
| ADM-SALES   | Admin Sales Reports     |
| API         | API Tests               |

### Test Case Template

| Field                 | Description                          |
| --------------------- | ------------------------------------ |
| **Test Case ID**      | TC-MODULE-NNN                        |
| **Title**             | Descriptive title                    |
| **Module**            | Feature module                       |
| **Priority**          | P0/P1/P2/P3                          |
| **Severity**          | Critical/High/Medium/Low             |
| **Preconditions**     | State required before test           |
| **Test Data**         | Specific data needed                 |
| **Steps**             | Numbered action steps                |
| **Expected Result**   | What should happen                   |
| **Actual Result**     | (Filled during execution)            |
| **Status**            | Pass/Fail/Blocked/Skipped            |
| **Automation Status** | Automated/Manual/To Be Automated     |
| **Tags**              | @smoke, @regression, @negative, etc. |

### Estimated Test Case Counts by Module

| Module                           | Documented Test Cases | Automated Tests | Priority |
| -------------------------------- | --------------------- | --------------- | -------- |
| AUTH (User)                      | 18                    | 12              | P0       |
| HOME                             | 5                     | 4               | P2       |
| SHOP (Browse/Search/Filter/Sort) | 16                    | 12              | P1       |
| PRODUCT DETAILS                  | 8                     | 6               | P1       |
| CART                             | 14                    | 10              | P0       |
| CHECKOUT                         | 12                    | 8               | P0       |
| ORDERS                           | 12                    | 8               | P0       |
| PROFILE                          | 8                     | 5               | P2       |
| ADDRESS                          | 10                    | 7               | P1       |
| WISHLIST                         | 8                     | 6               | P1       |
| WALLET                           | 6                     | 4               | P2       |
| COUPONS (User)                   | 8                     | 6               | P1       |
| REVIEWS                          | 5                     | 3               | P2       |
| REFERRALS                        | 4                     | 2               | P3       |
| CONTACT                          | 3                     | 2               | P3       |
| ADMIN AUTH                       | 6                     | 4               | P0       |
| ADMIN CUSTOMERS                  | 5                     | 4               | P1       |
| ADMIN CATEGORIES                 | 8                     | 6               | P1       |
| ADMIN BRANDS                     | 7                     | 5               | P2       |
| ADMIN PRODUCTS                   | 10                    | 7               | P1       |
| ADMIN COUPONS                    | 8                     | 6               | P1       |
| ADMIN ORDERS                     | 8                     | 6               | P0       |
| ADMIN RETURNS                    | 5                     | 4               | P1       |
| ADMIN SALES REPORT               | 4                     | 2               | P2       |
| API TESTS                        | —                     | 25              | P0       |
| **TOTAL**                        | **~200**              | **~90-100**     |          |

> **Note:** ~200 documented test cases (manual), ~90-100 automated. Not every manual test case needs automation. Positive smoke paths and negative boundary tests get automated first.

---

## 16. Test Scenario Strategy

### Smoke Suite (~15 tests, < 5 min)

| #   | Scenario                                    | Priority |
| --- | ------------------------------------------- | -------- |
| 1   | User can login with valid credentials       | P0       |
| 2   | Homepage loads with products                | P0       |
| 3   | Shop page displays products with pagination | P0       |
| 4   | Product details page loads correctly        | P0       |
| 5   | User can add product to cart                | P0       |
| 6   | User can view cart with correct items       | P0       |
| 7   | User can proceed to checkout                | P0       |
| 8   | User can place COD order                    | P0       |
| 9   | Order success page displays order ID        | P0       |
| 10  | User can view order history                 | P0       |
| 11  | Admin can login                             | P0       |
| 12  | Admin dashboard loads with data             | P0       |
| 13  | Admin can view product list                 | P0       |
| 14  | Admin can view order list                   | P0       |
| 15  | User can logout successfully                | P0       |

### Regression Suite (~90-100 tests)

Full suite including smoke + all automated test cases from every module.

### Sanity Suite (per-module, ~5-10 tests)

- Triggered after specific bug fixes
- Runs only the module affected + its dependencies
- Example: Cart fix → run CART + CHECKOUT + ORDER sanity

### High-Level Test Scenarios (by Module)

#### AUTH Module

| Scenario                                         | Type                 | Priority |
| ------------------------------------------------ | -------------------- | -------- |
| Login with valid credentials → redirects to home | Positive             | P0       |
| Login with wrong password → shows error          | Negative             | P0       |
| Login with non-existent email → shows error      | Negative             | P0       |
| Login as blocked user → shows blocked message    | Negative             | P1       |
| Signup with valid data → OTP page shown          | Positive             | P0       |
| Signup with existing email → error message       | Negative             | P1       |
| Signup with mismatched passwords → error         | Negative/Validation  | P1       |
| Signup with invalid referral code → error        | Negative             | P2       |
| Signup with valid referral code → bonus credited | Positive/Integration | P2       |
| Forgot password → OTP → reset → login            | Positive (E2E)       | P1       |
| Access protected route without login → redirect  | Authorization        | P0       |
| Logout destroys session                          | Positive             | P0       |

#### CART Module

| Scenario                                     | Type              | Priority |
| -------------------------------------------- | ----------------- | -------- |
| Add product to cart → appears in cart        | Positive          | P0       |
| Add product with quantity 1-4 → accepted     | Boundary          | P0       |
| Add product with quantity > 4 → rejected     | Boundary/Negative | P0       |
| Add product exceeding stock → rejected       | Negative          | P1       |
| Add same product again → quantity increments | Positive          | P1       |
| Update cart quantity → total recalculates    | Positive          | P1       |
| Remove item from cart → cart updates         | Positive          | P0       |
| Add to cart without login → redirect/401     | Authorization     | P1       |
| Cart persists across page navigation         | Session           | P2       |
| Empty cart → shows empty state               | Boundary          | P2       |

#### CHECKOUT Module

| Scenario                                      | Type                 | Priority |
| --------------------------------------------- | -------------------- | -------- |
| Checkout with address + COD → order placed    | Positive             | P0       |
| Checkout with wallet payment → wallet debited | Positive/Integration | P1       |
| Checkout with insufficient wallet → error     | Negative             | P1       |
| Apply valid coupon → discount applied         | Positive             | P1       |
| Apply expired coupon → error                  | Negative             | P1       |
| Apply coupon below minimum → error            | Boundary             | P1       |
| Remove coupon → original total restored       | Positive             | P1       |
| Checkout with empty cart → redirect           | Negative             | P2       |
| Add new address from checkout                 | Positive             | P2       |

#### ADMIN ORDERS Module

| Scenario                                        | Type        | Priority |
| ----------------------------------------------- | ----------- | -------- |
| Admin views order list with pagination          | Positive    | P0       |
| Admin updates status Pending → Shipped          | Positive    | P0       |
| Admin updates status Shipped → Out for Delivery | Positive    | P0       |
| Admin updates invalid transition → error        | Negative    | P1       |
| Admin approves return → wallet credited         | Integration | P1       |
| Admin declines return → status updated          | Positive    | P1       |

---

## 17. API Testing Strategy

### Testable JSON Endpoints

Based on actual analysis, these routes return JSON responses and can be tested via `APIRequestContext`:

#### User-Side API Endpoints

| Method | Endpoint                                  | Request Body                             | Response                                             | Auth Required                    |
| ------ | ----------------------------------------- | ---------------------------------------- | ---------------------------------------------------- | -------------------------------- |
| POST   | `/login`                                  | `{email, password}`                      | Redirect (302) or render                             | No                               |
| POST   | `/verify-otp`                             | `{otp}`                                  | `{success, redirectUrl}`                             | Session (OTP flow)               |
| POST   | `/resend-otp`                             | —                                        | `{success, message}`                                 | Session                          |
| POST   | `/addToCart`                              | `{id, quantity}`                         | `{success, message}`                                 | Yes                              |
| POST   | `/removeFromCart`                         | `{productId}`                            | `{success, message}`                                 | Yes                              |
| POST   | `/updateCart`                             | `{items[]}`                              | `{success, message}`                                 | Yes                              |
| POST   | `/applyCoupon`                            | `{couponCode}`                           | `{success, coupon, cartTotal, discount, grandTotal}` | Session                          |
| POST   | `/removeCoupon`                           | —                                        | `{success, cartTotal, grandTotal, availableCoupons}` | Session                          |
| POST   | `/addWishlist`                            | `{id}`                                   | `{success, message}`                                 | Yes* (checks session internally) |
| POST   | `/removeFromWishlist`                     | `{productId}`                            | `{success, message}`                                 | Yes*                             |
| POST   | `/order/cancelItem`                       | `{orderId, itemId, reason}`              | `{success, message, refundAmount}`                   | Yes                              |
| POST   | `/order/returnItem`                       | `{orderId, itemId, reason}`              | `{success, message}`                                 | Yes                              |
| POST   | `/submitReview`                           | FormData (rating, title, review, images) | `{success, message}`                                 | Yes                              |
| POST   | `/walletPaymentOrder`                     | `{addressId}`                            | `{success, orderId}`                                 | Yes                              |
| POST   | `/wallet/createOrder`                     | `{amount}`                               | `{success, order}`                                   | Session                          |
| POST   | `/wallet/paymentSuccess`                  | `{razorpay_*, amount}`                   | `{success, message}`                                 | Session                          |
| GET    | `/shopPage?search=&category=&sort=&page=` | Query params                             | JSON if XHR, else HTML                               | No                               |

#### Admin-Side API Endpoints

| Method | Endpoint                         | Request Body                    | Response                      | Auth Required             |
| ------ | -------------------------------- | ------------------------------- | ----------------------------- | ------------------------- |
| POST   | `/admin/login`                   | `{email, password}`             | `{success, redirect/message}` | No                        |
| POST   | `/admin/addCategory`             | `{name, description}`           | JSON/redirect                 | Yes                       |
| POST   | `/admin/addCategoryOffer`        | `{categoryId, percentage}`      | JSON                          | Yes                       |
| POST   | `/admin/removeCategoryoffer`     | `{categoryId}`                  | JSON                          | Yes                       |
| POST   | `/admin/blockProduct`            | `{id}`                          | JSON                          | Yes                       |
| POST   | `/admin/unblockProduct`          | `{id}`                          | JSON                          | Yes                       |
| POST   | `/admin/addProductOffer`         | `{productId, percentage}`       | JSON                          | Yes                       |
| POST   | `/admin/removeProductOffer`      | `{productId}`                   | JSON                          | Yes                       |
| POST   | `/admin/addCoupon`               | Coupon data                     | `{success, message}`          | Yes                       |
| POST   | `/admin/editCoupon`              | Coupon data                     | `{success, message}`          | Yes                       |
| POST   | `/admin/update-order-status`     | `{orderId, newStatus}`          | `{success, message}`          | Yes                       |
| POST   | `/admin/process-return-request`  | `{orderId, approve, productId}` | `{success, message}`          | Yes                       |
| POST   | `/admin/add-brand-offer`         | `{brandId, percentage}`         | JSON                          | Yes                       |
| POST   | `/admin/remove-brand-offer`      | `{brandId}`                     | JSON                          | Yes                       |
| POST   | `/admin/toggle-brand-status/:id` | —                               | JSON                          | Yes                       |
| GET    | `/admin/dashboard-data`          | Query params                    | JSON                          | Yes                       |
| GET    | `/admin/best-selling`            | Query params                    | JSON                          | Yes                       |
| GET    | `/admin/dashboard-canceled-data` | —                               | JSON                          | **No** (⚠️ Missing auth!) |

### API Testing Approach

1. **Use Playwright's `APIRequestContext`** — no need for Axios
2. **Login via API** — `POST /login` to get session cookie, pass to subsequent requests
3. **Test response structure** — status code, success/message fields, data correctness
4. **Test authorization** — send requests without auth → expect 401/redirect
5. **Test negative cases** — invalid data, missing fields, expired coupon, etc.
6. **Schema validation** — use inline TypeScript type assertions (no Zod/Ajv needed for ~25 endpoints)

### Hybrid Testing Opportunities

| Pattern                | Example                                                |
| ---------------------- | ------------------------------------------------------ |
| API Setup → UI Verify  | Add item to cart via API → verify cart page shows item |
| UI Action → API Verify | Place order via UI → call order API to verify status   |
| API Setup → API Verify | Add coupon via admin API → apply coupon via user API   |

---

## 18. Test Tagging Strategy

### Tags

| Tag           | Purpose                     | Usage                     |
| ------------- | --------------------------- | ------------------------- |
| `@smoke`      | Critical path validation    | CI on every push          |
| `@regression` | Full regression suite       | Nightly/weekly CI run     |
| `@sanity`     | Post-fix quick validation   | Manual trigger per module |
| `@api`        | API-only tests (no browser) | Fast CI validation        |
| `@ui`         | UI browser tests            | Full regression           |
| `@e2e`        | End-to-end journeys         | Regression                |
| `@user`       | User-side tests             | Filter by role            |
| `@admin`      | Admin-side tests            | Filter by role            |
| `@negative`   | Negative test cases         | Regression                |
| `@critical`   | Business-critical tests     | Smoke + priority filter   |
| `@auth`       | Authentication tests        | Module filter             |
| `@cart`       | Cart module tests           | Module filter             |
| `@order`      | Order module tests          | Module filter             |

### Usage in Tests

```typescript
test.describe('Cart Operations @cart @user', () => {
  test('Add product to cart @smoke @critical', async ({ cartPage }) => {
    // ...
  });

  test('Add product exceeding max quantity @negative @regression', async ({ cartPage }) => {
    // ...
  });
});
```

### CLI Usage

```bash
# Run smoke tests
npx playwright test --grep "@smoke"

# Run API tests only
npx playwright test --grep "@api"

# Run user regression excluding slow e2e
npx playwright test --grep "@user" --grep-invert "@e2e"

# Run cart sanity
npx playwright test --grep "@cart.*@sanity"
```

---

## 19. Browser Strategy

### Browser Configuration

| Browser      | Smoke | Regression    | Rationale                                                |
| ------------ | ----- | ------------- | -------------------------------------------------------- |
| **Chromium** | ✅    | ✅            | Primary; most widely used; fastest in Playwright         |
| **Firefox**  | ❌    | ✅            | Gecko engine coverage; catches CSS/rendering differences |
| **WebKit**   | ❌    | ❌ (Advanced) | Safari engine; lowest priority for this portfolio        |

### Strategy

- **Smoke suite:** Chromium only → fast feedback (< 5 min)
- **Regression suite:** Chromium (full) + Firefox (smoke subset)
- **API tests:** No browser needed (headless request context)
- **WebKit:** Only if time permits; add as `SHOULD HAVE`

### Playwright Config

```typescript
projects: [
  { name: 'setup', testMatch: /.*\.setup\.ts/ },
  { name: 'chromium', use: { ...devices['Desktop Chrome'] }, dependencies: ['setup'] },
  {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'] },
    dependencies: ['setup'],
    grep: /@smoke/, // Only smoke tests on Firefox
  },
  { name: 'api', use: { baseURL: env.BASE_URL }, testMatch: /.*api.*\.spec\.ts/ },
];
```

---

## 20. Parallel Execution Strategy

### Constraints

TimeVault uses a **shared MongoDB database** with no test isolation at the database level. This creates conflicts when tests run in parallel and modify the same data.

### Recommended Approach

| Setting         | Value                  | Reason                                                            |
| --------------- | ---------------------- | ----------------------------------------------------------------- |
| `workers`       | 2-3                    | Moderate parallelism; avoids overwhelming single MongoDB instance |
| `fullyParallel` | `false` (within files) | Tests within a file may share context (e.g., login state)         |
| Between files   | Parallel (default)     | Different spec files run in parallel across workers               |

### Isolation Rules

1. **Each test uses unique data** — faker-generated emails, unique coupon codes
2. **Cart tests:** Each test starts by clearing the cart or using a fresh session
3. **Admin tests:** Can conflict if two workers try to edit the same product/category — use dedicated test data per spec file
4. **Order tests:** Create fresh orders per test; never rely on pre-existing orders
5. **Retries:** Limited to 1 retry to handle transient concurrency issues

### Not Recommended

- `workers: 1` — too slow for regression
- `workers: 8+` — too aggressive for shared database
- Parallel admin CRUD — creates data conflicts

---

## 21. Retry & Failure Strategy

### Retry Policy

```typescript
// playwright.config.ts
retries: process.env.CI ? 1 : 0,
// CI: 1 retry (catch transient network/session issues)
// Local: 0 retries (surface flaky tests immediately)
```

### Failure Artifacts

| Artifact       | When Captured       | Purpose                                                   |
| -------------- | ------------------- | --------------------------------------------------------- |
| **Screenshot** | On failure          | Visual evidence of failure state                          |
| **Video**      | On first retry (CI) | Full interaction replay for debugging                     |
| **Trace**      | On first retry (CI) | Network, console, DOM snapshots — Playwright Trace Viewer |

### Configuration

```typescript
use: {
  screenshot: 'only-on-failure',
  video: 'on-first-retry',
  trace: 'on-first-retry',
}
```

### Flaky Test Management

1. **Identify:** Tests that fail inconsistently are flagged during CI runs
2. **Isolate:** Move to `@flaky` tag, investigate root cause
3. **Fix:** Add proper waits, improve locators, fix test data issues
4. **Never** use retries to mask genuine failures or flaky tests
5. **Track:** Document flaky tests in a section of the test report

---

## 22. Reporting Strategy

### Primary: Allure Report

| Feature                                      | Value                          |
| -------------------------------------------- | ------------------------------ |
| Test categorization by suite, feature, story | ✅                             |
| Step-by-step execution breakdown             | ✅                             |
| Screenshots attached to failed tests         | ✅                             |
| Environment info (browser, OS, base URL)     | ✅                             |
| Trend graphs (across runs)                   | ✅ (when run history retained) |
| Severity/priority labels                     | ✅ (via test tags)             |

### Secondary: Playwright HTML Report

- Built-in, zero-config
- Used for local development
- Quick pass/fail overview

### Implementation

```bash
# Install
npm install -D allure-playwright allure-commandline

# Generate report after run
npx allure generate allure-results --clean -o allure-report
npx allure open allure-report
```

### Jenkins Archiving

| Artifact             | Retention      | Purpose                     |
| -------------------- | -------------- | --------------------------- |
| `allure-results/`    | Last 10 builds | Report generation + trend   |
| `playwright-report/` | Last 5 builds  | Backup HTML report          |
| `test-results/`      | Last 5 builds  | Screenshots, videos, traces |

---

## 23. Jenkins CI/CD Strategy

### Pipeline Stages

```
┌─────────┐   ┌─────────┐   ┌────────┐   ┌──────────┐   ┌───────────┐   ┌────────┐
│ Checkout │ → │ Install │ → │  Lint  │ → │  Smoke   │ → │Regression │ → │ Report │
│          │   │         │   │        │   │  Tests   │   │  Tests    │   │        │
└─────────┘   └─────────┘   └────────┘   └──────────┘   └───────────┘   └────────┘
                                               │                │              │
                                          Fail = Stop      Fail = Continue   Archive
```

### Jenkinsfile Concept

```groovy
pipeline {
    agent any

    environment {
        NODE_VERSION = '18'
        TEST_USER_EMAIL = credentials('timevault-test-user-email')
        TEST_USER_PASSWORD = credentials('timevault-test-user-password')
        TEST_ADMIN_EMAIL = credentials('timevault-test-admin-email')
        TEST_ADMIN_PASSWORD = credentials('timevault-test-admin-password')
        BASE_URL = 'http://localhost:3000'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install --with-deps chromium firefox'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Smoke Tests') {
            steps {
                sh 'npx playwright test --grep "@smoke" --project=chromium'
            }
        }

        stage('Regression Tests') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                    triggeredBy 'TimerTrigger'  // Nightly
                }
            }
            steps {
                sh 'npx playwright test --project=chromium --project=firefox'
            }
        }

        stage('Report') {
            steps {
                sh 'npx allure generate allure-results --clean -o allure-report'
            }
        }
    }

    post {
        always {
            allure includeProperties: false, results: [[path: 'allure-results']]
            publishHTML(target: [
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Report'
            ])
            archiveArtifacts artifacts: 'test-results/**', allowEmptyArchive: true
        }
        failure {
            echo 'Tests failed! Check reports for details.'
        }
    }
}
```

### Jenkins Configuration

| Setting              | Value                                                                    |
| -------------------- | ------------------------------------------------------------------------ |
| Trigger (Smoke)      | On every push to `main` or `develop`                                     |
| Trigger (Regression) | Nightly at 2:00 AM or manual trigger                                     |
| Credentials          | Jenkins credential store (masked env vars)                               |
| Artifact Retention   | 10 builds                                                                |
| Failure Behavior     | Smoke failure = pipeline stops; Regression failure = continues to report |
| Timeout              | Smoke: 10 min; Regression: 30 min                                        |
| Node.js              | Install via NodeJS plugin or pre-installed on agent                      |

---

## 24. Git / GitHub Strategy

### Branch Strategy

```
main          ← Stable, reviewed code only
  └── develop  ← Integration branch
       ├── feature/auth-tests       ← Feature branches
       ├── feature/cart-tests
       ├── feature/api-tests
       └── fix/flaky-login-test
```

### Naming Conventions

| Type           | Convention                                         | Example                                |
| -------------- | -------------------------------------------------- | -------------------------------------- |
| Feature branch | `feature/module-description`                       | `feature/cart-api-tests`               |
| Bug fix branch | `fix/description`                                  | `fix/flaky-login-redirect`             |
| Commit message | `type(scope): description`                         | `feat(cart): add cart CRUD test cases` |
| Commit types   | `feat`, `fix`, `test`, `docs`, `refactor`, `chore` |                                        |

### .gitignore

```
node_modules/
.env
auth/
reports/
allure-results/
allure-report/
playwright-report/
test-results/
*.state.json
```

### Repository README

The QA project should have its own repository (separate from the TimeVault app):

```
timevault-qa/
  README.md → Project overview, setup, run instructions, architecture diagram
```

---

## 25. Code Quality Strategy

### Included Tools

| Tool                       | Purpose                                   | Config                                     |
| -------------------------- | ----------------------------------------- | ------------------------------------------ |
| **ESLint**                 | Catch TypeScript issues, enforce patterns | `.eslintrc.json` with `@typescript-eslint` |
| **Prettier**               | Consistent formatting                     | `.prettierrc`                              |
| **TypeScript strict mode** | Type safety                               | `tsconfig.json` with `strict: true`        |

### Coding Standards

| Area                  | Convention                                                                 |
| --------------------- | -------------------------------------------------------------------------- |
| **Page Object files** | `kebab-case.page.ts` (e.g., `product-details.page.ts`)                     |
| **Test files**        | `kebab-case.spec.ts` (e.g., `cart.spec.ts`)                                |
| **Component files**   | `kebab-case.component.ts`                                                  |
| **API client files**  | `kebab-case.api.ts`                                                        |
| **Class names**       | PascalCase (`CartPage`, `HeaderComponent`)                                 |
| **Method names**      | camelCase (`addToCart()`, `getErrorMessage()`)                             |
| **Test descriptions** | Descriptive human-readable sentences                                       |
| **Locators**          | Prefer `getByRole()`, `getByText()`, `getByTestId()`, `getByPlaceholder()` |
| **Avoid**             | XPath unless absolutely necessary; `page.waitForTimeout()`                 |
| **Constants**         | UPPER_SNAKE_CASE                                                           |

### NOT Included (Justified)

| Tool                | Reason                                                         |
| ------------------- | -------------------------------------------------------------- |
| Husky + lint-staged | Added complexity for solo developer; can add later as ADVANCED |
| SonarQube           | Overkill for test project                                      |

---

## 26. Bug Management Strategy

### Platform: GitHub Issues

Use GitHub Issues in the QA repository with structured templates.

### Bug Report Template

```markdown
## Bug Report

**Bug ID:** BUG-NNN
**Title:** [Module] - Brief description
**Environment:** Chrome 120 / Node 18 / localhost:3000
**Severity:** Critical | High | Medium | Low
**Priority:** P0 | P1 | P2 | P3

### Preconditions

- User is logged in as test user
- Cart has 1 item

### Steps to Reproduce

1. Navigate to /checkoutPage
2. Apply coupon "TESTCOUP10"
3. Click "Place Order"

### Expected Result

Order should be placed with coupon discount applied.

### Actual Result

Error: "Internal Server Error" returned.

### Evidence

- Screenshot: [attached]
- Console error: [attached]
- Trace file: [attached]

### Status

Open | In Progress | Fixed | Verified | Closed

### Related Test Case

TC-CHKOUT-005
```

### Bug Tracking Labels

| Label               | Color    | Usage                    |
| ------------------- | -------- | ------------------------ |
| `bug`               | red      | Confirmed defect         |
| `severity-critical` | dark red | System crash, data loss  |
| `severity-high`     | orange   | Major feature broken     |
| `severity-medium`   | yellow   | Feature partially broken |
| `severity-low`      | green    | Cosmetic, minor          |
| `auth`              | blue     | Authentication module    |
| `cart`              | blue     | Cart module              |
| `admin`             | purple   | Admin-side               |

### Target: 10-15 Real Bugs

These should be **actually discovered** during testing, not fabricated. Based on code analysis, likely bug areas include:

- Missing auth middleware on some routes (e.g., `dashboard-canceled-data`)
- Admin `admincheckSession` checking any admin, not the logged-in admin
- Some wishlist/payment routes missing `auth.checkSession`
- Edge cases in coupon discount calculation for partial order cancellation
- `loadShopPage` — AJAX pagination may have inconsistencies with filters

---

## 27. RTM Strategy

### Requirements Traceability Matrix Format

| Requirement          | Feature           | Test Scenario                | Test Case ID    | Automation Status | Last Result | Bug ID  |
| -------------------- | ----------------- | ---------------------------- | --------------- | ----------------- | ----------- | ------- |
| User can register    | Auth - Signup     | Signup with valid data       | TC-AUTH-001     | Automated         | Pass        | —       |
| User can login       | Auth - Login      | Login with valid credentials | TC-AUTH-005     | Automated         | Pass        | —       |
| Cart max 4 items     | Cart              | Add > 4 qty                  | TC-CART-005     | Automated         | Pass        | —       |
| Admin can block user | Admin - Customers | Block active customer        | TC-ADM-CUST-002 | Automated         | Pass        | —       |
| Coupon minimum cart  | Checkout - Coupon | Apply coupon below min       | TC-COUP-004     | Automated         | Fail        | BUG-003 |

### Maintenance

- Updated after each test execution cycle
- Living document in `test-artifacts/RTM.md`
- Links test cases to specific source code routes/controllers

---

## 28. Documentation Strategy

### Required Documents

| Document                           | Purpose                               | Location        | Format   |
| ---------------------------------- | ------------------------------------- | --------------- | -------- |
| `README.md`                        | Project overview, setup, architecture | Root            | Markdown |
| `docs/TEST_PLAN.md`                | Scope, objectives, strategy, schedule | docs/           | Markdown |
| `docs/TEST_STRATEGY.md`            | Testing types, levels, approach       | docs/           | Markdown |
| `docs/AUTOMATION_ARCHITECTURE.md`  | Framework design, POM, fixtures       | docs/           | Markdown |
| `docs/CI_CD.md`                    | Jenkins pipeline, configuration       | docs/           | Markdown |
| `docs/TEST_DATA.md`                | Test data strategy, accounts          | docs/           | Markdown |
| `docs/BUG_REPORTS.md`              | Discovered defects with evidence      | docs/           | Markdown |
| `test-artifacts/TEST_SCENARIOS.md` | All test scenarios by module          | test-artifacts/ | Markdown |
| `test-artifacts/TEST_CASES.md`     | Detailed test cases                   | test-artifacts/ | Markdown |
| `test-artifacts/RTM.md`            | Requirements Traceability Matrix      | test-artifacts/ | Markdown |

### NOT Required

| Document            | Reason                                        |
| ------------------- | --------------------------------------------- |
| TEST_SCENARIOS.xlsx | Markdown tables are simpler and Git-trackable |
| TEST_CASES.xlsx     | Same — use Markdown for version control       |
| RTM.xlsx            | Same                                          |

> **Why Markdown instead of Excel?** Git can track changes, diffs are readable, no special tools needed. For a portfolio project, Markdown in GitHub renders beautifully.

---

## 29. Portfolio Strategy

### What the GitHub Repository Should Show

```
timevault-qa/
├── README.md                    ← Hero document with badges, screenshots, architecture
├── docs/                        ← Demonstrates QA planning & documentation skills
├── test-artifacts/              ← Demonstrates test case design skills
├── pages/                       ← Demonstrates POM architecture
├── components/                  ← Demonstrates component model
├── api/                         ← Demonstrates API testing
├── fixtures/                    ← Demonstrates Playwright fixtures
├── tests/                       ← Demonstrates automation skills
├── Jenkinsfile                  ← Demonstrates CI/CD
├── playwright.config.ts         ← Demonstrates framework configuration
└── .github/                     ← Professional repo setup
```

### README.md Structure

```markdown
# ⌚ TimeVault QA Automation Framework

## 🏗️ Architecture

[Architecture diagram image]

## 🛠️ Tech Stack

[Badge icons for Playwright, TypeScript, Jenkins, Allure]

## 📊 Test Coverage

| Module | Test Cases | Automated | Pass Rate |
| ------ | ---------- | --------- | --------- |
| ...    | ...        | ...       | ...       |

## 🚀 Quick Start

[Setup instructions]

## 📈 Reports

[Allure report screenshot]
[Jenkins pipeline screenshot]

## 📋 QA Documentation

- [Test Plan](docs/TEST_PLAN.md)
- [Test Strategy](docs/TEST_STRATEGY.md)
- [Test Scenarios](test-artifacts/TEST_SCENARIOS.md)
- [Bug Reports](docs/BUG_REPORTS.md)

## 🧪 Run Tests

[CLI commands for smoke, regression, api]

## 🔄 CI/CD

[Jenkins pipeline diagram]

## 📝 Skills Demonstrated

[Categorized list]
```

### Screenshots to Include

1. Allure Report dashboard
2. Allure test execution details with steps
3. Jenkins pipeline stage view
4. Jenkins build history
5. Playwright Trace Viewer (on a failure)
6. VS Code showing Page Object code

### Key Interview Talking Points

This project lets you confidently explain:

- Why you chose Page Object Model
- How fixtures provide dependency injection
- API vs UI test ratio decisions
- How storageState handles auth efficiently
- Why you used specific Playwright locators
- How the testing pyramid was applied
- What bugs you found and how you reported them
- How the Jenkins pipeline works
- How test data isolation prevents conflicts

---

## 30. Implementation Roadmap

### PHASE 0 — Application Analysis ✅ (This Document)

- **Objective:** Understand TimeVault thoroughly
- **Deliverables:** This blueprint document
- **Status:** Complete (pending approval)

### PHASE 1 — QA Documentation (1-2 days)

- **Objective:** Create all manual QA planning documents
- **What to learn:** Test plan writing, test scenario design, test case design
- **What to implement:**
  - `TEST_PLAN.md`
  - `TEST_STRATEGY.md`
  - `TEST_SCENARIOS.md` (all modules, all priorities)
  - `TEST_CASES.md` (first 50 critical test cases)
- **Deliverables:** Complete QA documentation suite
- **Skills demonstrated:** Manual testing, test planning, test case design
- **Complexity:** Low
- **Dependencies:** This blueprint approved

### PHASE 2 — Playwright + TypeScript Setup (1 day)

- **Objective:** Initialize the automation project
- **What to learn:** Playwright setup, TypeScript config, project structure
- **What to implement:**
  - `npm init` + install Playwright, TypeScript, ESLint, Prettier
  - `playwright.config.ts` with basic config
  - `tsconfig.json` with strict mode
  - `.env.example` and `config/env.config.ts`
  - Directory structure (empty folders with README)
  - `.gitignore`, `.eslintrc.json`, `.prettierrc`
  - First passing test (navigate to home page)
- **Deliverables:** Working project skeleton
- **Skills demonstrated:** Framework setup, TypeScript, configuration
- **Complexity:** Low-Medium
- **Dependencies:** Phase 1

### PHASE 3 — Framework Foundation (2-3 days)

- **Objective:** Build Page Objects, Components, and Fixtures
- **What to learn:** POM pattern, Playwright fixtures, component model
- **What to implement:**
  - Core page objects: `LoginPage`, `HomePage`, `ShopPage`, `CartPage`
  - Components: `HeaderComponent`, `PaginationComponent`
  - Base fixture: `base.fixture.ts`
  - Types: `types/index.ts`
  - Basic helpers: `utils/helpers.ts`
- **Deliverables:** Reusable framework foundation
- **Skills demonstrated:** POM, fixtures, TypeScript classes, component model
- **Complexity:** Medium
- **Dependencies:** Phase 2

### PHASE 4 — Authentication Tests (1-2 days)

- **Objective:** Implement auth test suite + auth fixture
- **What to learn:** Playwright storageState, auth setup project, session handling
- **What to implement:**
  - Auth setup project (save storageState)
  - `auth.fixture.ts`
  - `auth.spec.ts` — login, logout, invalid login, blocked user
  - `AdminLoginPage` + admin auth tests
- **Deliverables:** Auth tests + reusable auth state
- **Skills demonstrated:** Authentication handling, fixtures, negative testing
- **Complexity:** Medium
- **Dependencies:** Phase 3

### PHASE 5 — User Module Tests (3-4 days)

- **Objective:** Automate core user-side modules
- **What to learn:** Complex page interactions, data-driven testing, assertions
- **What to implement:**
  - Remaining page objects (ProductDetails, Checkout, Orders, etc.)
  - Test specs: `shop.spec.ts`, `cart.spec.ts`, `checkout.spec.ts`, `orders.spec.ts`, `wishlist.spec.ts`, `address.spec.ts`, `profile.spec.ts`, `wallet.spec.ts`
  - Test data generators with faker
  - Negative and boundary tests
- **Deliverables:** 30-40 automated user tests
- **Skills demonstrated:** Functional testing, negative testing, BVA, EP
- **Complexity:** Medium-High
- **Dependencies:** Phase 4

### PHASE 6 — Admin Module Tests (2-3 days)

- **Objective:** Automate admin-side modules
- **What to implement:**
  - Admin page objects (Dashboard, Categories, Products, Orders, Returns, etc.)
  - Test specs: `admin-auth.spec.ts`, `customers.spec.ts`, `categories.spec.ts`, `products.spec.ts`, `coupons.spec.ts`, `admin-orders.spec.ts`, `returns.spec.ts`
- **Deliverables:** 20-30 automated admin tests
- **Skills demonstrated:** Multi-role testing, CRUD testing
- **Complexity:** Medium
- **Dependencies:** Phase 5

### PHASE 7 — API Automation (2-3 days)

- **Objective:** Implement API test layer
- **What to learn:** Playwright `APIRequestContext`, cookie management, response validation
- **What to implement:**
  - API client classes: `auth.api.ts`, `cart.api.ts`, `wishlist.api.ts`, `coupon.api.ts`, `order.api.ts`, `admin-order.api.ts`
  - API test specs: `cart-api.spec.ts`, `wishlist-api.spec.ts`, `coupon-api.spec.ts`, `order-api.spec.ts`, `auth-api.spec.ts`, `admin-api.spec.ts`
  - Authorization tests (unauthenticated access)
  - Hybrid tests (API setup → UI verify)
- **Deliverables:** 20-25 API tests
- **Skills demonstrated:** API testing, contract testing, auth validation
- **Complexity:** Medium
- **Dependencies:** Phase 4 (for auth cookies)

### PHASE 8 — E2E Tests + Test Tagging (1-2 days)

- **Objective:** Create full user journeys and organize test suites
- **What to learn:** Test tagging, grep filtering, test organization
- **What to implement:**
  - E2E specs: `user-purchase-flow.spec.ts`, `order-cancel-refund.spec.ts`, `admin-product-lifecycle.spec.ts`
  - Add tags to all existing tests: `@smoke`, `@regression`, `@api`, etc.
  - Smoke suite validation (< 5 min)
  - npm scripts: `test:smoke`, `test:regression`, `test:api`
- **Deliverables:** Tagged test suites, E2E tests
- **Skills demonstrated:** E2E testing, test organization, suite management
- **Complexity:** Low-Medium
- **Dependencies:** Phases 5, 6, 7

### PHASE 9 — Reporting (1 day)

- **Objective:** Set up Allure reporting
- **What to learn:** Allure reporter config, report generation, test annotations
- **What to implement:**
  - Install and configure `allure-playwright`
  - Add Allure annotations (description, severity, feature, story)
  - Generate sample reports
  - Screenshot Allure dashboard for README
- **Deliverables:** Working Allure reports
- **Skills demonstrated:** Test reporting, test management
- **Complexity:** Low-Medium
- **Dependencies:** Phase 8

### PHASE 10 — Jenkins CI/CD (1-2 days)

- **Objective:** Set up Jenkins pipeline
- **What to learn:** Jenkins setup, Jenkinsfile, credentials, artifact archiving
- **What to implement:**
  - Install Jenkins locally
  - `Jenkinsfile` with stages
  - Credential binding
  - Allure plugin integration
  - Pipeline trigger configuration
  - Screenshot Jenkins for README
- **Deliverables:** Working CI/CD pipeline
- **Skills demonstrated:** CI/CD, Jenkins, DevOps basics
- **Complexity:** Medium
- **Dependencies:** Phases 8, 9

### PHASE 11 — Cross-Browser & Parallel (1 day)

- **Objective:** Add multi-browser and parallel execution
- **What to learn:** Playwright projects, workers, test isolation
- **What to implement:**
  - Add Firefox project to config
  - Configure `workers: 2-3`
  - Verify test isolation
  - Update Jenkinsfile for multi-browser
- **Deliverables:** Cross-browser + parallel execution
- **Skills demonstrated:** Cross-browser testing, parallel execution
- **Complexity:** Low-Medium
- **Dependencies:** Phase 10

### PHASE 12 — Bug Hunting & Documentation (1-2 days)

- **Objective:** Run full regression, document real bugs, complete RTM
- **What to implement:**
  - Run full regression suite against live app
  - Document 10-15 real bugs with evidence
  - Complete `BUG_REPORTS.md`
  - Complete `RTM.md`
  - Complete remaining test cases in `TEST_CASES.md`
- **Deliverables:** Bug reports, complete RTM, complete test cases
- **Skills demonstrated:** Bug reporting, traceability, real-world testing
- **Complexity:** Low
- **Dependencies:** Phases 5-11

### PHASE 13 — Portfolio Preparation (1 day)

- **Objective:** Polish everything for presentation
- **What to implement:**
  - Comprehensive `README.md` with architecture diagram, badges, screenshots
  - Report screenshots (Allure, Jenkins)
  - Final code review and cleanup
  - `AUTOMATION_ARCHITECTURE.md` with diagrams
  - Verify all docs are complete and accurate
  - Final commit and push
- **Deliverables:** Portfolio-ready GitHub repository
- **Skills demonstrated:** Documentation, presentation, professionalism
- **Complexity:** Low
- **Dependencies:** Phase 12

### Total Estimated Timeline: 16-24 working days

---

## 31. MVP vs Advanced

### MUST HAVE (MVP — Portfolio-Ready)

| Item                                                     | Phase   |
| -------------------------------------------------------- | ------- |
| QA documentation (Test Plan, Strategy, Scenarios, Cases) | 1       |
| Playwright + TypeScript project setup                    | 2       |
| Page Object Model for core pages (10-12 pages)           | 3       |
| Authentication with storageState                         | 4       |
| User auth tests (login, logout, negative)                | 4       |
| Cart tests (add, remove, update, boundary)               | 5       |
| Checkout test (COD order placement)                      | 5       |
| Shop browsing tests (search, filter, sort)               | 5       |
| Order tests (view, cancel)                               | 5       |
| Admin login/dashboard/order tests                        | 6       |
| API tests for cart, wishlist, coupon endpoints           | 7       |
| Test tagging (@smoke, @regression)                       | 8       |
| Allure reporting                                         | 9       |
| Jenkinsfile (basic pipeline)                             | 10      |
| Chromium browser testing                                 | Default |
| Real bug reports (5-10)                                  | 12      |
| RTM                                                      | 12      |
| Professional README                                      | 13      |
| **Total automated tests: ~60-70**                        |         |

### SHOULD HAVE (Strong Portfolio)

| Item                                              | Phase |
| ------------------------------------------------- | ----- |
| Wishlist tests                                    | 5     |
| Address CRUD tests                                | 5     |
| Wallet tests                                      | 5     |
| Profile tests                                     | 5     |
| Admin category/brand/product CRUD tests           | 6     |
| Admin coupon tests                                | 6     |
| Admin return processing tests                     | 6     |
| E2E journey tests (3 flows)                       | 8     |
| Firefox cross-browser (smoke subset)              | 11    |
| Parallel execution (2-3 workers)                  | 11    |
| Hybrid tests (API setup → UI verify)              | 7     |
| Authorization API tests (missing auth middleware) | 7     |
| 10-15 documented bugs                             | 12    |
| **Total automated tests: ~90-100**                |       |

### ADVANCED / OPTIONAL (Impressive Extras)

| Item                                                         | When                               |
| ------------------------------------------------------------ | ---------------------------------- |
| WebKit (Safari) browser testing                              | After all SHOULD HAVE done         |
| Visual regression testing (Playwright screenshot comparison) | After learning the concept         |
| Data-driven testing from JSON files                          | After learning the concept         |
| Custom Playwright reporter                                   | Advanced learning                  |
| Docker containerization of test execution                    | Advanced infrastructure            |
| GitHub Actions as alternative CI                             | If Jenkins proves problematic      |
| Accessibility testing (axe-playwright)                       | Stretch goal                       |
| Performance baseline tests (page load times)                 | Stretch goal                       |
| Husky pre-commit hooks                                       | When contributing to team projects |

---

## 32. Final Technology Stack

| Category              | Technology                      | Purpose                            | Priority  |
| --------------------- | ------------------------------- | ---------------------------------- | --------- |
| Language              | TypeScript                      | Type-safe test code                | MUST HAVE |
| Runtime               | Node.js 18+                     | JavaScript runtime                 | MUST HAVE |
| Package Manager       | npm                             | Dependency management              | MUST HAVE |
| Automation Framework  | Playwright                      | UI + API testing, multi-browser    | MUST HAVE |
| Test Runner           | Playwright Test                 | Built-in test runner with fixtures | MUST HAVE |
| API Testing           | Playwright `APIRequestContext`  | JSON endpoint testing              | MUST HAVE |
| Assertions            | Playwright `expect` + Web-First | Built-in assertion library         | MUST HAVE |
| Framework Pattern     | Page Object Model               | Maintainable test architecture     | MUST HAVE |
| Test Data             | @faker-js/faker                 | Dynamic, unique test data          | MUST HAVE |
| Environment Config    | dotenv                          | Secure credential management       | MUST HAVE |
| Reporting (Primary)   | Allure Report                   | Rich, detailed test reports        | MUST HAVE |
| Reporting (Secondary) | Playwright HTML Report          | Quick local report                 | MUST HAVE |
| Linting               | ESLint + @typescript-eslint     | Code quality                       | MUST HAVE |
| Formatting            | Prettier                        | Consistent style                   | MUST HAVE |
| Version Control       | Git + GitHub                    | Source control + portfolio         | MUST HAVE |
| CI/CD                 | Jenkins                         | Automated pipeline                 | MUST HAVE |
| Documentation         | Markdown                        | Test plans, reports, README        | MUST HAVE |
| Defect Management     | GitHub Issues                   | Bug tracking                       | MUST HAVE |

---

## 33. Final Architecture Diagram

```
                    ┌─────────────────────────────────────────────┐
                    │              TEST SPECIFICATIONS             │
                    │  ┌──────────┐ ┌──────────┐ ┌────────────┐  │
                    │  │User Tests│ │Admin Test│ │ API Tests  │  │
                    │  │  @smoke  │ │  @admin  │ │   @api     │  │
                    │  │  @user   │ │  @smoke  │ │  @smoke    │  │
                    │  └────┬─────┘ └────┬─────┘ └─────┬──────┘  │
                    │       │            │             │          │
                    │  ┌────▼────────────▼─────────────▼──────┐  │
                    │  │         PLAYWRIGHT FIXTURES            │  │
                    │  │  (Auth State, Page Objects, Data)      │  │
                    │  └────┬──────────────────────────┬───────┘  │
                    │       │                          │          │
                    │  ┌────▼────────────┐  ┌─────────▼───────┐  │
                    │  │  PAGE OBJECTS   │  │  API CLIENTS     │  │
                    │  │  + COMPONENTS   │  │  (APIRequest     │  │
                    │  │  (POM)          │  │   Context)       │  │
                    │  └────┬────────────┘  └─────────┬───────┘  │
                    │       │                          │          │
                    │  ┌────▼──────────────────────────▼───────┐  │
                    │  │     UTILITIES / TEST DATA / TYPES      │  │
                    │  │  (Helpers, Faker, Config, Assertions)  │  │
                    │  └────┬──────────────────────────────────┘  │
                    └───────┼──────────────────────────────────────┘
                            │
                            ▼  HTTP / HTTPS
                    ┌──────────────────────────────────────────────┐
                    │        TIMEVAULT APPLICATION                  │
                    │  Express.js + EJS + Mongoose                 │
                    │  localhost:3000                               │
                    │  ┌──────────┐ ┌──────────┐ ┌──────────┐     │
                    │  │ User     │ │ Admin    │ │ Razorpay │     │
                    │  │ Routes   │ │ Routes   │ │ (mocked) │     │
                    │  └────┬─────┘ └────┬─────┘ └──────────┘     │
                    │       └──────┬─────┘                         │
                    │         ┌────▼─────┐                         │
                    │         │ MongoDB  │                         │
                    │         └──────────┘                         │
                    └──────────────────────────────────────────────┘


    CI/CD PIPELINE:

    ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
    │  GitHub   │──▶│ Jenkins  │──▶│Playwright│──▶│  Allure  │
    │  Push     │   │ Pipeline │   │ Execution│   │  Report  │
    └──────────┘   └──────────┘   └──────────┘   └──────────┘
                        │              │               │
                    Install +      Smoke +          Archive
                    Lint           Regression       Artifacts
```

---

## 34. Final Deliverables Checklist

### QA Documentation

- [ ] `TEST_PLAN.md` — Scope, objectives, schedule, resources
- [ ] `TEST_STRATEGY.md` — Testing types, levels, tools, approach
- [ ] `TEST_SCENARIOS.md` — All test scenarios by module (P0-P3)
- [ ] `TEST_CASES.md` — Detailed test cases (100+)
- [ ] `RTM.md` — Requirements Traceability Matrix
- [ ] `BUG_REPORTS.md` — 10-15 real bugs with evidence

### Automation Framework

- [ ] `playwright.config.ts` — Multi-project, reporters, retries
- [ ] `tsconfig.json` — Strict TypeScript
- [ ] `config/env.config.ts` — Environment configuration
- [ ] Page Objects (15-20 pages) with clean locator strategies
- [ ] Components (4-5 reusable components)
- [ ] Custom fixtures (auth, page objects, test data)
- [ ] API client classes (5-7 clients)
- [ ] Test data generators with faker
- [ ] TypeScript types/interfaces
- [ ] Utility functions

### Automated Tests

- [ ] Auth tests (8-12 tests)
- [ ] User module UI tests (30-40 tests)
- [ ] Admin module UI tests (20-25 tests)
- [ ] API tests (20-25 tests)
- [ ] E2E journey tests (3-5 tests)
- [ ] **Total: ~85-100 automated tests**

### Test Suites

- [ ] Smoke suite (~15 tests, < 5 min)
- [ ] Regression suite (all tests)
- [ ] API-only suite
- [ ] Per-module tags

### Reporting

- [ ] Allure Report configured and generating
- [ ] Playwright HTML Report as fallback
- [ ] Screenshots on failure
- [ ] Trace on first retry

### CI/CD

- [ ] `Jenkinsfile` with stages
- [ ] Credential management (no hardcoded secrets)
- [ ] Allure integration in Jenkins
- [ ] Scheduled nightly regression

### Git / Repository

- [ ] Clean `.gitignore`
- [ ] `.env.example` template
- [ ] Professional `README.md` with:
  - [ ] Architecture diagram
  - [ ] Tech stack badges
  - [ ] Setup instructions
  - [ ] Run commands
  - [ ] Screenshots (Allure, Jenkins)
  - [ ] Skills demonstrated section
- [ ] Meaningful commit history

### Code Quality

- [ ] ESLint configured and passing
- [ ] Prettier configured
- [ ] No `any` types in TypeScript
- [ ] Consistent naming conventions
- [ ] No hardcoded values in tests

### Bug Management

- [ ] GitHub Issues with structured bug reports
- [ ] 10-15 real bugs documented
- [ ] Evidence attached (screenshots, traces)
- [ ] Severity + Priority assigned

### Portfolio Readiness

- [ ] README impresses at first glance
- [ ] Architecture diagram is clear
- [ ] Test reports have screenshots
- [ ] Jenkins pipeline has screenshots
- [ ] Every file serves a purpose
- [ ] Code is readable by a junior QA engineer

---

## 35. Risks and Mitigations

| Risk                                            | Impact                    | Probability | Mitigation                                                        |
| ----------------------------------------------- | ------------------------- | ----------- | ----------------------------------------------------------------- |
| TimeVault app not running during CI             | Tests fail completely     | Medium      | Document setup steps; include health check in pipeline            |
| MongoDB data conflicts in parallel tests        | Flaky failures            | Medium      | Use faker for unique data; limit workers to 2-3                   |
| Razorpay test mode limitations                  | Can't test online payment | High        | Focus on COD + Wallet; document Razorpay as manual test           |
| OTP email verification blocks automation        | Can't automate signup     | High        | Intercept OTP from console; or use pre-created accounts           |
| EJS server-rendered pages lack stable selectors | Brittle locators          | Medium      | Use text-based, role-based locators; add `data-testid` if allowed |
| Session expiry during long test runs            | Auth failures             | Low         | Re-authenticate in setup; use fresh storageState                  |
| Jenkins setup complexity                        | CI/CD not working         | Medium      | Follow step-by-step guide; use Docker Jenkins if local fails      |
| Scope creep (adding too many tests)             | Never finish              | Medium      | Strict MVP → SHOULD HAVE → ADVANCED separation                    |
| Playwright course not completed                 | Missing knowledge         | Medium      | Roadmap phases align with course progression                      |

---

## 36. Recommended First Step

After this blueprint is approved, the **first implementation task** is:

### PHASE 1: Create QA Documentation

1. Create a new Git repository: `timevault-qa`
2. Create the directory structure (empty folders with `.gitkeep`)
3. Write `docs/TEST_PLAN.md` based on Section 4-5 of this blueprint
4. Write `docs/TEST_STRATEGY.md` based on Section 6-7
5. Write `test-artifacts/TEST_SCENARIOS.md` — list all scenarios from Section 16 in full detail
6. Start `test-artifacts/TEST_CASES.md` — write the first 30-50 test cases for AUTH, CART, CHECKOUT modules
7. Commit and push

This gives you a foundation of QA documentation before writing any code, which is exactly how a professional QA Engineer works — **plan first, automate second**.

---

> ## ⛔ DO NOT IMPLEMENT YET
>
> This document is a **planning blueprint** only. No test code, no framework code, no configuration files should be created until this plan is explicitly approved.
>
> **First implementation task after approval:**  
> Create the `timevault-qa` repository and write the QA documentation (TEST_PLAN.md, TEST_STRATEGY.md, TEST_SCENARIOS.md, and the first batch of TEST_CASES.md) as described in Phase 1 of the Implementation Roadmap.

---

_Document produced after complete analysis of the TimeVault repository including all 2 route files, 16 controllers, 11 Mongoose models, 2 auth middleware files, 48 EJS views, and application configuration._
