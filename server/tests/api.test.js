/**
 * Automated Unit & Integration Testing Suite (Week 10 Deliverable)
 * Uses Node.js native test runner (node:test) and strict assertions (node:assert/strict)
 * Validates:
 *   - Production Health & Diagnostics API (GET /api/health)
 *   - Authentication API (Register, Duplicate Check, Login, Protected Profile)
 *   - Expense Management CRUD API (Create, Read, Date Range Query, Summary, Update, Delete)
 */

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000';

// Helper function to make HTTP requests
async function makeRequest(path, options = {}) {
  const url = new URL(path, BASE_URL);
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const body = options.body ? JSON.stringify(options.body) : null;
  if (body) {
    headers['Content-Length'] = Buffer.byteLength(body);
  }

  return new Promise((resolve, reject) => {
    const req = http.request(url, {
      method: options.method || 'GET',
      headers,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = data ? JSON.parse(data) : {};
        } catch {
          json = { raw: data };
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

describe('Personal Expense Tracker - Automated Integration Test Suite', () => {
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  let authToken = null;
  let createdExpenseId = null;

  // -------------------------------------------------------------
  // Test 1: Production Health Check & Diagnostics
  // -------------------------------------------------------------
  test('GET /api/health - Returns 200 and production runtime diagnostics', async () => {
    const res = await makeRequest('/api/health');
    assert.equal(res.status, 200, 'Health endpoint should respond with status 200');
    assert.equal(res.data.status, 'operational', 'Status should be operational');
    assert.ok(res.data.timestamp, 'Response should contain timestamp');
    assert.ok(res.data.system, 'Response should contain system diagnostics');
    assert.ok(res.data.system.nodeVersion, 'Should report Node.js version');
    assert.ok(res.data.system.memoryUsageMB, 'Should report memory usage in MB');
  });

  // -------------------------------------------------------------
  // Test 2: User Authentication - Input Validation
  // -------------------------------------------------------------
  test('POST /api/users/register - Rejects registration with missing required fields', async () => {
    const res = await makeRequest('/api/users/register', {
      method: 'POST',
      body: { name: 'Incomplete User' }
    });
    assert.equal(res.status, 400, 'Should reject invalid payload with 400');
    assert.equal(res.data.success, false);
  });

  // -------------------------------------------------------------
  // Test 3: User Authentication - Successful Registration
  // -------------------------------------------------------------
  test('POST /api/users/register - Registers a new user and returns JWT token', async () => {
    const res = await makeRequest('/api/users/register', {
      method: 'POST',
      body: {
        name: 'Automated Test User',
        email: testEmail,
        password: testPassword
      }
    });
    assert.equal(res.status, 201, 'Registration should return 201 Created');
    assert.equal(res.data.success, true);
    assert.ok(res.data.token, 'Should return a valid JWT token');
    assert.equal(res.data.user.email, testEmail);
    authToken = res.data.token;
  });

  // -------------------------------------------------------------
  // Test 4: User Authentication - Duplicate Email Guard
  // -------------------------------------------------------------
  test('POST /api/users/register - Prevents duplicate user registrations', async () => {
    const res = await makeRequest('/api/users/register', {
      method: 'POST',
      body: {
        name: 'Duplicate User',
        email: testEmail,
        password: testPassword
      }
    });
    assert.equal(res.status, 400, 'Duplicate email should be rejected with 400');
    assert.equal(res.data.success, false);
  });

  // -------------------------------------------------------------
  // Test 5: User Authentication - Successful Login
  // -------------------------------------------------------------
  test('POST /api/users/login - Authenticates valid credentials and yields token', async () => {
    const res = await makeRequest('/api/users/login', {
      method: 'POST',
      body: {
        email: testEmail,
        password: testPassword
      }
    });
    assert.equal(res.status, 200, 'Login should return 200 OK');
    assert.equal(res.data.success, true);
    assert.ok(res.data.token, 'Should yield a fresh JWT token');
    authToken = res.data.token;
  });

  // -------------------------------------------------------------
  // Test 6: Protected Profile Access
  // -------------------------------------------------------------
  test('GET /api/users/profile - Returns authorized user profile with valid Bearer token', async () => {
    const res = await makeRequest('/api/users/profile', {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    assert.equal(res.status, 200, 'Profile endpoint should return 200');
    assert.equal(res.data.success, true);
    assert.equal(res.data.user.email, testEmail);
  });

  test('GET /api/users/profile - Rejects unauthorized requests without token', async () => {
    const res = await makeRequest('/api/users/profile');
    assert.equal(res.status, 401, 'Unauthorized request should return 401');
    assert.equal(res.data.success, false);
  });

  // -------------------------------------------------------------
  // Test 7: Expense CRUD - Validation Failure
  // -------------------------------------------------------------
  test('POST /api/expenses - Rejects invalid transaction payload without required fields', async () => {
    const res = await makeRequest('/api/expenses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: { amount: 100 }
    });
    assert.equal(res.status, 400, 'Should reject missing fields with 400');
    assert.equal(res.data.success, false);
  });

  // -------------------------------------------------------------
  // Test 8: Expense CRUD - Create Expense Transaction
  // -------------------------------------------------------------
  test('POST /api/expenses - Records new expense transaction successfully', async () => {
    const res = await makeRequest('/api/expenses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        title: 'Cloud Server Hosting',
        amount: 2500,
        category: 'Utilities',
        type: 'expense',
        description: 'Monthly AWS infrastructure server tier',
        date: new Date().toISOString()
      }
    });
    assert.equal(res.status, 201, 'Creation should return 201 Created');
    assert.equal(res.data.success, true);
    assert.ok(res.data.data._id, 'Should return created expense ID');
    createdExpenseId = res.data.data._id;
  });

  // -------------------------------------------------------------
  // Test 9: Expense CRUD - Create Income Transaction
  // -------------------------------------------------------------
  test('POST /api/expenses - Records new income transaction successfully', async () => {
    const res = await makeRequest('/api/expenses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        title: 'Consulting Retainer Fee',
        amount: 15000,
        category: 'Salary',
        type: 'income',
        description: 'Client software development payment',
        date: new Date().toISOString()
      }
    });
    assert.equal(res.status, 201, 'Creation should return 201 Created');
    assert.equal(res.data.success, true);
  });

  // -------------------------------------------------------------
  // Test 10: Financial Summary Calculation
  // -------------------------------------------------------------
  test('GET /api/expenses/summary - Computes correct financial analytics and balance', async () => {
    const res = await makeRequest('/api/expenses/summary', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.equal(res.status, 200, 'Summary should return 200');
    assert.equal(res.data.success, true);
    assert.ok(res.data.summary.totalIncome >= 15000, 'Income must match or exceed logged amounts');
    assert.ok(res.data.summary.totalExpense >= 2500, 'Expense must match or exceed logged amounts');
    assert.equal(
      res.data.summary.netBalance,
      res.data.summary.totalIncome - res.data.summary.totalExpense,
      'Net balance must exactly equal totalIncome - totalExpense'
    );
  });

  // -------------------------------------------------------------
  // Test 11: Date Range Querying (Week 9 Deliverable)
  // -------------------------------------------------------------
  test('GET /api/expenses?startDate=...&endDate=... - Filters transactions by date window', async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await makeRequest(`/api/expenses?startDate=${today}&endDate=${today}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.equal(res.status, 200, 'Date filter should return 200');
    assert.equal(res.data.success, true);
    assert.ok(Array.isArray(res.data.data), 'Data must be an array of transactions');
    assert.ok(res.data.data.length >= 2, 'Should include today’s created transactions');
  });

  // -------------------------------------------------------------
  // Test 12: Expense CRUD - Update Transaction
  // -------------------------------------------------------------
  test('PUT /api/expenses/:id - Updates existing transaction amount and metadata', async () => {
    assert.ok(createdExpenseId, 'Created expense ID must exist');
    const res = await makeRequest(`/api/expenses/${createdExpenseId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        title: 'Cloud Server Hosting (Tier 2 Upgrade)',
        amount: 3200,
        category: 'Utilities'
      }
    });
    assert.equal(res.status, 200, 'Update should return 200');
    assert.equal(res.data.success, true);
    assert.equal(res.data.data.amount, 3200, 'Amount must be updated to 3200');
  });

  // -------------------------------------------------------------
  // Test 13: Expense CRUD - Delete Transaction
  // -------------------------------------------------------------
  test('DELETE /api/expenses/:id - Removes transaction from user record', async () => {
    assert.ok(createdExpenseId, 'Created expense ID must exist');
    const res = await makeRequest(`/api/expenses/${createdExpenseId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.equal(res.status, 200, 'Delete should return 200');
    assert.equal(res.data.success, true);
  });
});
