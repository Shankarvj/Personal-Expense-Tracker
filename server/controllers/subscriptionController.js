const Subscription = require("../models/Subscription");

// GET ALL SUBSCRIPTIONS FOR USER
const getSubscriptions = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : req.query.user;
    if (!userId) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    const subscriptions = await Subscription.find({ user: userId }).sort({ dueDay: 1 });

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscriptions",
      error: error.message,
    });
  }
};

// CREATE NEW SUBSCRIPTION
const createSubscription = async (req, res) => {
  try {
    const { name, amount, category, cycle, dueDay } = req.body;
    const userId = req.user ? req.user.id : req.body.user;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authorization required: Please log in to add subscriptions",
      });
    }

    if (!name || amount === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: "Please provide subscription name, amount, and category",
      });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a positive number greater than 0",
      });
    }

    const sub = await Subscription.create({
      name: name.trim(),
      amount: numAmount,
      category: category.trim(),
      cycle: cycle || "Monthly",
      dueDay: Number(dueDay) || 15,
      user: userId,
    });

    res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      data: sub,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create subscription",
      error: error.message,
    });
  }
};

// DELETE SUBSCRIPTION
const deleteSubscription = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : req.body.user;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authorization required",
      });
    }

    const deleted = await Subscription.findOneAndDelete({
      _id: req.params.id,
      user: userId,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found or unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Subscription removed successfully",
      data: { id: req.params.id },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete subscription",
      error: error.message,
    });
  }
};

module.exports = {
  getSubscriptions,
  createSubscription,
  deleteSubscription,
};
