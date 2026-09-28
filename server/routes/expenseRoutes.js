const express = require("express");
const router = express.Router();

const {
  getExpenses,
  getExpenseSummary,
  createExpense,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");

const {
  optionalAuth,
  protect,
} = require("../middleware/authMiddleware");

// Financial summary endpoint (placed before :id route)
router.get("/summary", optionalAuth, getExpenseSummary);

// CRUD Endpoints
router.get("/", optionalAuth, getExpenses);
router.post("/", optionalAuth, createExpense);
router.put("/:id", optionalAuth, updateExpense);
router.delete("/:id", optionalAuth, deleteExpense);

module.exports = router;