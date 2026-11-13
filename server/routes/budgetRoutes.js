const express = require("express");
const router = express.Router();
const { getBudgets, saveBudgets } = require("../controllers/budgetController");
const { optionalAuth, protect } = require("../middleware/authMiddleware");

router.get("/", optionalAuth, getBudgets);
router.post("/", protect, saveBudgets);
router.put("/", protect, saveBudgets);

module.exports = router;

