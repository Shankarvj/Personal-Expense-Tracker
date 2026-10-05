/**
 * Rate Limiting & Security Guard Middleware
 * Week 8 Security Polish
 */

const rateLimit = require("express-rate-limit");

// General API Rate Limiter (15 minutes window, max 200 requests per IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again after 15 minutes.",
  },
});

// Stricter Auth Rate Limiter (Prevent Brute-Force Password Attacks)
// (15 minutes window, max 15 login/register attempts per IP)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts from this IP address. Please wait 15 minutes before retrying.",
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
};
