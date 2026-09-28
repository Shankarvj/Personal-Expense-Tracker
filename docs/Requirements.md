# Software Requirements Specification (SRS)
## Personal Expense Tracker
**Project Name:** Expense Tracker  
**System Architecture:** Node.js, Express.js, MongoDB Atlas, Vanilla Modern UI  
**Phase / Milestone:** Milestone 01 — Project Inception & Technical Initiation

---

## 1. Project Title & Executive Summary
- **Title:** Personal Expense Tracker ("Expense Tracker")
- **Domain:** Personal Finance Management & Financial Analytics
- **Summary:** An interactive, secure, full-stack financial monitoring application engineered to give individuals complete visibility and granular control over their daily incomes, expenditures, savings ratios, and category budgets. The system couples an asynchronous Node.js/Express REST API backend with a high-performance, responsive user interface and cloud-persisted MongoDB Atlas storage.

---

## 2. Problem Statement
Managing personal finances in modern life is fraught with friction:
- **Disorganized Spending:** Unrecorded cash, UPI, and digital card transactions lead to rapid budget overruns and end-of-month financial stress.
- **Lack of Real-Time Insights:** Traditional spreadsheets are cumbersome, error-prone, and lack instant visual aggregations (e.g., category breakdowns, savings rates).
- **Security & Privacy Concerns:** Many third-party commercial apps require direct banking access or display intrusive ads, exposing sensitive financial footprints.
- **Need for Accessible Tracking:** Users need a lightweight, lightning-fast, and intuitive platform that offers instant transaction entry, multi-parameter filtering, and cryptographic data protection.

---

## 3. Project Objectives
1. **Frictionless Transaction Management:** Facilitate sub-second logging of financial transactions (both expenses and revenues) with title, amount, category, date, and description.
2. **Dynamic Financial Analytics:** Automatically compute net balance, total income, total expenditures, and savings rate percentage in real time.
3. **Multi-Faceted Data Filtering:** Enable multi-criteria filtering by category (Food, Housing, Travel, Entertainment, Healthcare, Utilities, etc.), transaction type, and date ranges.
4. **Security & Identity Isolation:** Ensure user records are cryptographically protected using salted Bcrypt password hashing and stateless JSON Web Tokens (JWT) for route guarding.
5. **Architectural Reliability:** Employ asynchronous non-blocking event-driven I/O, custom request logging, and centralized error middleware to guarantee 99.9% application uptime.

---

## 4. Target Users & User Personas
- **University Students & Young Professionals:** Managing monthly allowances, rent, tuition, and daily food expenses on tight budgets.
- **Freelancers & Independent Contractors:** Tracking irregular income streams across various clients alongside work-related expenditures.
- **Households & Family Budget Planners:** Monitoring recurring utility bills, groceries, healthcare costs, and savings goals.

---

## 5. Functional Requirements (FRS)

### FR-01: User Identity & Access Management
- **FR-01.1 Registration:** Users can create an account with name, email, and password. System enforces minimum password length (6 characters) and unique email constraints.
- **FR-01.2 Authentication:** Registered users can authenticate via email and password, receiving a cryptographically signed JWT token.
- **FR-01.3 Session Security:** Subsequent API requests validate the Bearer token in the `Authorization` header to isolate user-specific financial records.

### FR-02: Expense & Income Recording (CRUD Operations)
- **FR-02.1 Create Entry:** Add new financial record specifying title (required), amount (positive numeric, required), category (required), type (expense/income, default: expense), date, and optional description.
- **FR-02.2 Read / Query Entries:** Retrieve all records with optional query parameters (`category`, `type`, `search`, `startDate`, `endDate`, `sort`).
- **FR-02.3 Update Entry:** Modify any transaction fields by ID, verifying schema rules and constraints.
- **FR-02.4 Delete Entry:** Remove a record by ID with immediate recalculation of metrics.

### FR-03: Real-Time Analytics & Aggregation
- **FR-03.1 Summary Calculation:** Server and client calculate total income, total expenditure, net balance, and savings percentage.
- **FR-03.2 Category Breakdown:** Compute aggregated expenditures per category for visual donut / pie chart representation.

### FR-04: System Diagnostics & Logging
- **FR-04.1 Request Auditing:** Middleware logs all incoming HTTP requests (timestamp, HTTP method, requested URL).
- **FR-04.2 Centralized Error Interception:** Custom error middleware catches unexpected exceptions and returns standardized JSON error responses.

---

## 6. Non-Functional Requirements (NFRS)

| Category | Requirement Specification |
|---|---|
| **Performance** | API response latency < 100ms for standard CRUD operations under normal load. |
| **Scalability** | Asynchronous, non-blocking Event Loop architecture supports concurrent request pipelines. |
| **Security** | Passwords hashed using Bcrypt with 10 salt rounds; JWT signed with cryptographic secret; .env excludes secrets from repository. |
| **Availability** | Cloud MongoDB Atlas replication ensures 99.9% database availability. |
| **Usability & UX** | High-contrast glassmorphic dark theme, intuitive single-page navigation, responsive layout across mobile and desktop. |
| **Maintainability** | Clean MVC directory segregation (controllers, models, routes, middleware, config). |

---

## 7. Technology Stack Selection & Rationale

| Layer | Technology Selected | Rationale |
|---|---|---|
| **Runtime Environment** | Node.js (v24.x) | Single-threaded, non-blocking I/O event-driven runtime ideal for high-throughput REST APIs. |
| **Web Application Framework** | Express.js (v5.x) | Minimalist, unopinionated web framework providing robust middleware chaining and routing mechanisms. |
| **Database & ODM** | MongoDB Atlas & Mongoose (v9.x) | Flexible JSON-like document store schema modeling, validation, and cloud clustering. |
| **Security & Cryptography** | BcryptJS & JSONWebToken (JWT) | Industry standard one-way password hashing and stateless token-based authorization. |
| **Client Frontend** | Modern HTML5, CSS3 & Vanilla JavaScript | Zero-dependency, ultra-fast rendering, native CSS custom properties, and interactive canvas/SVG charts. |
| **Version Control & CI** | Git & GitHub | Modular branching, atomic commits, and structured milestone tracking. |

---

## 8. Team Member Responsibilities & Governance
- **Lead Full-Stack Developer:** Shankar G
  - System Architecture & API Design
  - MongoDB Schema Modeling & Controller Logic
  - Middleware Pipeline & Cryptographic Security
  - Interactive Web User Interface & Lab Demonstrations
- **Lab Faculty / Evaluator:** Semester 3 SSS Lab Assessment Committee
