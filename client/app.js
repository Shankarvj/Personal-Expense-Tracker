/**
 * Expense Tracker - Interactive Core Application
 * Full-Stack Financial Intelligence & Milestone Progression Studio
 * Author: Shankar G
 */

// Application State
const state = {
  activeTab: 'trackerTab',
  activeMilestone: 1,
  activeDoc: 'doc-milestones',
  backendConnected: false,
  apiBase: window.location.origin.includes('localhost:5000') 
    ? 'http://localhost:5000/api' 
    : 'http://localhost:5000/api',
  currentUser: {
    id: '673f8e91a03e1b0021c3b12a',
    name: 'Shankar G',
    email: 'shankar007139@fsd.college.edu',
    role: 'Lead Developer'
  },
  jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3M2Y4ZTkxYTAzZTFiMDAyMWMzYjEyYSIsImVtYWlsIjoic2hhbmthcjAwNzEzOUBmc2QuY29sbGVnZS5lZHUiaWF0IjoxNzMyNzgwMDAwLCJleHAiOjE3MzMzODQ4MDB9.D2s8V5q3N_K1l_0x9P-Z7mU2w8Y',
  transactions: [],
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
    'Other': '#64748b'
  }
};

// Initial Seed Data (Loaded if database is empty or local sandbox is active)
const defaultTransactions = [
  {
    _id: 'tx_seed_01',
    title: 'Monthly Salary Credit',
    amount: 75000,
    category: 'Salary',
    type: 'income',
    date: '2026-09-01',
    description: 'Corporate payroll direct deposit'
  },
  {
    _id: 'tx_seed_02',
    title: 'Apartment Lease Rent',
    amount: 18000,
    category: 'Housing',
    type: 'expense',
    date: '2026-09-02',
    description: 'Monthly flat rent payment'
  },
  {
    _id: 'tx_seed_03',
    title: 'Supermarket Groceries',
    amount: 4250,
    category: 'Food',
    type: 'expense',
    date: '2026-09-05',
    description: 'Fresh organic produce & pantry staples'
  },
  {
    _id: 'tx_seed_04',
    title: 'High-speed Fiber Broadband',
    amount: 1299,
    category: 'Utilities',
    type: 'expense',
    date: '2026-09-08',
    description: 'Monthly 500Mbps optical fiber bill'
  },
  {
    _id: 'tx_seed_05',
    title: 'Fuel & Metro Transit Reload',
    amount: 2800,
    category: 'Travel',
    type: 'expense',
    date: '2026-09-12',
    description: 'Commute petrol and rapid transit card'
  },
  {
    _id: 'tx_seed_06',
    title: 'Freelance Web Design Milestone',
    amount: 22500,
    category: 'Freelance',
    type: 'income',
    date: '2026-09-15',
    description: 'UI/UX design delivery for client portal'
  },
  {
    _id: 'tx_seed_07',
    title: 'Gourmet Dining & Bistro',
    amount: 3100,
    category: 'Food',
    type: 'expense',
    date: '2026-09-19',
    description: 'Evening dinner with engineering peers'
  },
  {
    _id: 'tx_seed_08',
    title: 'Health Checkup & Pharmacy',
    amount: 1600,
    category: 'Healthcare',
    type: 'expense',
    date: '2026-09-22',
    description: 'Routine wellness consultation and supplements'
  },
  {
    _id: 'tx_seed_09',
    title: 'Cloud Certification Exam',
    amount: 4500,
    category: 'Education',
    type: 'expense',
    date: '2026-09-25',
    description: 'Professional cloud architecture voucher'
  },
  {
    _id: 'tx_seed_10',
    title: 'Cinema & Streaming Pass',
    amount: 1150,
    category: 'Entertainment',
    type: 'expense',
    date: '2026-09-27',
    description: 'IMAX tickets and digital subscriptions'
  }
];

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  setupNavigation();
  updateCategoryOptions();
  setTodayDateInput();
  initLocalStorage();
  await checkBackendStatus();
  await loadTransactions();
  renderMilestoneViews();
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
      document.getElementById(targetId).classList.add('active');
      state.activeTab = targetId;

      if (targetId === 'trackerTab') {
        renderLedgerTable();
        renderCharts();
      }
    });
  });
}

// Initial Local Storage setup
function initLocalStorage() {
  const stored = localStorage.getItem('expense_tracker_txs');
  if (!stored) {
    localStorage.setItem('expense_tracker_txs', JSON.stringify(defaultTransactions));
    state.transactions = [...defaultTransactions];
  } else {
    try {
      state.transactions = JSON.parse(stored);
    } catch (e) {
      state.transactions = [...defaultTransactions];
    }
  }
  document.getElementById('activeJwtTextarea').value = state.jwtToken;
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
    statusText.innerText = 'Interactive Sandbox';
  }
}

// Load Transactions (Backend or Sandbox)
async function loadTransactions() {
  if (state.backendConnected) {
    try {
      const res = await fetch(`${state.apiBase}/expenses`, {
        headers: {
          'Authorization': `Bearer ${state.jwtToken}`
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          state.transactions = json.data;
        } else {
          // If Atlas DB is currently empty, seed from defaultTransactions
          for (const item of defaultTransactions) {
            await fetch(`${state.apiBase}/expenses`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.jwtToken}`
              },
              body: JSON.stringify(item)
            });
          }
          const seededRes = await fetch(`${state.apiBase}/expenses`);
          const seededJson = await seededRes.json();
          state.transactions = seededJson.data || defaultTransactions;
        }
      }
    } catch (e) {
      console.warn('Backend fetch failed, using local state:', e);
    }
  }

  updateMetrics();
  renderLedgerTable();
  renderCharts();
  runQueryBuilderTest();
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

  const payload = { title, amount, category, type, date, description };

  if (state.backendConnected) {
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
        if (!res.ok) throw new Error('Update failed');
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
        if (!res.ok) throw new Error('Create failed');
        showToast('New entry recorded in ledger', 'success');
      }
      await loadTransactions();
      closeTransactionModal();
      return;
    } catch (e) {
      console.warn('API error, falling back to local store:', e);
    }
  }

  // Local fallback mutation
  if (id) {
    const idx = state.transactions.findIndex(t => t._id === id);
    if (idx !== -1) {
      state.transactions[idx] = { ...state.transactions[idx], ...payload };
      showToast('Transaction updated (Local)', 'success');
    }
  } else {
    const newEntry = {
      _id: 'tx_local_' + Date.now(),
      ...payload,
      createdAt: new Date().toISOString()
    };
    state.transactions.unshift(newEntry);
    showToast('New transaction created (Local)', 'success');
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
      }
    } catch (e) {
      console.warn('Backend delete failed, falling back to local:', e);
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

// User Profile / Auth Modal
function toggleUserAuthModal() {
  const modal = document.getElementById('userAuthModal');
  modal.classList.toggle('active');
}

function loginDemoAccount() {
  regenerateJwtDemo();
  showToast('JWT Token refreshed', 'success');
}

// ========================================================
// MILESTONE PROGRESSION STUDIO LAB ENGINE
// ========================================================

function switchMilestone(stepNum) {
  state.activeMilestone = stepNum;

  // Update Stepper buttons
  document.querySelectorAll('.step-btn').forEach(btn => {
    btn.classList.remove('active');
    if (parseInt(btn.getAttribute('data-step')) === stepNum) {
      btn.classList.add('active');
    }
  });

  // Update Panels
  document.querySelectorAll('.milestone-panel').forEach(panel => {
    panel.classList.remove('active');
  });
  const targetPanel = document.getElementById(`milestonePanel-${stepNum}`);
  if (targetPanel) targetPanel.classList.add('active');
}

function renderMilestoneViews() {
  updateApiPresetPayload();
  simulateBcryptHash();
  runQueryBuilderTest();
}

// --- MILESTONE 2: LIVE EVENT LOOP SIMULATOR ---
let elSimTimer = null;
function resetEventLoopSimulation() {
  if (elSimTimer) clearTimeout(elSimTimer);
  document.getElementById('elCallStack').innerHTML = '<div class="el-placeholder">Idle</div>';
  document.getElementById('elMicrotask').innerHTML = '<div class="el-placeholder">Empty</div>';
  document.getElementById('elMacrotask').innerHTML = '<div class="el-placeholder">Empty</div>';
  document.getElementById('elConsole').innerHTML = '<div class="console-line text-muted">> Reset complete. Click Run to simulate...</div>';
  document.getElementById('elExplanation').innerHTML = 'Event Loop reset to baseline state.';
}

function runEventLoopSimulation() {
  resetEventLoopSimulation();
  const callStack = document.getElementById('elCallStack');
  const microtask = document.getElementById('elMicrotask');
  const macrotask = document.getElementById('elMacrotask');
  const term = document.getElementById('elConsole');
  const exp = document.getElementById('elExplanation');

  term.innerHTML = '<div class="console-line text-muted">> Executing eventloop.js...</div>';

  // Step 1: console.log("1. Start")
  callStack.innerHTML = '<div class="el-token">console.log("1. Start")</div>';
  exp.innerText = 'Step 1: Synchronous instruction pushed to Call Stack.';

  setTimeout(() => {
    term.innerHTML += '<div class="console-line">1. Start</div>';
    callStack.innerHTML = '<div class="el-placeholder">Call Stack Empty</div>';

    // Step 2: setTimeout(..., 0)
    setTimeout(() => {
      callStack.innerHTML = '<div class="el-token">setTimeout(..., 0)</div>';
      exp.innerText = 'Step 2: setTimeout registered in Timer Web API → pushed to Macrotask Queue.';

      setTimeout(() => {
        callStack.innerHTML = '<div class="el-placeholder">Call Stack Empty</div>';
        macrotask.innerHTML = '<div class="el-token macro">Timeout Callback [Macrotask]</div>';

        // Step 3: Promise.resolve().then(...)
        setTimeout(() => {
          callStack.innerHTML = '<div class="el-token">Promise.resolve().then(...)</div>';
          exp.innerText = 'Step 3: Promise callback queued into Microtask Queue.';

          setTimeout(() => {
            callStack.innerHTML = '<div class="el-placeholder">Call Stack Empty</div>';
            microtask.innerHTML = '<div class="el-token micro">Promise Callback [Microtask]</div>';

            // Step 4: console.log("2. End")
            setTimeout(() => {
              callStack.innerHTML = '<div class="el-token">console.log("2. End")</div>';
              exp.innerText = 'Step 4: Synchronous console.log("2. End") executes in Call Stack.';

              setTimeout(() => {
                term.innerHTML += '<div class="console-line">2. End</div>';
                callStack.innerHTML = '<div class="el-placeholder">Idle</div>';

                // Step 5: Event loop resolves Microtasks first!
                setTimeout(() => {
                  exp.innerText = 'Step 5: Call Stack emptied! Event Loop immediately drains Microtask Queue (Promises prioritized).';
                  callStack.innerHTML = '<div class="el-token micro">Promise Callback</div>';
                  microtask.innerHTML = '<div class="el-placeholder">Drained</div>';

                  setTimeout(() => {
                    term.innerHTML += '<div class="console-line">3. Promise Callback</div>';
                    callStack.innerHTML = '<div class="el-placeholder">Idle</div>';

                    // Step 6: Event loop processes Macrotasks (Timers phase)
                    setTimeout(() => {
                      exp.innerText = 'Step 6: Event Loop advances to Timer Phase → executes Macrotask Queue.';
                      callStack.innerHTML = '<div class="el-token macro">Timeout Callback</div>';
                      macrotask.innerHTML = '<div class="el-placeholder">Drained</div>';

                      setTimeout(() => {
                        term.innerHTML += '<div class="console-line">4. Timeout Callback</div>';
                        callStack.innerHTML = '<div class="el-placeholder">Idle</div>';
                        term.innerHTML += '<div class="console-line text-muted">> [Process Completed with Code 0]</div>';
                        exp.innerHTML = '<strong>Verified Execution Order:</strong> <code>1. Start → 2. End → 3. Promise Callback → 4. Timeout Callback</code>. Demonstrates Microtask prioritization over Timers!';
                      }, 800);
                    }, 800);
                  }, 800);
                }, 900);
              }, 700);
            }, 700);
          }, 700);
        }, 700);
      }, 700);
    }, 700);
  }, 700);
}

// --- MILESTONE 3: REST API SANDBOX ---
function updateApiPresetPayload() {
  const method = document.getElementById('apiMethodSelect').value;
  const endpoint = document.getElementById('apiEndpointSelect').value;
  const payloadGroup = document.getElementById('apiPayloadGroup');
  const payloadText = document.getElementById('apiPayloadText');

  if (method === 'POST' || method === 'PUT') {
    payloadGroup.style.display = 'block';
    if (endpoint === '/api/expenses') {
      payloadText.value = JSON.stringify({
        title: 'Cloud Hosting Subscription',
        amount: 899,
        category: 'Utilities',
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        description: 'Monthly VPS cloud server fee'
      }, null, 2);
    } else {
      payloadText.value = JSON.stringify({
        email: 'shankar@example.com',
        password: 'SecurePassword123'
      }, null, 2);
    }
  } else {
    payloadGroup.style.display = 'none';
  }
}

async function sendApiConsoleRequest() {
  const method = document.getElementById('apiMethodSelect').value;
  const endpoint = document.getElementById('apiEndpointSelect').value;
  const payloadText = document.getElementById('apiPayloadText').value;
  const inspector = document.getElementById('apiResponseInspector');
  const statusBadge = document.getElementById('apiStatusBadge');
  const latencyBadge = document.getElementById('apiLatencyBadge');

  inspector.innerText = '// Sending request to backend...';
  const startTime = performance.now();

  try {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.jwtToken}`
      }
    };

    if ((method === 'POST' || method === 'PUT') && payloadText) {
      options.body = payloadText;
    }

    const res = await fetch(`${state.apiBase}${endpoint.replace('/api', '')}`, options);
    const endTime = performance.now();
    const latency = Math.round(endTime - startTime);

    statusBadge.innerText = `${res.status} ${res.statusText}`;
    statusBadge.className = res.ok ? 'badge primary' : 'badge';
    latencyBadge.innerText = `${latency}ms`;

    const data = await res.json();
    inspector.innerText = JSON.stringify(data, null, 2);
  } catch (err) {
    const latency = Math.round(performance.now() - startTime);
    statusBadge.innerText = 'Sandbox Mock 200';
    statusBadge.className = 'badge primary';
    latencyBadge.innerText = `${latency}ms`;

    // Simulated response if offline
    let mockResp = { success: true, timestamp: new Date().toISOString(), simulated: true };
    if (endpoint.includes('summary')) {
      mockResp.summary = {
        totalIncome: 97500,
        totalExpense: 33799,
        balance: 63701,
        savingsRate: 65.3
      };
    } else if (endpoint.includes('health')) {
      mockResp.status = 'operational';
      mockResp.database = 'Connected (Sandbox)';
    } else {
      mockResp.count = state.transactions.length;
      mockResp.data = state.transactions.slice(0, 3);
    }
    inspector.innerText = JSON.stringify(mockResp, null, 2);
  }
}

// --- MILESTONE 4: MIDDLEWARE INTERCEPTION SIMULATOR ---
function simulateMiddlewareFlow(scenario) {
  const nodeReq = document.getElementById('nodeRequest');
  const nodeLog = document.getElementById('nodeLogger');
  const nodeAuth = document.getElementById('nodeAuth');
  const nodeCtrl = document.getElementById('nodeController');
  const nodeErr = document.getElementById('nodeError');
  const nodeRes = document.getElementById('nodeResponse');
  const statusSub = document.getElementById('nodeResponseStatus');
  const exp = document.getElementById('pipelineExplanation');

  // Reset node classes
  [nodeReq, nodeLog, nodeAuth, nodeCtrl, nodeErr, nodeRes].forEach(n => {
    n.classList.remove('active-pass', 'active-fail');
  });

  if (scenario === 'success') {
    nodeReq.classList.add('active-pass');
    nodeLog.classList.add('active-pass');
    nodeAuth.classList.add('active-pass');
    nodeCtrl.classList.add('active-pass');
    nodeRes.classList.add('active-pass');
    statusSub.innerText = '200 OK JSON';
    exp.innerHTML = '<strong>Standard Request Flow:</strong> <code>loggerMiddleware</code> logs HTTP hit → <code>authMiddleware</code> verifies Bearer JWT → <code>expenseController</code> handles query → dispatches HTTP 200 OK.';
  } else if (scenario === 'no_token') {
    nodeReq.classList.add('active-pass');
    nodeLog.classList.add('active-pass');
    nodeAuth.classList.add('active-fail');
    nodeRes.classList.add('active-fail');
    statusSub.innerText = '401 Unauthorized';
    exp.innerHTML = '<strong>Authentication Guard Interception:</strong> Missing Bearer token in <code>Authorization</code> header! <code>authMiddleware</code> immediately short-circuits execution and returns <code>401 Unauthorized</code>.';
  } else if (scenario === 'validation_error') {
    nodeReq.classList.add('active-pass');
    nodeLog.classList.add('active-pass');
    nodeAuth.classList.add('active-pass');
    nodeCtrl.classList.add('active-fail');
    nodeRes.classList.add('active-fail');
    statusSub.innerText = '400 Bad Request';
    exp.innerHTML = '<strong>Validation Error:</strong> Missing required fields (title, amount, or category). Controller stops pipeline and returns <code>400 Bad Request</code>.';
  } else if (scenario === 'server_crash') {
    nodeReq.classList.add('active-pass');
    nodeLog.classList.add('active-pass');
    nodeAuth.classList.add('active-pass');
    nodeCtrl.classList.add('active-fail');
    nodeErr.classList.add('active-fail');
    nodeRes.classList.add('active-fail');
    statusSub.innerText = '500 Internal Error';
    exp.innerHTML = '<strong>Centralized Error Interceptor:</strong> Unexpected database or runtime exception triggered! Caught by <code>errorMiddleware.js</code>, stack trace logged to console, and uniform 500 JSON dispatched without crashing Node process.';
  }
}

// --- MILESTONE 5: DATABASE SCHEMA & BSON GENERATOR ---
function generateSampleBSON() {
  const inspector = document.getElementById('sampleBSONInspector');
  const sample = {
    _id: "ObjectId('673f" + Math.floor(Math.random() * 1000000000).toString(16) + "')",
    title: "Metro Transit Smart Card",
    amount: 1500,
    category: "Travel",
    type: "expense",
    date: new Date().toISOString(),
    description: "Periodic metro card auto-refill",
    user: "ObjectId('673f8e91a03e1b0021c3b12a')",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    __v: 0
  };
  inspector.innerText = JSON.stringify(sample, null, 2);
}

// --- MILESTONE 6: QUERY BUILDER TEST ---
function runQueryBuilderTest() {
  const cat = document.getElementById('qbCategory').value;
  const type = document.getElementById('qbType').value;
  const sort = document.getElementById('qbSort').value;
  const displayUrl = document.getElementById('synthesizedQueryUrl');
  const tbody = document.getElementById('qbResultsTableBody');

  const params = [];
  if (cat) params.push(`category=${cat}`);
  if (type) params.push(`type=${type}`);
  if (sort) params.push(`sort=${sort}`);

  const queryString = params.length > 0 ? `?${params.join('&')}` : '';
  displayUrl.innerText = `GET /api/expenses${queryString}`;

  // Filter local preview
  let results = state.transactions.filter(t => {
    const matchCat = !cat || (t.category && t.category.toLowerCase() === cat.toLowerCase());
    const matchType = !type || t.type === type;
    return matchCat && matchType;
  });

  results.sort((a, b) => {
    if (sort === 'date_desc') return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt);
    if (sort === 'date_asc') return new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt);
    if (sort === 'amount_desc') return b.amount - a.amount;
    if (sort === 'amount_asc') return a.amount - b.amount;
    return 0;
  });

  tbody.innerHTML = results.slice(0, 4).map(r => `
    <tr>
      <td>${escapeHTML(r.title)}</td>
      <td>${escapeHTML(r.category)}</td>
      <td><span class="badge-type ${r.type}">${r.type}</span></td>
      <td>${formatCurrency(r.amount)}</td>
      <td>${formatDate(r.date || r.createdAt)}</td>
    </tr>
  `).join('');
}

// --- MILESTONE 7: BCRYPT & JWT LAB ---
function simulateBcryptHash() {
  const pwd = document.getElementById('bcryptInput').value || 'SecurePassword123';
  const rounds = document.getElementById('bcryptSaltRounds').value || 10;
  const hashBox = document.getElementById('bcryptHashDisplay');
  const breakdown = document.getElementById('bcryptBreakdown');

  // Pseudo-random salt generator for demonstration
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789./';
  let salt = '';
  for (let i = 0; i < 22; i++) salt += chars.charAt(Math.floor(Math.random() * chars.length));

  let cipher = '';
  for (let i = 0; i < 31; i++) cipher += chars.charAt(Math.floor(Math.random() * chars.length));

  const fullHash = `$2a$${rounds}$${salt}${cipher}`;
  hashBox.innerText = fullHash;

  breakdown.innerHTML = `
    <span class="hb-part hb-algo">$2a$</span>
    <span class="hb-part hb-cost">${rounds}$</span>
    <span class="hb-part hb-salt">${salt}</span>
    <span class="hb-part hb-cipher">${cipher}</span>
  `;

  document.getElementById('bcryptCompareResult').innerText = 'Ready to verify candidate against active hash';
  document.getElementById('bcryptCompareResult').className = 'compare-result';
}

function simulateBcryptCompare() {
  const original = document.getElementById('bcryptInput').value;
  const candidate = document.getElementById('bcryptCompareInput').value;
  const resultBox = document.getElementById('bcryptCompareResult');

  if (original === candidate) {
    resultBox.className = 'compare-result match';
    resultBox.innerHTML = '✔ <code>bcrypt.compare()</code> MATCH! Password hashes correlate correctly.';
  } else {
    resultBox.className = 'compare-result mismatch';
    resultBox.innerHTML = '✖ <code>bcrypt.compare()</code> MISMATCH! Invalid credentials supplied.';
  }
}

function regenerateJwtDemo() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let sig = '';
  for (let i = 0; i < 27; i++) sig += chars.charAt(Math.floor(Math.random() * chars.length));

  const p1 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
  const p2 = btoa(JSON.stringify({
    id: state.currentUser.id,
    email: state.currentUser.email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 604800
  })).replace(/=/g, '');

  state.jwtToken = `${p1}.${p2}.${sig}`;

  document.getElementById('jwtP1').innerText = p1;
  document.getElementById('jwtP2').innerText = p2;
  document.getElementById('jwtP3').innerText = sig;
  document.getElementById('activeBearerCode').innerText = `Authorization: Bearer ${state.jwtToken.substring(0, 24)}...`;
  document.getElementById('activeJwtTextarea').value = state.jwtToken;
}

function copyJwtToClipboard() {
  navigator.clipboard.writeText(state.jwtToken);
  showToast('Bearer token copied to clipboard', 'success');
}

// --- TAB 3: TECHNICAL DOSSIER LOADERS ---
function loadDocSection(sectionId) {
  document.querySelectorAll('.doc-link').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');

  document.querySelectorAll('.doc-content-section').forEach(sec => sec.classList.remove('active'));
  const target = document.getElementById(sectionId);
  if (!target) return;

  if (sectionId === 'doc-requirements' && target.innerHTML.trim() === '') {
    target.innerHTML = `
      <h1>Software Requirements Specification (SRS)</h1>
      <p class="lead">Personal Expense Tracker — Engineering Requirements & Objectives</p>
      <hr class="doc-divider">
      <h3>1. System Objectives</h3>
      <p>Deliver sub-second transaction tracking, multi-parameter querying, and cloud-persisted financial analytics protected by cryptographic identity isolation.</p>
      <h3>2. Functional Requirements</h3>
      <ul>
        <li><strong>FR-01:</strong> User Registration and Bcrypt salted password hashing (10 rounds).</li>
        <li><strong>FR-02:</strong> JWT Token issuance and Bearer authorization middleware.</li>
        <li><strong>FR-03:</strong> Full CRUD API endpoints for expenses and incomes.</li>
        <li><strong>FR-04:</strong> Dynamic query engine supporting category, date range, and text search.</li>
        <li><strong>FR-05:</strong> Aggregated financial calculations for balance, total expense, total income, and savings rate.</li>
      </ul>
      <h3>3. Non-Functional Requirements</h3>
      <ul>
        <li><strong>Performance:</strong> Sub-100ms response time on all standard CRUD endpoints.</li>
        <li><strong>Security:</strong> Secrets decoupled via .env; passwords never stored or returned in plain text.</li>
        <li><strong>Reliability:</strong> MongoDB Atlas cloud cluster replication; centralized error middleware.</li>
      </ul>
    `;
  } else if (sectionId === 'doc-db' && target.innerHTML.trim() === '') {
    target.innerHTML = `
      <h1>Database Design & Schema Architecture</h1>
      <p class="lead">MongoDB Atlas Distributed NoSQL Schema Modeling with Mongoose ODM</p>
      <hr class="doc-divider">
      <h3>Entity Relationship Overview</h3>
      <pre class="json-inspector">
+---------------------+              +-----------------------+
|        USER         |              |        EXPENSE        |
+---------------------+              +-----------------------+
| _id       : ObjectId| 1          * | _id         : ObjectId|
| name      : String  |------------->| title       : String  |
| email     : String  | (1-to-Many)  | amount      : Number  |
| password  : String  |              | category    : String  |
| createdAt : Date    |              | type        : String  |
+---------------------+              | date        : Date    |
                                     | user        : ObjectId|
                                     +-----------------------+
      </pre>
      <h3>Index Optimization</h3>
      <ul>
        <li><code>users.email</code>: Unique B-Tree index for rapid authentication lookups.</li>
        <li><code>expenses.category + date</code>: Compound index to accelerate analytics queries.</li>
      </ul>
    `;
  } else if (sectionId === 'doc-api' && target.innerHTML.trim() === '') {
    target.innerHTML = `
      <h1>RESTful API Specification</h1>
      <p class="lead">Standard HTTP Endpoints, Payload Schemas, and Response Formats</p>
      <hr class="doc-divider">
      <h3>Endpoints Overview</h3>
      <ul>
        <li><code>POST /api/users/register</code> — Register new user account</li>
        <li><code>POST /api/users/login</code> — Authenticate and receive JWT Bearer token</li>
        <li><code>GET /api/users/profile</code> — Retrieve authenticated user profile (Protected)</li>
        <li><code>GET /api/expenses</code> — Query and filter financial records</li>
        <li><code>GET /api/expenses/summary</code> — Aggregate balance, total income, total expense</li>
        <li><code>POST /api/expenses</code> — Create a new financial transaction</li>
        <li><code>PUT /api/expenses/:id</code> — Update an existing transaction</li>
        <li><code>DELETE /api/expenses/:id</code> — Remove a transaction by identifier</li>
      </ul>
    `;
  } else if (sectionId === 'doc-testing' && target.innerHTML.trim() === '') {
    target.innerHTML = `
      <h1>Quality Assurance & Testing Report</h1>
      <p class="lead">Verification Results, Execution Traces, and Security Audits</p>
      <hr class="doc-divider">
      <h3>Test Execution Highlights</h3>
      <ul>
        <li><strong>Event Loop Verification:</strong> <code>eventloop.js</code> executed Call Stack → Microtasks (Promises) → Macrotasks (Timers) in expected sequence.</li>
        <li><strong>Middleware Verification:</strong> Custom logger middleware records all request routes; error interceptor handles uncaught exceptions.</li>
        <li><strong>CRUD Verification:</strong> 201 Created and 200 OK verified across all transactional endpoints.</li>
        <li><strong>Cryptographic Security:</strong> Bcrypt salted hashes verified; JWT signature rejection tested.</li>
      </ul>
    `;
  }

  target.classList.add('active');
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
