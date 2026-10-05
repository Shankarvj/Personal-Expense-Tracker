/**
 * Authentication Input Validation & Sanitization Middleware
 * Week 8 Security Polish
 */

// Email regex pattern for RFC 5322 compliance checking
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Helper to sanitize text and strip dangerous script / HTML injection tags
const sanitizeText = (input) => {
  if (typeof input !== "string") return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/[<>]/g, "")
    .trim();
};

// Validate User Registration Request
const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  // Name Validation
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    errors.push("Full name is required.");
  } else if (name.trim().length < 2 || name.trim().length > 50) {
    errors.push("Name must be between 2 and 50 characters.");
  }

  // Email Validation
  if (!email || typeof email !== "string" || email.trim().length === 0) {
    errors.push("Email address is required.");
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push("Please provide a valid email address format.");
  }

  // Password Validation
  if (!password || typeof password !== "string") {
    errors.push("Password is required.");
  } else if (password.length < 6) {
    errors.push("Password must be at least 6 characters long.");
  } else if (password.length > 128) {
    errors.push("Password cannot exceed 128 characters.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: " + errors.join(" "),
      errors,
    });
  }

  // Sanitize and normalize inputs
  req.body.name = sanitizeText(name);
  req.body.email = email.trim().toLowerCase();
  req.body.password = password; // Passwords are not stripped of special chars, hashed with bcrypt

  next();
};

// Validate User Login Request
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== "string" || email.trim().length === 0) {
    errors.push("Email address is required.");
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push("Please provide a valid email address format.");
  }

  if (!password || typeof password !== "string" || password.trim().length === 0) {
    errors.push("Password is required.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: " + errors.join(" "),
      errors,
    });
  }

  req.body.email = email.trim().toLowerCase();
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  sanitizeText,
  EMAIL_REGEX,
};
