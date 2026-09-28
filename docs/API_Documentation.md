# RESTful API Specification
## Personal Expense Tracker
**Base URL:** `http://localhost:5000/api`  
**Protocol:** HTTP/1.1  
**Content-Type:** `application/json`  
**Phase / Milestone:** Milestone 03 & Milestone 06 — REST API Architecture & CRUD Engine

---

## 1. Authentication & Security Headers
Endpoints requiring authentication mandate the `Authorization` header containing the Bearer token acquired upon registration or login:
```http
Authorization: Bearer <jwt_token_string>
Content-Type: application/json
```

---

## 2. Authentication Endpoints (Milestone 07)

### 2.1 Register New User
- **Route:** `POST /api/users/register`
- **Access:** Public
- **Request Body:**
```json
{
  "name": "Shankar G",
  "email": "shankar@example.com",
  "password": "SecurePassword123"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "User Registered Successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "673f8e91a03e1b0021c3b12a",
    "name": "Shankar G",
    "email": "shankar@example.com",
    "createdAt": "2026-09-28T10:00:00.000Z"
  }
}
```

### 2.2 User Login
- **Route:** `POST /api/users/login`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "shankar@example.com",
  "password": "SecurePassword123"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Login Successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "673f8e91a03e1b0021c3b12a",
    "name": "Shankar G",
    "email": "shankar@example.com"
  }
}
```

### 2.3 Get Current User Profile
- **Route:** `GET /api/users/profile`
- **Access:** Protected (Requires Bearer Token)
- **Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "_id": "673f8e91a03e1b0021c3b12a",
    "name": "Shankar G",
    "email": "shankar@example.com",
    "createdAt": "2026-09-28T10:00:00.000Z"
  }
}
```

---

## 3. Financial Transaction Endpoints (Milestones 03 & 06)

### 3.1 Get All Transactions (With Filtering)
- **Route:** `GET /api/expenses`
- **Query Parameters:**
  - `category` (string, optional): e.g. `Food`, `Housing`, `Travel`
  - `type` (string, optional): `expense` or `income`
  - `search` (string, optional): Keyword search matching title/description
  - `startDate` (ISO Date, optional): e.g. `2026-09-01`
  - `endDate` (ISO Date, optional): e.g. `2026-09-30`
  - `sort` (string, optional): `date_desc`, `date_asc`, `amount_desc`, `amount_asc`
- **Response (200 OK):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "673f9104a03e1b0021c3b135",
      "title": "Monthly Salary Credit",
      "amount": 75000,
      "category": "Salary",
      "type": "income",
      "date": "2026-09-01T00:00:00.000Z",
      "description": "Direct deposit",
      "createdAt": "2026-09-01T09:30:00.000Z"
    },
    {
      "_id": "673f9104a03e1b0021c3b136",
      "title": "Organic Groceries",
      "amount": 3450,
      "category": "Food",
      "type": "expense",
      "date": "2026-09-15T14:20:00.000Z",
      "description": "Regular supermarket supplies",
      "createdAt": "2026-09-15T14:20:00.000Z"
    }
  ]
}
```

### 3.2 Get Financial Analytics Summary
- **Route:** `GET /api/expenses/summary`
- **Access:** Public / Authenticated
- **Response (200 OK):**
```json
{
  "success": true,
  "summary": {
    "totalIncome": 75000,
    "totalExpense": 21850,
    "balance": 53150,
    "savingsRate": 70.9,
    "transactionCount": 14,
    "categoryBreakdown": {
      "Food": 6200,
      "Housing": 12000,
      "Travel": 2450,
      "Entertainment": 1200
    }
  }
}
```

### 3.3 Create New Transaction
- **Route:** `POST /api/expenses`
- **Request Body:**
```json
{
  "title": "Broadband Internet Bill",
  "amount": 1299,
  "category": "Utilities",
  "type": "expense",
  "date": "2026-09-28",
  "description": "High-speed fiber optic connection"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Expense Created Successfully",
  "data": {
    "_id": "673f9543a03e1b0021c3b140",
    "title": "Broadband Internet Bill",
    "amount": 1299,
    "category": "Utilities",
    "type": "expense",
    "date": "2026-09-28T00:00:00.000Z",
    "description": "High-speed fiber optic connection",
    "createdAt": "2026-09-28T10:15:30.000Z"
  }
}
```

### 3.4 Update Existing Transaction
- **Route:** `PUT /api/expenses/:id`
- **Request Body:** Partial or complete fields to update
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Expense Updated Successfully",
  "data": {
    "_id": "673f9543a03e1b0021c3b140",
    "title": "Broadband Internet Bill (500Mbps)",
    "amount": 1499,
    "category": "Utilities",
    "type": "expense"
  }
}
```

### 3.5 Delete Transaction
- **Route:** `DELETE /api/expenses/:id`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Expense Deleted Successfully",
  "data": {
    "id": "673f9543a03e1b0021c3b140"
  }
}
```

---

## 4. Diagnostics & System Health (Milestone 04)
- **Route:** `GET /api/health`
- **Response (200 OK):**
```json
{
  "status": "operational",
  "service": "Personal Expense Tracker API",
  "database": "Connected",
  "timestamp": "2026-09-28T10:20:00.000Z",
  "uptime": "142s"
}
```
