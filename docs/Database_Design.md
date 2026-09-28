# Database Design & Schema Architecture
## Personal Expense Tracker
**Database Engine:** MongoDB Atlas (Cloud NoSQL)  
**Object Data Modeling (ODM):** Mongoose v9.x  
**Phase / Milestone:** Milestone 05 — Cloud Database Integration & Data Modeling

---

## 1. Database Overview & Strategy
The Expense Tracker application employs MongoDB Atlas, a distributed document-oriented database. A NoSQL schema-first design using Mongoose ODM ensures high schema flexibility while strictly validating required fields, data types, and default values.

### Connection Architecture
- **Protocol:** `mongodb+srv://` (SRV connection string with SSL/TLS encryption)
- **Environment Isolation:** Credentials stored exclusively in `.env` (excluded via `.gitignore`)
- **Connection Module:** `server/config/db.js` using asynchronous `mongoose.connect()` with graceful process termination handling on failure.

---

## 2. Entity-Relationship (ER) Architecture

```
+-----------------------------------------------------------+
|                          USER                             |
+-----------------------------------------------------------+
| _id          : ObjectId (PK, auto-generated)              |
| name         : String (required)                          |
| email        : String (required, unique, indexed)         |
| password     : String (required, Bcrypt hashed)           |
| createdAt    : Date (auto-managed timestamp)              |
| updatedAt    : Date (auto-managed timestamp)              |
+-----------------------------------------------------------+
                            | 1
                            |
                            | 0..* (One-to-Many Reference)
                            v
+-----------------------------------------------------------+
|                        EXPENSE                            |
+-----------------------------------------------------------+
| _id          : ObjectId (PK, auto-generated)              |
| title        : String (required, trimmed)                 |
| amount       : Number (required, min: 0.01)               |
| category     : String (required, trimmed)                 |
| type         : String (enum: ['expense', 'income'])       |
| date         : Date (default: Date.now)                   |
| description  : String (optional, default: "")             |
| user         : ObjectId (FK -> User._id, optional/ref)    |
| createdAt    : Date (auto-managed timestamp)              |
| updatedAt    : Date (auto-managed timestamp)              |
+-----------------------------------------------------------+
```

---

## 3. Data Dictionaries

### 3.1 `users` Collection Schema
Defined in `server/models/User.js`.

| Field Name | Data Type | Validation Rules | Constraints / Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Automatically generated 12-byte BSON identifier |
| `name` | String | `required: true` | User's full display name |
| `email` | String | `required: true`, `unique: true` | Normalized email address, unique index created |
| `password` | String | `required: true` | 60-character Bcrypt salted hash (never plain text) |
| `createdAt` | Date | System timestamp | Managed automatically via Mongoose `{ timestamps: true }` |
| `updatedAt` | Date | System timestamp | Managed automatically via Mongoose `{ timestamps: true }` |

### 3.2 `expenses` Collection Schema
Defined in `server/models/Expense.js`.

| Field Name | Data Type | Validation Rules | Constraints / Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Automatically generated 12-byte BSON identifier |
| `title` | String | `required: true`, `trim: true` | Brief description of the transaction (e.g., "Grocery Shopping") |
| `amount` | Number | `required: true`, `min: 0.01` | Positive financial value |
| `category` | String | `required: true`, `trim: true` | Category label (Food, Housing, Travel, Entertainment, Salary, etc.) |
| `type` | String | `enum: ['expense', 'income']` | Distinguishes expenditures from revenues (default: `expense`) |
| `date` | Date | `default: Date.now` | Effective date of the transaction |
| `description` | String | `default: ""`, `trim: true` | Optional detailed notes or vendor reference |
| `user` | ObjectId | `ref: 'User'` | Foreign reference linking the entry to the authenticated user |
| `createdAt` | Date | System timestamp | Created timestamp |
| `updatedAt` | Date | System timestamp | Updated timestamp |

---

## 4. Query Indexing Strategy
To optimize filtering performance for Milestone 06 (Queries & Filtering):
1. **User Index (`{ email: 1 }`):** Unique B-Tree index for rapid authentication lookups.
2. **Category & Date Compound Index (`{ category: 1, date: -1 }`):** Accelerates category-based and date-bounded aggregation queries.
3. **User Reference Index (`{ user: 1, date: -1 }`):** Optimizes multi-tenant record retrieval ordered by transaction date.
