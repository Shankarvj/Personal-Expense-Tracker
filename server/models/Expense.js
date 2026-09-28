const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than zero"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["expense", "income"],
      default: "expense",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Expense", expenseSchema);