const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token;

  console.log("Authorization Header:", req.headers.authorization);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      console.log("Token:", token);

      const decoded = jwt.verify(token, "mysecretkey");

      console.log("Decoded:", decoded);

      req.user = decoded;

      next();
    } catch (error) {
      console.log("JWT Error:", error.message);

      return res.status(401).json({
        message: "Not Authorized"
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      message: "No Token Found"
    });
  }
};

module.exports = { protect };