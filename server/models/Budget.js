const mongoose = require("mongoose");
const { isMongoConnected, matchFilter, readCollection, writeCollection } = require("./dbProxy");

const budgetSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Budget limit is required"],
      min: [0, "Budget limit cannot be negative"],
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

budgetSchema.index({ user: 1, category: 1 }, { unique: true });

const MongooseBudget = mongoose.model("Budget", budgetSchema);

const BudgetProxy = {
  async find(filter = {}) {
    if (isMongoConnected()) {
      try {
        return await MongooseBudget.find(filter);
      } catch (err) {
        console.warn("[Budget] MongoDB find fallback:", err.message);
      }
    }

    const budgets = readCollection("budgets");
    return budgets.filter((item) => matchFilter(item, filter));
  },

  async bulkWrite(operations = []) {
    if (isMongoConnected()) {
      try {
        return await MongooseBudget.bulkWrite(operations);
      } catch (err) {
        console.warn("[Budget] MongoDB bulkWrite fallback:", err.message);
      }
    }

    const budgets = readCollection("budgets");

    operations.forEach((op) => {
      if (op.updateOne) {
        const filter = op.updateOne.filter || {};
        const update = (op.updateOne.update && op.updateOne.update.$set) || {};
        const idx = budgets.findIndex((b) => matchFilter(b, filter));

        if (idx !== -1) {
          budgets[idx] = {
            ...budgets[idx],
            ...update,
            updatedAt: new Date().toISOString(),
          };
        } else if (op.updateOne.upsert) {
          budgets.push({
            _id: "bgt_" + Date.now() + Math.random().toString(36).substring(2, 6),
            ...filter,
            ...update,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }
    });

    writeCollection("budgets", budgets);
    return { ok: 1, modifiedCount: operations.length };
  },

  async countDocuments(filter = {}) {
    if (isMongoConnected()) {
      try {
        return await MongooseBudget.countDocuments(filter);
      } catch (err) {
        console.warn("[Budget] MongoDB count fallback:", err.message);
      }
    }
    const budgets = readCollection("budgets");
    return budgets.filter((item) => matchFilter(item, filter)).length;
  },
};

module.exports = BudgetProxy;
