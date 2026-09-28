const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

connectDB();

const app = express();

// Middleware Imports
const loggerMiddleware = require("./middleware/loggerMiddleware");
const errorMiddleware = require("./middleware/errorMiddleware");

// Built-in Middleware
app.use(express.json());

// Custom Logger Middleware
app.use(loggerMiddleware);

// Routes
const expenseRoutes = require("./routes/expenseRoutes");

app.use("/api/expenses", expenseRoutes);

// Home Route
app.get("/", (req, res) => {
    res.send("Personal Expense Tracker API Running");
});

// Error Middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});