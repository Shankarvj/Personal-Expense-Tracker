const mongoose = require("mongoose");
const { readCollection, writeCollection } = require("../config/storage");

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

function matchFilter(item, filter = {}) {
  if (!filter || Object.keys(filter).length === 0) return true;

  for (const [key, val] of Object.entries(filter)) {
    if (key === "$or" && Array.isArray(val)) {
      const orMatched = val.some((subQuery) => {
        for (const [subKey, subVal] of Object.entries(subQuery)) {
          if (subVal && subVal.$regex) {
            const regex = new RegExp(subVal.$regex, subVal.$options || "");
            if (regex.test(item[subKey] || "")) return true;
          } else if (item[subKey] === subVal) {
            return true;
          }
        }
        return false;
      });
      if (!orMatched) return false;
      continue;
    }

    if (key === "user") {
      const itemUserId = item.user && (item.user._id || item.user);
      if (String(itemUserId) !== String(val)) return false;
      continue;
    }

    if (key === "date" && typeof val === "object") {
      const itemDate = new Date(item.date || item.createdAt).getTime();
      if (val.$gte && itemDate < new Date(val.$gte).getTime()) return false;
      if (val.$lte && itemDate > new Date(val.$lte).getTime()) return false;
      continue;
    }

    if (typeof val === "string") {
      if (String(item[key] || "").toLowerCase() !== val.toLowerCase()) return false;
      continue;
    }

    if (item[key] !== val) return false;
  }

  return true;
}

function sortItems(items, sortOption = {}) {
  if (!sortOption || Object.keys(sortOption).length === 0) return items;
  return [...items].sort((a, b) => {
    for (const [field, direction] of Object.entries(sortOption)) {
      let aVal = a[field];
      let bVal = b[field];

      if (field === "date" || field === "createdAt") {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      }

      if (aVal < bVal) return direction === -1 || direction === "desc" ? 1 : -1;
      if (aVal > bVal) return direction === -1 || direction === "desc" ? -1 : 1;
    }
    return 0;
  });
}

module.exports = {
  isMongoConnected,
  matchFilter,
  sortItems,
  readCollection,
  writeCollection,
};

