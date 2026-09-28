const Expense = require("../models/Expense");

// GET ALL EXPENSES WITH ADVANCED QUERYING & FILTERING
const getExpenses = async (req, res) => {
  try {
    const { category, type, search, startDate, endDate, sort } = req.query;

    const query = {};

    // Filter by User if authenticated
    if (req.user && req.user.id) {
      query.$or = [{ user: req.user.id }, { user: null }, { user: { $exists: false } }];
    }

    // Filter by Category
    if (category && category !== "All") {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    // Filter by Type (expense / income)
    if (type && type !== "All") {
      query.type = type.toLowerCase();
    }

    // Search query on title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Date range filtering
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Dynamic sorting
    let sortOptions = { date: -1, createdAt: -1 };
    if (sort === "amount_asc") sortOptions = { amount: 1 };
    else if (sort === "amount_desc") sortOptions = { amount: -1 };
    else if (sort === "date_asc") sortOptions = { date: 1 };
    else if (sort === "date_desc") sortOptions = { date: -1 };

    const expenses = await Expense.find(query).sort(sortOptions);

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET FINANCIAL SUMMARY & ANALYTICS
const getExpenseSummary = async (req, res) => {
  try {
    const query = {};
    if (req.user && req.user.id) {
      query.$or = [{ user: req.user.id }, { user: null }, { user: { $exists: false } }];
    }

    const expenses = await Expense.find(query);

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryBreakdown = {};

    expenses.forEach((item) => {
      const amt = Number(item.amount) || 0;
      const itemType = item.type || "expense";

      if (itemType === "income") {
        totalIncome += amt;
      } else {
        totalExpense += amt;
        const cat = item.category || "Uncategorized";
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + amt;
      }
    });

    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      summary: {
        totalIncome,
        totalExpense,
        balance,
        savingsRate: Number(savingsRate),
        transactionCount: expenses.length,
        categoryBreakdown,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// CREATE EXPENSE
const createExpense = async (req, res) => {
  try {
    const { title, amount, category, type, date, description } = req.body;

    if (!title || !amount || !category) {
      return res.status(400).json({
        success: false,
        message: "Please provide title, amount, and category",
      });
    }

    const expenseData = {
      title,
      amount: Number(amount),
      category,
      type: type || "expense",
      date: date ? new Date(date) : new Date(),
      description: description || "",
    };

    if (req.user && req.user.id) {
      expenseData.user = req.user.id;
    }

    const expense = await Expense.create(expenseData);

    res.status(201).json({
      success: true,
      message: "Expense Created Successfully",
      data: expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE EXPENSE
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Expense Updated Successfully",
      data: expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE EXPENSE
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Expense Deleted Successfully",
      data: { id: req.params.id },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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