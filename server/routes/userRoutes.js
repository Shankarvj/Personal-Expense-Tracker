const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getProfile,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimitMiddleware");
const {
  validateRegister,
  validateLogin,
} = require("../validations/authValidation");

// Public Authentication Endpoints (Guarded by rate limiter & input validator)
router.post("/register", authLimiter, validateRegister, registerUser);
router.post("/login", authLimiter, validateLogin, loginUser);

// Protected Profile Endpoint
router.get("/profile", protect, getProfile);

module.exports = router;