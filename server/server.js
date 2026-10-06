const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const connectDB = require("./config/db");

dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Security Headers Middleware (Helmet - Week 8 Hardening)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'", "http://localhost:5000", "https://*"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Middleware Imports
const loggerMiddleware = require("./middleware/loggerMiddleware");
const errorMiddleware = require("./middleware/errorMiddleware");
const { apiLimiter } = require("./middleware/rateLimitMiddleware");

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

// Built-in Body Parsing Middleware (With payload size limits to prevent DoS)
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Custom Non-Blocking Logger Middleware
app.use(loggerMiddleware);

// Rate Limiter for all API routes (Week 8 Security Guard)
app.use("/api", apiLimiter);

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
    security: {
      helmet: "Active (CSP & XSS protection)",
      rateLimiter: "Active (200 req/15min API, 15 req/15min Auth)",
      inputValidation: "RFC 5322 & Positive Numeric Sanitization Active",
    },
  });
});

// API Info Route
app.get("/api", (req, res) => {
  res.status(200).json({
    message: "Personal Expense Tracker API Engine",
    version: "1.0.0",
    securityAudit: "Week 8 Hardened (Helmet, Rate Limiting, Input Sanitization)",
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