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

const {
  validateExpenseCreate,
  validateExpenseUpdate,
} = require("../validations/expenseValidation");

// Financial summary endpoint (placed before :id route)
router.get("/summary", optionalAuth, getExpenseSummary);

// CRUD Endpoints (Protected with optional/strict auth & payload validators)
router.get("/", optionalAuth, getExpenses);
router.post("/", optionalAuth, validateExpenseCreate, createExpense);
router.put("/:id", optionalAuth, validateExpenseUpdate, updateExpense);
router.delete("/:id", optionalAuth, deleteExpense);

module.exports = router;