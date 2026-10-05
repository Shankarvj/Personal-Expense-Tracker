/**
 * Expense Tracker - Interactive Core Application
 * Full-Stack Financial Intelligence & Authorization Engine
 * Author: Shankar G
 */

// Application State
const state = {
  activeTab: 'trackerTab',
  backendConnected: false,
  apiBase: '/api',
  currentUser: null,
  jwtToken: localStorage.getItem('auth_token') || '',
  transactions: [],
  budgets: JSON.parse(localStorage.getItem('expense_tracker_budgets')) || {
    'Food': 8000,
    'Housing': 15000,
    'Travel': 3000,
    'Utilities': 3500,
    'Healthcare': 2500,
    'Entertainment': 3000,
    'Shopping': 4000,
    'Education': 5000
  },
  categoryColors: {
    'Food': '#10b981',
    'Housing': '#8b5cf6',
    'Travel': '#06b6d4',
    'Utilities': '#f59e0b',
    'Healthcare': '#ec4899',
    'Entertainment': '#3b82f6',
    'Shopping': '#14b8a6',
    'Education': '#a855f7',
    'Salary': '#22c55e',
    'Freelance': '#0ea5e9',
    'Investments': '#38bdf8',
    'Gift': '#e879f9',
    'Refund': '#34d399',
    'Other': '#64748b'
  }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  setupNavigation();
  updateCategoryOptions();
  setTodayDateInput();
  initCalculators();
  await checkBackendStatus();
  await initAuth();
  await loadTransactions();
  renderAnalyticsView();
  renderBudgetPlanner();
});

// Setup Main Navigation Tabs
function setupNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.getAttribute('data-tab');
      const pane = document.getElementById(targetId);
      if (pane) pane.classList.add('active');
      state.activeTab = targetId;

      if (targetId === 'trackerTab') {
        renderLedgerTable();
        renderCharts();
      } else if (targetId === 'analyticsTab') {
        renderAnalyticsView();
      } else if (targetId === 'budgetTab') {
        renderBudgetPlanner();
      } else if (targetId === 'toolsTab') {
        calculateEMI();
        calculateSIP();
        calculateEmergencyFund();
        calculateTax();
      }
    });
  });
}

// ========================================================
// AUTHENTICATION & SESSION MANAGEMENT
// ========================================================

// Initialize user session from localStorage and verify profile
async function initAuth() {
  const savedToken = localStorage.getItem('auth_token');
  const savedUser = localStorage.getItem('auth_user');

  if (savedToken) {
    state.jwtToken = savedToken;
    if (savedUser) {
      try {
        state.currentUser = JSON.parse(savedUser);
      } catch (e) {
        state.currentUser = null;
      }
    }

    // Verify token validity with backend if server is connected
    if (state.backendConnected) {
      try {
        const res = await fetch(`${state.apiBase}/users/profile`, {
          headers: {
            'Authorization': `Bearer ${state.jwtToken}`
          }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.user) {
            state.currentUser = json.user;
            localStorage.setItem('auth_user', JSON.stringify(json.user));
          }
        } else {
          // Token expired or invalid
          console.warn('JWT session expired or invalid. Resetting credentials.');
          state.jwtToken = '';
          state.currentUser = null;
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        }
      } catch (err) {
        console.warn('Could not verify profile with server:', err);
      }
    }
  } else {
    state.jwtToken = '';
    state.currentUser = null;
  }

  updateAuthUI();
}

// Update UI according to authentication state
function updateAuthUI() {
  const unauthBox = document.getElementById('unauthHeaderBox');
  const authBox = document.getElementById('authHeaderBox');
  const guestBanner = document.getElementById('guestNoticeBanner');
  const userAvatar = document.getElementById('userAvatar');
  const userNameDisplay = document.getElementById('userNameDisplay');
  const authBadge = document.getElementById('authBadge');
  const activeJwtTextarea = document.getElementById('activeJwtTextarea');

  if (state.currentUser && state.jwtToken) {
    // Authenticated state
    if (unauthBox) unauthBox.style.display = 'none';
    if (authBox) authBox.style.display = 'flex';
    if (guestBanner) guestBanner.style.display = 'none';

    const name = state.currentUser.name || 'User';
    const initials = name
      .split(' ')
      .map(part => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    if (userAvatar) userAvatar.innerText = initials || 'U';
    if (userNameDisplay) userNameDisplay.innerText = name;
    if (authBadge) {
      authBadge.innerText = 'Authenticated (JWT)';
      authBadge.style.color = '#34d399';
    }

    // Profile modal details
    const profileAvatar = document.getElementById('profileModalAvatar');
    const profileName = document.getElementById('profileModalUserName');
    const profileEmail = document.getElementById('profileModalUserEmail');
    const profileRole = document.getElementById('profileModalRole');

    if (profileAvatar) profileAvatar.innerText = initials || 'U';
    if (profileName) profileName.innerText = name;
    if (profileEmail) profileEmail.innerText = state.currentUser.email || '';
    if (profileRole) profileRole.innerText = 'Active Session (JWT Bearer Protected)';
    if (activeJwtTextarea) activeJwtTextarea.value = state.jwtToken;

  } else {
    // Unauthenticated state
    if (unauthBox) unauthBox.style.display = 'block';
    if (authBox) authBox.style.display = 'none';
    if (guestBanner) guestBanner.style.display = 'flex';
    if (activeJwtTextarea) activeJwtTextarea.value = 'No active JWT token. Please sign in or register to acquire a signed token.';
  }
}

// Open Auth Modal (Login / Register)
function openAuthModal(tab = 'login') {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  modal.classList.add('active');
  switchAuthTab(tab);
  hideAuthAlert();
}

// Close Auth Modal
function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.remove('active');
  hideAuthAlert();
}

// Switch between Login and Register tabs
function switchAuthTab(tab) {
  const loginBtn = document.getElementById('authTabLoginBtn');
  const regBtn = document.getElementById('authTabRegisterBtn');
  const loginContent = document.getElementById('tabLogin');
  const regContent = document.getElementById('tabRegister');
  const title = document.getElementById('authModalTitle');

  hideAuthAlert();

  if (tab === 'register') {
    if (loginBtn) loginBtn.classList.remove('active');
    if (regBtn) regBtn.classList.add('active');
    if (loginContent) loginContent.classList.remove('active');
    if (regContent) regContent.classList.add('active');
    if (title) title.innerText = 'Create New Account';
  } else {
    if (loginBtn) loginBtn.classList.add('active');
    if (regBtn) regBtn.classList.remove('active');
    if (loginContent) loginContent.classList.add('active');
    if (regContent) regContent.classList.remove('active');
    if (title) title.innerText = 'Sign In to Expense Tracker';
  }
}

// Toggle User Profile Modal
function toggleUserProfileModal() {
  const modal = document.getElementById('userProfileModal');
  if (modal) modal.classList.toggle('active');
}

// Show alert banner inside auth modal
function showAuthAlert(msg, type = 'error') {
  const box = document.getElementById('authAlertBox');
  if (!box) return;
  box.className = `auth-alert-box ${type}`;
  box.innerText = msg;
}

// Hide alert banner inside auth modal
function hideAuthAlert() {
  const box = document.getElementById('authAlertBox');
  if (!box) return;
  box.className = 'auth-alert-box';
  box.innerText = '';
}

// Handle User Login
async function handleLogin(event) {
  event.preventDefault();
  hideAuthAlert();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const submitBtn = document.getElementById('loginSubmitBtn');

  if (!email || !password) {
    showAuthAlert('Please enter both your email address and password.', 'error');
    return;
  }

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = 'Authenticating...';
    }

    const res = await fetch(`${state.apiBase}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Invalid email or password credentials');
    }

    // Save token and user details
    state.jwtToken = data.token;
    state.currentUser = data.user;
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));

    updateAuthUI();
    closeAuthModal();
    showToast(`Welcome back, ${data.user.name}!`, 'success');

    // Load user's transactions
    await loadTransactions();
  } catch (error) {
    showAuthAlert(error.message, 'error');
    showToast(error.message, 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerText = 'Sign In';
    }
  }
}

// Handle User Registration
async function handleRegister(event) {
  event.preventDefault();
  hideAuthAlert();

  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirmPassword = document.getElementById('regConfirmPassword').value;
  const submitBtn = document.getElementById('registerSubmitBtn');

  if (!name || !email || !password || !confirmPassword) {
    showAuthAlert('Please fill in all required fields.', 'error');
    return;
  }

  if (password.length < 6) {
    showAuthAlert('Password must be at least 6 characters long.', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showAuthAlert('Passwords do not match. Please re-enter your password.', 'error');
    return;
  }

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = 'Creating Account...';
    }

    const res = await fetch(`${state.apiBase}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Registration failed. Please try again.');
    }

    // Save token and user details
    state.jwtToken = data.token;
    state.currentUser = data.user;
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));

    updateAuthUI();
    closeAuthModal();
    showToast(`Account created successfully! Welcome, ${data.user.name}`, 'success');

    // Load transactions
    await loadTransactions();
  } catch (error) {
    showAuthAlert(error.message, 'error');
    showToast(error.message, 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerText = 'Register Account';
    }
  }
}

// Handle User Logout
function logoutUser() {
  state.jwtToken = '';
  state.currentUser = null;
  state.transactions = [];

  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');

  // Close profile modal if open
  const profileModal = document.getElementById('userProfileModal');
  if (profileModal) profileModal.classList.remove('active');

  updateAuthUI();
  updateMetrics();
  renderLedgerTable();
  renderCharts();

  showToast('You have been signed out.', 'success');
  openAuthModal('login');
}

// Check Backend Connectivity
async function checkBackendStatus() {
  const statusPill = document.getElementById('backendStatusPill');
  const statusText = document.getElementById('backendStatusText');

  try {
    const res = await fetch(`${state.apiBase}/health`, { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      state.backendConnected = true;
      statusPill.style.background = 'rgba(16, 185, 129, 0.15)';
      statusPill.style.borderColor = 'rgba(16, 185, 129, 0.4)';
      statusPill.style.color = '#34d399';
      statusText.innerText = `API Online (${data.database})`;
    } else {
      throw new Error('Non-200 status');
    }
  } catch (err) {
    state.backendConnected = false;
    statusPill.style.background = 'rgba(6, 182, 212, 0.15)';
    statusPill.style.borderColor = 'rgba(6, 182, 212, 0.4)';
    statusPill.style.color = '#38bdf8';
    statusText.innerText = 'Offline Sandbox';
  }
}

// Load Transactions (Backend or Sandbox)
async function loadTransactions() {
  if (state.backendConnected) {
    if (state.jwtToken) {
      try {
        const res = await fetch(`${state.apiBase}/expenses`, {
          headers: {
            'Authorization': `Bearer ${state.jwtToken}`
          }
        });
        if (res.ok) {
          const json = await res.json();
          state.transactions = json.data || [];
        } else if (res.status === 401) {
          // Token expired or invalid
          console.warn('Session unauthorized. Logging out.');
          logoutUser();
          return;
        }
      } catch (e) {
        console.warn('Backend fetch failed:', e);
        state.transactions = [];
      }
    } else {
      // Unauthenticated state with connected backend
      state.transactions = [];
    }
  } else {
    // Offline local storage fallback
    const stored = localStorage.getItem('expense_tracker_txs');
    if (stored) {
      try {
        state.transactions = JSON.parse(stored);
      } catch (e) {
        state.transactions = [];
      }
    } else {
      state.transactions = [];
    }
  }

  updateMetrics();
  renderLedgerTable();
  renderCharts();
  renderAnalyticsView();
  renderBudgetPlanner();
  calculateEmergencyFund();
}

// Format Currency
function formatCurrency(num) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(num);
}

// Format Date Display
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Update KPI Metrics Cards
function updateMetrics() {
  let income = 0;
  let expense = 0;

  state.transactions.forEach(t => {
    const amt = Number(t.amount) || 0;
    if (t.type === 'income') {
      income += amt;
    } else {
      expense += amt;
    }
  });

  const balance = income - expense;
  const savingsRate = income > 0 ? (((income - expense) / income) * 100).toFixed(1) : 0;

  document.getElementById('netBalanceDisplay').innerText = formatCurrency(balance);
  document.getElementById('totalIncomeDisplay').innerText = formatCurrency(income);
  document.getElementById('totalExpenseDisplay').innerText = formatCurrency(expense);
  document.getElementById('savingsRateDisplay').innerText = `${savingsRate}%`;

  const progressBar = document.getElementById('savingsProgressBar');
  const clampedRate = Math.max(0, Math.min(100, savingsRate));
  progressBar.style.width = `${clampedRate}%`;

  const healthPill = document.getElementById('balanceHealthPill');
  if (balance >= 0) {
    healthPill.className = 'trend-pill positive';
    healthPill.innerText = 'Positive Cash Flow';
  } else {
    healthPill.className = 'trend-pill';
    healthPill.style.background = 'rgba(244, 63, 94, 0.15)';
    healthPill.style.color = '#fb7185';
    healthPill.innerText = 'Deficit Detected';
  }
}

// Render Ledger Table with Filtering
function renderLedgerTable() {
  const tbody = document.getElementById('transactionsTableBody');
  const emptyState = document.getElementById('emptyState');
  const search = document.getElementById('searchInput').value.toLowerCase().trim();
  const catFilter = document.getElementById('categoryFilter').value;
  const typeFilter = document.getElementById('typeFilter').value;
  const sort = document.getElementById('sortFilter').value;

  let filtered = state.transactions.filter(t => {
    const matchesSearch = !search || 
      (t.title && t.title.toLowerCase().includes(search)) || 
      (t.description && t.description.toLowerCase().includes(search)) ||
      (t.category && t.category.toLowerCase().includes(search));
    
    const matchesCat = catFilter === 'All' || (t.category && t.category.toLowerCase() === catFilter.toLowerCase());
    const matchesType = typeFilter === 'All' || t.type === typeFilter;

    return matchesSearch && matchesCat && matchesType;
  });

  // Sorting
  filtered.sort((a, b) => {
    if (sort === 'date_desc') return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt);
    if (sort === 'date_asc') return new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt);
    if (sort === 'amount_desc') return b.amount - a.amount;
    if (sort === 'amount_asc') return a.amount - b.amount;
    return 0;
  });

  document.getElementById('recordCounter').innerText = `${filtered.length} entries`;

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';
  tbody.innerHTML = filtered.map(item => {
    const isIncome = item.type === 'income';
    const typeLabel = isIncome ? 'Income' : 'Expense';
    const typeClass = isIncome ? 'income' : 'expense';
    const sign = isIncome ? '+' : '-';
    const color = state.categoryColors[item.category] || '#64748b';

    return `
      <tr>
        <td>
          <span class="badge-type ${typeClass}">
            <span>${isIncome ? '↓' : '↑'}</span>
            ${typeLabel}
          </span>
        </td>
        <td>
          <div class="tx-title-group">
            <span class="tx-title">${escapeHTML(item.title)}</span>
            <span class="tx-desc">${escapeHTML(item.description || 'No additional remarks')}</span>
          </div>
        </td>
        <td>
          <span class="category-tag">
            <span class="legend-color-dot" style="background: ${color}"></span>
            ${escapeHTML(item.category || 'General')}
          </span>
        </td>
        <td>
          <span class="subtext">${formatDate(item.date || item.createdAt)}</span>
        </td>
        <td class="text-right">
          <span class="tx-amount ${typeClass}">
            ${sign} ${formatCurrency(item.amount)}
          </span>
        </td>
        <td class="text-center">
          <div class="table-actions">
            <button class="action-btn" onclick="openEditModal('${item._id}')" title="Edit Entry">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="action-btn delete" onclick="deleteTransaction('${item._id}')" title="Delete Entry">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Search Filter Trigger
function handleSearchFilter() {
  renderLedgerTable();
}

// Render Visual Charts (Donut & Progress Bars)
function renderCharts() {
  renderDonutChart();
  renderCategoryBars();
}

// Category Donut Chart (Canvas)
function renderDonutChart() {
  const canvas = document.getElementById('categoryDonutChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const legend = document.getElementById('categoryLegend');

  const categoryTotals = {};
  let totalExpense = 0;

  state.transactions.filter(t => t.type === 'expense').forEach(t => {
    const cat = t.category || 'Other';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(t.amount);
    totalExpense += Number(t.amount);
  });

  const categories = Object.keys(categoryTotals);
  legend.innerHTML = '';

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (totalExpense === 0 || categories.length === 0) {
    ctx.font = '14px Plus Jakarta Sans';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText('No Expense Records', canvas.width / 2, canvas.height / 2);
    legend.innerHTML = '<span class="subtext">Add expenses to view breakdown</span>';
    return;
  }

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 100;
  const innerRadius = 65;

  let startAngle = -0.5 * Math.PI;

  categories.forEach(cat => {
    const val = categoryTotals[cat];
    const sliceAngle = (val / totalExpense) * 2 * Math.PI;
    const endAngle = startAngle + sliceAngle;
    const color = state.categoryColors[cat] || '#8b5cf6';

    // Draw Donut Slice
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    startAngle = endAngle;

    // Append to Legend
    const pct = ((val / totalExpense) * 100).toFixed(1);
    const itemEl = document.createElement('div');
    itemEl.className = 'legend-item';
    itemEl.innerHTML = `
      <span>
        <span class="legend-color-dot" style="background: ${color}"></span>
        <strong>${cat}</strong>
      </span>
      <span class="subtext">${pct}% (${formatCurrency(val)})</span>
    `;
    legend.appendChild(itemEl);
  });

  // Center Text in Donut
  ctx.font = 'bold 16px Plus Jakarta Sans';
  ctx.fillStyle = '#f8fafc';
  ctx.textAlign = 'center';
  ctx.fillText('Expenses', centerX, centerY - 6);
  ctx.font = '12px JetBrains Mono';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(formatCurrency(totalExpense), centerX, centerY + 14);
}

// Category Bar Comparison
function renderCategoryBars() {
  const container = document.getElementById('categoryBarContainer');
  if (!container) return;

  const categoryTotals = {};
  let maxVal = 0;

  state.transactions.filter(t => t.type === 'expense').forEach(t => {
    const cat = t.category || 'Other';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(t.amount);
    if (categoryTotals[cat] > maxVal) maxVal = categoryTotals[cat];
  });

  const categories = Object.keys(categoryTotals);
  if (categories.length === 0) {
    container.innerHTML = '<div class="subtext text-center">No expense data available</div>';
    return;
  }

  container.innerHTML = categories.slice(0, 5).map(cat => {
    const val = categoryTotals[cat];
    const widthPct = maxVal > 0 ? (val / maxVal) * 100 : 0;
    const color = state.categoryColors[cat] || '#10b981';

    return `
      <div class="category-bar-row">
        <div class="category-bar-info">
          <span>${cat}</span>
          <span class="subtext">${formatCurrency(val)}</span>
        </div>
        <div class="category-bar-track">
          <div class="category-bar-fill" style="width: ${widthPct}%; background: ${color}"></div>
        </div>
      </div>
    `;
  }).join('');
}

// Modal Handlers
function openTransactionModal() {
  document.getElementById('modalTitle').innerText = 'Create New Transaction';
  document.getElementById('transactionForm').reset();
  document.getElementById('txId').value = '';
  document.querySelector('input[name="txType"][value="expense"]').checked = true;
  updateCategoryOptions();
  setTodayDateInput();
  document.getElementById('transactionModalOverlay').classList.add('active');
}

function openEditModal(id) {
  const item = state.transactions.find(t => t._id === id);
  if (!item) return;

  document.getElementById('modalTitle').innerText = 'Edit Transaction';
  document.getElementById('txId').value = item._id;
  document.getElementById('txTitle').value = item.title;
  document.getElementById('txAmount').value = item.amount;

  const typeRadio = document.querySelector(`input[name="txType"][value="${item.type || 'expense'}"]`);
  if (typeRadio) typeRadio.checked = true;
  updateCategoryOptions();

  document.getElementById('txCategory').value = item.category;
  document.getElementById('txDate').value = (item.date || item.createdAt || '').split('T')[0];
  document.getElementById('txDescription').value = item.description || '';

  document.getElementById('transactionModalOverlay').classList.add('active');
}

function closeTransactionModal() {
  document.getElementById('transactionModalOverlay').classList.remove('active');
}

function setTodayDateInput() {
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('txDate');
  if (dateInput && !dateInput.value) dateInput.value = today;
}

function updateCategoryOptions() {
  const type = document.querySelector('input[name="txType"]:checked')?.value || 'expense';
  const categorySelect = document.getElementById('txCategory');
  if (!categorySelect) return;

  const expenseCategories = ['Food', 'Housing', 'Travel', 'Utilities', 'Healthcare', 'Entertainment', 'Shopping', 'Education', 'Other'];
  const incomeCategories = ['Salary', 'Freelance', 'Investments', 'Gift', 'Refund', 'Other'];

  const list = type === 'income' ? incomeCategories : expenseCategories;
  categorySelect.innerHTML = list.map(c => `<option value="${c}">${c}</option>`).join('');
}

// Handle Form Submission (Create or Update)
async function handleTransactionSubmit(event) {
  event.preventDefault();

  const id = document.getElementById('txId').value;
  const title = document.getElementById('txTitle').value.trim();
  const amount = parseFloat(document.getElementById('txAmount').value);
  const category = document.getElementById('txCategory').value;
  const type = document.querySelector('input[name="txType"]:checked').value;
  const date = document.getElementById('txDate').value;
  const description = document.getElementById('txDescription').value.trim();

  if (!title || isNaN(amount) || amount <= 0 || !category) {
    showToast('Please provide valid transaction details', 'error');
    return;
  }

  // If backend is connected but user is not signed in, prompt authentication
  if (state.backendConnected && !state.jwtToken) {
    showToast('Please sign in or register to record transactions to the database', 'error');
    openAuthModal('login');
    return;
  }

  const payload = { title, amount, category, type, date, description };

  if (state.backendConnected && state.jwtToken) {
    try {
      if (id) {
        // PUT update
        const res = await fetch(`${state.apiBase}/expenses/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.jwtToken}`
          },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Update failed');
        }
        showToast('Transaction updated successfully', 'success');
      } else {
        // POST create
        const res = await fetch(`${state.apiBase}/expenses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.jwtToken}`
          },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Create failed');
        }
        showToast('New entry recorded in database', 'success');
      }
      await loadTransactions();
      closeTransactionModal();
      return;
    } catch (e) {
      console.warn('API error:', e);
      showToast(e.message || 'Failed to save transaction', 'error');
      return;
    }
  }

  // Local fallback mutation (offline sandbox)
  if (id) {
    const idx = state.transactions.findIndex(t => t._id === id);
    if (idx !== -1) {
      state.transactions[idx] = { ...state.transactions[idx], ...payload };
      showToast('Transaction updated (Sandbox)', 'success');
    }
  } else {
    const newEntry = {
      _id: 'tx_local_' + Date.now(),
      ...payload,
      createdAt: new Date().toISOString()
    };
    state.transactions.unshift(newEntry);
    showToast('New transaction created (Sandbox)', 'success');
  }

  localStorage.setItem('expense_tracker_txs', JSON.stringify(state.transactions));
  updateMetrics();
  renderLedgerTable();
  renderCharts();
  closeTransactionModal();
}

// Delete Transaction
async function deleteTransaction(id) {
  if (!confirm('Are you sure you want to delete this record?')) return;

  if (state.backendConnected) {
    if (!state.jwtToken) {
      showToast('Please sign in to delete records from the database', 'error');
      openAuthModal('login');
      return;
    }

    try {
      const res = await fetch(`${state.apiBase}/expenses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${state.jwtToken}`
        }
      });
      if (res.ok) {
        showToast('Record deleted from database', 'success');
        await loadTransactions();
        return;
      } else {
        const errData = await res.json();
        throw new Error(errData.message || 'Delete failed');
      }
    } catch (e) {
      console.warn('Backend delete failed:', e);
      showToast(e.message || 'Failed to delete transaction', 'error');
      return;
    }
  }

  state.transactions = state.transactions.filter(t => t._id !== id);
  localStorage.setItem('expense_tracker_txs', JSON.stringify(state.transactions));
  updateMetrics();
  renderLedgerTable();
  renderCharts();
  showToast('Record deleted from ledger', 'success');
}

// Export CSV Functionality
function exportTransactionsCSV() {
  const headers = ['Title', 'Amount', 'Category', 'Type', 'Date', 'Description'];
  const rows = state.transactions.map(t => [
    `"${(t.title || '').replace(/"/g, '""')}"`,
    t.amount,
    `"${t.category || ''}"`,
    t.type || 'expense',
    t.date || t.createdAt,
    `"${(t.description || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `expense_tracker_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('CSV Exported successfully', 'success');
}

// ========================================================
// PRINT & STATEMENT EXPORT ENGINE
// ========================================================
function printFinancialStatement() {
  window.print();
}

// ========================================================
// TAB 2: FINANCIAL ANALYTICS & CASH FLOW ENGINE
// ========================================================
function renderAnalyticsView() {
  const expenses = state.transactions.filter(t => t.type === 'expense');
  const incomes = state.transactions.filter(t => t.type === 'income');

  const totalExpense = expenses.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalIncome = incomes.reduce((sum, t) => sum + Number(t.amount || 0), 0);

  // 1. Daily Outflow Velocity & Burn Rate
  const uniqueDates = new Set(expenses.map(t => (t.date || t.createdAt || '').substring(0, 10)));
  const activeDays = Math.max(1, uniqueDates.size);
  const dailyBurn = totalExpense / activeDays;
  const daysInCurrentMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const projectedSpend = dailyBurn * daysInCurrentMonth;

  const dailyBurnEl = document.getElementById('dailyBurnDisplay');
  const burnSubtextEl = document.getElementById('burnRateSubtext');
  const projectedEl = document.getElementById('projectedSpendDisplay');

  if (dailyBurnEl) dailyBurnEl.innerText = `${formatCurrency(dailyBurn)} / day`;
  if (burnSubtextEl) burnSubtextEl.innerText = `Calculated across ${activeDays} active recorded days`;
  if (projectedEl) projectedEl.innerText = formatCurrency(projectedSpend);

  // 2. Top Expense Category
  const catTotals = {};
  expenses.forEach(t => {
    const cat = t.category || 'Other';
    catTotals[cat] = (catTotals[cat] || 0) + Number(t.amount || 0);
  });

  let topCat = 'None';
  let topCatAmt = 0;
  for (const [cat, amt] of Object.entries(catTotals)) {
    if (amt > topCatAmt) {
      topCatAmt = amt;
      topCat = cat;
    }
  }

  const topExpenseEl = document.getElementById('topExpenseDisplay');
  const topExpenseSubtextEl = document.getElementById('topExpenseSubtext');
  if (topExpenseEl) topExpenseEl.innerText = topCat;
  if (topExpenseSubtextEl) {
    const pct = totalExpense > 0 ? ((topCatAmt / totalExpense) * 100).toFixed(1) : 0;
    topExpenseSubtextEl.innerText = `${pct}% of total spending (${formatCurrency(topCatAmt)})`;
  }

  // 3. Render Trend Charts & Rules
  renderMonthlyTrendChart();
  render50_30_20Rule(totalIncome, expenses);
  renderFinancialInsights(totalIncome, totalExpense, topCat, topCatAmt);
}

// Monthly Inflow vs Outflow Historical Canvas Renderer
function renderMonthlyTrendChart() {
  const canvas = document.getElementById('monthlyTrendChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Handle high-DPI
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || 800;
  const height = 260;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, width, height);

  // Group by Month (Last 6 Months)
  const monthMap = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Seed past 6 months
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
    monthMap[key] = { label, income: 0, expense: 0 };
  }

  state.transactions.forEach(t => {
    const dt = new Date(t.date || t.createdAt);
    if (!isNaN(dt.getTime())) {
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      if (monthMap[key]) {
        if (t.type === 'income') monthMap[key].income += Number(t.amount || 0);
        else monthMap[key].expense += Number(t.amount || 0);
      }
    }
  });

  const monthKeys = Object.keys(monthMap);
  const maxVal = Math.max(
    ...monthKeys.map(k => Math.max(monthMap[k].income, monthMap[k].expense)),
    10000
  );

  const paddingLeft = 60;
  const paddingRight = 30;
  const paddingTop = 20;
  const paddingBottom = 40;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Grid Lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1;
  ctx.font = '10px JetBrains Mono, monospace';
  ctx.fillStyle = '#64748b';
  ctx.textAlign = 'right';

  const gridSteps = 4;
  for (let i = 0; i <= gridSteps; i++) {
    const y = paddingTop + (chartHeight / gridSteps) * i;
    const val = maxVal - (maxVal / gridSteps) * i;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, y);
    ctx.lineTo(width - paddingRight, y);
    ctx.stroke();
    ctx.fillText(`₹${Math.round(val / 1000)}k`, paddingLeft - 8, y + 3);
  }

  // Draw Bars
  const groupWidth = chartWidth / monthKeys.length;
  const barWidth = Math.min(28, (groupWidth - 24) / 2);

  monthKeys.forEach((k, idx) => {
    const data = monthMap[k];
    const groupX = paddingLeft + idx * groupWidth + groupWidth / 2;

    const incomeHeight = (data.income / maxVal) * chartHeight;
    const expenseHeight = (data.expense / maxVal) * chartHeight;

    const incomeX = groupX - barWidth - 3;
    const expenseX = groupX + 3;

    // Income Bar (Emerald Gradient)
    if (incomeHeight > 0) {
      const gradInc = ctx.createLinearGradient(0, paddingTop + chartHeight - incomeHeight, 0, paddingTop + chartHeight);
      gradInc.addColorStop(0, '#34d399');
      gradInc.addColorStop(1, '#059669');
      ctx.fillStyle = gradInc;
      ctx.beginPath();
      ctx.roundRect(incomeX, paddingTop + chartHeight - incomeHeight, barWidth, incomeHeight, [4, 4, 0, 0]);
      ctx.fill();
    }

    // Expense Bar (Rose Gradient)
    if (expenseHeight > 0) {
      const gradExp = ctx.createLinearGradient(0, paddingTop + chartHeight - expenseHeight, 0, paddingTop + chartHeight);
      gradExp.addColorStop(0, '#fb7185');
      gradExp.addColorStop(1, '#e11d48');
      ctx.fillStyle = gradExp;
      ctx.beginPath();
      ctx.roundRect(expenseX, paddingTop + chartHeight - expenseHeight, barWidth, expenseHeight, [4, 4, 0, 0]);
      ctx.fill();
    }

    // Month Label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(data.label, groupX, height - 12);
  });
}

// 50/30/20 Financial Budget Rule Analysis
function render50_30_20Rule(totalIncome, expenses) {
  const needsCategories = ['Food', 'Housing', 'Utilities', 'Healthcare', 'Education'];
  const wantsCategories = ['Entertainment', 'Shopping', 'Travel', 'Other'];

  let needsTotal = 0;
  let wantsTotal = 0;

  expenses.forEach(t => {
    const cat = t.category || 'Other';
    if (needsCategories.includes(cat)) {
      needsTotal += Number(t.amount || 0);
    } else {
      wantsTotal += Number(t.amount || 0);
    }
  });

  const baseDenominator = totalIncome > 0 ? totalIncome : (needsTotal + wantsTotal || 1);
  const savingsAmount = Math.max(0, totalIncome - (needsTotal + wantsTotal));

  const needsPct = Math.min(100, Math.round((needsTotal / baseDenominator) * 100));
  const wantsPct = Math.min(100, Math.round((wantsTotal / baseDenominator) * 100));
  const savingsPct = totalIncome > 0 ? Math.min(100, Math.round((savingsAmount / totalIncome) * 100)) : 0;

  const ruleNeedsPctEl = document.getElementById('ruleNeedsPct');
  const ruleNeedsBarEl = document.getElementById('ruleNeedsBar');
  const ruleWantsPctEl = document.getElementById('ruleWantsPct');
  const ruleWantsBarEl = document.getElementById('ruleWantsBar');
  const ruleSavingsPctEl = document.getElementById('ruleSavingsPct');
  const ruleSavingsBarEl = document.getElementById('ruleSavingsBar');

  if (ruleNeedsPctEl) ruleNeedsPctEl.innerText = `${needsPct}% (${formatCurrency(needsTotal)})`;
  if (ruleNeedsBarEl) {
    ruleNeedsBarEl.style.width = `${needsPct}%`;
    ruleNeedsBarEl.style.background = needsPct > 50 ? '#fb7185' : '#38bdf8';
  }

  if (ruleWantsPctEl) ruleWantsPctEl.innerText = `${wantsPct}% (${formatCurrency(wantsTotal)})`;
  if (ruleWantsBarEl) {
    ruleWantsBarEl.style.width = `${wantsPct}%`;
    ruleWantsBarEl.style.background = wantsPct > 30 ? '#fb7185' : '#f59e0b';
  }

  if (ruleSavingsPctEl) ruleSavingsPctEl.innerText = `${savingsPct}% (${formatCurrency(savingsAmount)})`;
  if (ruleSavingsBarEl) {
    ruleSavingsBarEl.style.width = `${savingsPct}%`;
    ruleSavingsBarEl.style.background = savingsPct >= 20 ? '#10b981' : '#f59e0b';
  }
}

// AI & Smart Financial Diagnostics Generator
function renderFinancialInsights(totalIncome, totalExpense, topCat, topCatAmt) {
  const container = document.getElementById('financialInsightsContainer');
  if (!container) return;

  const insights = [];
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // 1. Savings Rate Assessment
  if (totalIncome === 0 && totalExpense === 0) {
    insights.push({
      type: 'warning',
      icon: '💡',
      title: 'Ready for Transaction Intake',
      desc: 'Record your monthly salary income and living expenses to generate tailored cash flow diagnostics.'
    });
  } else if (netSavings < 0) {
    insights.push({
      type: 'danger',
      icon: '🚨',
      title: 'Deficit Warning: Outflow Exceeds Inflow',
      desc: `You are running a net monthly deficit of ${formatCurrency(Math.abs(netSavings))}. Prioritize trimming non-essential discretionary expenses.`
    });
  } else if (savingsRate >= 30) {
    insights.push({
      type: 'positive',
      icon: '💎',
      title: 'Exceptional Capital Accumulation',
      desc: `Outstanding savings rate of ${savingsRate.toFixed(1)}%! Consider deploying this surplus into systematic wealth generation instruments (SIPs/Index Funds).`
    });
  } else if (savingsRate >= 20) {
    insights.push({
      type: 'positive',
      icon: '✅',
      title: 'Optimal 50/30/20 Savings Compliance',
      desc: `Your savings rate is healthy at ${savingsRate.toFixed(1)}%. You are meeting the baseline target for financial stability.`
    });
  } else {
    insights.push({
      type: 'warning',
      icon: '⚠️',
      title: 'Sub-Optimal Savings Rate',
      desc: `Your savings rate of ${savingsRate.toFixed(1)}% is below the recommended 20% benchmark. Review high-expenditure categories.`
    });
  }

  // 2. Category Concentration Check
  if (totalExpense > 0 && topCat !== 'None') {
    const topPct = (topCatAmt / totalExpense) * 100;
    if (topPct >= 40) {
      insights.push({
        type: 'warning',
        icon: '📊',
        title: `Heavy Concentration in ${topCat}`,
        desc: `${topCat} accounts for ${topPct.toFixed(1)}% (${formatCurrency(topCatAmt)}) of your total spending. Setting a category budget limit is recommended.`
      });
    }
  }

  // 3. Liquidity Cushion Advice
  insights.push({
    type: 'positive',
    icon: '🛡️',
    title: 'Emergency Cushion Target',
    desc: `Maintain a 3 to 6-month buffer (${formatCurrency(totalExpense * 3)} - ${formatCurrency(totalExpense * 6)}) in liquid reserves before committing to long-term locks.`
  });

  container.innerHTML = insights.map(i => `
    <div class="insight-card ${i.type}">
      <div class="insight-icon">${i.icon}</div>
      <div>
        <div class="insight-title">${i.title}</div>
        <div class="insight-desc">${i.desc}</div>
      </div>
    </div>
  `).join('');
}

// ========================================================
// TAB 3: CATEGORY BUDGET PLANNER ENGINE
// ========================================================
function renderBudgetPlanner() {
  const grid = document.getElementById('budgetCategoryCardsGrid');
  if (!grid) return;

  const expenses = state.transactions.filter(t => t.type === 'expense');
  const catSpent = {};
  expenses.forEach(t => {
    const cat = t.category || 'Other';
    catSpent[cat] = (catSpent[cat] || 0) + Number(t.amount || 0);
  });

  let totalBudget = 0;
  let totalSpentInBudgets = 0;

  const categories = Object.keys(state.budgets);

  grid.innerHTML = categories.map(cat => {
    const budgetCap = Number(state.budgets[cat]) || 0;
    const spent = Number(catSpent[cat]) || 0;
    totalBudget += budgetCap;
    totalSpentInBudgets += spent;

    const usagePct = budgetCap > 0 ? (spent / budgetCap) * 100 : (spent > 0 ? 100 : 0);
    const clampedPct = Math.min(100, usagePct);
    const remaining = Math.max(0, budgetCap - spent);

    let statusClass = 'safe';
    let statusText = 'On Track';
    let barColor = '#10b981';

    if (usagePct > 100) {
      statusClass = 'danger';
      statusText = `Over by ${formatCurrency(spent - budgetCap)}`;
      barColor = '#f43f5e';
    } else if (usagePct >= 80) {
      statusClass = 'warning';
      statusText = 'Approaching Limit';
      barColor = '#f59e0b';
    }

    const catColor = state.categoryColors[cat] || '#38bdf8';

    return `
      <div class="budget-card">
        <div class="budget-card-header">
          <div class="budget-card-title">
            <span class="legend-color-dot" style="background: ${catColor}; width: 12px; height: 12px; border-radius: 50%; display: inline-block;"></span>
            <span>${escapeHTML(cat)}</span>
          </div>
          <span class="budget-status-pill ${statusClass}">${statusText}</span>
        </div>

        <div class="budget-amounts">
          <div>
            <div class="budget-spent-val">${formatCurrency(spent)}</div>
            <div class="budget-cap-val">of ${formatCurrency(budgetCap)} cap</div>
          </div>
          <strong style="font-size: 0.95rem; font-family: 'JetBrains Mono', monospace; color: ${barColor}">${usagePct.toFixed(0)}%</strong>
        </div>

        <div class="budget-progress-bg">
          <div class="budget-progress-bar" style="width: ${clampedPct}%; background: ${barColor};"></div>
        </div>

        <div class="budget-footer-info">
          <span>Remaining: <strong>${formatCurrency(remaining)}</strong></span>
          <span>Target Cap: ${formatCurrency(budgetCap)}</span>
        </div>
      </div>
    `;
  }).join('');

  // Update Summary Metrics
  const totalBudgetEl = document.getElementById('totalBudgetDisplay');
  const budgetSpentEl = document.getElementById('budgetSpentDisplay');
  const budgetUsagePctEl = document.getElementById('budgetUsagePctDisplay');
  const budgetRemainingEl = document.getElementById('budgetRemainingDisplay');
  const budgetHealthBadge = document.getElementById('budgetHealthBadge');

  if (totalBudgetEl) totalBudgetEl.innerText = formatCurrency(totalBudget);
  if (budgetSpentEl) budgetSpentEl.innerText = formatCurrency(totalSpentInBudgets);
  
  const overallUsagePct = totalBudget > 0 ? ((totalSpentInBudgets / totalBudget) * 100).toFixed(1) : 0;
  if (budgetUsagePctEl) budgetUsagePctEl.innerText = `${overallUsagePct}% of aggregate limits consumed`;

  const remainingSafe = Math.max(0, totalBudget - totalSpentInBudgets);
  if (budgetRemainingEl) budgetRemainingEl.innerText = formatCurrency(remainingSafe);

  if (budgetHealthBadge) {
    if (totalSpentInBudgets > totalBudget) {
      budgetHealthBadge.className = 'trend-pill';
      budgetHealthBadge.style.background = 'rgba(244, 63, 94, 0.15)';
      budgetHealthBadge.style.color = '#fb7185';
      budgetHealthBadge.innerText = 'Budget Exceeded';
    } else {
      budgetHealthBadge.className = 'trend-pill positive';
      budgetHealthBadge.style.background = 'rgba(16, 185, 129, 0.15)';
      budgetHealthBadge.style.color = '#34d399';
      budgetHealthBadge.innerText = 'Within Safe Bounds';
    }
  }
}

// Open Budget Target Configuration Modal
function openBudgetConfigModal() {
  const modal = document.getElementById('budgetConfigModal');
  const container = document.getElementById('budgetInputsContainer');
  if (!modal || !container) return;

  const defaultCategories = ['Food', 'Housing', 'Travel', 'Utilities', 'Healthcare', 'Entertainment', 'Shopping', 'Education'];

  container.innerHTML = defaultCategories.map(cat => {
    const currentVal = state.budgets[cat] || 0;
    const color = state.categoryColors[cat] || '#38bdf8';
    return `
      <div class="budget-config-item">
        <label class="budget-config-label">
          <span style="width: 10px; height: 10px; border-radius: 50%; background: ${color}; display: inline-block;"></span>
          ${cat}
        </label>
        <input type="number" name="budget_${cat}" class="form-input budget-config-input" value="${currentVal}" min="0" step="500" required>
      </div>
    `;
  }).join('');

  modal.classList.add('active');
}

// Close Budget Modal
function closeBudgetConfigModal() {
  const modal = document.getElementById('budgetConfigModal');
  if (modal) modal.classList.remove('active');
}

// Handle Saving Budget Caps
function handleSaveBudgetConfig(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  const updatedBudgets = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('budget_')) {
      const cat = key.replace('budget_', '');
      updatedBudgets[cat] = Math.max(0, Number(value) || 0);
    }
  }

  state.budgets = updatedBudgets;
  localStorage.setItem('expense_tracker_budgets', JSON.stringify(state.budgets));
  renderBudgetPlanner();
  closeBudgetConfigModal();
  showToast('Category budget limits saved successfully', 'success');
}

// ========================================================
// TAB 4: FINANCIAL COMPUTATION & WEALTH CALCULATORS
// ========================================================
function initCalculators() {
  calculateEMI();
  calculateSIP();
  calculateEmergencyFund();
  calculateTax();
}

// 1. Loan EMI Calculator
function calculateEMI() {
  const pInput = document.getElementById('emiPrincipal');
  const rInput = document.getElementById('emiRate');
  const tInput = document.getElementById('emiTenure');

  if (!pInput || !rInput || !tInput) return;

  const principal = parseFloat(pInput.value) || 0;
  const annualRate = parseFloat(rInput.value) || 0;
  const years = parseFloat(tInput.value) || 0;

  if (principal <= 0 || annualRate <= 0 || years <= 0) {
    document.getElementById('emiResultMonthly').innerText = '₹0';
    document.getElementById('emiResultInterest').innerText = '₹0';
    document.getElementById('emiResultTotal').innerText = '₹0';
    return;
  }

  const monthlyRate = annualRate / (12 * 100);
  const totalMonths = years * 12;

  // EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
  const totalPayment = emi * totalMonths;
  const totalInterest = totalPayment - principal;

  document.getElementById('emiResultMonthly').innerText = formatCurrency(Math.round(emi));
  document.getElementById('emiResultInterest').innerText = formatCurrency(Math.round(totalInterest));
  document.getElementById('emiResultTotal').innerText = formatCurrency(Math.round(totalPayment));
}

// 2. SIP & Wealth Projector
function calculateSIP() {
  const pInput = document.getElementById('sipAmount');
  const rInput = document.getElementById('sipRate');
  const yInput = document.getElementById('sipYears');

  if (!pInput || !rInput || !yInput) return;

  const monthlyInvestment = parseFloat(pInput.value) || 0;
  const annualRate = parseFloat(rInput.value) || 0;
  const years = parseFloat(yInput.value) || 0;

  if (monthlyInvestment <= 0 || annualRate <= 0 || years <= 0) {
    document.getElementById('sipResultInvested').innerText = '₹0';
    document.getElementById('sipResultGains').innerText = '₹0';
    document.getElementById('sipResultTotal').innerText = '₹0';
    return;
  }

  const i = annualRate / (12 * 100);
  const n = years * 12;

  // SIP formula: P * ((1 + i)^n - 1) / i * (1 + i)
  const futureValue = monthlyInvestment * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  const totalInvested = monthlyInvestment * n;
  const wealthGained = futureValue - totalInvested;

  document.getElementById('sipResultInvested').innerText = formatCurrency(Math.round(totalInvested));
  document.getElementById('sipResultGains').innerText = `+ ${formatCurrency(Math.round(wealthGained))}`;
  document.getElementById('sipResultTotal').innerText = formatCurrency(Math.round(futureValue));
}

// 3. Emergency Fund Readiness
function calculateEmergencyFund() {
  const expenses = state.transactions.filter(t => t.type === 'expense');
  const incomes = state.transactions.filter(t => t.type === 'income');

  const totalExpense = expenses.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalIncome = incomes.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const currentBalance = totalIncome - totalExpense;

  const uniqueMonths = new Set(expenses.map(t => (t.date || t.createdAt || '').substring(0, 7)));
  const monthCount = Math.max(1, uniqueMonths.size);
  const avgMonthlyBurn = totalExpense / monthCount || 30000;

  const target3Mo = avgMonthlyBurn * 3;
  const target6Mo = avgMonthlyBurn * 6;

  const burnEl = document.getElementById('efMonthlyBurn');
  const target3El = document.getElementById('ef3Months');
  const target6El = document.getElementById('ef6Months');
  const balanceEl = document.getElementById('efCurrentBalance');
  const coveragePctEl = document.getElementById('efCoveragePct');
  const progressBar = document.getElementById('efProgressBar');
  const adviceEl = document.getElementById('efStatusAdvice');

  if (burnEl) burnEl.innerText = formatCurrency(avgMonthlyBurn);
  if (target3El) target3El.innerText = formatCurrency(target3Mo);
  if (target6El) target6El.innerText = formatCurrency(target6Mo);
  if (balanceEl) balanceEl.innerText = formatCurrency(currentBalance);

  const coveragePct = target6Mo > 0 ? Math.min(100, Math.max(0, Math.round((currentBalance / target6Mo) * 100))) : 0;
  if (coveragePctEl) coveragePctEl.innerText = `${coveragePct}%`;
  if (progressBar) {
    progressBar.style.width = `${coveragePct}%`;
    progressBar.style.background = coveragePct >= 100 ? '#10b981' : (coveragePct >= 50 ? '#38bdf8' : '#f59e0b');
  }

  if (adviceEl) {
    if (currentBalance >= target6Mo) {
      adviceEl.innerHTML = '🛡️ <strong>Optimal Fortress Cushion:</strong> You have full 6+ months of living coverage in reserve!';
    } else if (currentBalance >= target3Mo) {
      adviceEl.innerHTML = '⚡ <strong>Moderate Runway:</strong> You have 3+ months covered. Aim to expand to 6 months.';
    } else {
      adviceEl.innerHTML = '⚠️ <strong>Build Cushion:</strong> Prioritize saving to reach minimum 3-month safety reserves.';
    }
  }
}

// 4. Fast Income Tax Estimator (FY 2024-25 New Regime)
function calculateTax() {
  const grossInput = document.getElementById('taxGrossIncome');
  if (!grossInput) return;

  const grossIncome = parseFloat(grossInput.value) || 0;
  const standardDeduction = 75000;
  const taxableIncome = Math.max(0, grossIncome - standardDeduction);

  let tax = 0;

  if (taxableIncome <= 300000) {
    tax = 0;
  } else if (taxableIncome <= 700000) {
    // 3L - 7L @ 5% (Eligible for 87A rebate if total income <= 7L)
    tax = (taxableIncome - 300000) * 0.05;
    if (taxableIncome <= 700000) tax = 0; // Section 87A rebate
  } else {
    // Bracket calculations for > 7L
    tax += (700000 - 300000) * 0.05; // 20,000
    if (taxableIncome <= 1000000) {
      tax += (taxableIncome - 700000) * 0.10;
    } else {
      tax += (1000000 - 700000) * 0.10; // 30,000
      if (taxableIncome <= 1200000) {
        tax += (taxableIncome - 1000000) * 0.15;
      } else {
        tax += (1200000 - 1000000) * 0.15; // 30,000
        if (taxableIncome <= 1500000) {
          tax += (taxableIncome - 1200000) * 0.20;
        } else {
          tax += (1500000 - 1200000) * 0.20; // 60,000
          tax += (taxableIncome - 1500000) * 0.30;
        }
      }
    }
  }

  // 4% Health & Education Cess
  const cess = tax * 0.04;
  const totalTax = tax + cess;
  const effectiveRate = grossIncome > 0 ? ((totalTax / grossIncome) * 100).toFixed(1) : 0;

  document.getElementById('taxableIncomeResult').innerText = formatCurrency(taxableIncome);
  document.getElementById('taxPayableResult').innerText = formatCurrency(Math.round(totalTax));
  document.getElementById('taxEffectiveRate').innerText = `${effectiveRate}%`;
}

function copyJwtToClipboard() {
  navigator.clipboard.writeText(state.jwtToken);
  showToast('Bearer token copied to clipboard', 'success');
}


// Toast Notifications
function showToast(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerText = msg;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Helper: Escape HTML
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}
