# Milestone Progression & Technical Deliverables Report
## Personal Expense Tracker
**Repository:** `expense-tracker`  
**Author:** Shankar G  
**Academic Module:** SSS Lab — Full Stack Development Laboratory  
**Coverage Scope:** Milestone 01 through Milestone 07

---

## Milestone 01: Project Inception, Specification & Node Runtime Setup

### 1. Technical Focus
- Node.js runtime initialization, NPM package ecosystem, server-side scripting environment.
- Setting up the project repository, version control strategy, dependencies baseline, and requirements documentation.

### 2. Milestone Deliverables
- **Project Title:** Personal Expense Tracker ("Expense Tracker")
- **Problem Statement:** Modern consumers and students struggle with fragmented financial habits, leading to budget leakage and lack of actionable savings insights.
- **Objectives:** Create a modular, asynchronous RESTful backend and reactive user interface to record, categorize, query, and analyze personal financial flows.
- **Target Audience:** College students, salaried professionals, and freelancers needing automated financial clarity.
- **Functional Requirements:** User registration/login, income & expense CRUD operations, categorized aggregation, real-time analytics.
- **Non-Functional Requirements:** Sub-100ms latency, high availability, salted Bcrypt credential protection, stateless JWT access.
- **Tech Stack:** Node.js, Express.js, MongoDB Atlas, Mongoose, BcryptJS, JSONWebToken, Vanilla CSS/HTML/JS.
- **GitHub Monitoring Record:**
  - Repository initialized with `.gitignore`, `README.md`, and `package.json`.
  - Initial commit hash: `git commit -m "feat: project inception and runtime baseline"`

---

## Milestone 02: Event Loop Architecture & Modular Backend Design

### 2.1 Technical Focus
- Node.js Event Loop phases, synchronous vs asynchronous execution, Microtask queue vs Macrotask queue.
- Modular software architecture with CommonJS (`require` and `module.exports`) following the Model-View-Controller (MVC) separation of concerns.

### 2.2 Milestone Deliverables
- **Event Loop Experiment Script (`eventloop.js`):**
  Demonstrating the execution order of synchronous instructions, `process.nextTick` / `Promise.resolve()` microtasks, and `setTimeout()` macrotasks.
  - Verified Execution Sequence:
    `1. Start` -> `2. End` -> `3. Promise Callback` -> `4. Timeout Callback`
- **Architectural Directory Segregation:**
  ```
  expense-tracker/
  ├── server/
  │   ├── config/          # Database configuration (db.js)
  │   ├── controllers/     # Route logic (expenseController.js, userController.js)
  │   ├── middleware/      # Logger, error handler, auth guards
  │   ├── models/          # Mongoose data schemas (Expense.js, User.js)
  │   ├── routes/          # Express route definitions
  │   ├── public/          # Client application assets & UI
  │   ├── .env             # Environment variables
  │   └── server.js        # Server bootstrapping entrypoint
  ├── docs/                # Comprehensive engineering documentation
  └── eventloop.js         # Event loop verification script
  ```
- **GitHub Monitoring Record:**
  - Commits: `feat: implement event loop verification script`, `refactor: establish MVC directory segregation`.

---

## Milestone 03: Express REST Routing & Protocol Layer

### 3.1 Technical Focus
- Express.js application framework, HTTP method verbs (GET, POST, PUT, DELETE), route path matching, URL parameter extraction, and request body parsing.

### 3.2 Milestone Deliverables
- Express server instance instantiated in `server/server.js`.
- Modular route registration using `express.Router()`:
  - `/api/expenses` -> Routed to `expenseRoutes.js`
  - `/api/users` -> Routed to `userRoutes.js`
- JSON body parsing configured via `express.json()`.
- Interactive API documentation drafted in `docs/API_Documentation.md`.
- **GitHub Monitoring Record:**
  - Commits: `feat: setup express routing and request/response pipelines`.

---

## Milestone 04: Middleware Pipeline & Resilient Error Interceptor

### 4.1 Technical Focus
- Middleware chaining, request lifecycle interception, customized logging, static file delivery, and centralized exception handling.

### 4.2 Milestone Deliverables
- **Custom Request Logger Middleware (`loggerMiddleware.js`):**
  Intercepts every incoming HTTP request and outputs formatted ISO timestamp, method, and endpoint URL to stdout.
- **Centralized Error Interceptor Middleware (`errorMiddleware.js`):**
  Captures uncaught exceptions or errors propagated via `next(err)`, logs the stack trace securely, and dispatches a clean, uniform HTTP 500 JSON response to prevent application crashes.
- **CORS Middleware:**
  Enables browser client cross-origin HTTP requests with preflight `OPTIONS` handling.
- **Static Asset Middleware:**
  Serves production client single-page application assets from the `server/public` directory.
- **GitHub Monitoring Record:**
  - Commits: `feat: implement custom logger and centralized error middleware`.

---

## Milestone 05: Cloud Database Integration & Data Modeling

### 5.1 Technical Focus
- MongoDB Atlas cloud clustering, Mongoose Object Data Modeling (ODM), schema constraints, field validators, and environment isolation.

### 5.2 Milestone Deliverables
- **Database Connection Engine (`config/db.js`):**
  Asynchronous handshake connecting to MongoDB Atlas cluster using secure URI string from `.env`.
- **Mongoose Schemas:**
  - `Expense.js`: Includes `title`, `amount` (min: 0.01), `category`, `type` (expense/income), `date`, `description`, `user` reference, and automatic timestamps.
  - `User.js`: Includes `name`, `email` (unique index), `password` (hashed), and timestamps.
- **Environment Isolation:**
  `.env` excluded from version control via `.gitignore` to safeguard cloud connection strings and secrets.
- **GitHub Monitoring Record:**
  - Commits: `feat: connect MongoDB Atlas and construct Mongoose data models`.

---

## Milestone 06: Complete CRUD Engine, Advanced Querying & Filtering

### 6.1 Technical Focus
- Complete CRUD (Create, Read, Update, Delete) database operations, dynamic query construction, regex search, date range filtering, and financial aggregation.

### 6.2 Milestone Deliverables
- **Expense Controller (`controllers/expenseController.js`):**
  - `getExpenses`: Supports filtering by `category`, `type`, `search` keyword, date ranges (`startDate` / `endDate`), and dynamic sorting (`amount_asc`, `amount_desc`, `date_asc`, `date_desc`).
  - `getExpenseSummary`: Aggregates total income, total expenditure, net balance, savings rate, and category-wise spending totals.
  - `createExpense`: Validates required fields and commits new record with 201 status code.
  - `updateExpense`: Modifies record by ID and runs schema validators with 200 status code.
  - `deleteExpense`: Purges record by ID with 200 confirmation.
- **Testing Evidence:**
  Comprehensive test cases recorded in `docs/Testing_Report.md`.
- **GitHub Monitoring Record:**
  - Commits: `feat: implement full CRUD endpoints with multi-attribute filtering`.

---

## Milestone 07: Cryptographic Authentication, Bcrypt Hashing & JWT Security

### 7.1 Technical Focus
- User registration, cryptographic salt generation, one-way password hashing via Bcrypt, JSON Web Token (JWT) stateless authorization, and route protection guards.

### 7.2 Milestone Deliverables
- **Password Hashing:**
  - User registration in `controllers/userController.js` creates a unique 10-round salt (`bcrypt.genSalt(10)`) and hashes the plain text password before persistence.
  - Plaintext password is never saved or returned in JSON responses.
  - Login checks credentials using `bcrypt.compare(candidatePassword, storedHash)`.
- **Stateless JWT Authorization:**
  - Upon successful authentication, server issues an HS256-signed JWT token containing user ID payload and 7-day expiration.
- **Route Guard Middleware (`authMiddleware.js`):**
  - Validates `Authorization: Bearer <token>` on protected routes such as `GET /api/users/profile`.
  - Rejects unauthenticated requests with HTTP 401 Unauthorized.
- **Security Audit:**
  - Secret keys decoupled via `JWT_SECRET` in environment variables.
  - Password fields sanitized with `.select("-password")`.
- **GitHub Monitoring Record:**
  - Commits: `feat: implement Bcrypt hashing and JWT authorization middleware`.
