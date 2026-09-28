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
- **Bcrypt Salt Generation:** Password hashed with 10 rounds of salt generation. Plaintext password is never saved or returned in API responses.
- **JWT Signature Verification:** Tokens signed with secret algorithm HS256 and expiration set to 7 days.
- **Route Guard Test:** Requesting `/api/users/profile` without Bearer token returns `401 Unauthorized` (`Not Authorized: No token provided in Authorization header`).
- **Valid Bearer Token Test:** Requesting `/api/users/profile` with valid token decodes user identity and returns profile information.
