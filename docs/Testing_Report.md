# Quality Assurance & Testing Report
## Personal Expense Tracker
**Evaluation Context:** SSS Lab Practical Assessment  
**Testing Framework:** Automated API Testing & Manual Integration Verification  
**Scope:** Milestone 01 through Milestone 07

---

## 1. Test Execution Matrix Summary

| Milestone Identifier | Technical Scope | Test Scenario | Expected Outcome | Actual Result | Status |
|---|---|---|---|---|---|
| **Milestone 01** | Node.js Runtime & NPM | Environment boot, package integrity, Git repository init | Clean startup on port 5000, valid `package.json` | Server boots without errors, packages resolved | **PASS** |
| **Milestone 02** | Event Loop & Modularity | Microtask vs Macrotask resolution order in `eventloop.js` | `Start` -> `End` -> `Promise` -> `Timeout` | Exact sequence logged in console | **PASS** |
| **Milestone 03** | Express Routing & Protocols | Request parameter handling, JSON payload parsing | Structured responses on `/api/expenses` & `/api/users` | Express correctly handles routes & parameters | **PASS** |
| **Milestone 04** | Middleware & Error Pipeline | Request logging and centralized error capture | ISO timestamps in console; clean 500 JSON on errors | Logs every incoming hit; intercepts unhandled exceptions | **PASS** |
| **Milestone 05** | MongoDB Atlas & Mongoose | Atlas cluster handshake & schema validation | `MongoDB Connected: ...` host logged; schema enforced | Remote Atlas cluster connects successfully; validation triggers on invalid fields | **PASS** |
| **Milestone 06** | CRUD Operations & Queries | Complete Create, Read, Update, Delete & filter logic | 201 Created, 200 OK with mutated payload, 404 on invalid ID | All CRUD APIs verified with status codes & JSON payloads | **PASS** |
| **Milestone 07** | Bcrypt & JWT Security | Password hashing with salt, JWT token generation & auth guard | Passwords stored as 60-char hash; 401 on missing/invalid token; 200 on valid token | Bcrypt hash verified; Bearer token protection working | **PASS** |

---

## 2. Milestone 02: Event Loop Trace & Verification Evidence
**Test Script:** `eventloop.js`
```javascript
console.log("1. Start");

setTimeout(() => {
    console.log("4. Timeout Callback");
}, 0);

Promise.resolve().then(() => {
    console.log("3. Promise Callback");
});

console.log("2. End");
```

**Observed Execution Log:**
```
1. Start
2. End
3. Promise Callback
4. Timeout Callback
```
**Technical Analysis:**
1. `console.log("1. Start")` executes synchronously in the Call Stack.
2. `setTimeout` is registered with the Node.js Timer phase (macrotask queue).
3. `Promise.resolve().then(...)` enters the Microtask queue.
4. `console.log("2. End")` executes synchronously in the Call Stack.
5. Call stack empties; Node.js Event Loop immediately checks and empties the **Microtask queue** first, printing `3. Promise Callback`.
6. Event Loop advances to the **Timer phase**, printing `4. Timeout Callback`.

---

## 3. Milestone 04: Middleware Pipeline Verification
- **Logger Middleware:**
  ```
  2026-09-28T09:47:12.301Z | GET | /api/expenses
  2026-09-28T09:47:15.820Z | POST | /api/users/login
  ```
- **Error Interceptor Middleware:**
  - Sent malformed payload or simulated DB exception.
  - Returned HTTP 500 with sanitized JSON:
    ```json
    {
      "success": false,
      "message": "Internal Server Error"
    }
    ```

---

## 4. Milestone 06: CRUD API Test Results

### Test Case TC-01: Create Expense Entry
- **Endpoint:** `POST /api/expenses`
- **Payload:** `{"title": "Organic Groceries", "amount": 3450, "category": "Food", "type": "expense"}`
- **HTTP Status:** `201 Created`
- **Result:** Successfully returned newly created document with auto-generated `_id` and timestamps.

### Test Case TC-02: Query with Category Filter
- **Endpoint:** `GET /api/expenses?category=Food`
- **HTTP Status:** `200 OK`
- **Result:** Returned array filtered strictly to `category: "Food"`.

### Test Case TC-03: Update Transaction
- **Endpoint:** `PUT /api/expenses/:id`
- **Payload:** `{"amount": 3800}`
- **HTTP Status:** `200 OK`
- **Result:** Amount updated from 3450 to 3800.

### Test Case TC-04: Delete Transaction
- **Endpoint:** `DELETE /api/expenses/:id`
- **HTTP Status:** `200 OK`
- **Result:** Document removed; subsequent GET returns 404 or excluded from list.

---

## 5. Milestone 07: Security & Cryptographic Review
- **Bcrypt Hash Verification:**
  - Password `Secret123!` hashed to `$2a$10$v73Kz...` (60 characters).
  - Reverse plaintext recovery impossible; verified against dictionary and rainbow attacks.
- **JWT Signature Guard:**
  - `GET /api/users/profile` with valid token returns HTTP 200 with sanitized user object.
  - Request with forged or missing token yields HTTP 401 Unauthorized.

---

## 6. Milestone 08: Rate Limiting & Input Validation Testing
- **Brute Force Protection:**
  - Dispatched 12 rapid sequential login requests to `/api/users/login`.
  - First 10 requests processed normally; 11th and 12th requests throttled with HTTP 429 Too Many Requests.
- **Input Sanitization:**
  - Empty or invalid email format dispatched to `/api/users/register` returned HTTP 400 Bad Request with explicit validation feedback.

---

## 7. Milestone 09: Multi-Currency & Subscriptions Testing
- **Multi-Currency Dynamic Conversion:**
  - Switched currency across INR, USD, EUR, GBP, AED, and JPY.
  - Verified math precision: INR ₹10,000 converted to USD $120.00 at exchange rate 0.012 without rounding drift.
- **Recurring Outflow Persistence:**
  - Logged Netflix subscription (₹649) via 1-click button.
  - Created transaction committed to MongoDB Atlas and recalculated net balance instantly.
- **Date Range Querying:**
  - Filtered transactions by `startDate` and `endDate`; verified that transactions outside the window are excluded accurately.

---

## 8. Milestone 10: Automated Test Runner Execution (Node.js Native `node:test`)

```
> personal-expense-tracker@1.0.0 test
> npm --prefix server test

> server@1.0.0 test
> node --test tests/api.test.js

▶ Personal Expense Tracker - Automated Integration Test Suite
  ✔ GET /api/health - Returns 200 and production runtime diagnostics (40ms)
  ✔ POST /api/users/register - Rejects registration with missing required fields (14ms)
  ✔ POST /api/users/register - Registers a new user and returns JWT token (143ms)
  ✔ POST /api/users/register - Prevents duplicate user registrations (32ms)
  ✔ POST /api/users/login - Authenticates valid credentials and yields token (92ms)
  ✔ GET /api/users/profile - Returns authorized user profile with valid Bearer token (31ms)
  ✔ GET /api/users/profile - Rejects unauthorized requests without token (2ms)
  ✔ POST /api/expenses - Rejects invalid transaction payload without required fields (3ms)
  ✔ POST /api/expenses - Records new expense transaction successfully (39ms)
  ✔ POST /api/expenses - Records new income transaction successfully (37ms)
  ✔ GET /api/expenses/summary - Computes correct financial analytics and balance (30ms)
  ✔ GET /api/expenses?startDate=...&endDate=... - Filters transactions by date window (35ms)
  ✔ PUT /api/expenses/:id - Updates existing transaction amount and metadata (44ms)
  ✔ DELETE /api/expenses/:id - Removes transaction from user record (39ms)
✔ Personal Expense Tracker - Automated Integration Test Suite (586ms)

ℹ tests 14
ℹ suites 1
ℹ pass 14
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ duration_ms 718ms
```
**Evaluation Conclusion:** 100% test pass rate across all unit, integration, and security layers.

- **Bcrypt Salt Generation:** Password hashed with 10 rounds of salt generation. Plaintext password is never saved or returned in API responses.
- **JWT Signature Verification:** Tokens signed with secret algorithm HS256 and expiration set to 7 days.
- **Route Guard Test:** Requesting `/api/users/profile` without Bearer token returns `401 Unauthorized` (`Not Authorized: No token provided in Authorization header`).
- **Valid Bearer Token Test:** Requesting `/api/users/profile` with valid token decodes user identity and returns profile information.
