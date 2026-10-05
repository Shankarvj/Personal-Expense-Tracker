const Expense = require("../models/Expense");

// GET ALL EXPENSES (Filtered by User if authenticated, supports search/category/type/sort)
const getExpenses = async (req, res) => {
  try {
    const filter = {};

    // If authenticated user is attached via auth middleware
    if (req.user && req.user.id) {
      filter.user = req.user.id;
    }

    // Category filter
    if (req.query.category && req.query.category !== "All") {
      filter.category = req.query.category;
    }

    // Type filter (income / expense)
    if (req.query.type && req.query.type !== "all") {
      filter.type = req.query.type;
    }

    // Search keyword in title or description
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Sorting
    let sortOption = { date: -1, createdAt: -1 };
    if (req.query.sort === "amount-desc") {
      sortOption = { amount: -1 };
    } else if (req.query.sort === "amount-asc") {
      sortOption = { amount: 1 };
    } else if (req.query.sort === "date-asc") {
      sortOption = { date: 1 };
    }

    const expenses = await Expense.find(filter).sort(sortOption);

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch expenses",
      error: error.message,
    });
  }
};

// GET FINANCIAL SUMMARY (Income, Expense, Balance, Breakdown)
const getExpenseSummary = async (req, res) => {
  try {
    const filter = {};
    if (req.user && req.user.id) {
      filter.user = req.user.id;
    }

    const expenses = await Expense.find(filter);

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryBreakdown = {};

    expenses.forEach((item) => {
      const amt = Number(item.amount) || 0;
      if (item.type === "income") {
        totalIncome += amt;
      } else {
        totalExpense += amt;
        categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + amt;
      }
    });

    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      summary: {
        totalIncome,
        totalExpense,
        netBalance,
        savingsRate: parseFloat(savingsRate),
        transactionCount: expenses.length,
        categoryBreakdown,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to compute financial summary",
      error: error.message,
    });
  }
};

// CREATE NEW EXPENSE
const createExpense = async (req, res) => {
  try {
    const { title, amount, category, type, description, date } = req.body;

    if (!title || amount === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: "Please provide title, amount, and category",
      });
    }

    // Determine user id (authenticated user or fallback if provided)
    const userId = req.user ? req.user.id : req.body.user;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authorization required: Please log in to record transactions",
      });
    }

    const expense = await Expense.create({
      title: title.trim(),
      amount: Number(amount),
      category: category.trim(),
      type: type || "expense",
      description: description ? description.trim() : "",
      date: date ? new Date(date) : new Date(),
      user: userId,
    });

    res.status(201).json({
      success: true,
      message: "Transaction recorded successfully",
      data: expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create transaction",
      error: error.message,
    });
  }
};

// UPDATE EXPENSE
const updateExpense = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    if (req.user && req.user.id) {
      query.user = req.user.id;
    }

    const updatedExpense = await Expense.findOneAndUpdate(
      query,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedExpense) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found or unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      data: updatedExpense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update transaction",
      error: error.message,
    });
  }
};

// DELETE EXPENSE
const deleteExpense = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    if (req.user && req.user.id) {
      query.user = req.user.id;
    }

    const deletedExpense = await Expense.findOneAndDelete(query);

    if (!deletedExpense) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found or unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
      data: { id: req.params.id },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete transaction",
      error: error.message,
    });
  }
};

module.exports = {
  getExpenses,
  getExpenseSummary,
  createExpense,
  updateExpense,
  deleteExpense,
};