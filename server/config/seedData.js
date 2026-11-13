const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Expense = require("../models/Expense");
const Subscription = require("../models/Subscription");
const Budget = require("../models/Budget");

/**
 * Ensures a verified Demo User and initial educational sample records
 * exist in MongoDB Atlas for seamless project demonstration.
 */
async function seedDefaultData() {
  try {
    const demoEmail = "demo@expensetracker.io";
    let demoUser = await User.findOne({ email: demoEmail });

    if (!demoUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("DemoPassword123!", salt);

      demoUser = await User.create({
        name: "Demo Financial User",
        email: demoEmail,
        password: hashedPassword,
      });
      console.log("[Seed Engine] Verified & initialized demo account: demo@expensetracker.io");
    }

    // 1. Seed Transactions
    const expenseCount = await Expense.countDocuments({ user: demoUser._id });
    if (expenseCount === 0) {
      const now = Date.now();
      const sampleRecords = [
        {
          title: "Monthly Software Engineering Salary",
          amount: 65000,
          category: "Salary",
          type: "income",
          description: "Direct salary transfer for current cycle",
          date: new Date(now),
          user: demoUser._id,
        },
        {
          title: "UI/UX Consultation & Development Retainer",
          amount: 18500,
          category: "Freelance",
          type: "income",
          description: "Client web design milestone payout",
          date: new Date(now - 86400000 * 2),
          user: demoUser._id,
        },
        {
          title: "Apartment Residential Lease",
          amount: 15000,
          category: "Housing",
          type: "expense",
          description: "Monthly apartment rent and maintenance fee",
          date: new Date(now - 86400000 * 3),
          user: demoUser._id,
        },
        {
          title: "Supermarket Groceries & Supplies",
          amount: 4850,
          category: "Food",
          type: "expense",
          description: "Pantry restocking and fresh groceries",
          date: new Date(now - 86400000 * 4),
          user: demoUser._id,
        },
        {
          title: "Cloud Infrastructure & Server Hosting",
          amount: 2450,
          category: "Utilities",
          type: "expense",
          description: "Monthly database clusters and cloud instances",
          date: new Date(now - 86400000 * 6),
          user: demoUser._id,
        },
        {
          title: "Monthly Transit & Fuel Card Recharge",
          amount: 1800,
          category: "Travel",
          type: "expense",
          description: "Public transit smartcard and travel pass",
          date: new Date(now - 86400000 * 8),
          user: demoUser._id,
        },
        {
          title: "Weekend Family Dining & Coffee",
          amount: 2200,
          category: "Entertainment",
          type: "expense",
          description: "Dinner bistro and recreational leisure",
          date: new Date(now - 86400000 * 10),
          user: demoUser._id,
        },
        {
          title: "Fitness Center & Gym Membership",
          amount: 2000,
          category: "Healthcare",
          type: "expense",
          description: "Monthly gym and crossfit subscription",
          date: new Date(now - 86400000 * 12),
          user: demoUser._id,
        },
      ];

      await Expense.insertMany(sampleRecords);
      console.log(`[Seed Engine] Seeded ${sampleRecords.length} financial transactions to MongoDB Atlas.`);
    }

    // 2. Seed Subscriptions
    const subCount = await Subscription.countDocuments({ user: demoUser._id });
    if (subCount === 0) {
      const sampleSubs = [
        { name: "Netflix 4K Ultra", amount: 649, category: "Entertainment", cycle: "Monthly", dueDay: 15, user: demoUser._id },
        { name: "Spotify Premium Family", amount: 179, category: "Entertainment", cycle: "Monthly", dueDay: 28, user: demoUser._id },
        { name: "AWS Cloud Hosting", amount: 2450, category: "Utilities", cycle: "Monthly", dueDay: 5, user: demoUser._id },
        { name: "JioFiber High-Speed", amount: 999, category: "Utilities", cycle: "Monthly", dueDay: 20, user: demoUser._id },
        { name: "Gym & Fitness Pass", amount: 2000, category: "Healthcare", cycle: "Monthly", dueDay: 1, user: demoUser._id },
      ];
      await Subscription.insertMany(sampleSubs);
      console.log(`[Seed Engine] Seeded ${sampleSubs.length} recurring subscriptions to MongoDB Atlas.`);
    }

    // 3. Seed Budgets
    const budgetCount = await Budget.countDocuments({ user: demoUser._id });
    if (budgetCount === 0) {
      const sampleBudgets = [
        { category: "Food", amount: 8000, user: demoUser._id },
        { category: "Housing", amount: 15000, user: demoUser._id },
        { category: "Travel", amount: 3000, user: demoUser._id },
        { category: "Utilities", amount: 3500, user: demoUser._id },
        { category: "Healthcare", amount: 2500, user: demoUser._id },
        { category: "Entertainment", amount: 3000, user: demoUser._id },
        { category: "Shopping", amount: 4000, user: demoUser._id },
        { category: "Education", amount: 5000, user: demoUser._id },
      ];
      await Budget.insertMany(sampleBudgets);
      console.log(`[Seed Engine] Seeded category budget limits to MongoDB Atlas.`);
    }
  } catch (error) {
    console.warn("[Seed Engine] Seeding check notice:", error.message);
  }
}

module.exports = seedDefaultData;
