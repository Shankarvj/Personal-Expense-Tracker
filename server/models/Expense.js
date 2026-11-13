const mongoose = require("mongoose");
const { isMongoConnected, matchFilter, sortItems, readCollection, writeCollection } = require("./dbProxy");

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      default: "expense",
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseExpense = mongoose.model("Expense", expenseSchema);

// Hybrid Expense Model (Seamlessly switches between MongoDB Atlas and persistent local storage)
const ExpenseProxy = {
  find(filter = {}) {
    if (isMongoConnected()) {
      try {
        return MongooseExpense.find(filter);
      } catch (err) {
        console.warn("[Expense] MongoDB find fallback:", err.message);
      }
    }

    const expenses = readCollection("expenses");
    const matched = expenses.filter((item) => matchFilter(item, filter));

    return {
      async sort(sortOption) {
        return sortItems(matched, sortOption);
      },
      then(resolve, reject) {
        return Promise.resolve(matched).then(resolve, reject);
      },
      catch(reject) {
        return Promise.resolve(matched).catch(reject);
      },
    };
  },

  async findById(id) {
    if (isMongoConnected()) {
      try {
        return await MongooseExpense.findById(id);
      } catch (err) {
        console.warn("[Expense] MongoDB findById fallback:", err.message);
      }
    }

    const expenses = readCollection("expenses");
    return expenses.find((e) => String(e._id) === String(id)) || null;
  },

  async create(payload) {
    if (isMongoConnected()) {
      try {
        return await MongooseExpense.create(payload);
      } catch (err) {
        console.warn("[Expense] MongoDB create fallback:", err.message);
      }
    }

    const expenses = readCollection("expenses");
    const now = new Date().toISOString();
    const newEntry = {
      _id: "exp_" + Date.now(),
      title: payload.title,
      amount: Number(payload.amount),
      category: payload.category,
      type: payload.type || "expense",
      description: payload.description || "",
      date: payload.date || now,
      user: payload.user,
      createdAt: now,
      updatedAt: now,
    };

    expenses.unshift(newEntry);
    writeCollection("expenses", expenses);
    return newEntry;
  },

  async findByIdAndUpdate(id, update, options = {}) {
    return this.findOneAndUpdate({ _id: id }, update, options);
  },

  async findOneAndUpdate(filter = {}, update = {}, options = {}) {
    if (isMongoConnected()) {
      try {
        return await MongooseExpense.findOneAndUpdate(filter, update, options);
      } catch (err) {
        console.warn("[Expense] MongoDB update fallback:", err.message);
      }
    }

    const expenses = readCollection("expenses");
    const idx = expenses.findIndex((e) => matchFilter(e, filter));
    if (idx === -1) return null;

    const updated = {
      ...expenses[idx],
      ...update,
      amount: update.amount !== undefined ? Number(update.amount) : expenses[idx].amount,
      updatedAt: new Date().toISOString(),
    };

    expenses[idx] = updated;
    writeCollection("expenses", expenses);
    return updated;
  },

  async findByIdAndDelete(id) {
    return this.findOneAndDelete({ _id: id });
  },

  async findOneAndDelete(filter = {}) {
    if (isMongoConnected()) {
      try {
        return await MongooseExpense.findOneAndDelete(filter);
      } catch (err) {
        console.warn("[Expense] MongoDB delete fallback:", err.message);
      }
    }

    const expenses = readCollection("expenses");
    const idx = expenses.findIndex((e) => matchFilter(e, filter));
    if (idx === -1) return null;

    const deleted = expenses.splice(idx, 1)[0];
    writeCollection("expenses", expenses);
    return deleted;
  },

  async countDocuments(filter = {}) {
    if (isMongoConnected()) {
      try {
        return await MongooseExpense.countDocuments(filter);
      } catch (err) {
        console.warn("[Expense] MongoDB count fallback:", err.message);
      }
    }
    const expenses = readCollection("expenses");
    return expenses.filter((e) => matchFilter(e, filter)).length;
  },

  async aggregate(pipeline = []) {
    if (isMongoConnected()) {
      try {
        return await MongooseExpense.aggregate(pipeline);
      } catch (err) {
        console.warn("[Expense] MongoDB aggregate fallback:", err.message);
      }
    }

    // Default aggregation fallback for summary (group by type)
    const expenses = readCollection("expenses");
    let totalIncome = 0;
    let totalExpense = 0;

    expenses.forEach((e) => {
      const amt = Number(e.amount) || 0;
      if (e.type === "income") totalIncome += amt;
      else totalExpense += amt;
    });

    return [
      { _id: "income", total: totalIncome },
      { _id: "expense", total: totalExpense },
    ];
  },
};

module.exports = ExpenseProxy;
