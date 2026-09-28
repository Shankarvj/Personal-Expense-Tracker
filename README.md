# Personal Expense Tracker ("Expense Tracker")

A high-performance, full-stack personal finance and analytical management system engineered with Node.js, Express.js, MongoDB Atlas, and a responsive, futuristic cyber-glassmorphic user interface.

---

## 🌟 Key Highlights & Engineering Features

- **Interactive Financial Dashboard:** Real-time metrics for Total Balance, Inflow (Income), Outflow (Expenses), and Savings Rate percentage.
- **Dynamic Visual Analytics:** Dynamic Category Breakdown Chart and Monthly Trend Visualizers.
- **Granular CRUD Engine:** Full Create, Read, Update, Delete capabilities with real-time category filtering, type filtering, keyword search, and sorting.
- **Cryptographic Security Layer:** Salting and password hashing with Bcrypt (10 rounds) and stateless JSON Web Token (JWT) route protection.
- **Resilient Middleware Architecture:** Custom non-blocking request logger, centralized error interceptor, and CORS handling.
- **Interactive Milestone Progression Studio:** Built-in interactive workbench covering Milestones 01 through 07 with live Event Loop simulations, API tester, and JWT token laboratory.

---

## 📁 Repository Structure

```
expense-tracker/
├── server/
│   ├── config/          # MongoDB Atlas connection (db.js)
│   ├── controllers/     # Business logic (expenseController.js, userController.js)
│   ├── middleware/      # Logger, error handler, JWT protect middleware
│   ├── models/          # Mongoose data schemas (Expense.js, User.js)
│   ├── routes/          # Express route definitions
│   ├── public/          # Client web application and interactive studio
│   ├── .env             # Environment configuration (PORT, MONGO_URI, JWT_SECRET)
│   └── server.js        # Backend entrypoint and server runner
├── docs/                # Comprehensive technical documentation
│   ├── Requirements.md
│   ├── Database_Design.md
│   ├── API_Documentation.md
│   ├── Testing_Report.md
│   └── Milestone_Progression_Deliverables.md
├── dataset/             # Dataset resources
├── screenshots/         # UI & execution visual captures
├── eventloop.js         # Event loop verification experiment
└── README.md            # Primary repository documentation
```

---

## 🚀 Quick Start Guide

### 1. Backend Server Setup
```bash
cd server
npm install
npm run dev
# or
node server.js
```
The server will start at `http://localhost:5000`.

### 2. Accessing the Application
- Open `http://localhost:5000` in your web browser.
- Or open `server/public/index.html` directly in any modern browser.

---

## 🧪 Testing & Verification
Refer to [Testing_Report.md](docs/Testing_Report.md) for detailed test cases, execution outputs, and verification traces.
