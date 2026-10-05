/**
 * Expense & Income Input Validation & Sanitization Middleware
 * Week 8 Security Polish
 */

const { sanitizeText } = require("./authValidation");

const ALLOWED_TYPES = ["expense", "income"];
const ALLOWED_CATEGORIES = [
  "Food",
  "Housing",
  "Travel",
  "Utilities",
  "Healthcare",
  "Entertainment",
  "Shopping",
  "Education",
  "Salary",
  "Freelance",
  "Investments",
  "Gift",
  "Refund",
  "Other",
];

// Validate & Sanitize Expense Creation Request
const validateExpenseCreate = (req, res, next) => {
  const { title, amount, category, type, description, date } = req.body;
  const errors = [];

  // Title Validation
  if (!title || typeof title !== "string" || title.trim().length === 0) {
    errors.push("Title is required.");
  } else if (title.trim().length < 2 || title.trim().length > 100) {
    errors.push("Title must be between 2 and 100 characters.");
  }

  // Amount Validation (Strict positive number)
  const numAmount = Number(amount);
  if (amount === undefined || amount === null || isNaN(numAmount)) {
    errors.push("Amount must be a valid number.");
  } else if (!isFinite(numAmount)) {
    errors.push("Amount must be a finite number.");
  } else if (numAmount <= 0) {
    errors.push("Amount must be a positive value greater than zero.");
  } else if (numAmount > 100000000) {
    errors.push("Amount exceeds maximum supported single transaction limit (₹10,00,00,000).");
  }

  // Category Validation
  if (!category || typeof category !== "string" || category.trim().length === 0) {
    errors.push("Category is required.");
  } else if (category.trim().length > 50) {
    errors.push("Category name cannot exceed 50 characters.");
  }

  // Type Validation
  if (type && !ALLOWED_TYPES.includes(type.toLowerCase())) {
    errors.push(`Type must be either 'expense' or 'income'. Received: ${type}`);
  }

  // Description Validation (Optional)
  if (description && typeof description === "string" && description.length > 500) {
    errors.push("Description cannot exceed 500 characters.");
  }

  // Date Validation (Optional)
  if (date) {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      errors.push("Please provide a valid ISO date format.");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: " + errors.join(" "),
      errors,
    });
  }

  // Sanitize Inputs
  req.body.title = sanitizeText(title);
  req.body.amount = Number(numAmount.toFixed(2));
  req.body.category = sanitizeText(category);
  req.body.type = type ? type.toLowerCase() : "expense";
  req.body.description = description ? sanitizeText(description) : "";
  if (date) req.body.date = new Date(date);

  next();
};

// Validate & Sanitize Expense Update Request
const validateExpenseUpdate = (req, res, next) => {
  const { title, amount, category, type, description, date } = req.body;
  const errors = [];

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim().length === 0) {
      errors.push("Title cannot be empty.");
    } else if (title.trim().length < 2 || title.trim().length > 100) {
      errors.push("Title must be between 2 and 100 characters.");
    } else {
      req.body.title = sanitizeText(title);
    }
  }

  if (amount !== undefined) {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || !isFinite(numAmount)) {
      errors.push("Amount must be a valid finite number.");
    } else if (numAmount <= 0) {
      errors.push("Amount must be a positive number greater than zero.");
    } else {
      req.body.amount = Number(numAmount.toFixed(2));
    }
  }

  if (category !== undefined) {
    if (typeof category !== "string" || category.trim().length === 0) {
      errors.push("Category cannot be empty.");
    } else {
      req.body.category = sanitizeText(category);
    }
  }

  if (type !== undefined) {
    if (!ALLOWED_TYPES.includes(type.toLowerCase())) {
      errors.push(`Type must be either 'expense' or 'income'. Received: ${type}`);
    } else {
      req.body.type = type.toLowerCase();
    }
  }

  if (description !== undefined) {
    if (typeof description === "string" && description.length > 500) {
      errors.push("Description cannot exceed 500 characters.");
    } else {
      req.body.description = sanitizeText(description);
    }
  }

  if (date !== undefined) {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      errors.push("Please provide a valid ISO date format.");
    } else {
      req.body.date = parsedDate;
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: " + errors.join(" "),
      errors,
    });
  }

  next();
};

module.exports = {
  validateExpenseCreate,
  validateExpenseUpdate,
  ALLOWED_TYPES,
  ALLOWED_CATEGORIES,
};
