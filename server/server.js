const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Middleware Imports
const loggerMiddleware = require("./middleware/loggerMiddleware");
const errorMiddleware = require("./middleware/errorMiddleware");

// CORS Middleware (Enables browser cross-origin requests)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Built-in Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom Logger Middleware
app.use(loggerMiddleware);

// Serve static frontend files from 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Routes
const expenseRoutes = require("./routes/expenseRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/api/expenses", expenseRoutes);
app.use("/api/users", userRoutes);

// System Health & Diagnostics Endpoint
app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: "Disconnected",
    1: "Connected",
    2: "Connecting",
    3: "Disconnecting",
  };

  res.status(200).json({
    status: "operational",
    service: "Personal Expense Tracker API",
    database: dbStatusMap[dbState] || "Unknown",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()) + "s",
  });
});

// API Info Route
app.get("/api", (req, res) => {
  res.status(200).json({
    message: "Personal Expense Tracker API Engine",
    endpoints: {
      auth: ["POST /api/users/register", "POST /api/users/login", "GET /api/users/profile"],
      expenses: [
        "GET /api/expenses",
        "POST /api/expenses",
        "GET /api/expenses/summary",
        "PUT /api/expenses/:id",
        "DELETE /api/expenses/:id"
      ],
      diagnostics: ["GET /api/health"]
    }
  });
});

// Fallback to static app or status if root requested
app.get("/", (req, res, next) => {
  // If static index exists in public, express.static handles it.
  // Otherwise provide status.
  res.sendFile(path.join(__dirname, "public", "index.html"), (err) => {
    if (err) {
      res.send("Personal Expense Tracker API Running. Public frontend not loaded.");
    }
  });
});

// Centralized Error Middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});