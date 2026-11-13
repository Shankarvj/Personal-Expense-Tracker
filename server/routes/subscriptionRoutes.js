const express = require("express");
const router = express.Router();
const {
  getSubscriptions,
  createSubscription,
  deleteSubscription,
} = require("../controllers/subscriptionController");
const { optionalAuth, protect } = require("../middleware/authMiddleware");

router.get("/", optionalAuth, getSubscriptions);
router.post("/", protect, createSubscription);
router.delete("/:id", protect, deleteSubscription);

module.exports = router;

