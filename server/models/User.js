const mongoose = require("mongoose");
const { isMongoConnected, readCollection, writeCollection } = require("./dbProxy");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseUser = mongoose.model("User", userSchema);

// Hybrid User Model (Seamlessly switches between MongoDB Atlas and persistent local storage)
const UserProxy = {
  async findOne(filter = {}) {
    if (isMongoConnected()) {
      try {
        return await MongooseUser.findOne(filter);
      } catch (err) {
        console.warn("[User] MongoDB query fallback:", err.message);
      }
    }

    const users = readCollection("users");
    const user = users.find((u) => {
      if (filter.email && u.email.toLowerCase() === filter.email.toLowerCase()) return true;
      if (filter._id && String(u._id) === String(filter._id)) return true;
      return false;
    });

    return user ? { ...user } : null;
  },

  findById(id) {
    if (isMongoConnected()) {
      try {
        return MongooseUser.findById(id);
      } catch (err) {
        console.warn("[User] MongoDB query fallback:", err.message);
      }
    }

    const users = readCollection("users");
    const user = users.find((u) => String(u._id) === String(id));
    let selectedUser = user ? { ...user } : null;

    const queryObj = {
      select(fieldStr) {
        if (selectedUser && fieldStr && fieldStr.includes("-password")) {
          delete selectedUser.password;
        }
        return queryObj;
      },
      then(resolve, reject) {
        return Promise.resolve(selectedUser).then(resolve, reject);
      },
      catch(reject) {
        return Promise.resolve(selectedUser).catch(reject);
      },
    };

    return queryObj;
  },

  async create(payload) {
    if (isMongoConnected()) {
      try {
        return await MongooseUser.create(payload);
      } catch (err) {
        console.warn("[User] MongoDB create fallback:", err.message);
      }
    }

    const users = readCollection("users");
    const newUser = {
      _id: "usr_" + Date.now(),
      name: payload.name,
      email: payload.email.toLowerCase(),
      password: payload.password,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    writeCollection("users", users);
    return { ...newUser };
  },

  async countDocuments(filter = {}) {
    if (isMongoConnected()) {
      try {
        return await MongooseUser.countDocuments(filter);
      } catch (err) {
        console.warn("[User] MongoDB count fallback:", err.message);
      }
    }
    const users = readCollection("users");
    return users.length;
  },
};

module.exports = UserProxy;
