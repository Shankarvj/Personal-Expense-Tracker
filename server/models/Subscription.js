const mongoose = require("mongoose");
const { isMongoConnected, matchFilter, sortItems, readCollection, writeCollection } = require("./dbProxy");

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Subscription name is required"],
      trim: true,
      maxlength: 100,
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
    cycle: {
      type: String,
      enum: ["Monthly", "Yearly", "Weekly"],
      default: "Monthly",
    },
    dueDay: {
      type: Number,
      min: [1, "Due day must be between 1 and 31"],
      max: [31, "Due day must be between 1 and 31"],
      default: 15,
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

const MongooseSubscription = mongoose.model("Subscription", subscriptionSchema);

const SubscriptionProxy = {
  find(filter = {}) {
    if (isMongoConnected()) {
      try {
        return MongooseSubscription.find(filter);
      } catch (err) {
        console.warn("[Subscription] MongoDB find fallback:", err.message);
      }
    }

    const subs = readCollection("subscriptions");
    const matched = subs.filter((item) => matchFilter(item, filter));

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

  async create(payload) {
    if (isMongoConnected()) {
      try {
        return await MongooseSubscription.create(payload);
      } catch (err) {
        console.warn("[Subscription] MongoDB create fallback:", err.message);
      }
    }

    const subs = readCollection("subscriptions");
    const now = new Date().toISOString();
    const newEntry = {
      _id: "sub_" + Date.now(),
      name: payload.name,
      amount: Number(payload.amount),
      category: payload.category,
      cycle: payload.cycle || "Monthly",
      dueDay: Number(payload.dueDay) || 15,
      user: payload.user,
      createdAt: now,
      updatedAt: now,
    };

    subs.push(newEntry);
    writeCollection("subscriptions", subs);
    return newEntry;
  },

  async findOneAndDelete(filter = {}) {
    if (isMongoConnected()) {
      try {
        return await MongooseSubscription.findOneAndDelete(filter);
      } catch (err) {
        console.warn("[Subscription] MongoDB delete fallback:", err.message);
      }
    }

    const subs = readCollection("subscriptions");
    const idx = subs.findIndex((item) => matchFilter(item, filter));
    if (idx === -1) return null;

    const deleted = subs.splice(idx, 1)[0];
    writeCollection("subscriptions", subs);
    return deleted;
  },

  async countDocuments(filter = {}) {
    if (isMongoConnected()) {
      try {
        return await MongooseSubscription.countDocuments(filter);
      } catch (err) {
        console.warn("[Subscription] MongoDB count fallback:", err.message);
      }
    }
    const subs = readCollection("subscriptions");
    return subs.filter((item) => matchFilter(item, filter)).length;
  },
};

module.exports = SubscriptionProxy;
