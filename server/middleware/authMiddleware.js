const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

// Strict Guard Middleware - Rejects if token missing or invalid
const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized: Invalid or expired token",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not Authorized: No token provided in Authorization header",
    });
  }
};

// Flexible / Permissive Middleware - Decodes token if present, but permits unauthenticated access
const optionalAuth = (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Ignored for optional auth
    }
  }
  next();
};

module.exports = { protect, optionalAuth };