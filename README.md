# Personal Expense Tracker

A full-stack financial intelligence platform engineered with **Node.js**, **Express.js**, **MongoDB Atlas**, and a **Cyber-Glassmorphism** frontend.

---

## 📅 Week-by-Week Project Implementation Mapping

| Week | Milestone / Deliverable | Key Implementation Components | Status |
| :--- | :--- | :--- | :---: |
| **Week 1** | **Problem Definition & SRS** | Requirements specification, SRS matrix, entity model ([docs/Requirements.md](docs/Requirements.md)) | ✅ Verified |
| **Week 2** | **Node.js Foundations & Architecture** | Asynchronous non-blocking I/O, Event Loop verification ([eventloop.js](eventloop.js)) | ✅ Verified |
| **Week 3** | **Express.js REST API Development** | Full CRUD routes, financial ledger endpoints, response normalization | ✅ Verified |
| **Week 4** | **Middleware Design & Error Handling** | Request logger, centralized error interceptor, CORS pipeline | ✅ Verified |
| **Week 5** | **Database Design & Mongoose Modeling** | Distributed MongoDB Atlas schema design, compound index optimization | ✅ Verified |
| **Week 6** | **Advanced Querying & Filtering Engine** | Multi-parameter filtering (Category, Type, Sorting, Date Range, Search) | ✅ Verified |
| **Week 7** | **Authentication & Authorization** | Bcrypt salted password hashing (10 rounds) & JWT Bearer token protection | ✅ Verified |
| **Week 8** | **Input Validation, Security & Analytics Suite** | Input sanitization, Helmet CSP, Rate limiting, Budget Planner & Calculators | ✅ Verified |

---

## 🌟 Application Features & Functional Modules

### 1. 📊 Financial Dashboard & Ledger (`#trackerTab`)
* **Real-time Balance Cards:** Net Available Balance, Total Inflow (Income), Total Outflow (Expenses), and Net Savings Rate %.
* **Interactive Expenditure Donut Matrix:** High-DPI HTML5 canvas rendering category spend percentages and amounts.
* **Granular Transaction Ledger:** Search by title/remarks, filter by category/type, sort by date/amount.
* **Export & Print Suite:** One-click **CSV Statement Export** and **Printable / PDF Statement** generation.

### 2. 📈 Financial Analytics & Cash Flow Reports (`#analyticsTab`)
* **Daily Outflow Velocity & Burn Rate:** Real-time calculation of daily spending pace across active transaction dates.
* **Projected Month-End Spend:** Predictive forecasting based on current spending velocity.
* **Top Expense Category Highlight:** Automatically detects and displays highest category concentration.
* **Monthly Inflow vs. Outflow Historical Chart:** Dual-bar visualization comparing income vs. expenses across months.
* **50 / 30 / 20 Budget Rule Compliance:** Tracks Essential Needs ($\le 50\%$), Discretionary Wants ($\le 30\%$), and Retained Savings ($\ge 20\%$).
* **Smart Financial Diagnostics Engine:** Contextual health assessments, deficit warnings, and savings guidance.

### 3. 🎯 Category Budget Planner & Spending Caps (`#budgetTab`)
* **Aggregate Budget Limit Tracking:** Real-time consumption gauges and safe-to-spend buffer.
* **Category Budget Meters:** Per-category progress bars with live status pills (`On Track`, `Approaching Limit`, `Budget Exceeded`).
* **Custom Budget Configuration Modal:** Configure monthly spending caps for each category.

### 4. 🧮 Smart Wealth & Loan Calculation Suite (`#toolsTab`)
* **Loan EMI & Interest Calculator:** Computes monthly installments, total interest, and total payable amount ($E = P \cdot r \cdot \frac{(1+r)^n}{(1+r)^n - 1}$).
* **SIP Compound Wealth Projector:** Forecasts future value and wealth gained from monthly systematic investing ($M = P \cdot \frac{(1+i)^n - 1}{i} \cdot (1+i)$).
* **Emergency Fund Readiness Score:** Evaluates 3-month and 6-month safety cushion targets against current net balances.
* **Income Tax Estimator (FY 2024–25):** Calculates taxable income, bracket taxes under India's New Tax Regime, standard deduction (₹75,000), and Section 87A rebate.

### 5. 🛡️ Security & Authentication Engine
* **Bcrypt Password Hashing:** Salted hashing with 10 rounds prior to database persistence.
* **JWT Stateless Bearer Authorization:** Tokens verified on all protected transactional routes.
* **Input Validation & Sanitization:** Strips XSS script tags and validates RFC 5322 email patterns.
* **Rate Limiting & Helmet Headers:** Protects against brute-force attacks and enforces Content Security Policy (CSP).

---

## 📁 Repository Directory Structure

```
expense-tracker/
├── client/                          # Client-side static assets
│   ├── index.html                   # User interface
│   ├── style.css                    # Cyber-glassmorphism styling system
│   └── app.js                       # Frontend financial engine & API connector
├── server/                          # Backend application
│   ├── config/                      # MongoDB Atlas connection (db.js)
│   ├── controllers/                 # Business logic controllers (expenseController, userController)
│   ├── middleware/                  # Logger, auth protect, error handler, rate limit
│   ├── models/                      # Mongoose data schemas (Expense.js, User.js)
│   ├── public/                      # Static web assets served by Express
│   ├── routes/                      # REST API routes (expenseRoutes.js, userRoutes.js)
│   ├── validations/                 # Request payload validation & sanitization
│   ├── .env                         # Environment variables (PORT, MONGO_URI, JWT_SECRET)
│   ├── package.json                 # Node.js dependencies and scripts
│   └── server.js                    # Express server entrypoint
├── docs/                            # Academic & technical dossier documentation
│   ├── Requirements.md              # Week 1: Problem Definition & SRS
│   ├── Database_Design.md           # Week 5: MongoDB Atlas Schema Modeling
│   ├── API_Documentation.md         # Week 3 & 6: REST API Specification
│   ├── Testing_Report.md            # Verification & Quality Assurance Report
│   └── Milestone_Progression_Deliverables.md # 8-Week Milestone Tracker
├── dataset/                         # Sample financial data
├── screenshots/                     # Visual interface captures
├── eventloop.js                     # Week 2: Event loop verification experiment
├── package.json                     # Root convenience script wrapper
└── README.md                        # Master repository documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
* [Node.js](https://nodejs.org/) (v16.x or higher)
* [npm](https://www.npmjs.com/)

### 1. Run the Backend Server
```powershell
cd "expense-tracker\server"
npm start
```
*The server will start on `http://localhost:5000` and connect to MongoDB Atlas.*

### 2. Access the Application
Open your browser and navigate to:
```
http://localhost:5000
```

---

## 🧪 Automated Testing

Run the verification test suite to check all endpoints:
```powershell
node -e "require('./server/server.js');"
```

---

## 📄 License
This project is licensed under the **ISC License**. Developed by **Shankar G**.
