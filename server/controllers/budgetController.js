const Budget = require("../models/Budget");

const DEFAULT_BUDGETS = {
  Food: 8000,
  Housing: 15000,
  Travel: 3000,
  Utilities: 3500,
  Healthcare: 2500,
  Entertainment: 3000,
  Shopping: 4000,
  Education: 5000,
};

// GET BUDGET LIMITS FOR USER
const getBudgets = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : req.query.user;
    if (!userId) {
      return res.status(200).json({
        success: true,
        data: DEFAULT_BUDGETS,
      });
    }

    const budgets = await Budget.find({ user: userId });

    if (budgets.length === 0) {
      return res.status(200).json({
        success: true,
        data: DEFAULT_BUDGETS,
      });
    }

    const budgetMap = { ...DEFAULT_BUDGETS };
    budgets.forEach((b) => {
      budgetMap[b.category] = b.amount;
    });

    res.status(200).json({
      success: true,
      data: budgetMap,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch budget configuration",
      error: error.message,
    });
  }
};

// SAVE / UPDATE BUDGET LIMITS FOR USER
const saveBudgets = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : req.body.user;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authorization required: Please log in to save budget settings",
      });
    }

    const { budgets } = req.body;
    if (!budgets || typeof budgets !== "object") {
      return res.status(400).json({
        success: false,
        message: "Invalid budget payload. Expected key-value mapping of category amounts.",
      });
    }

    const operations = Object.entries(budgets).map(([category, amount]) => ({
      updateOne: {
        filter: { user: userId, category },
        update: { $set: { amount: Math.max(0, Number(amount) || 0) } },
        upsert: true,
      },
    }));

    if (operations.length > 0) {
      await Budget.bulkWrite(operations);
    }

    res.status(200).json({
      success: true,
      message: "Category budgets saved to database successfully",
      data: budgets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to persist budgets",
      error: error.message,
    });
  }
};

module.exports = {
  getBudgets,
  saveBudgets,
  DEFAULT_BUDGETS,
};

