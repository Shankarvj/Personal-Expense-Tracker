/**
 * Expense Tracker - Interactive Core Application
 * Full-Stack Financial Intelligence & Authorization Engine
 * Author: Shankar G
 */

// Multi-Currency Converter Exchange Rates (Week 9 Deliverable)
const currencyRates = {
  'INR': { symbol: '₹', rate: 1.0, locale: 'en-IN', name: 'Indian Rupee' },
  'USD': { symbol: '$', rate: 0.012, locale: 'en-US', name: 'US Dollar' },
  'EUR': { symbol: '€', rate: 0.011, locale: 'de-DE', name: 'Euro' },
  'GBP': { symbol: '£', rate: 0.0095, locale: 'en-GB', name: 'British Pound' },
  'AED': { symbol: 'AED', rate: 0.044, locale: 'ar-AE', name: 'UAE Dirham' },
  'JPY': { symbol: '¥', rate: 1.82, locale: 'ja-JP', name: 'Japanese Yen' }
};

// Seeded Pre-Loaded Demo Transactions (Database-Free Standalone Engine)
const DEFAULT_DEMO_TRANSACTIONS = [
  { _id: 'demo_tx_1', title: 'Monthly Software Salary', amount: 65000, category: 'Salary', type: 'income', date: new Date().toISOString(), description: 'Direct monthly salary credit' },
  { _id: 'demo_tx_2', title: 'Freelance Design Retainer', amount: 18500, category: 'Freelance', type: 'income', date: new Date(Date.now() - 86400000 * 2).toISOString(), description: 'UI/UX consultation project payout' },
  { _id: 'demo_tx_3', title: 'Apartment Rent & Maintenance', amount: 15000, category: 'Housing', type: 'expense', date: new Date(Date.now() - 86400000 * 3).toISOString(), description: 'Monthly residential apartment lease' },
  { _id: 'demo_tx_4', title: 'Supermarket Groceries & Pantry', amount: 4850, category: 'Food', type: 'expense', date: new Date(Date.now() - 86400000 * 4).toISOString(), description: 'Weekly groceries and kitchen supplies' },
  { _id: 'demo_tx_5', title: 'AWS Cloud Infrastructure', amount: 2450, category: 'Utilities', type: 'expense', date: new Date(Date.now() - 86400000 * 6).toISOString(), description: 'EC2 servers & cloud database hosting' },
  { _id: 'demo_tx_6', title: 'Fuel & Metro Travel Pass', amount: 1800, category: 'Travel', type: 'expense', date: new Date(Date.now() - 86400000 * 8).toISOString(), description: 'Daily commute and transit recharge' },
  { _id: 'demo_tx_7', title: 'Weekend Dining & Bistro', amount: 2200, category: 'Entertainment', type: 'expense', date: new Date(Date.now() - 86400000 * 10).toISOString(), description: 'Family dinner and coffee' },
  { _id: 'demo_tx_8', title: 'Gym & Crossfit Membership', amount: 2000, category: 'Healthcare', type: 'expense', date: new Date(Date.now() - 86400000 * 12).toISOString(), description: 'Monthly fitness center pass' }
];

// Application State
const state = {
  activeTab: 'trackerTab',
  backendConnected: false,
  isDemoMode: localStorage.getItem('expense_tracker_is_demo') === 'true',
  isAuthSubmitting: false,
  pendingTransaction: null,
  apiBase: (typeof window !== 'undefined' && (window.location.protocol === 'file:' || (window.location.port && window.location.port !== '5000')))
    ? 'http://localhost:5000/api'
    : '/api',
  currentUser: null,
  jwtToken: localStorage.getItem('auth_token') || '',
  currentCurrency: localStorage.getItem('expense_tracker_currency') || 'INR',
  currentTheme: localStorage.getItem('expense_tracker_theme') || 'theme-dark',
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
  subscriptions: JSON.parse(localStorage.getItem('expense_tracker_subscriptions')) || [
    { id: 'sub-1', name: 'Netflix 4K Ultra', amount: 649, category: 'Entertainment', cycle: 'Monthly', dueDay: 15 },
    { id: 'sub-2', name: 'Spotify Premium Family', amount: 179, category: 'Entertainment', cycle: 'Monthly', dueDay: 28 },
    { id: 'sub-3', name: 'AWS Cloud Hosting', amount: 2450, category: 'Utilities', cycle: 'Monthly', dueDay: 5 },
    { id: 'sub-4', name: 'JioFiber High-Speed', amount: 999, category: 'Utilities', cycle: 'Monthly', dueDay: 20 },
    { id: 'sub-5', name: 'Gym & Fitness Pass', amount: 2000, category: 'Healthcare', cycle: 'Monthly', dueDay: 1 }
  ],
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
  // Apply saved theme
  document.body.className = state.currentTheme;
  updateThemeIcon();

  // Apply saved currency
  const currSelect = document.getElementById('globalCurrencySelect');
  if (currSelect) currSelect.value = state.currentCurrency;

  setupNavigation();
  updateCategoryOptions();
  setTodayDateInput();
  initCalculators();
  renderSubscriptions();
  setupModalDismissListeners();
  setupButtonActionListeners();
  await checkBackendStatus();
  await initAuth();
  await loadTransactions();
  await loadSubscriptions();
  await loadBudgets();
  renderAnalyticsView();
  renderBudgetPlanner();
  initRouter();
});

// Tab & Route Mapping Configuration
const tabRoutes = {
  'trackerTab': '/dashboard',
  'analyticsTab': '/analytics',
  'budgetTab': '/budget',
  'toolsTab': '/tools'
};

const routeToTab = {
  '/': 'trackerTab',
  '/dashboard': 'trackerTab',
  '/tracker': 'trackerTab',
  '/ledger': 'trackerTab',
  '/expenses': 'trackerTab',
  '/analytics': 'analyticsTab',
  '/insights': 'analyticsTab',
  '/budget': 'budgetTab',
  '/budgets': 'budgetTab',
  '/tools': 'toolsTab',
  '/calculator': 'toolsTab',
  '/calculators': 'toolsTab'
};

function navigateToTab(tabId, pushHistory = true) {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

  const tabBtn = document.querySelector(`.nav-tab[data-tab="${tabId}"]`);
  if (tabBtn) tabBtn.classList.add('active');

  const pane = document.getElementById(tabId);
  if (pane) pane.classList.add('active');
  state.activeTab = tabId;

  if (tabId === 'trackerTab') {
    renderLedgerTable();
    renderCharts();
  } else if (tabId === 'analyticsTab') {
    renderAnalyticsView();
  } else if (tabId === 'budgetTab') {
    renderBudgetPlanner();
  } else if (tabId === 'toolsTab') {
    calculateEMI();
    calculateSIP();
    calculateEmergencyFund();
    calculateTax();
  }

  const targetPath = tabRoutes[tabId] || '/dashboard';
  if (pushHistory && window.location.pathname !== targetPath) {
    try {
      history.pushState({ tabId }, '', targetPath);
    } catch (e) {
      window.location.hash = targetPath;
    }
  }
}

// Client SPA Router (Deep linking, direct URLs, browser history, & 404 handling)
function initRouter() {
  function handleLocation() {
    let path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '/');
    if (hash && hash !== '/') {
      path = hash;
    }

    // Modal Authentication Routes
    if (path === '/login') {
      navigateToTab('trackerTab', false);
      openAuthModal('login');
      return;
    }
    if (path === '/register' || path === '/signup') {
      navigateToTab('trackerTab', false);
      openAuthModal('register');
      return;
    }

    if (routeToTab[path]) {
      navigateToTab(routeToTab[path], false);
    } else {
      // Graceful fallback for non-existing routes
      navigateToTab('trackerTab', true);
    }
  }

  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.tabId) {
      navigateToTab(e.state.tabId, false);
    } else {
      handleLocation();
    }
  });

  window.addEventListener('hashchange', handleLocation);

  // Trigger initial route match
  handleLocation();
}

// Setup Main Navigation Tabs Click Events
function setupNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = tab.getAttribute('data-tab');
      navigateToTab(targetId, true);
    });
  });

  const brand = document.querySelector('.brand-container');
  if (brand) {
    brand.style.cursor = 'pointer';
    brand.addEventListener('click', () => navigateToTab('trackerTab', true));
  }
}

// ========================================================
// AUTHENTICATION & SESSION MANAGEMENT
// ========================================================
// DEMO VERSION & SANDBOX CONTROLS (DATABASE-INDEPENDENT)
// ========================================================

// Launch Offline Demo Version
function launchDemoMode() {
  state.isDemoMode = true;
  localStorage.setItem('expense_tracker_is_demo', 'true');

  state.currentUser = {
    _id: 'demo_user_67890',
    name: 'Demo Financial User',
    email: 'demo@expensetracker.io',
    role: 'Demo Sandbox User'
  };
  state.jwtToken = 'demo.eyJzdWIiOiJkZW1vX3VzZXIiLCJuYW1lIjoiRGVtbyBVc2VyIn0.mock_signature_2026';
  localStorage.setItem('auth_token', state.jwtToken);
  localStorage.setItem('auth_user', JSON.stringify(state.currentUser));

  // Seed sample transactions if empty
  const stored = localStorage.getItem('expense_tracker_demo_txs');
  if (stored) {
    try {
      state.transactions = JSON.parse(stored);
    } catch {
      state.transactions = JSON.parse(JSON.stringify(DEFAULT_DEMO_TRANSACTIONS));
    }
  } else {
    state.transactions = JSON.parse(JSON.stringify(DEFAULT_DEMO_TRANSACTIONS));
  }
  localStorage.setItem('expense_tracker_demo_txs', JSON.stringify(state.transactions));

  updateAuthUI();
  updateMetrics();
  renderLedgerTable();
  renderCharts();
  renderAnalyticsView();
  renderBudgetPlanner();
  renderSubscriptions();
  calculateEmergencyFund();

  showToast('🎮 Demo Version Launched! Full website features active without database connection.', 'success');
}

// Reset Demo Sample Data
function resetDemoData() {
  state.transactions = JSON.parse(JSON.stringify(DEFAULT_DEMO_TRANSACTIONS));
  localStorage.setItem('expense_tracker_demo_txs', JSON.stringify(state.transactions));

  updateMetrics();
  renderLedgerTable();
  renderCharts();
  renderAnalyticsView();
  renderBudgetPlanner();
  renderSubscriptions();
  calculateEmergencyFund();

  showToast('🔄 Demo sample transactions reset to initial state!', 'info');
}

// Initialize user session from localStorage and verify profile
async function initAuth() {
  const isDemo = localStorage.getItem('expense_tracker_is_demo') === 'true';
  const savedToken = localStorage.getItem('auth_token');
  const savedUser = localStorage.getItem('auth_user');
  const hasLoggedOut = localStorage.getItem('has_logged_out') === 'true';

  if (isDemo) {
    state.isDemoMode = true;
    state.currentUser = savedUser ? JSON.parse(savedUser) : {
      _id: 'demo_user_001',
      name: 'Demo Financial User',
      email: 'demo@expensetracker.io',
      role: 'Demo Sandbox User'
    };
    state.jwtToken = savedToken || 'demo_jwt_token';
    updateAuthUI();
    return;
  }

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
          // Token expired, if demo user auto-renew, else clear
          if (state.currentUser && state.currentUser.email === 'demo@expensetracker.io') {
            await quickDemoLogin();
          } else {
            state.jwtToken = '';
            state.currentUser = null;
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
          }
        }
      } catch (err) {
        console.warn('Could not verify profile with server:', err);
      }
    }
  } else if (!hasLoggedOut && state.backendConnected) {
    // Fresh launch: Auto-authenticate into verified demo session for immediate readiness
    await quickDemoLogin();
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
  const resetDemoBtn = document.getElementById('resetDemoBtn');
  const activeJwtTextarea = document.getElementById('activeJwtTextarea');
  const statusPill = document.getElementById('backendStatusPill');
  const statusText = document.getElementById('backendStatusText');

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

    if (state.isDemoMode) {
      if (authBadge) {
        authBadge.innerText = 'Demo Sandbox';
        authBadge.style.color = '#38bdf8';
      }
      if (resetDemoBtn) resetDemoBtn.style.display = 'inline-flex';
      if (statusPill && statusText) {
        statusPill.style.background = 'rgba(6, 182, 212, 0.15)';
        statusPill.style.borderColor = 'rgba(6, 182, 212, 0.4)';
        statusPill.style.color = '#38bdf8';
        statusText.innerText = 'Demo Sandbox';
        statusPill.title = 'Demo Sandbox Mode (Database-Free)';
      }
    } else {
      if (authBadge) {
        authBadge.innerText = 'JWT Active';
        authBadge.style.color = '#34d399';
      }
      if (resetDemoBtn) resetDemoBtn.style.display = 'none';
    }

    // Profile modal details
    const profileAvatar = document.getElementById('profileModalAvatar');
    const profileName = document.getElementById('profileModalUserName');
    const profileEmail = document.getElementById('profileModalUserEmail');
    const profileRole = document.getElementById('profileModalRole');

    if (profileAvatar) profileAvatar.innerText = initials || 'U';
    if (profileName) profileName.innerText = name;
    if (profileEmail) profileEmail.innerText = state.currentUser.email || '';
    if (profileRole) profileRole.innerText = state.isDemoMode ? 'Demo Sandbox Session (Client-Side Validated)' : 'Active Session (JWT Bearer Protected)';
    if (activeJwtTextarea) activeJwtTextarea.value = state.jwtToken;

  } else {
    // Unauthenticated state
    if (unauthBox) unauthBox.style.display = 'flex';
    if (authBox) authBox.style.display = 'none';
    if (resetDemoBtn) resetDemoBtn.style.display = 'none';
    if (guestBanner) guestBanner.style.display = 'flex';
    if (activeJwtTextarea) activeJwtTextarea.value = 'No active JWT token. Please sign in, register, or click "Demo Version" for instant database-free access.';
  }
}

// Dismiss Modals via Backdrop Click and Escape Key
function setupModalDismissListeners() {
  const authModal = document.getElementById('authModal');
  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) closeAuthModal();
    });
  }
  const userProfileModal = document.getElementById('userProfileModal');
  if (userProfileModal) {
    userProfileModal.addEventListener('click', (e) => {
      if (e.target === userProfileModal) toggleUserProfileModal();
    });
  }
  const txModal = document.getElementById('transactionModalOverlay');
  if (txModal) {
    txModal.addEventListener('click', (e) => {
      if (e.target === txModal) closeTransactionModal();
    });
  }
  const budgetModal = document.getElementById('budgetConfigModal');
  if (budgetModal) {
    budgetModal.addEventListener('click', (e) => {
      if (e.target === budgetModal) closeBudgetConfigModal();
    });
  }
  const subModal = document.getElementById('subscriptionModal');
  if (subModal) {
    subModal.addEventListener('click', (e) => {
      if (e.target === subModal) closeAddSubscriptionModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAuthModal();
      closeTransactionModal();
      closeBudgetConfigModal();
      closeAddSubscriptionModal();
      const profileModal = document.getElementById('userProfileModal');
      if (profileModal && profileModal.classList.contains('active')) {
        toggleUserProfileModal();
      }
    }
  });
}

// Direct Synchronous Event Listener Bindings for 100% Reliable Interactions
function setupButtonActionListeners() {
  // Add Income primary button
  const addIncomeBtn = document.getElementById('addIncomeBtn');
  if (addIncomeBtn) {
    addIncomeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openTransactionModal('income');
    });
  }

  // Add Expense primary button
  const addExpenseBtn = document.getElementById('addExpenseBtn');
  if (addExpenseBtn) {
    addExpenseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openTransactionModal('expense');
    });
  }

  // Empty state buttons
  const emptyIncomeBtn = document.getElementById('emptyAddIncomeBtn');
  if (emptyIncomeBtn) {
    emptyIncomeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openTransactionModal('income');
    });
  }
  const emptyExpenseBtn = document.getElementById('emptyAddExpenseBtn');
  if (emptyExpenseBtn) {
    emptyExpenseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openTransactionModal('expense');
    });
  }

  // Add Subscription button
  const addSubBtn = document.getElementById('addSubscriptionBtn');
  if (addSubBtn) {
    addSubBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openAddSubscriptionModal();
    });
  }

  // Configure Budgets button
  const configBudgetsBtn = document.getElementById('configBudgetsBtn');
  if (configBudgetsBtn) {
    configBudgetsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openBudgetConfigModal();
    });
  }

  // Export CSV button
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', (e) => {
      e.preventDefault();
      exportTransactionsCSV();
    });
  }

  // Print Statement button
  const printBtn = document.getElementById('printStatementBtn');
  if (printBtn) {
    printBtn.addEventListener('click', (e) => {
      e.preventDefault();
      printFinancialStatement();
    });
  }

  // Clear Date Filter button
  const clearDateBtn = document.getElementById('clearDateBtn');
  if (clearDateBtn) {
    clearDateBtn.addEventListener('click', (e) => {
      e.preventDefault();
      clearDateFilter();
    });
  }

  // Search & Filter controls
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.addEventListener('input', handleSearchFilter);

  const catFilter = document.getElementById('categoryFilter');
  if (catFilter) catFilter.addEventListener('change', handleSearchFilter);

  const typeFilter = document.getElementById('typeFilter');
  if (typeFilter) typeFilter.addEventListener('change', handleSearchFilter);

  const sortFilter = document.getElementById('sortFilter');
  if (sortFilter) sortFilter.addEventListener('change', handleSearchFilter);

  const startDate = document.getElementById('startDateFilter');
  if (startDate) startDate.addEventListener('change', handleSearchFilter);

  const endDate = document.getElementById('endDateFilter');
  if (endDate) endDate.addEventListener('change', handleSearchFilter);

  // Currency select
  const currSelect = document.getElementById('globalCurrencySelect');
  if (currSelect) {
    currSelect.addEventListener('change', (e) => {
      changeCurrency(e.target.value);
    });
  }

  // Theme toggle
  const themeToggle = document.getElementById('themeToggleBtn');
  if (themeToggle) {
    themeToggle.addEventListener('click', (e) => {
      e.preventDefault();
      cycleTheme();
    });
  }

  // Header Sign In / Sign Up / Demo Version
  const headerSignInBtn = document.getElementById('headerSignInBtn');
  if (headerSignInBtn) {
    headerSignInBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openAuthModal('login');
    });
  }
  const headerSignUpBtn = document.getElementById('headerSignUpBtn');
  if (headerSignUpBtn) {
    headerSignUpBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openAuthModal('register');
    });
  }
  const headerDemoBtn = document.getElementById('headerDemoBtn');
  if (headerDemoBtn) {
    headerDemoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      launchDemoMode();
    });
  }
  const resetDemoBtn = document.getElementById('resetDemoBtn');
  if (resetDemoBtn) {
    resetDemoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      resetDemoData();
    });
  }

  // Logout button
  const logoutBtn = document.getElementById('headerLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logoutUser();
    });
  }

  // User Profile Pill
  const userPill = document.getElementById('userPill');
  if (userPill) {
    userPill.addEventListener('click', (e) => {
      e.preventDefault();
      toggleUserProfileModal();
    });
  }
}

// Open Auth Modal (Login / Register)
function openAuthModal(tab = 'login') {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  modal.classList.add('active');
  switchAuthTab(tab);
  hideAuthAlert();

  try {
    const route = `/${tab}`;
    if (window.location.pathname !== route && window.location.hash !== `#${route}`) {
      history.pushState({ authModal: true, tab }, '', route);
    }
  } catch (e) { }

  const rememberedEmail = localStorage.getItem('remembered_email');
  const loginEmail = document.getElementById('loginEmail');
  const rememberCheck = document.getElementById('rememberMeCheckbox');
  if (rememberedEmail && loginEmail && !loginEmail.value) {
    loginEmail.value = rememberedEmail;
    if (rememberCheck) rememberCheck.checked = true;
    validateEmailField(loginEmail, 'loginEmailFeedback');
  }

  // Set focus
  setTimeout(() => {
    if (tab === 'register') {
      const regName = document.getElementById('regName');
      if (regName) regName.focus();
    } else {
      if (loginEmail && loginEmail.value) {
        const loginPass = document.getElementById('loginPassword');
        if (loginPass) loginPass.focus();
      } else if (loginEmail) {
        loginEmail.focus();
      }
    }
  }, 60);
}

// Close Auth Modal
function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = '';
  }
  state.isAuthSubmitting = false;
  hideAuthAlert();

  const currentTabRoute = tabRoutes[state.activeTab] || '/dashboard';
  try {
    if (window.location.pathname === '/login' || window.location.pathname === '/register' || window.location.pathname === '/signup') {
      history.pushState({ tabId: state.activeTab }, '', currentTabRoute);
    }
  } catch (e) { }

  // Reset button states
  const loginBtn = document.getElementById('loginSubmitBtn');
  if (loginBtn) {
    loginBtn.disabled = false;
    loginBtn.innerText = 'Sign In';
  }
  const regBtn = document.getElementById('registerSubmitBtn');
  if (regBtn) {
    regBtn.disabled = false;
    regBtn.innerText = 'Register Account';
  }

  // Clear passwords and feedback highlights
  const lp = document.getElementById('loginPassword');
  if (lp) lp.value = '';
  const rp = document.getElementById('regPassword');
  if (rp) rp.value = '';
  const rcp = document.getElementById('regConfirmPassword');
  if (rcp) rcp.value = '';

  document.querySelectorAll('#authModal .form-input').forEach(inp => {
    inp.classList.remove('input-error');
  });
}

// Switch between Login and Register tabs
function switchAuthTab(tab) {
  const loginBtn = document.getElementById('authTabLoginBtn');
  const regBtn = document.getElementById('authTabRegisterBtn');
  const loginContent = document.getElementById('tabLogin');
  const regContent = document.getElementById('tabRegister');
  const title = document.getElementById('authModalTitle');

  hideAuthAlert();
  document.querySelectorAll('#authModal .form-input').forEach(inp => {
    inp.classList.remove('input-error');
  });

  if (tab === 'register') {
    if (loginBtn) {
      loginBtn.classList.remove('active');
      loginBtn.setAttribute('aria-selected', 'false');
    }
    if (regBtn) {
      regBtn.classList.add('active');
      regBtn.setAttribute('aria-selected', 'true');
    }
    if (loginContent) {
      loginContent.classList.remove('active');
      loginContent.style.display = 'none';
    }
    if (regContent) {
      regContent.classList.add('active');
      regContent.style.display = 'block';
    }
    if (title) title.innerText = 'Create New Account';

    setTimeout(() => {
      const regName = document.getElementById('regName');
      if (regName) regName.focus();
    }, 50);
  } else {
    if (loginBtn) {
      loginBtn.classList.add('active');
      loginBtn.setAttribute('aria-selected', 'true');
    }
    if (regBtn) {
      regBtn.classList.remove('active');
      regBtn.setAttribute('aria-selected', 'false');
    }
    if (loginContent) {
      loginContent.classList.add('active');
      loginContent.style.display = 'block';
    }
    if (regContent) {
      regContent.classList.remove('active');
      regContent.style.display = 'none';
    }
    if (title) title.innerText = 'Sign In to Expense Tracker';

    const rememberedEmail = localStorage.getItem('remembered_email');
    const loginEmail = document.getElementById('loginEmail');
    if (rememberedEmail && loginEmail && !loginEmail.value) {
      loginEmail.value = rememberedEmail;
      validateEmailField(loginEmail, 'loginEmailFeedback');
    }

    setTimeout(() => {
      if (loginEmail && loginEmail.value) {
        const lp = document.getElementById('loginPassword');
        if (lp) lp.focus();
      } else if (loginEmail) {
        loginEmail.focus();
      }
    }, 50);
  }
}

// Toggle Password Visibility (Eye Icon)
function togglePasswordVisibility(inputId, btnEl) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btnEl.innerText = '🙈';
    btnEl.title = 'Hide password';
    btnEl.setAttribute('aria-label', 'Hide password');
  } else {
    input.type = 'password';
    btnEl.innerText = '👁️';
    btnEl.title = 'Show password';
    btnEl.setAttribute('aria-label', 'Show password');
  }
}

// Live Email Format Validation
function validateEmailField(inputEl, feedbackId) {
  const feedback = document.getElementById(feedbackId);
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const val = inputEl.value.trim();

  if (!feedback) return true;

  if (val.length === 0) {
    feedback.className = 'input-feedback';
    feedback.innerText = '';
    inputEl.classList.remove('input-error');
    return false;
  }

  if (emailRegex.test(val)) {
    feedback.className = 'input-feedback valid';
    feedback.innerText = '✓ Valid email address format';
    inputEl.classList.remove('input-error');
    return true;
  } else {
    feedback.className = 'input-feedback invalid';
    feedback.innerText = '✕ Please enter a valid email (e.g. name@example.com)';
    inputEl.classList.add('input-error');
    return false;
  }
}

// Live Full Name Validation
function validateNameField(inputEl) {
  const counter = document.getElementById('regNameCounter');
  const feedback = document.getElementById('regNameFeedback');
  const val = inputEl.value.trim();

  if (counter) counter.innerText = `${inputEl.value.length} / 50`;

  if (!feedback) return;
  if (val.length === 0) {
    feedback.className = 'input-feedback';
    feedback.innerText = '';
  } else if (val.length < 2) {
    feedback.className = 'input-feedback invalid';
    feedback.innerText = '✕ Name must be at least 2 characters';
  } else {
    feedback.className = 'input-feedback valid';
    feedback.innerText = '✓ Looks good';
  }
}

// Live Password Strength Meter
function validatePasswordStrengthLive(password) {
  const box = document.getElementById('passwordStrengthBox');
  const bar = document.getElementById('strengthBarFill');
  const label = document.getElementById('strengthText');
  const hint = document.getElementById('strengthHint');

  const critLength = document.getElementById('critLength');
  const critNumber = document.getElementById('critNumber');
  const critCase = document.getElementById('critCase');
  const critSpecial = document.getElementById('critSpecial');

  if (!box) return;

  if (!password || password.length === 0) {
    box.style.display = 'none';
    return;
  }

  box.style.display = 'block';

  let score = 0;
  const hasLength = password.length >= 6;
  const hasNumber = /\d/.test(password);
  const hasCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (hasLength) score++;
  if (hasNumber) score++;
  if (hasCase) score++;
  if (hasSpecial) score++;

  if (critLength) critLength.className = `criteria-chip ${hasLength ? 'passed' : ''}`;
  if (critNumber) critNumber.className = `criteria-chip ${hasNumber ? 'passed' : ''}`;
  if (critCase) critCase.className = `criteria-chip ${hasCase ? 'passed' : ''}`;
  if (critSpecial) critSpecial.className = `criteria-chip ${hasSpecial ? 'passed' : ''}`;

  if (score === 1) {
    bar.style.width = '25%';
    bar.style.background = '#f43f5e';
    label.style.color = '#fb7185';
    label.innerText = 'Strength: Weak';
    hint.innerText = 'Add numbers & letters';
  } else if (score === 2) {
    bar.style.width = '50%';
    bar.style.background = '#f59e0b';
    label.style.color = '#fbbf24';
    label.innerText = 'Strength: Fair';
    hint.innerText = 'Include mixed case & symbols';
  } else if (score === 3) {
    bar.style.width = '75%';
    bar.style.background = '#06b6d4';
    label.style.color = '#38bdf8';
    label.innerText = 'Strength: Good';
    hint.innerText = 'Almost bulletproof';
  } else if (score === 4) {
    bar.style.width = '100%';
    bar.style.background = '#10b981';
    label.style.color = '#34d399';
    label.innerText = 'Strength: Strong 🛡️';
    hint.innerText = 'Excellent password security';
  }
}

// Live Confirm Password Matcher
function validatePasswordMatchLive() {
  const p1 = document.getElementById('regPassword').value;
  const p2 = document.getElementById('regConfirmPassword').value;
  const feedback = document.getElementById('regConfirmFeedback');

  if (!feedback) return;

  if (p2.length === 0) {
    feedback.className = 'input-feedback';
    feedback.innerText = '';
    return;
  }

  if (p1 === p2) {
    feedback.className = 'input-feedback valid';
    feedback.innerText = '✓ Passwords match';
  } else {
    feedback.className = 'input-feedback invalid';
    feedback.innerText = '✕ Passwords do not match';
  }
}

// Automatically commit any transaction the user entered before signing in
async function processPendingTransactionAfterAuth() {
  if (state.pendingTransaction && state.backendConnected && state.jwtToken) {
    const pending = state.pendingTransaction;
    state.pendingTransaction = null;
    try {
      const res = await fetch(`${state.apiBase}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.jwtToken}`
        },
        body: JSON.stringify(pending)
      });
      if (res.ok) {
        showToast(`✓ Prepared transaction "${pending.title}" recorded to MongoDB Atlas!`, 'success');
        await loadTransactions();
      }
    } catch (err) {
      console.warn('Failed to commit pending transaction:', err);
    }
  }
}

// Quick 1-Click Demo Login
async function quickDemoLogin() {
  showToast('Connecting to Demo Session...', 'info');
  const emailInput = document.getElementById('loginEmail');
  const passInput = document.getElementById('loginPassword');
  if (emailInput) {
    emailInput.value = 'demo@expensetracker.io';
    validateEmailField(emailInput, 'loginEmailFeedback');
  }
  if (passInput) passInput.value = 'DemoPassword123!';

  const submitBtn = document.getElementById('quickDemoBtn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="btn-spinner"></span> Connecting...';
  }

  // Attempt backend demo login or auto-register if not existing
  try {
    let res = await fetch(`${state.apiBase}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@expensetracker.io', password: 'DemoPassword123!' })
    });
    let data = await res.json();

    if (!res.ok || !data.success) {
      // Auto-register demo account if first time
      res = await fetch(`${state.apiBase}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Demo Financial User', email: 'demo@expensetracker.io', password: 'DemoPassword123!' })
      });
      data = await res.json();
    }

    if (data && data.success) {
      state.isDemoMode = false;
      localStorage.removeItem('expense_tracker_is_demo');
      localStorage.removeItem('expense_tracker_demo_txs');
      localStorage.removeItem('has_logged_out');

      state.jwtToken = data.token;
      state.currentUser = data.user;
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));

      updateAuthUI();
      closeAuthModal();
      showToast('Logged in successfully as Demo User!', 'success');

      const trackerTabBtn = document.querySelector('.nav-tab[data-tab="trackerTab"]');
      if (trackerTabBtn) trackerTabBtn.click();

      await loadTransactions();
      await loadSubscriptions();
      await loadBudgets();
      await processPendingTransactionAfterAuth();
    } else {
      throw new Error(data.message || 'Demo login failed');
    }
  } catch (err) {
    // Sandbox fallback
    launchDemoMode();
    closeAuthModal();
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerText = '🚀 Demo Sign In';
    }
  }
}

function fillDemoCredentials() {
  const emailInput = document.getElementById('loginEmail');
  const passInput = document.getElementById('loginPassword');
  if (emailInput) {
    emailInput.value = 'demo@expensetracker.io';
    validateEmailField(emailInput, 'loginEmailFeedback');
  }
  if (passInput) passInput.value = 'DemoPassword123!';
  showToast('Filled Demo Credentials. Click Sign In.', 'info');
}

// Live Transaction Form Validations
function validateTxTitle(inputEl) {
  const counter = document.getElementById('txTitleCounter');
  const feedback = document.getElementById('txTitleFeedback');
  const val = inputEl.value.trim();

  if (counter) counter.innerText = `${inputEl.value.length} / 100`;

  if (!feedback) return;
  if (val.length === 0) {
    feedback.className = 'input-feedback';
    feedback.innerText = '';
  } else if (val.length < 2) {
    feedback.className = 'input-feedback invalid';
    feedback.innerText = '✕ Title must be at least 2 characters';
  } else {
    feedback.className = 'input-feedback valid';
    feedback.innerText = '✓ Title valid';
  }
}

function validateTxAmount(inputEl) {
  const feedback = document.getElementById('txAmountFeedback');
  const val = parseFloat(inputEl.value);

  if (!feedback) return;
  if (isNaN(val) || inputEl.value === '') {
    feedback.className = 'input-feedback';
    feedback.innerText = '';
  } else if (val <= 0) {
    feedback.className = 'input-feedback invalid';
    feedback.innerText = '✕ Amount must be greater than 0';
  } else if (val > 100000000) {
    feedback.className = 'input-feedback invalid';
    feedback.innerText = '✕ Amount exceeds maximum limit';
  } else {
    feedback.className = 'input-feedback valid';
    feedback.innerText = `✓ ${formatCurrency(val)}`;
  }
}

function setQuickDate(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const dateStr = d.toISOString().split('T')[0];
  const dateInput = document.getElementById('txDate');
  if (dateInput) {
    dateInput.value = dateStr;
    showToast(`Date set to ${offsetDays === 0 ? 'Today' : 'Yesterday'} (${dateStr})`, 'info');
  }
}

// Toggle User Profile Modal
function toggleUserProfileModal() {
  const modal = document.getElementById('userProfileModal');
  if (!modal) return;
  if (modal.classList.contains('active')) {
    modal.classList.remove('active');
    modal.style.display = '';
  } else {
    modal.classList.add('active');
  }
}

// Show alert banner inside auth modal
function showAuthAlert(msg, type = 'error') {
  const box = document.getElementById('authAlertBox');
  if (!box) return;
  box.className = `auth-alert-box ${type}`;
  const icon = type === 'error' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
  box.innerHTML = `<span style="font-size:1.15rem;line-height:1;margin-top:1px;">${icon}</span><div style="flex:1;">${msg}</div>`;
  box.style.display = 'flex';
}

// Hide alert banner inside auth modal
function hideAuthAlert() {
  const box = document.getElementById('authAlertBox');
  if (!box) return;
  box.className = 'auth-alert-box';
  box.innerHTML = '';
  box.style.display = 'none';
}

// Handle User Login
async function handleLogin(event) {
  if (event) event.preventDefault();
  if (state.isAuthSubmitting) return;

  hideAuthAlert();

  const emailInput = document.getElementById('loginEmail');
  const passInput = document.getElementById('loginPassword');
  const email = (emailInput?.value || '').trim();
  const password = passInput?.value || '';
  const rememberMe = document.getElementById('rememberMeCheckbox')?.checked;
  const submitBtn = document.getElementById('loginSubmitBtn');

  // Clear previous error borders
  if (emailInput) emailInput.classList.remove('input-error');
  if (passInput) passInput.classList.remove('input-error');

  if (!email) {
    showAuthAlert('Please enter your email address.', 'error');
    if (emailInput) {
      emailInput.classList.add('input-error');
      emailInput.focus();
    }
    return;
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    showAuthAlert('Please provide a valid email address format (e.g. user@example.com).', 'error');
    if (emailInput) {
      emailInput.classList.add('input-error');
      emailInput.focus();
    }
    return;
  }

  if (!password) {
    showAuthAlert('Please enter your account password.', 'error');
    if (passInput) {
      passInput.classList.add('input-error');
      passInput.focus();
    }
    return;
  }

  try {
    state.isAuthSubmitting = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="btn-spinner"></span> Authenticating...';
    }

    const res = await fetch(`${state.apiBase}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.toLowerCase(), password })
    });

    let data = {};
    try {
      data = await res.json();
    } catch {
      data = { message: 'Unexpected server response received.' };
    }

    if (!res.ok || !data.success) {
      let errorMsg = 'Invalid email or password credentials.';
      if (res.status === 401) {
        errorMsg = 'Invalid email or password. Please verify your credentials and try again.';
        if (passInput) {
          passInput.classList.add('input-error');
          passInput.value = '';
          passInput.focus();
        }
      } else if (res.status === 429) {
        errorMsg = data.message || 'Too many authentication attempts. Please wait a moment before retrying.';
      } else if (data.message) {
        errorMsg = data.message;
      }
      showAuthAlert(errorMsg, 'error');
      showToast(errorMsg, 'error');
      return;
    }

    // Clear any previous demo state
    state.isDemoMode = false;
    localStorage.removeItem('expense_tracker_is_demo');
    localStorage.removeItem('expense_tracker_demo_txs');
    localStorage.removeItem('has_logged_out');

    // Save token and user details
    state.jwtToken = data.token;
    state.currentUser = data.user;
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));

    if (rememberMe) {
      localStorage.setItem('remembered_email', email);
    } else {
      localStorage.removeItem('remembered_email');
    }

    updateAuthUI();
    closeAuthModal();
    showToast(`Welcome back, ${data.user.name || 'User'}!`, 'success');

    // Navigate to tracker tab
    const trackerTabBtn = document.querySelector('.nav-tab[data-tab="trackerTab"]');
    if (trackerTabBtn) trackerTabBtn.click();

    // Load user's transactions from MongoDB
    await loadTransactions();
    await loadSubscriptions();
    await loadBudgets();
    await processPendingTransactionAfterAuth();
  } catch (error) {
    const errText = error.message || 'Failed to connect to authentication server.';
    showAuthAlert(errText, 'error');
    showToast(errText, 'error');
  } finally {
    state.isAuthSubmitting = false;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerText = 'Sign In';
    }
  }
}

// Handle User Registration
async function handleRegister(event) {
  if (event) event.preventDefault();
  if (state.isAuthSubmitting) return;

  hideAuthAlert();

  const nameInput = document.getElementById('regName');
  const emailInput = document.getElementById('regEmail');
  const passInput = document.getElementById('regPassword');
  const confirmInput = document.getElementById('regConfirmPassword');

  const name = (nameInput?.value || '').trim();
  const email = (emailInput?.value || '').trim();
  const password = passInput?.value || '';
  const confirmPassword = confirmInput?.value || '';
  const submitBtn = document.getElementById('registerSubmitBtn');

  // Clear previous error borders
  [nameInput, emailInput, passInput, confirmInput].forEach(inp => {
    if (inp) inp.classList.remove('input-error');
  });

  if (!name || name.length < 2) {
    showAuthAlert('Full name must be at least 2 characters long.', 'error');
    if (nameInput) {
      nameInput.classList.add('input-error');
      nameInput.focus();
    }
    return;
  }

  if (name.length > 50) {
    showAuthAlert('Full name cannot exceed 50 characters.', 'error');
    if (nameInput) {
      nameInput.classList.add('input-error');
      nameInput.focus();
    }
    return;
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email || !emailRegex.test(email)) {
    showAuthAlert('Please provide a valid email format (e.g. user@example.com).', 'error');
    if (emailInput) {
      emailInput.classList.add('input-error');
      emailInput.focus();
    }
    return;
  }

  if (!password || password.length < 6) {
    showAuthAlert('Password must be at least 6 characters long.', 'error');
    if (passInput) {
      passInput.classList.add('input-error');
      passInput.focus();
    }
    return;
  }

  if (password.length > 128) {
    showAuthAlert('Password cannot exceed 128 characters.', 'error');
    if (passInput) {
      passInput.classList.add('input-error');
      passInput.focus();
    }
    return;
  }

  if (password !== confirmPassword) {
    showAuthAlert('Passwords do not match. Please verify both password entries.', 'error');
    if (confirmInput) {
      confirmInput.classList.add('input-error');
      confirmInput.focus();
    }
    return;
  }

  try {
    state.isAuthSubmitting = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="btn-spinner"></span> Creating Account...';
    }

    const res = await fetch(`${state.apiBase}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email: email.toLowerCase(), password })
    });

    let data = {};
    try {
      data = await res.json();
    } catch {
      data = { message: 'Unexpected server response received.' };
    }

    if (!res.ok || !data.success) {
      let errorMsg = data.message || 'Registration failed. Please try again.';
      if (data.message && data.message.toLowerCase().includes('already exists')) {
        errorMsg = `An account with this email address already exists. <a href="javascript:void(0)" onclick="switchAuthTab('login')">Click here to Sign In</a>`;
        if (emailInput) emailInput.classList.add('input-error');
      } else if (Array.isArray(data.errors) && data.errors.length > 0) {
        errorMsg = `<div><strong>Please resolve the following:</strong><ul>${data.errors.map(e => `<li>${e}</li>`).join('')}</ul></div>`;
      } else if (res.status === 429) {
        errorMsg = data.message || 'Too many attempts. Please wait a moment before retrying.';
      }

      showAuthAlert(errorMsg, 'error');
      showToast(data.message || 'Registration failed', 'error');
      return;
    }

    // Clear any previous demo state
    state.isDemoMode = false;
    localStorage.removeItem('expense_tracker_is_demo');
    localStorage.removeItem('expense_tracker_demo_txs');
    localStorage.removeItem('has_logged_out');

    // Save token and user details
    state.jwtToken = data.token;
    state.currentUser = data.user;
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));

    updateAuthUI();
    closeAuthModal();
    showToast(`Account created successfully! Welcome, ${data.user.name || 'User'}!`, 'success');

    // Navigate to tracker tab
    const trackerTabBtn = document.querySelector('.nav-tab[data-tab="trackerTab"]');
    if (trackerTabBtn) trackerTabBtn.click();

    // Load initial user transactions from database
    await loadTransactions();
    await loadSubscriptions();
    await loadBudgets();
    await processPendingTransactionAfterAuth();
  } catch (error) {
    const errText = error.message || 'Failed to connect to authentication server.';
    showAuthAlert(errText, 'error');
    showToast(errText, 'error');
  } finally {
    state.isAuthSubmitting = false;
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
  state.isDemoMode = false;
  state.transactions = [];
  state.subscriptions = [
    { id: 'sub-1', name: 'Netflix 4K Ultra', amount: 649, category: 'Entertainment', cycle: 'Monthly', dueDay: 15 },
    { id: 'sub-2', name: 'Spotify Premium Family', amount: 179, category: 'Entertainment', cycle: 'Monthly', dueDay: 28 },
    { id: 'sub-3', name: 'AWS Cloud Hosting', amount: 2450, category: 'Utilities', cycle: 'Monthly', dueDay: 5 },
    { id: 'sub-4', name: 'JioFiber High-Speed', amount: 999, category: 'Utilities', cycle: 'Monthly', dueDay: 20 },
    { id: 'sub-5', name: 'Gym & Fitness Pass', amount: 2000, category: 'Healthcare', cycle: 'Monthly', dueDay: 1 }
  ];
  state.budgets = {
    'Food': 8000,
    'Housing': 15000,
    'Travel': 3000,
    'Utilities': 3500,
    'Healthcare': 2500,
    'Entertainment': 3000,
    'Shopping': 4000,
    'Education': 5000
  };

  localStorage.setItem('has_logged_out', 'true');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  localStorage.removeItem('expense_tracker_is_demo');
  localStorage.removeItem('expense_tracker_demo_txs');
  localStorage.removeItem('expense_tracker_demo_subs');
  localStorage.removeItem('expense_tracker_demo_budgets');

  // Close modals
  closeAuthModal();
  const profileModal = document.getElementById('userProfileModal');
  if (profileModal) {
    profileModal.classList.remove('active');
    profileModal.style.display = 'none';
  }

  updateAuthUI();
  updateMetrics();
  renderLedgerTable();
  renderCharts();
  renderAnalyticsView();
  renderBudgetPlanner();
  renderSubscriptions();
  calculateEmergencyFund();

  // Navigate to tracker tab
  const trackerTabBtn = document.querySelector('.nav-tab[data-tab="trackerTab"]');
  if (trackerTabBtn) trackerTabBtn.click();

  showToast('You have been signed out successfully.', 'info');
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
      if (!state.isDemoMode) {
        statusPill.style.background = 'rgba(16, 185, 129, 0.15)';
        statusPill.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        statusPill.style.color = '#34d399';
        const isMongo = data.database && data.database.toLowerCase().includes('mongo');
        statusText.innerText = isMongo ? 'MongoDB Connected' : 'Local Storage Active';
        statusPill.title = `Backend Connected: ${data.database || 'Online'}`;
      }
    } else {
      throw new Error('Non-200 status');
    }
  } catch (err) {
    state.backendConnected = false;
    if (!state.isDemoMode) {
      statusPill.style.background = 'rgba(6, 182, 212, 0.15)';
      statusPill.style.borderColor = 'rgba(6, 182, 212, 0.4)';
      statusPill.style.color = '#38bdf8';
      statusText.innerText = 'Offline Sandbox';
      statusPill.title = 'Offline Standalone Mode Active';
    }
  }
}

// Load Transactions (Backend or Database-Free Demo Sandbox)
async function loadTransactions() {
  if (state.isDemoMode) {
    const stored = localStorage.getItem('expense_tracker_demo_txs');
    if (stored) {
      try {
        state.transactions = JSON.parse(stored);
      } catch {
        state.transactions = JSON.parse(JSON.stringify(DEFAULT_DEMO_TRANSACTIONS));
      }
    } else {
      state.transactions = JSON.parse(JSON.stringify(DEFAULT_DEMO_TRANSACTIONS));
      localStorage.setItem('expense_tracker_demo_txs', JSON.stringify(state.transactions));
    }
    updateMetrics();
    renderLedgerTable();
    renderCharts();
    renderAnalyticsView();
    renderBudgetPlanner();
    renderSubscriptions();
    calculateEmergencyFund();
    return;
  }

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
        console.warn('Backend fetch failed, falling back to local records:', e);
        const stored = localStorage.getItem('expense_tracker_txs');
        state.transactions = stored ? JSON.parse(stored) : [];
      }
    } else {
      // Unauthenticated state: load from local storage
      const stored = localStorage.getItem('expense_tracker_txs');
      state.transactions = stored ? JSON.parse(stored) : [];
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

// Load Subscriptions (Backend MongoDB or Local Sandbox)
async function loadSubscriptions() {
  if (state.isDemoMode) {
    const stored = localStorage.getItem('expense_tracker_demo_subs');
    if (stored) {
      try {
        state.subscriptions = JSON.parse(stored);
      } catch (e) {
        state.subscriptions = [
          { id: 'sub-1', name: 'Netflix 4K Ultra', amount: 649, category: 'Entertainment', cycle: 'Monthly', dueDay: 15 },
          { id: 'sub-2', name: 'Spotify Premium Family', amount: 179, category: 'Entertainment', cycle: 'Monthly', dueDay: 28 },
          { id: 'sub-3', name: 'AWS Cloud Hosting', amount: 2450, category: 'Utilities', cycle: 'Monthly', dueDay: 5 },
          { id: 'sub-4', name: 'JioFiber High-Speed', amount: 999, category: 'Utilities', cycle: 'Monthly', dueDay: 20 },
          { id: 'sub-5', name: 'Gym & Fitness Pass', amount: 2000, category: 'Healthcare', cycle: 'Monthly', dueDay: 1 }
        ];
      }
    }
    renderSubscriptions();
    return;
  }

  if (state.backendConnected && state.jwtToken) {
    try {
      const res = await fetch(`${state.apiBase}/subscriptions`, {
        headers: {
          'Authorization': `Bearer ${state.jwtToken}`
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          state.subscriptions = json.data;
        }
      }
    } catch (e) {
      console.warn('Backend fetch subscriptions failed:', e);
    }
  } else {
    const stored = localStorage.getItem('expense_tracker_subscriptions');
    if (stored) {
      try {
        state.subscriptions = JSON.parse(stored);
      } catch (e) { }
    }
  }

  renderSubscriptions();
}

// Load Budgets (Backend MongoDB or Local Sandbox)
async function loadBudgets() {
  if (state.isDemoMode) {
    const stored = localStorage.getItem('expense_tracker_demo_budgets');
    if (stored) {
      try {
        state.budgets = JSON.parse(stored);
      } catch (e) { }
    }
    renderBudgetPlanner();
    return;
  }

  if (state.backendConnected && state.jwtToken) {
    try {
      const res = await fetch(`${state.apiBase}/budgets`, {
        headers: {
          'Authorization': `Bearer ${state.jwtToken}`
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && typeof json.data === 'object') {
          state.budgets = { ...state.budgets, ...json.data };
        }
      }
    } catch (e) {
      console.warn('Backend fetch budgets failed:', e);
    }
  } else {
    const stored = localStorage.getItem('expense_tracker_budgets');
    if (stored) {
      try {
        state.budgets = JSON.parse(stored);
      } catch (e) { }
    }
  }

  renderBudgetPlanner();
}

// Format Currency with Dynamic Exchange Rates (Week 9 Deliverable)
function formatCurrency(num) {
  const curr = currencyRates[state.currentCurrency] || currencyRates['INR'];
  const converted = (Number(num) || 0) * curr.rate;
  return new Intl.NumberFormat(curr.locale, {
    style: 'currency',
    currency: state.currentCurrency === 'AED' ? 'AED' : state.currentCurrency,
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: state.currentCurrency === 'JPY' ? 0 : 2
  }).format(converted);
}

// Switch Currency Global Handler
function changeCurrency(currCode) {
  if (!currencyRates[currCode]) return;
  state.currentCurrency = currCode;
  localStorage.setItem('expense_tracker_currency', currCode);
  updateMetrics();
  renderLedgerTable();
  renderCharts();
  renderAnalyticsView();
  renderBudgetPlanner();
  renderSubscriptions();
  calculateEMI();
  calculateSIP();
  calculateEmergencyFund();
  calculateTax();
  showToast(`Currency converted to ${currCode} (${currencyRates[currCode].symbol})`, 'info');
}

// Cycle UI Theme (Dark / Ocean / Glass)
function cycleTheme() {
  const themes = ['theme-dark', 'theme-ocean', 'theme-glass'];
  const currentIdx = themes.indexOf(state.currentTheme);
  const nextTheme = themes[(currentIdx + 1) % themes.length];
  state.currentTheme = nextTheme;
  document.body.className = nextTheme;
  localStorage.setItem('expense_tracker_theme', nextTheme);
  updateThemeIcon();
  showToast(`Theme switched to ${nextTheme.replace('theme-', '').toUpperCase()}`, 'info');
}

function updateThemeIcon() {
  const icon = document.getElementById('themeIcon');
  if (!icon) return;
  if (state.currentTheme === 'theme-ocean') icon.innerText = '🌊';
  else if (state.currentTheme === 'theme-glass') icon.innerText = '✨';
  else icon.innerText = '🌙';
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

// Render Ledger Table with Filtering & Custom Date Ranges (Week 9 Deliverable)
function renderLedgerTable() {
  const tbody = document.getElementById('transactionsTableBody');
  const emptyState = document.getElementById('emptyState');
  const search = document.getElementById('searchInput').value.toLowerCase().trim();
  const catFilter = document.getElementById('categoryFilter').value;
  const typeFilter = document.getElementById('typeFilter').value;
  const sort = document.getElementById('sortFilter').value;
  const startDate = document.getElementById('startDateFilter')?.value;
  const endDate = document.getElementById('endDateFilter')?.value;

  let filtered = state.transactions.filter(t => {
    const matchesSearch = !search ||
      (t.title && t.title.toLowerCase().includes(search)) ||
      (t.description && t.description.toLowerCase().includes(search)) ||
      (t.category && t.category.toLowerCase().includes(search));

    const matchesCat = catFilter === 'All' || (t.category && t.category.toLowerCase() === catFilter.toLowerCase());
    const matchesType = typeFilter === 'All' || t.type === typeFilter;

    let matchesDate = true;
    if (startDate) {
      const itemDate = new Date(t.date || t.createdAt).setHours(0, 0, 0, 0);
      const start = new Date(startDate).setHours(0, 0, 0, 0);
      if (itemDate < start) matchesDate = false;
    }
    if (endDate) {
      const itemDate = new Date(t.date || t.createdAt).setHours(23, 59, 59, 999);
      const end = new Date(endDate).setHours(23, 59, 59, 999);
      if (itemDate > end) matchesDate = false;
    }

    return matchesSearch && matchesCat && matchesType && matchesDate;
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

// Category Donut Chart (Canvas with High-DPI Support)
function renderDonutChart() {
  const canvas = document.getElementById('categoryDonutChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const legend = document.getElementById('categoryLegend');

  const dpr = window.devicePixelRatio || 1;
  const width = 280;
  const height = 280;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  if (ctx.setTransform) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  } else {
    ctx.scale(dpr, dpr);
  }

  const categoryTotals = {};
  let totalExpense = 0;

  state.transactions.filter(t => t.type === 'expense').forEach(t => {
    const cat = t.category || 'Other';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(t.amount);
    totalExpense += Number(t.amount);
  });

  const categories = Object.keys(categoryTotals);
  legend.innerHTML = '';

  ctx.clearRect(0, 0, width, height);

  if (totalExpense === 0 || categories.length === 0) {
    ctx.font = '14px Plus Jakarta Sans';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText('No Expense Records', width / 2, height / 2);
    legend.innerHTML = '<span class="subtext">Add expenses to view breakdown</span>';
    return;
  }

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 95;
  const innerRadius = 60;

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
  ctx.font = 'bold 15px Plus Jakarta Sans';
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

// Modal Handlers (Add Income or Expense Entity)
function openTransactionModal(defaultType = 'expense') {
  const isIncome = defaultType === 'income';
  const modalTitle = document.getElementById('modalTitle');
  if (modalTitle) {
    modalTitle.innerText = isIncome ? 'Record New Income (Inflow)' : 'Create New Expense (Outflow)';
  }
  const form = document.getElementById('transactionForm');
  if (form) form.reset();

  const txIdEl = document.getElementById('txId');
  if (txIdEl) txIdEl.value = '';

  const targetRadio = document.querySelector(`input[name="txType"][value="${isIncome ? 'income' : 'expense'}"]`);
  if (targetRadio) targetRadio.checked = true;

  updateCategoryOptions();
  setTodayDateInput();

  const modalOverlay = document.getElementById('transactionModalOverlay');
  if (modalOverlay) {
    modalOverlay.classList.add('active');
  }

  setTimeout(() => {
    const titleInput = document.getElementById('txTitle');
    if (titleInput) titleInput.focus();
  }, 60);
}

function openEditModal(id) {
  const item = state.transactions.find(t => t._id === id);
  if (!item) return;

  const isIncome = item.type === 'income';
  const modalTitle = document.getElementById('modalTitle');
  if (modalTitle) {
    modalTitle.innerText = isIncome ? 'Edit Income Transaction' : 'Edit Expense Transaction';
  }

  document.getElementById('txId').value = item._id;
  document.getElementById('txTitle').value = item.title;
  document.getElementById('txAmount').value = item.amount;

  const typeRadio = document.querySelector(`input[name="txType"][value="${item.type || 'expense'}"]`);
  if (typeRadio) typeRadio.checked = true;
  updateCategoryOptions();

  document.getElementById('txCategory').value = item.category;
  document.getElementById('txDate').value = (item.date || item.createdAt || '').split('T')[0];
  document.getElementById('txDescription').value = item.description || '';

  const modalOverlay = document.getElementById('transactionModalOverlay');
  if (modalOverlay) {
    modalOverlay.classList.add('active');
  }
}

function closeTransactionModal() {
  const modalOverlay = document.getElementById('transactionModalOverlay');
  if (modalOverlay) {
    modalOverlay.classList.remove('active');
    modalOverlay.style.display = '';
  }
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

// Handle Form Submission (Create or Update with Full Validation)
async function handleTransactionSubmit(event) {
  event.preventDefault();

  const id = document.getElementById('txId').value;
  const title = document.getElementById('txTitle').value.trim();
  const amount = parseFloat(document.getElementById('txAmount').value);
  const category = document.getElementById('txCategory').value;
  const type = document.querySelector('input[name="txType"]:checked').value;
  const date = document.getElementById('txDate').value;
  const description = document.getElementById('txDescription').value.trim();

  // Strict Client-Side Validation
  if (!title || title.length < 2) {
    showToast('Validation Error: Title must be at least 2 characters', 'error');
    return;
  }
  if (isNaN(amount) || amount <= 0) {
    showToast('Validation Error: Amount must be a positive number greater than 0', 'error');
    return;
  }
  if (!category) {
    showToast('Validation Error: Please select a category', 'error');
    return;
  }

  const payload = { title, amount, category, type, date: date || new Date().toISOString(), description };

  // Demo Sandbox Mode Execution (Database-Free)
  if (state.isDemoMode) {
    if (id) {
      const idx = state.transactions.findIndex(t => t._id === id);
      if (idx !== -1) {
        state.transactions[idx] = { ...state.transactions[idx], ...payload };
        showToast('✓ Transaction updated (Demo Sandbox)', 'success');
      }
    } else {
      const newEntry = {
        _id: 'demo_tx_' + Date.now(),
        ...payload,
        createdAt: new Date().toISOString()
      };
      state.transactions.unshift(newEntry);
      showToast('✓ New transaction recorded (Demo Sandbox)', 'success');
    }

    localStorage.setItem('expense_tracker_demo_txs', JSON.stringify(state.transactions));
    updateMetrics();
    renderLedgerTable();
    renderCharts();
    renderAnalyticsView();
    renderBudgetPlanner();
    calculateEmergencyFund();
    closeTransactionModal();
    return;
  }

  // If user is not authenticated: save into active ledger and preserve for cloud sync
  if (!state.jwtToken) {
    state.pendingTransaction = payload;
    if (id) {
      const idx = state.transactions.findIndex(t => t._id === id);
      if (idx !== -1) {
        state.transactions[idx] = { ...state.transactions[idx], ...payload };
        showToast('✓ Transaction updated in local ledger', 'success');
      }
    } else {
      const newEntry = {
        _id: 'tx_guest_' + Date.now(),
        ...payload,
        createdAt: new Date().toISOString()
      };
      state.transactions.unshift(newEntry);
      showToast(`✓ "${payload.title}" recorded! (Sign in anytime to sync to backend database)`, 'success');
    }

    localStorage.setItem('expense_tracker_txs', JSON.stringify(state.transactions));
    updateMetrics();
    renderLedgerTable();
    renderCharts();
    renderAnalyticsView();
    renderBudgetPlanner();
    calculateEmergencyFund();
    closeTransactionModal();
    return;
  }

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
        showToast('Transaction updated successfully in database', 'success');
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

  // Demo Sandbox Mode Deletion (Database-Free)
  if (state.isDemoMode) {
    state.transactions = state.transactions.filter(t => t._id !== id);
    localStorage.setItem('expense_tracker_demo_txs', JSON.stringify(state.transactions));
    updateMetrics();
    renderLedgerTable();
    renderCharts();
    renderAnalyticsView();
    renderBudgetPlanner();
    calculateEmergencyFund();
    showToast('Record deleted from Demo Sandbox', 'info');
    return;
  }

  if (state.backendConnected && state.jwtToken) {
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
      console.warn('Backend delete failed, removing locally:', e);
    }
  }

  state.transactions = state.transactions.filter(t => t._id !== id);
  localStorage.setItem('expense_tracker_txs', JSON.stringify(state.transactions));
  updateMetrics();
  renderLedgerTable();
  renderCharts();
  renderAnalyticsView();
  renderBudgetPlanner();
  calculateEmergencyFund();
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
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = '';
  }
}

// Handle Saving Budget Caps (MongoDB & Local Storage)
async function handleSaveBudgetConfig(event) {
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

  if (state.isDemoMode) {
    state.budgets = updatedBudgets;
    localStorage.setItem('expense_tracker_demo_budgets', JSON.stringify(state.budgets));
    renderBudgetPlanner();
    closeBudgetConfigModal();
    showToast('Category budget limits saved to Demo Sandbox', 'success');
    return;
  }

  if (state.backendConnected && state.jwtToken) {
    try {
      const res = await fetch(`${state.apiBase}/budgets`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.jwtToken}`
        },
        body: JSON.stringify({ budgets: updatedBudgets })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save budget settings');
      }
      state.budgets = updatedBudgets;
      localStorage.setItem('expense_tracker_budgets', JSON.stringify(state.budgets));
      renderBudgetPlanner();
      closeBudgetConfigModal();
      showToast('Category budget limits saved to MongoDB Atlas!', 'success');
      return;
    } catch (err) {
      showToast(err.message || 'Failed to persist budgets', 'error');
      return;
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


// ========================================================
// WEEK 9: SUBSCRIPTIONS & RECURRING BILLS ENGINE
// ========================================================

function renderSubscriptions() {
  const container = document.getElementById('subscriptionsContainer');
  const totalMonthlyEl = document.getElementById('subTotalMonthly');
  if (!container) return;

  let totalMonthly = 0;
  state.subscriptions.forEach(s => {
    const amt = Number(s.amount) || 0;
    if (s.cycle === 'Monthly') totalMonthly += amt;
    else if (s.cycle === 'Yearly') totalMonthly += amt / 12;
    else if (s.cycle === 'Weekly') totalMonthly += amt * 4.33;
  });

  if (totalMonthlyEl) {
    totalMonthlyEl.innerText = `${formatCurrency(Math.round(totalMonthly))} / mo`;
  }

  if (state.subscriptions.length === 0) {
    container.innerHTML = `
      <div style="padding: 24px 10px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
        No recurring subscriptions tracked.<br>Click <strong>+ Add Bill</strong> to schedule fixed outflows.
      </div>
    `;
    return;
  }

  container.innerHTML = state.subscriptions.map(sub => {
    const subId = sub._id || sub.id;
    return `
      <div class="subscription-item">
        <div class="sub-info">
          <span class="sub-name">${escapeHTML(sub.name)}</span>
          <div class="sub-meta">
            <span class="sub-badge">${escapeHTML(sub.category)}</span>
            <span title="Due day ${sub.dueDay} (${escapeHTML(sub.cycle || 'Monthly')})">• Due day ${sub.dueDay}</span>
          </div>
        </div>
        <div class="sub-actions">
          <span class="sub-amount">${formatCurrency(sub.amount)}</span>
          <button class="btn-log-sub" onclick="logSubscriptionToLedger('${subId}')" title="Record this subscription into ledger now">Log</button>
          <button class="btn-del-sub" onclick="deleteSubscription('${subId}')" title="Delete subscription">✕</button>
        </div>
      </div>
    `;
  }).join('');
}

function openAddSubscriptionModal() {
  const modal = document.getElementById('subscriptionModal');
  if (modal) modal.classList.add('active');
}

function closeAddSubscriptionModal() {
  const modal = document.getElementById('subscriptionModal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = '';
  }
  const form = document.getElementById('subscriptionForm');
  if (form) form.reset();
}

async function handleAddSubscription(e) {
  e.preventDefault();
  const name = document.getElementById('subName').value.trim();
  const amount = parseFloat(document.getElementById('subAmount').value);
  const category = document.getElementById('subCategory').value;
  const cycle = document.getElementById('subCycle').value;
  const dueDay = parseInt(document.getElementById('subDueDay').value, 10);

  if (!name || isNaN(amount) || amount <= 0) {
    showToast('Please enter a valid subscription name and amount', 'error');
    return;
  }

  const payload = {
    name,
    amount,
    category,
    cycle,
    dueDay: dueDay || 15
  };

  if (state.isDemoMode) {
    const newSub = {
      id: `sub_${Date.now()}`,
      ...payload
    };
    state.subscriptions.push(newSub);
    localStorage.setItem('expense_tracker_demo_subs', JSON.stringify(state.subscriptions));
    renderSubscriptions();
    closeAddSubscriptionModal();
    showToast(`Subscription "${name}" added to Demo Sandbox!`, 'success');
    return;
  }

  if (state.backendConnected && state.jwtToken) {
    try {
      const res = await fetch(`${state.apiBase}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.jwtToken}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save subscription');
      }
      state.subscriptions.push(data.data);
      renderSubscriptions();
      closeAddSubscriptionModal();
      showToast(`Subscription "${name}" saved to MongoDB Atlas!`, 'success');
      return;
    } catch (err) {
      showToast(err.message || 'Failed to create subscription', 'error');
      return;
    }
  }

  const newSub = {
    id: `sub_${Date.now()}`,
    ...payload
  };

  state.subscriptions.push(newSub);
  localStorage.setItem('expense_tracker_subscriptions', JSON.stringify(state.subscriptions));
  renderSubscriptions();
  closeAddSubscriptionModal();
  showToast(`Subscription "${name}" added to recurring tracker!`, 'success');
}

async function deleteSubscription(id) {
  if (!confirm('Are you sure you want to remove this recurring bill?')) return;

  if (state.isDemoMode) {
    state.subscriptions = state.subscriptions.filter(s => (s._id || s.id) !== id);
    localStorage.setItem('expense_tracker_demo_subs', JSON.stringify(state.subscriptions));
    renderSubscriptions();
    showToast('Subscription removed from Demo Sandbox', 'info');
    return;
  }

  if (state.backendConnected && state.jwtToken) {
    try {
      const res = await fetch(`${state.apiBase}/subscriptions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${state.jwtToken}`
        }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete subscription');
      }
      state.subscriptions = state.subscriptions.filter(s => (s._id || s.id) !== id);
      renderSubscriptions();
      showToast('Subscription deleted from database', 'success');
      return;
    } catch (err) {
      showToast(err.message || 'Failed to delete subscription', 'error');
      return;
    }
  }

  state.subscriptions = state.subscriptions.filter(s => (s._id || s.id) !== id);
  localStorage.setItem('expense_tracker_subscriptions', JSON.stringify(state.subscriptions));
  renderSubscriptions();
  showToast('Subscription removed from tracker', 'info');
}

async function logSubscriptionToLedger(id) {
  const sub = state.subscriptions.find(s => (s._id || s.id) === id);
  if (!sub) return;

  const payload = {
    title: sub.name,
    amount: sub.amount,
    category: sub.category,
    type: 'expense',
    description: `Recurring ${sub.cycle} subscription renewal`,
    date: new Date().toISOString()
  };

  if (state.backendConnected && state.jwtToken) {
    try {
      const res = await fetch(`${state.apiBase}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.jwtToken}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to log subscription to server');
      }
      showToast(`Logged "${sub.name}" (${formatCurrency(sub.amount)}) to MongoDB Ledger!`, 'success');
      await loadTransactions();
    } catch (err) {
      showToast(err.message, 'error');
    }
  } else {
    // Sandbox
    payload._id = `tx_sub_${Date.now()}`;
    payload.createdAt = new Date().toISOString();
    state.transactions.unshift(payload);
    localStorage.setItem('expense_tracker_txs', JSON.stringify(state.transactions));
    updateMetrics();
    renderLedgerTable();
    renderCharts();
    renderAnalyticsView();
    renderBudgetPlanner();
    showToast(`Logged "${sub.name}" (${formatCurrency(sub.amount)}) to Local Sandbox!`, 'success');
  }
}

function clearDateFilter() {
  const start = document.getElementById('startDateFilter');
  const end = document.getElementById('endDateFilter');
  if (start) start.value = '';
  if (end) end.value = '';
  renderLedgerTable();
  showToast('Date range filter cleared', 'info');
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

// Explicit Global Window Bindings (Ensures 100% Reliability for Inline Handlers)
if (typeof window !== 'undefined') {
  window.openTransactionModal = openTransactionModal;
  window.closeTransactionModal = closeTransactionModal;
  window.openEditModal = openEditModal;
  window.deleteTransaction = deleteTransaction;
  window.handleTransactionSubmit = handleTransactionSubmit;
  window.openAddSubscriptionModal = openAddSubscriptionModal;
  window.closeAddSubscriptionModal = closeAddSubscriptionModal;
  window.handleAddSubscription = handleAddSubscription;
  window.deleteSubscription = deleteSubscription;
  window.logSubscriptionToLedger = logSubscriptionToLedger;
  window.openBudgetConfigModal = openBudgetConfigModal;
  window.closeBudgetConfigModal = closeBudgetConfigModal;
  window.handleSaveBudgetConfig = handleSaveBudgetConfig;
  window.exportTransactionsCSV = exportTransactionsCSV;
  window.printFinancialStatement = printFinancialStatement;
  window.clearDateFilter = clearDateFilter;
  window.handleSearchFilter = handleSearchFilter;
  window.openAuthModal = openAuthModal;
  window.closeAuthModal = closeAuthModal;
  window.switchAuthTab = switchAuthTab;
  window.quickDemoLogin = quickDemoLogin;
  window.fillDemoCredentials = fillDemoCredentials;
  window.handleLogin = handleLogin;
  window.handleRegister = handleRegister;
  window.logoutUser = logoutUser;
  window.launchDemoMode = launchDemoMode;
  window.resetDemoData = resetDemoData;
  window.toggleUserProfileModal = toggleUserProfileModal;
  window.copyJwtToClipboard = copyJwtToClipboard;
  window.changeCurrency = changeCurrency;
  window.cycleTheme = cycleTheme;
  window.calculateEMI = calculateEMI;
  window.calculateSIP = calculateSIP;
  window.calculateEmergencyFund = calculateEmergencyFund;
  window.calculateTax = calculateTax;
  window.navigateToTab = navigateToTab;
}

