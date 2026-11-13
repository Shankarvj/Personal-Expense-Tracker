const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const DATA_DIR = path.join(__dirname, "..", "data");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const FILES = {
  users: path.join(DATA_DIR, "users.json"),
  expenses: path.join(DATA_DIR, "expenses.json"),
  subscriptions: path.join(DATA_DIR, "subscriptions.json"),
  budgets: path.join(DATA_DIR, "budgets.json"),
};

function readCollection(collection) {
  const filePath = FILES[collection];
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw || "[]");
  } catch (err) {
    console.warn(`[Storage] Error reading ${collection}.json:`, err.message);
    return [];
  }
}

function writeCollection(collection, data) {
  const filePath = FILES[collection];
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error(`[Storage] Error writing ${collection}.json:`, err.message);
  }
}

// Auto-seed default data if empty
async function initStorage() {
  let users = readCollection("users");
  let demoUser = users.find((u) => u.email === "demo@expensetracker.io");

  if (!demoUser) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("DemoPassword123!", salt);
    demoUser = {
      _id: "demo_user_001",
      name: "Demo Financial User",
      email: "demo@expensetracker.io",
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(demoUser);
    writeCollection("users", users);
  }

  let expenses = readCollection("expenses");
  if (expenses.length === 0) {
    const now = Date.now();
    expenses = [
      {
        _id: "exp_001",
        title: "Monthly Software Engineering Salary",
        amount: 65000,
        category: "Salary",
        type: "income",
        description: "Direct salary transfer for current cycle",
        date: new Date(now).toISOString(),
        user: demoUser._id,
        createdAt: new Date(now).toISOString(),
        updatedAt: new Date(now).toISOString(),
      },
      {
        _id: "exp_002",
        title: "UI/UX Consultation & Development Retainer",
        amount: 18500,
        category: "Freelance",
        type: "income",
        description: "Client web design milestone payout",
        date: new Date(now - 86400000 * 2).toISOString(),
        user: demoUser._id,
        createdAt: new Date(now - 86400000 * 2).toISOString(),
        updatedAt: new Date(now - 86400000 * 2).toISOString(),
      },
      {
        _id: "exp_003",
        title: "Apartment Residential Lease",
        amount: 15000,
        category: "Housing",
        type: "expense",
        description: "Monthly apartment rent and maintenance fee",
        date: new Date(now - 86400000 * 3).toISOString(),
        user: demoUser._id,
        createdAt: new Date(now - 86400000 * 3).toISOString(),
        updatedAt: new Date(now - 86400000 * 3).toISOString(),
      },
      {
        _id: "exp_004",
        title: "Supermarket Groceries & Supplies",
        amount: 4850,
        category: "Food",
        type: "expense",
        description: "Pantry restocking and fresh groceries",
        date: new Date(now - 86400000 * 4).toISOString(),
        user: demoUser._id,
        createdAt: new Date(now - 86400000 * 4).toISOString(),
        updatedAt: new Date(now - 86400000 * 4).toISOString(),
      },
      {
        _id: "exp_005",
        title: "Cloud Infrastructure & Server Hosting",
        amount: 2450,
        category: "Utilities",
        type: "expense",
        description: "Monthly database clusters and cloud instances",
        date: new Date(now - 86400000 * 6).toISOString(),
        user: demoUser._id,
        createdAt: new Date(now - 86400000 * 6).toISOString(),
        updatedAt: new Date(now - 86400000 * 6).toISOString(),
      },
      {
        _id: "exp_006",
        title: "Monthly Transit & Fuel Card Recharge",
        amount: 1800,
        category: "Travel",
        type: "expense",
        description: "Public transit smartcard and travel pass",
        date: new Date(now - 86400000 * 8).toISOString(),
        user: demoUser._id,
        createdAt: new Date(now - 86400000 * 8).toISOString(),
        updatedAt: new Date(now - 86400000 * 8).toISOString(),
      },
      {
        _id: "exp_007",
        title: "Weekend Family Dining & Coffee",
        amount: 2200,
        category: "Entertainment",
        type: "expense",
        description: "Dinner bistro and recreational leisure",
        date: new Date(now - 86400000 * 10).toISOString(),
        user: demoUser._id,
        createdAt: new Date(now - 86400000 * 10).toISOString(),
        updatedAt: new Date(now - 86400000 * 10).toISOString(),
      },
      {
        _id: "exp_008",
        title: "Fitness Center & Gym Membership",
        amount: 2000,
        category: "Healthcare",
        type: "expense",
        description: "Monthly fitness pass",
        date: new Date(now - 86400000 * 12).toISOString(),
        user: demoUser._id,
        createdAt: new Date(now - 86400000 * 12).toISOString(),
        updatedAt: new Date(now - 86400000 * 12).toISOString(),
      },
    ];
    writeCollection("expenses", expenses);
  }

  let subs = readCollection("subscriptions");
  if (subs.length === 0) {
    subs = [
      {
        _id: "sub_001",
        name: "Netflix 4K Ultra",
        amount: 649,
        category: "Entertainment",
        cycle: "Monthly",
        dueDay: 15,
        user: demoUser._id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "sub_002",
        name: "Spotify Premium Family",
        amount: 179,
        category: "Entertainment",
        cycle: "Monthly",
        dueDay: 28,
        user: demoUser._id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "sub_003",
        name: "AWS Cloud Infrastructure",
        amount: 2450,
        category: "Utilities",
        cycle: "Monthly",
        dueDay: 5,
        user: demoUser._id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "sub_004",
        name: "JioFiber Broadband",
        amount: 999,
        category: "Utilities",
        cycle: "Monthly",
        dueDay: 20,
        user: demoUser._id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "sub_005",
        name: "CultFit Gym & Health",
        amount: 2000,
        category: "Healthcare",
        cycle: "Monthly",
        dueDay: 1,
        user: demoUser._id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    writeCollection("subscriptions", subs);
  }

  let budgets = readCollection("budgets");
  if (budgets.length === 0) {
    const DEFAULT_CAPS = {
      Food: 8000,
      Housing: 15000,
      Travel: 3000,
      Utilities: 3500,
      Healthcare: 2500,
      Entertainment: 3000,
      Shopping: 4000,
      Education: 5000,
    };
    budgets = Object.entries(DEFAULT_CAPS).map(([category, amount], idx) => ({
      _id: `bgt_00${idx + 1}`,
      category,
      amount,
      user: demoUser._id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    writeCollection("budgets", budgets);
  }
}

// Initialize on module load
initStorage();

module.exports = {
  readCollection,
  writeCollection,
  initStorage,
};

