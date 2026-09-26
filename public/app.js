// SuperUMKM Client Portal & Interactive Engine
let currentRole = 'UMKM_OWNER_FREE';
let userToken = '';
let currentRecommendations = [];
let activeModalActionTab = 'gmaps-tab';

const roleUsers = {
  UMKM_OWNER_FREE: { id: 'u-free-001', name: 'Budi Santoso', phone: '081234567890', role: 'UMKM_OWNER_FREE', badge: 'free', badgeText: 'UMKM FREE TIER' },
  UMKM_OWNER_PREMIUM: { id: 'u-prem-002', name: 'Siti Rahma', phone: '089876543210', role: 'UMKM_OWNER_PREMIUM', badge: 'premium', badgeText: 'UMKM PREMIUM TIER' },
  CASHIER: { id: 'u-cashier-005', name: 'Dewi (Kasir Toko)', phone: '081122334455', role: 'CASHIER', badge: 'agent', badgeText: 'KASIR TOKO' },
  FIELD_AGENT: { id: 'u-agent-003', name: 'Rian Hidayat (Agen)', phone: '085551234567', role: 'FIELD_AGENT', badge: 'agent', badgeText: 'FIELD CONSULTANT' },
  SUPER_ADMIN: { id: 'u-admin-004', name: 'Super Admin System', phone: '080011223344', role: 'SUPER_ADMIN', badge: 'admin', badgeText: 'SUPER ADMIN' }
};

document.addEventListener('DOMContentLoaded', () => {
  switchRole('UMKM_OWNER_FREE');
  initProductInputs();
});

function initProductInputs() {
  const container = document.getElementById('product-inputs-container');
  if (!container) return;
  container.innerHTML = '';
  addNewProductInput('Minyak Goreng 2L', 'Rp 34.000', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', 'Kemasan hemat & original');
  addNewProductInput('Beras Premium 5kg', 'Rp 72.000', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400', 'Beras putih pulen pilihan');
}

function addNewProductInput(name = '', price = '', img = '', desc = '') {
  const container = document.getElementById('product-inputs-container');
  if (!container) return;

  const itemIndex = container.children.length + 1;
  const row = document.createElement('div');
  row.className = 'product-input-row';
  row.style.cssText = 'background: rgba(0,0,0,0.3); border: 1px dashed rgba(255,255,255,0.15); padding: 0.85rem; border-radius: 10px; margin-bottom: 0.75rem;';
  
  row.innerHTML = `
    <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; color: #60a5fa; margin-bottom: 0.5rem;">
      <span>Produk #${itemIndex}</span>
      ${itemIndex > 1 ? `<span style="color: #f87171; cursor: pointer;" onclick="this.parentElement.parentElement.remove()">✕ Hapus Produk</span>` : ''}
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.5rem;">
      <input type="text" class="form-control prod-name" placeholder="Nama Produk" value="${name}">
      <input type="text" class="form-control prod-price" placeholder="Harga (Contoh: Rp 25.000)" value="${price}">
    </div>
    <div style="margin-bottom: 0.5rem;">
      <label style="font-size: 0.75rem; color: #94a3b8;">📷 Upload Foto Produk dari HP / Galeri:</label>
      <input type="file" accept="image/*" class="form-control" style="margin-top: 0.2rem; font-size: 0.8rem;" onchange="handleProductFileUpload(this)">
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
      <input type="text" class="form-control prod-img" placeholder="URL Foto / Result Data" value="${img}">
      <input type="text" class="form-control prod-desc" placeholder="Deskripsi Singkat" value="${desc}">
    </div>
  `;
  container.appendChild(row);
}

// Handle Direct File Upload for Banner
function handleBannerFileUpload(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const dataUrl = e.target.result;
      document.getElementById('landing-banner').value = dataUrl;
      const preview = document.getElementById('preview-banner-box');
      if (preview) preview.style.backgroundImage = `url('${dataUrl}')`;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

// Handle Direct File Upload for Product Photo
function handleProductFileUpload(input) {
  if (input.files && input.files[0]) {
    const row = input.closest('.product-input-row');
    if (!row) return;
    const urlInput = row.querySelector('.prod-img');
    const reader = new FileReader();
    reader.onload = function (e) {
      const dataUrl = e.target.result;
      if (urlInput) urlInput.value = dataUrl;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function setBannerPreset(url) {
  const input = document.getElementById('landing-banner');
  if (input) input.value = url;
  const preview = document.getElementById('preview-banner-box');
  if (preview) preview.style.backgroundImage = `url('${url}')`;
}

// Role Switcher for Interactive Testing
async function switchRole(roleKey) {
  currentRole = roleKey;
  const user = roleUsers[roleKey];
  
  // Login via API to get JWT Token
  try {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number: user.phone })
    });
    const data = await res.json();
    if (data.success) {
      userToken = data.data.token;
    }
  } catch (err) {
    console.error('Login error:', err);
  }

  // Update Header UI
  document.getElementById('user-display-name').innerText = user.name;
  document.getElementById('user-display-phone').innerText = user.phone;
  
  const badgeEl = document.getElementById('role-badge-display');
  badgeEl.className = `role-badge ${user.badge}`;
  badgeEl.innerText = user.badgeText;

  // Toggle Visibility of System Admin Exclusive Documentation Menu
  const docsMenuEl = document.getElementById('menu-item-docs');
  if (docsMenuEl) {
    if (roleKey === 'SUPER_ADMIN') {
      docsMenuEl.style.display = 'flex';
    } else {
      docsMenuEl.style.display = 'none';
      const docsTabEl = document.getElementById('docs-tab');
      if (docsTabEl && docsTabEl.classList.contains('active')) {
        switchTab('audit-tab');
      }
    }
  }

  // Fetch and Render Dynamic Role-Based Navigation Menu
  await loadDynamicNavigationMenu();

  // Initial load
  handleAuditEvaluateDefault();
  loadTasks();
  loadCourses();
  loadPOSData();
  loadKitStateFromBackend();
}

// Dynamic Navigation Resolver Client Functions
async function loadDynamicNavigationMenu() {
  if (!userToken) return;

  try {
    const res = await fetch('/api/v1/users/navigation-menus', {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    const data = await res.json();
    if (data.success) {
      renderDynamicNavigationSidebar(data.data);
    }
  } catch (err) {
    console.error('loadDynamicNavigationMenu error:', err);
  }
}

let isSidebarCollapsed = false;
let collapsedCategories = {};

function toggleSidebarCollapse() {
  const sidebar = document.querySelector('.sidebar');
  const btn = document.getElementById('sidebar-toggle-btn');
  if (!sidebar) return;

  isSidebarCollapsed = !isSidebarCollapsed;
  sidebar.classList.toggle('collapsed', isSidebarCollapsed);

  if (btn) {
    btn.innerText = isSidebarCollapsed ? '▶' : '◀';
  }
}

function toggleCategoryAccordion(catKey) {
  collapsedCategories[catKey] = !collapsedCategories[catKey];
  const groupEl = document.getElementById(`cat-group-${catKey}`);
  const arrowEl = document.getElementById(`cat-arrow-${catKey}`);
  if (groupEl) {
    groupEl.style.display = collapsedCategories[catKey] ? 'none' : 'block';
  }
  if (arrowEl) {
    arrowEl.innerText = collapsedCategories[catKey] ? '►' : '▼';
  }
}

function renderDynamicNavigationSidebar(resolvedData) {
  const container = document.getElementById('sidebar-menu-container');
  if (!container) return;

  container.innerHTML = '';
  container.style.cssText = 'overflow-y: auto; max-height: calc(100vh - 140px); flex: 1; padding-right: 0.2rem;';

  const activeTabId = document.querySelector('.tab-content.active') ? document.querySelector('.tab-content.active').id : 'audit-tab';

  Object.keys(resolvedData.grouped_menus).forEach(catKey => {
    const catGroup = resolvedData.grouped_menus[catKey];
    const isCollapsed = !!collapsedCategories[catKey];

    const catHeader = document.createElement('div');
    catHeader.className = 'tree-category-header';
    catHeader.style.cssText = 'font-size: 0.7rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin: 0.85rem 0 0.35rem 0.4rem; display: flex; align-items: center; justify-content: space-between; cursor: pointer; user-select: none; padding: 0.25rem 0.4rem; border-radius: 4px; background: rgba(255,255,255,0.03);';
    catHeader.onclick = () => toggleCategoryAccordion(catKey);

    catHeader.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.4rem;" class="cat-header-title">
        <span>${catGroup.icon}</span> <span>${catGroup.title}</span>
      </div>
      <span id="cat-arrow-${catKey}" style="font-size: 0.65rem; color: #64748b;">${isCollapsed ? '►' : '▼'}</span>
    `;
    container.appendChild(catHeader);

    const itemsWrapper = document.createElement('div');
    itemsWrapper.id = `cat-group-${catKey}`;
    itemsWrapper.style.display = isCollapsed ? 'none' : 'block';

    catGroup.items.forEach(item => {
      const a = document.createElement('a');
      a.className = `menu-item ${item.tabId === activeTabId ? 'active' : ''}`;
      if (item.id === 'system_docs_admin' || item.tabId === 'docs-tab') {
        a.id = 'menu-item-docs';
        a.style.cssText = 'background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); font-weight: 700; color: #a5b4fc;';
      }
      a.setAttribute('onclick', `switchTab('${item.tabId}', this)`);

      let badgeHtml = item.badgeLabel ? `<span class="menu-badge" style="font-size: 0.65rem; background: rgba(59, 130, 246, 0.2); color: #60a5fa; padding: 0.15rem 0.4rem; border-radius: 4px; margin-left: auto;">${item.badgeLabel}</span>` : '';

      a.innerHTML = `<span class="menu-icon">${item.icon}</span> <span class="menu-title-text">${item.title}</span> ${badgeHtml}`;
      itemsWrapper.appendChild(a);
    });

    container.appendChild(itemsWrapper);
  });

  // Update Quota Badge in POS Tab if element exists
  const staffQuotaBadge = document.getElementById('staff-quota-badge');
  if (staffQuotaBadge) {
    if (resolvedData.metadata.staff_limit === 1) {
      staffQuotaBadge.innerText = 'Paket GRATIS: Max 1 Kasir';
      staffQuotaBadge.style.cssText = 'font-size: 0.75rem; padding: 0.3rem 0.6rem; border-radius: 9999px; font-weight: 700; background: rgba(234, 179, 8, 0.2); color: #fde047; border: 1px solid rgba(234, 179, 8, 0.3);';
    } else if (resolvedData.metadata.staff_limit === -1) {
      staffQuotaBadge.innerText = 'Paket PREMIUM: Unlimited Kasir';
      staffQuotaBadge.style.cssText = 'font-size: 0.75rem; padding: 0.3rem 0.6rem; border-radius: 9999px; font-weight: 700; background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3);';
    } else {
      staffQuotaBadge.innerText = 'Staf Kasir Mode';
      staffQuotaBadge.style.cssText = 'font-size: 0.75rem; padding: 0.3rem 0.6rem; border-radius: 9999px; font-weight: 700; background: rgba(148, 163, 184, 0.2); color: #cbd5e1;';
    }
  }
}

// Navigation Tabs
function switchTab(tabId, el) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));

  const targetTab = document.getElementById(tabId);
  if (targetTab) {
    targetTab.classList.add('active');
  } else {
    document.getElementById('audit-tab').classList.add('active');
  }

  if (el) {
    el.classList.add('active');
  } else {
    const matchingMenu = Array.from(document.querySelectorAll('.menu-item')).find(item => item.getAttribute('onclick') && item.getAttribute('onclick').includes(tabId));
    if (matchingMenu) matchingMenu.classList.add('active');
  }

  const titles = {
    'audit-tab': { title: 'AI Business Health Audit & Action Center', subtitle: 'Diagnosis otomatis AI kesehatan digital usaha UMKM Anda berbasis siklus CHECK → FIX → GROW' },
    'gmaps-tab': { title: 'Google Maps & AI Review Engine', subtitle: 'Cetak QR Code Review, balasan otomatis AI, dan kupon loyalitas' },
    'landing-tab': { title: 'Mini Website & Toko Online Instan', subtitle: 'Buat katalog web instan dengan tautan WhatsApp, media sosial & upload foto' },
    'pos-tab': { title: 'Mesin Kasir & Integrasi QRIS', subtitle: 'Pencatatan transaksi instan, QRIS dinamis, cetak struk, dan kelola staf kasir toko' },
    'staff-tab': { title: 'Manajemen Staf Kasir & Hak Akses Staf', subtitle: 'Kelola informasi staf kasir, alamat tempat tinggal, PIN login, dan batasi menu yang dapat dibuka.' },
    'cashflow-tab': { title: 'Modul Cashflow & P&L Saku', subtitle: 'Pencatatan pemasukan/pengeluaran harian, omzet bersih & export laporan WA' },
    'loyalty-tab': { title: 'Smart WhatsApp Broadcast & Loyalty', subtitle: 'Himpunan kontak otomatis, deteksi pelanggan churn & template wa.me' },
    'inventory-tab': { title: 'Manajemen Stok, Supplier & Buku Bon', subtitle: 'Monitoring stok kritis, draft order WA supplier & utang-piutang' },
    'copywriting-tab': { title: 'AI Promo Generator & Data Poster', subtitle: 'Copywriting otomatis santai lokal & renderer visual poster promo' },
    'services-tab': { title: 'Jasa Pendampingan & Pusat Rute Agen', subtitle: 'Manajemen tiket pengerjaan verifikasi lokasi & rute efisien agen' },
    'learning-tab': { title: 'Video Micro-Course Edukasi', subtitle: 'Modul pelatihan strategi pemasaran digital & Google Maps' },
    'kit-tab': { title: 'Kit Lokal Naik Kelas', subtitle: 'Action kit interaktif untuk diagnosis & penanganan etalase digital UMKM' },
    'qris-tab': { title: 'Integrasi QRIS Kasir & Dynamic QR Generator', subtitle: 'Payload QRIS dinamis/statis, SVG QR renderer, dan verifikasi status bayar otomatis' },
    'docs-tab': { title: 'Dokumentasi Sistem IT (System Admin)', subtitle: 'Spesifikasi arsitektur, registry REST API, SQL DDL PostgreSQL, matriks Hak Akses Staf, dan sequence diagram' }
  };

  if (titles[tabId]) {
    document.getElementById('active-tab-title').innerText = titles[tabId].title;
    document.getElementById('active-tab-subtitle').innerText = titles[tabId].subtitle;
  }

  if (tabId === 'pos-tab') loadPOSData();
  if (tabId === 'staff-tab') loadStaffData();
  if (tabId === 'learning-tab') loadCourses();
  if (tabId === 'kit-tab') loadKitStateFromBackend();
  if (tabId === 'cashflow-tab') loadCashflowData();
  if (tabId === 'loyalty-tab') loadLoyaltyData();
  if (tabId === 'inventory-tab') loadInventoryData();
  if (tabId === 'qris-tab') loadQRISData();
  if (tabId === 'docs-tab') loadITAdminDocsBackend();
}

let currentAuditStep = 1;
let isScoreBreakdownOpen = false;

// Toggle Google Maps Audit Fields Visibility & Conditional Branch Notice
function toggleGmapsAuditFields() {
  const gmapsSelect = document.getElementById('audit-gmaps');
  const gmapsFields = document.getElementById('gmaps-audit-fields');
  const skipNotice = document.getElementById('gmaps-skip-notice');
  if (!gmapsSelect) return;

  const isGmaps = gmapsSelect.value === 'true';
  if (gmapsFields) gmapsFields.style.display = isGmaps ? 'block' : 'none';
  if (skipNotice) skipNotice.style.display = isGmaps ? 'none' : 'block';
}

function nextAuditStep() {
  if (currentAuditStep < 4) {
    currentAuditStep++;
    updateWizardStepUI();
  }
}

function prevAuditStep() {
  if (currentAuditStep > 1) {
    currentAuditStep--;
    updateWizardStepUI();
  }
}

function updateWizardStepUI() {
  for (let i = 1; i <= 4; i++) {
    const stepEl = document.getElementById(`audit-step-${i}`);
    if (stepEl) {
      stepEl.style.display = (i === currentAuditStep) ? 'block' : 'none';
    }
  }

  const badge = document.getElementById('wizard-step-badge');
  if (badge) badge.innerText = `Langkah ${currentAuditStep} dari 4`;

  const pBar = document.getElementById('wizard-progress-bar');
  if (pBar) pBar.style.width = `${currentAuditStep * 25}%`;

  const prevBtn = document.getElementById('wizard-prev-btn');
  const nextBtn = document.getElementById('wizard-next-btn');
  const submitBtn = document.getElementById('wizard-submit-btn');

  if (prevBtn) prevBtn.style.display = (currentAuditStep > 1) ? 'inline-flex' : 'none';
  if (nextBtn) nextBtn.style.display = (currentAuditStep < 4) ? 'inline-flex' : 'none';
  if (submitBtn) submitBtn.style.display = (currentAuditStep === 4) ? 'inline-flex' : 'none';
}

function toggleScoreBreakdownDetails() {
  isScoreBreakdownOpen = !isScoreBreakdownOpen;
  const container = document.getElementById('score-breakdown-container');
  if (container) container.style.display = isScoreBreakdownOpen ? 'block' : 'none';
}

// Evaluate Audit Default
async function handleAuditEvaluateDefault() {
  toggleGmapsAuditFields();
  updateWizardStepUI();
  const payload = {
    has_gmaps_profile: true,
    gmaps_rating: 4.6,
    review_count: 15,
    has_website_or_catalog: false,
    has_whatsapp_business: true,
    has_qris_payment: true,
    has_physical_banner: true,
    has_social_media: false,
    has_promo_program: true,
    photos_count: 8,
    weekly_post_updates: false
  };
  await runAuditEvaluation(payload);
}

// Audit Evaluation Form Submit (AI-Powered)
async function handleAuditSubmit(e) {
  e.preventDefault();
  
  const hasGmaps = document.getElementById('audit-gmaps').value === 'true';

  const payload = {
    has_gmaps_profile: hasGmaps,
    gmaps_rating: hasGmaps && document.getElementById('audit-rating') ? parseFloat(document.getElementById('audit-rating').value) : 0,
    review_count: hasGmaps && document.getElementById('audit-reviews') ? parseInt(document.getElementById('audit-reviews').value) : 0,
    has_website_or_catalog: document.getElementById('audit-catalog') ? document.getElementById('audit-catalog').value === 'true' : false,
    has_whatsapp_business: document.getElementById('audit-wa') ? document.getElementById('audit-wa').value === 'true' : false,
    has_qris_payment: document.getElementById('audit-qris') ? document.getElementById('audit-qris').value === 'true' : false,
    has_physical_banner: document.getElementById('audit-banner') ? document.getElementById('audit-banner').value === 'true' : false,
    has_social_media: document.getElementById('audit-sosmed') ? document.getElementById('audit-sosmed').value === 'true' : false,
    has_promo_program: document.getElementById('audit-promo') ? document.getElementById('audit-promo').value === 'true' : false,
    photos_count: 8,
    weekly_post_updates: false
  };

  await runAuditEvaluation(payload);
}

async function runAuditEvaluation(payload) {
  try {
    const res = await fetch('/api/v1/audit/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (result.success) {
      const data = result.data;
      document.getElementById('score-val').innerText = data.health_score;
      document.getElementById('score-status').innerText = data.status_grade;
      document.getElementById('ai-diagnosis-summary').innerText = data.ai_diagnosis_summary;

      currentRecommendations = data.recommendations || [];

      // Render transparent 8-dimension breakdown
      renderScoreBreakdown(data.breakdown || []);

      // Render Top 3 Focus Tasks Component
      renderTopFocusTasks(data.top_focus_tasks || []);

      // Render recommendations list with direct execution buttons
      renderRecommendationsList(currentRecommendations);
    }
  } catch (err) {
    console.error('Gagal menghitung skor audit:', err);
  }
}

function renderScoreBreakdown(breakdown) {
  const container = document.getElementById('score-breakdown-container');
  if (!container) return;

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; background: rgba(0,0,0,0.3); padding: 0.75rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);">
      ${breakdown.map(item => `
        <div style="font-size: 0.78rem; padding: 0.35rem 0.5rem; background: rgba(255,255,255,0.03); border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">
          <div style="display: flex; justify-content: space-between; font-weight: 700; color: #f8fafc;">
            <span>${item.dimension}</span>
            <span style="color: ${item.earned === item.max ? '#34d399' : '#fbbf24'};">${item.earned}/${item.max} Poin</span>
          </div>
          <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 0.15rem;">${item.gap_reason}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderTopFocusTasks(focusTasks) {
  const container = document.getElementById('top-focus-tasks-container');
  if (!container) return;

  if (!focusTasks || focusTasks.length === 0) {
    container.innerHTML = `<div style="font-size: 0.85rem; color: #34d399; text-align: center; padding: 0.5rem;">🎉 Selamat! Semua dimensi utama aset digital Anda sudah optimal!</div>`;
    return;
  }

  container.innerHTML = focusTasks.slice(0, 3).map((task, idx) => `
    <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.04); border: 1px solid rgba(245, 158, 11, 0.2); padding: 0.85rem; border-radius: 10px; margin-bottom: 0.6rem; gap: 0.75rem;">
      <div style="display: flex; align-items: center; gap: 0.75rem; flex: 1;">
        <span style="font-size: 1.2rem; background: rgba(245, 158, 11, 0.2); color: #fbbf24; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem; flex-shrink: 0;">${idx + 1}</span>
        <div>
          <div style="font-weight: 700; font-size: 0.88rem; color: #ffffff;">${task.title}</div>
          <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.15rem;">${task.description}</div>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.4rem; flex-shrink: 0;">
        <span style="font-size: 0.75rem; font-weight: 800; background: rgba(16, 185, 129, 0.2); color: #34d399; padding: 0.2rem 0.5rem; border-radius: 6px; border: 1px solid rgba(16, 185, 129, 0.3);">+${task.impact_points} Poin</span>
        <button class="btn btn-primary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="switchTab('${task.action_tab_id || 'gmaps-tab'}')">
          🚀 Eksekusi
        </button>
      </div>
    </div>
  `).join('');
}

function renderRecommendationsList(recs) {
  const recContainer = document.getElementById('recommendations-list');
  if (!recContainer) return;

  recContainer.innerHTML = recs.map((rec, index) => `
    <div class="checklist-item interactive" style="display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; padding: 0.85rem; background: rgba(255,255,255,0.02); border-radius: 10px; margin-bottom: 0.5rem;">
      <div style="display: flex; gap: 0.75rem; align-items: center; flex: 1;">
        <div class="checklist-icon" style="font-size: 1.1rem;">💡</div>
        <div>
          <div style="font-size: 0.88rem; font-weight: 600; color: #ffffff;">${rec.text}</div>
          <div style="font-size: 0.78rem; color: #94a3b8; margin-top: 0.15rem;">Kategori: ${rec.category || 'Digital Growth'}</div>
        </div>
      </div>
      <div style="display: flex; gap: 0.4rem; flex-shrink: 0;">
        <button class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="openCourseDetailByIndex(${index})">
          🎓 Tutorial
        </button>
        <button class="btn btn-primary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="switchTab('${rec.action_tab_id || 'gmaps-tab'}')">
          🚀 Buka Modul
        </button>
      </div>
    </div>
  `).join('');
}

// Modal Course Detail Viewer
function openCourseDetailByIndex(index) {
  const rec = currentRecommendations[index];
  if (!rec) return;

  document.getElementById('modal-category').innerText = rec.category || 'Digital Growth Strategy';
  document.getElementById('modal-title').innerText = rec.course_title || 'Panduan Edukasi UMKM';
  document.getElementById('modal-description').innerText = rec.text || 'Ikuti langkah-langkah di bawah ini.';

  // Video embed
  const iframe = document.getElementById('modal-video-iframe');
  iframe.src = (rec.video_url || 'https://www.youtube.com/embed/dQw4w9WgXcQ') + '?autoplay=1';

  // Render Step-by-Step Action Guide Cards
  const stepsBox = document.getElementById('modal-steps-container');
  const steps = rec.steps || [
    { num: 1, title: 'Buka Fitur Terkait', desc: 'Akses menu fitur di platform SuperUMKM.' },
    { num: 2, title: 'Masukkan Data Toko', desc: 'Isi informasi toko Anda dengan teliti.' },
    { num: 3, title: 'Simpan & Publikasikan', desc: 'Selesaikan dan terbitkan perubahan Anda.' }
  ];

  stepsBox.innerHTML = steps.map(step => `
    <div style="display: flex; gap: 0.85rem; align-items: flex-start; padding: 0.75rem 0.9rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px;">
      <div style="width: 28px; height: 28px; background: var(--primary-gradient); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem; color: #ffffff; flex-shrink: 0;">
        ${step.num}
      </div>
      <div>
        <div style="font-weight: 700; font-size: 0.9rem; color: #ffffff;">${step.title}</div>
        <div style="font-size: 0.82rem; color: #94a3b8; margin-top: 0.15rem;">${step.desc}</div>
      </div>
    </div>
  `).join('');

  activeModalActionTab = rec.action_tab_id || 'gmaps-tab';
  document.getElementById('modal-action-btn').innerText = rec.action_button_label || '🚀 Eksekusi Aksi Ini Sekarang';

  document.getElementById('course-modal').classList.add('active');
}

function openCourseDetail(courseId, title, description) {
  document.getElementById('modal-category').innerText = 'Micro-Course Edukasi';
  document.getElementById('modal-title').innerText = title;
  document.getElementById('modal-description').innerText = description || 'Modul pelatihan strategi digital marketing.';
  
  const iframe = document.getElementById('modal-video-iframe');
  iframe.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1';

  const stepsBox = document.getElementById('modal-steps-container');
  stepsBox.innerHTML = `
    <div style="display: flex; gap: 0.85rem; align-items: flex-start; padding: 0.75rem 0.9rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px;">
      <div style="width: 28px; height: 28px; background: var(--primary-gradient); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem; color: #ffffff;">1</div>
      <div>
        <div style="font-weight: 700; font-size: 0.9rem; color: #ffffff;">Tonton Video Sampai Selesai</div>
        <div style="font-size: 0.82rem; color: #94a3b8;">Simak poin-poin utama materi yang disampaikan dalam durasi 5-10 menit.</div>
      </div>
    </div>
    <div style="display: flex; gap: 0.85rem; align-items: flex-start; padding: 0.75rem 0.9rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px;">
      <div style="width: 28px; height: 28px; background: var(--primary-gradient); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem; color: #ffffff;">2</div>
      <div>
        <div style="font-weight: 700; font-size: 0.9rem; color: #ffffff;">Praktekkan Pada Toko Anda</div>
        <div style="font-size: 0.82rem; color: #94a3b8;">Gunakan alat bantu generator di SuperUMKM untuk mempermudah pengerjaan.</div>
      </div>
    </div>
  `;

  activeModalActionTab = 'gmaps-tab';
  document.getElementById('modal-action-btn').innerText = '🚀 Praktekkan Sekarang';

  document.getElementById('course-modal').classList.add('active');
}

function executeModalAction() {
  closeCourseModal();
  switchTab(activeModalActionTab);
}

function closeCourseModal() {
  document.getElementById('course-modal').classList.remove('active');
  const iframe = document.getElementById('modal-video-iframe');
  iframe.src = '';
}

// Generate QR Standee Config
async function handleGenerateQR(e) {
  e.preventDefault();

  const payload = {
    business_name: document.getElementById('qr-biz-name').value,
    gmaps_review_url: document.getElementById('qr-gmaps-url').value,
    template_style: document.getElementById('qr-template').value,
    custom_text: document.getElementById('qr-custom-text').value
  };

  try {
    const res = await fetch('/api/v1/gmaps/qr-generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (result.success) {
      document.getElementById('preview-biz-name').innerText = result.data.business_name;
      document.getElementById('preview-custom-text').innerText = result.data.custom_text;
      document.getElementById('qr-img-element').src = result.data.qr_code_svg_url;
      
      if (result.data.tier_level === 'STANDARD_FREE' && payload.template_style !== 'BASIC_STANDARD') {
        alert('Catatan RBAC: Kustomisasi Template Premium telah disesuaikan ke standar Free karena akun Anda menggunakan Tier Standard.');
      }
    }
  } catch (err) {
    alert('Gagal generate QR: ' + err.message);
  }
}

function downloadQRPdf() {
  alert('Template PDF siap cetak untuk Standee Akrilik telah di-generate!');
}

// Generate AI Review Auto-Reply
async function handleGenerateAutoReply(e) {
  e.preventDefault();
  const reviewer_name = document.getElementById('reply-reviewer').value;
  const rating = parseInt(document.getElementById('reply-rating').value);

  try {
    const res = await fetch('/api/v1/gmaps/auto-reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ reviewer_name, rating, business_name: document.getElementById('qr-biz-name').value })
    });
    const result = await res.json();
    if (result.success) {
      document.getElementById('reply-result-box').style.display = 'block';
      document.getElementById('reply-text').innerText = `"${result.data.suggested_reply}"`;
    }
  } catch (err) {
    alert('Gagal generate balasan AI: ' + err.message);
  }
}

// Generate Review Loyalty Coupon
async function handleGenerateCoupon(e) {
  e.preventDefault();
  const title = document.getElementById('coupon-title').value;
  const discount = document.getElementById('coupon-discount').value;

  try {
    const res = await fetch('/api/v1/gmaps/coupons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ coupon_name: title, discount_text: discount })
    });
    const result = await res.json();
    if (result.success) {
      document.getElementById('coupon-result-box').style.display = 'block';
      document.getElementById('coupon-code-val').innerText = result.data.code;
      document.getElementById('coupon-desc-val').innerText = `${result.data.title} - ${result.data.discount_text} (Berlaku s.d ${result.data.valid_until})`;
    }
  } catch (err) {
    alert('Gagal buat kupon: ' + err.message);
  }
}

// Build Website Sementara dengan Multi-Social Links, Upload Foto Banner, & Katalog
async function handleBuildLanding(e) {
  e.preventDefault();

  // Collect Product Items
  const productRows = document.querySelectorAll('.product-input-row');
  const items = Array.from(productRows).map(row => ({
    name: row.querySelector('.prod-name').value || 'Produk Unggulan',
    price: row.querySelector('.prod-price').value || 'Rp 25.000',
    image_url: row.querySelector('.prod-img').value || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    description: row.querySelector('.prod-desc').value || 'Kualitas terbaik'
  }));

  const payload = {
    business_name: document.getElementById('landing-name').value,
    category: document.getElementById('landing-category').value,
    description: document.getElementById('landing-desc').value,
    whatsapp_number: document.getElementById('landing-wa').value,
    banner_url: document.getElementById('landing-banner').value,
    social_links: {
      instagram: document.getElementById('social-ig').value,
      tiktok: document.getElementById('social-tiktok').value,
      facebook: document.getElementById('social-fb').value,
      shopee: document.getElementById('social-shopee').value,
      tokopedia: document.getElementById('social-tokopedia').value
    },
    items
  };

  try {
    const res = await fetch('/api/v1/landing/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (result.success) {
      const pubLink = `/toko/${result.data.slug}`;
      document.getElementById('published-slug-url').innerText = pubLink;
      document.getElementById('open-public-site-btn').href = pubLink;
      document.getElementById('live-biz-name').innerText = payload.business_name;
      document.getElementById('live-cat').innerText = payload.category;
      document.getElementById('live-desc').innerText = payload.description;

      if (payload.banner_url) {
        document.getElementById('preview-banner-box').style.backgroundImage = `url('${payload.banner_url}')`;
      }

      // Social Badges Preview
      const socList = [];
      if (payload.social_links.instagram) socList.push(`<span style="font-size: 0.75rem; background: #f1f5f9; padding: 0.2rem 0.5rem; border-radius: 12px; color: #475569;">📸 Instagram</span>`);
      if (payload.social_links.tiktok) socList.push(`<span style="font-size: 0.75rem; background: #f1f5f9; padding: 0.2rem 0.5rem; border-radius: 12px; color: #475569;">🎵 TikTok</span>`);
      if (payload.social_links.facebook) socList.push(`<span style="font-size: 0.75rem; background: #f1f5f9; padding: 0.2rem 0.5rem; border-radius: 12px; color: #475569;">📘 Facebook</span>`);
      if (payload.social_links.shopee) socList.push(`<span style="font-size: 0.75rem; background: #f1f5f9; padding: 0.2rem 0.5rem; border-radius: 12px; color: #475569;">🟠 Shopee</span>`);
      if (payload.social_links.tokopedia) socList.push(`<span style="font-size: 0.75rem; background: #f1f5f9; padding: 0.2rem 0.5rem; border-radius: 12px; color: #475569;">🟢 Tokopedia</span>`);
      document.getElementById('live-social-badges').innerHTML = socList.join('');

      // Products Preview
      document.getElementById('live-product-preview-list').innerHTML = items.map(it => `
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; padding: 0.4rem 0; border-bottom: 1px dashed #e5e7eb;">
          <span>${it.name}</span>
          <span style="font-weight: 700; color: #059669;">${it.price}</span>
        </div>
      `).join('');

      const waBtn = document.getElementById('wa-order-btn');
      if (waBtn) waBtn.href = `https://wa.me/62${payload.whatsapp_number.replace(/^0/, '')}?text=Halo%20${encodeURIComponent(payload.business_name)}`;
      
      alert('Mini Website & Toko Online Instan UMKM berhasil diterbitkan! Klik "Buka Web Publik" untuk melihat hasilnya.');
    }
  } catch (err) {
    alert('Gagal menerbitkan website sementara: ' + err.message);
  }
}

// Load Service Tasks
async function loadTasks() {
  const tbody = document.getElementById('tasks-table-body');
  if (!tbody) return;

  try {
    const res = await fetch('/api/v1/services/tasks', {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const result = await res.json();

    if (result.success) {
      if (result.data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">Belum ada tiket jasa. Klik + Ajukan Tiket Baru.</td></tr>`;
        return;
      }

      tbody.innerHTML = result.data.map(task => `
        <tr>
          <td><code>${task.id}</code></td>
          <td><b>${task.client_name}</b></td>
          <td>${task.task_step}</td>
          <td>${task.consultant_name}</td>
          <td>
            <span class="role-badge ${task.task_status === 'COMPLETED' ? 'agent' : 'free'}">${task.task_status}</span>
          </td>
          <td>
            ${task.proof_evidence_url ? `<a href="${task.proof_evidence_url}" target="_blank" style="color: #60a5fa;">📸 Lihat Foto</a>` : '<span style="color: var(--text-sub);">Belum ada</span>'}
          </td>
          <td>
            ${renderTaskActions(task)}
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Task load error:', err);
  }
}

function renderTaskActions(task) {
  if (currentRole === 'SUPER_ADMIN' && !task.consultant_id) {
    return `<button onclick="assignAgent('${task.id}')" class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;">Assign Agent</button>`;
  }
  if ((currentRole === 'FIELD_AGENT' || currentRole === 'SUPER_ADMIN') && task.task_status !== 'COMPLETED') {
    return `<button onclick="uploadEvidence('${task.id}')" class="btn btn-primary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;">Upload Geotag</button>`;
  }
  return `<span style="font-size: 0.8rem; color: var(--text-sub);">Read Only</span>`;
}

async function loadAgentRoute() {
  const box = document.getElementById('route-display-box');
  try {
    const res = await fetch('/api/v1/services/agent-route', {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const result = await res.json();
    if (result.success) {
      box.innerHTML = `
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 0.5rem;">Urutan Rute Optimal Agen Lapangan:</div>
        ${result.optimized_route.map(r => `
          <div style="padding: 0.5rem 0.75rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; margin-bottom: 0.4rem; display: flex; justify-content: space-between;">
            <div><b>Stop ${r.stop_sequence}:</b> ${r.business_name} (${r.address_text})</div>
            <div style="color: #34d399; font-weight: 700;">+${r.estimated_distance_km} KM</div>
          </div>
        `).join('')}
      `;
    }
  } catch (err) {
    alert('Fitur ini khusus untuk peran Field Agent atau Super Admin!');
  }
}

async function openOrderModal() {
  const service_type = prompt('Masukkan jenis layanan yang dibutuhkan:', 'Optimasi Google Maps & Verifikasi Lapangan');
  if (!service_type) return;

  try {
    const res = await fetch('/api/v1/services/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ service_type, requirement_notes: 'Pendampingan langsung' })
    });
    const result = await res.json();
    if (result.success) {
      alert('Tiket berhasil dibuat!');
      loadTasks();
    }
  } catch (err) {
    alert('Gagal order: ' + err.message);
  }
}

async function assignAgent(taskId) {
  try {
    const res = await fetch(`/api/v1/services/tasks/${taskId}/assign`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ consultant_id: 'u-agent-003' })
    });
    const result = await res.json();
    if (result.success) {
      alert('Berhasil diajukan ke Agen Wilayah (Rian Hidayat)!');
      loadTasks();
    }
  } catch (err) {
    alert('Gagal assign: ' + err.message);
  }
}

async function uploadEvidence(taskId) {
  try {
    const res = await fetch(`/api/v1/services/tasks/${taskId}/evidence`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        proof_evidence_url: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=500',
        latitude: -6.2088,
        longitude: 106.8456,
        notes: 'Verifikasi lokasi selesai & stiker QR terpasang'
      })
    });
    const result = await res.json();
    if (result.success) {
      alert('Bukti foto Geotag lokasi berhasil diunggah!');
      loadTasks();
    }
  } catch (err) {
    alert('Gagal upload evidence: ' + err.message);
  }
}

// Load Video Courses with Embed Player & Admin Controls
async function loadCourses() {
  const container = document.getElementById('courses-grid');
  if (!container) return;

  const adminVideoUploadCard = document.getElementById('admin-video-upload-card');
  if (adminVideoUploadCard) {
    adminVideoUploadCard.style.display = currentRole === 'SUPER_ADMIN' ? 'block' : 'none';
  }

  try {
    const res = await fetch('/api/v1/learning/courses', {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const result = await res.json();

    if (result.success) {
      container.innerHTML = result.data.map(course => {
        const embedUrl = course.embed_url || course.video_url || 'https://www.youtube.com/embed/dQw4w9WgXcQ';
        const steps = course.steps || [
          'Langkah 1: Tonton video panduan sampai selesai.',
          'Langkah 2: Buka menu modul terkait pada sistem SuperUMKM.',
          'Langkah 3: Praktikkan panduan pada bisnis UMKM Anda.'
        ];

        return `
          <div class="card video-card" style="padding: 0; overflow: hidden; background: #0f172a; border: 1px solid rgba(255,255,255,0.1);">
            <div style="position: relative; width: 100%; padding-top: 56.25%;">
              <iframe src="${embedUrl}" style="position: absolute; top:0; left:0; width:100%; height:100%; border:0;" allowfullscreen></iframe>
              ${course.is_locked ? `
                <div class="lock-overlay" style="position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(15,23,42,0.95); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10;">
                  <span style="font-size: 2rem;">🔒</span>
                  <span style="font-size: 0.8rem; font-weight: 700; color: #f87171;">KHUSUS MEMBER PREMIUM</span>
                  <span style="font-size: 0.72rem; color: #94a3b8; margin-top: 0.2rem;">Upgrade akun ke Premium untuk menonton</span>
                </div>
              ` : ''}
            </div>
            <div style="padding: 1rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
                <span style="font-size: 0.7rem; color: #60a5fa; font-weight: 700; text-transform: uppercase;">${course.module_category}</span>
                <span class="role-badge ${course.minimum_tier === 'PREMIUM' ? 'admin' : 'free'}" style="font-size: 0.65rem;">${course.minimum_tier}</span>
              </div>
              <div style="font-size: 0.95rem; font-weight: 700; color: #f8fafc; margin-bottom: 0.3rem;">${course.title}</div>
              <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.75rem;">${course.description || 'Tutorial strategi & tips praktis ekosistem SuperUMKM.'}</p>
              
              <!-- Step-By-Step Action Guidelines for Owners -->
              <div style="background: rgba(15, 23, 42, 0.9); padding: 0.75rem; border-radius: 8px; border: 1px dashed rgba(59, 130, 246, 0.3); margin-bottom: 0.75rem;">
                <div style="font-size: 0.78rem; font-weight: 700; color: #38bdf8; margin-bottom: 0.4rem;">📝 Panduan Langkah Demi Langkah:</div>
                <div style="display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.75rem; color: #cbd5e1;">
                  ${steps.map((st, sIdx) => `
                    <div style="display: flex; gap: 0.4rem; align-items: flex-start;">
                      <span style="color: #34d399; font-weight: 700;">✓</span>
                      <span>${st}</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: #64748b;">
                <span>⏱️ ${Math.round((course.duration_seconds || 300) / 60)} Menit</span>
                ${currentRole === 'SUPER_ADMIN' ? `
                  <button class="btn btn-secondary" style="font-size: 0.7rem; padding: 0.2rem 0.5rem; color: #f87171;" onclick="handleDeleteVideo('${course.id}')">🗑️ Hapus</button>
                ` : ''}
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  } catch (err) {
    console.error('Courses load error:', err);
  }
}

async function handleAdminUploadVideo(e) {
  e.preventDefault();
  const stepsInput = document.getElementById('admin-video-steps');
  const payload = {
    title: document.getElementById('admin-video-title').value,
    module_category: document.getElementById('admin-video-category').value,
    video_url: document.getElementById('admin-video-url').value,
    description: document.getElementById('admin-video-desc').value,
    minimum_tier: document.getElementById('admin-video-tier').value,
    duration_seconds: document.getElementById('admin-video-duration').value,
    steps: stepsInput ? stepsInput.value : ''
  };

  try {
    const res = await fetch('/api/v1/learning/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (result.success) {
      alert('Video edukasi berhasil diupload & dipublikasikan!');
      document.getElementById('admin-video-form').reset();
      loadCourses();
    } else {
      alert(result.error || 'Gagal mengupload video');
    }
  } catch (err) {
    console.error('handleAdminUploadVideo error:', err);
    alert('Terjadi kesalahan server saat mengupload video');
  }
}

async function handleDeleteVideo(videoId) {
  if (!confirm('Apakah Anda yakin ingin menghapus video edukasi ini?')) return;
  try {
    const res = await fetch(`/api/v1/learning/courses/${videoId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const result = await res.json();
    if (result.success) {
      alert('Video berhasil dihapus');
      loadCourses();
    } else {
      alert(result.error || 'Gagal menghapus video');
    }
  } catch (err) {
    console.error('handleDeleteVideo error:', err);
  }
}

// ==========================================
// STAFF MANAGEMENT CLIENT ENGINE
// ==========================================
async function loadStaffData() {
  if (!userToken) return;
  try {
    const res = await fetch('/api/v1/pos/staff', {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const result = await res.json();
    if (result.success) {
      renderStaffList(result.data.staff_list);
    }
  } catch (err) {
    console.error('loadStaffData error:', err);
  }
}

function renderStaffList(staffList) {
  const container = document.getElementById('staff-list-container');
  if (!container) return;

  if (!staffList || staffList.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 1.5rem;">Belum ada staf kasir yang ditambahkan.</div>`;
    return;
  }

  container.innerHTML = staffList.map(staff => `
    <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.85rem;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem;">
        <div>
          <strong style="color: #f8fafc; font-size: 0.95rem;">${staff.staff_name}</strong>
          <span style="font-size: 0.75rem; background: rgba(59, 130, 246, 0.2); color: #60a5fa; padding: 0.1rem 0.4rem; border-radius: 4px; margin-left: 0.4rem;">${staff.role_title || 'Kasir'}</span>
        </div>
        <span class="role-badge ${staff.status === 'ACTIVE' ? 'free' : 'admin'}" style="font-size: 0.65rem;">${staff.status === 'ACTIVE' ? 'AKTIF' : 'NONAKTIF'}</span>
      </div>
      <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.3rem;">
        <div>📱 WA: <strong>${staff.phone_number}</strong></div>
        <div>🏠 Alamat: ${staff.address || '-'}</div>
        <div>🔑 PIN Login: <code>${staff.pin || '1234'}</code></div>
      </div>
      <div style="margin-top: 0.5rem; display: flex; flex-wrap: wrap; gap: 0.3rem; font-size: 0.7rem;">
        ${(staff.allowed_permissions || ['pos_instant', 'qris_payment']).map(p => `<span style="background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 0.1rem 0.4rem; border-radius: 4px;">✓ ${p}</span>`).join('')}
      </div>
      <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
        <button class="btn btn-secondary" style="font-size: 0.75rem; padding: 0.25rem 0.6rem;" onclick='editStaff(${JSON.stringify(staff).replace(/'/g, "&apos;")})'>✏️ Edit</button>
        <button class="btn btn-secondary" style="font-size: 0.75rem; padding: 0.25rem 0.6rem; color: #f87171;" onclick="deleteStaff('${staff.id}')">🗑️ Nonaktifkan</button>
      </div>
    </div>
  `).join('');
}

function openAddStaffModal() {
  resetStaffForm();
  document.getElementById('staff-form-title').innerText = '👤 Form Tambah Staf Kasir';
  document.getElementById('staff-name-input').focus();
}

function resetStaffForm() {
  document.getElementById('staff-edit-id').value = '';
  document.getElementById('staff-manage-form').reset();
  document.getElementById('staff-form-title').innerText = '👤 Form Informasi Staf Kasir';
}

function editStaff(staff) {
  document.getElementById('staff-edit-id').value = staff.id;
  document.getElementById('staff-name-input').value = staff.staff_name || '';
  document.getElementById('staff-phone-input').value = staff.phone_number || '';
  document.getElementById('staff-address-input').value = staff.address || '';
  document.getElementById('staff-pin-input').value = staff.pin || '1234';
  document.getElementById('staff-role-title-input').value = staff.role_title || 'Kasir Toko';

  const perms = staff.allowed_permissions || [];
  document.getElementById('perm-pos').checked = perms.includes('pos_instant');
  document.getElementById('perm-qris').checked = perms.includes('qris_payment');
  document.getElementById('perm-inventory').checked = perms.includes('inventory_stok_bon');
  document.getElementById('perm-cashflow').checked = perms.includes('cashflow_pnl');
  document.getElementById('perm-loyalty').checked = perms.includes('wa_loyalty');
  document.getElementById('perm-course').checked = perms.includes('micro_course');

  document.getElementById('staff-form-title').innerText = `✏️ Edit Staf: ${staff.staff_name}`;
}

async function handleSaveStaff(e) {
  e.preventDefault();
  const staffId = document.getElementById('staff-edit-id').value;

  const allowed_permissions = [];
  if (document.getElementById('perm-pos').checked) allowed_permissions.push('pos_instant');
  if (document.getElementById('perm-qris').checked) allowed_permissions.push('qris_payment');
  if (document.getElementById('perm-inventory').checked) allowed_permissions.push('inventory_stok_bon');
  if (document.getElementById('perm-cashflow').checked) allowed_permissions.push('cashflow_pnl');
  if (document.getElementById('perm-loyalty').checked) allowed_permissions.push('wa_loyalty');
  if (document.getElementById('perm-course').checked) allowed_permissions.push('micro_course');

  const payload = {
    staff_name: document.getElementById('staff-name-input').value,
    phone_number: document.getElementById('staff-phone-input').value,
    address: document.getElementById('staff-address-input').value,
    pin: document.getElementById('staff-pin-input').value,
    role_title: document.getElementById('staff-role-title-input').value,
    allowed_permissions
  };

  const method = staffId ? 'PUT' : 'POST';
  const url = staffId ? `/api/v1/pos/staff/${staffId}` : '/api/v1/pos/staff';

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify(payload)
    });
    const result = await res.json();

    if (result.success) {
      alert(result.message || 'Data staf berhasil disimpan!');
      resetStaffForm();
      loadStaffData();
      loadDynamicNavigationMenu();
    } else {
      alert(result.error || 'Gagal menyimpan data staf');
    }
  } catch (err) {
    console.error('handleSaveStaff error:', err);
    alert('Terjadi kesalahan saat menyimpan data staf');
  }
}

async function deleteStaff(staffId) {
  if (!confirm('Apakah Anda yakin ingin menonaktifkan staf kasir ini?')) return;
  try {
    const res = await fetch(`/api/v1/pos/staff/${staffId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const result = await res.json();
    if (result.success) {
      alert(result.message);
      loadStaffData();
    } else {
      alert(result.error || 'Gagal menonaktifkan staf');
    }
  } catch (err) {
    console.error('deleteStaff error:', err);
  }
}

// ==========================================
// POS & STAFF MANAGEMENT CLIENT ENGINE
// ==========================================
let cartItems = [];

function addToCart(name, price) {
  const existing = cartItems.find(item => item.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cartItems.push({ name, price: Number(price), qty: 1 });
  }
  renderCart();
}

function addCustomItemToCart() {
  const nameInput = document.getElementById('pos-custom-name');
  const priceInput = document.getElementById('pos-custom-price');
  
  if (!nameInput || !priceInput) return;

  const name = nameInput.value.trim();
  const price = Number(priceInput.value);

  if (!name || isNaN(price) || price <= 0) {
    alert('Masukkan nama produk dan harga yang valid!');
    return;
  }

  addToCart(name, price);
  nameInput.value = '';
  priceInput.value = '';
}

function updateCartQty(index, delta) {
  if (cartItems[index]) {
    cartItems[index].qty += delta;
    if (cartItems[index].qty <= 0) {
      cartItems.splice(index, 1);
    }
    renderCart();
  }
}

function removeFromCart(index) {
  cartItems.splice(index, 1);
  renderCart();
}

function renderCart() {
  const tbody = document.getElementById('cart-table-body');
  const totalDisplay = document.getElementById('cart-total-display');
  if (!tbody || !totalDisplay) return;

  if (cartItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 1rem;">Keranjang belanja masih kosong. Klik produk di atas.</td></tr>`;
    totalDisplay.innerText = 'Rp 0';
    return;
  }

  let total = 0;
  tbody.innerHTML = cartItems.map((item, idx) => {
    const subtotal = item.qty * item.price;
    total += subtotal;
    return `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
        <td style="padding: 0.5rem 0;"><strong>${item.name}</strong><br><span style="font-size: 0.75rem; color: var(--text-muted);">@ Rp ${item.price.toLocaleString('id-ID')}</span></td>
        <td style="text-align: center; padding: 0.5rem 0;">
          <button class="btn btn-secondary" type="button" style="padding: 0.15rem 0.4rem; font-size: 0.75rem;" onclick="updateCartQty(${idx}, -1)">-</button>
          <span style="margin: 0 0.4rem; font-weight: 700;">${item.qty}</span>
          <button class="btn btn-secondary" type="button" style="padding: 0.15rem 0.4rem; font-size: 0.75rem;" onclick="updateCartQty(${idx}, 1)">+</button>
        </td>
        <td style="text-align: right; padding: 0.5rem 0; font-weight: 700; color: #4ade80;">Rp ${subtotal.toLocaleString('id-ID')}</td>
        <td style="text-align: center; padding: 0.5rem 0;">
          <span style="color: #f87171; cursor: pointer;" onclick="removeFromCart(${idx})">✕</span>
        </td>
      </tr>
    `;
  }).join('');

  totalDisplay.innerText = `Rp ${total.toLocaleString('id-ID')}`;
}

let activeQrisTransactionId = null;

async function handlePOSCheckout() {
  if (cartItems.length === 0) {
    alert('Keranjang belanja masih kosong!');
    return;
  }

  const payMethodSelect = document.getElementById('pos-pay-method');
  const payMethod = payMethodSelect ? payMethodSelect.value : 'TUNAI';
  const totalAmount = cartItems.reduce((acc, item) => acc + (item.price * (item.qty || 1)), 0);

  if (payMethod === 'QRIS') {
    try {
      const qrisRes = await fetch('/api/v1/qris/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ amount: totalAmount, isDynamic: true })
      });
      const qrisData = await qrisRes.json();
      if (qrisData.success) {
        activeQrisTransactionId = qrisData.data.transaction_id;
        document.getElementById('qris-svg-container').innerHTML = qrisData.data.qr_svg;
        document.getElementById('qris-modal-amount').innerText = `Rp ${totalAmount.toLocaleString('id-ID')}`;
        document.getElementById('qris-status-text').innerText = '⏳ Menunggu scan & konfirmasi bayar otomatis...';
        document.getElementById('qris-modal').classList.add('active');
        return;
      }
    } catch (e) {
      console.error('QRIS error:', e);
    }
  }

  await executeFinalPOSCheckout(payMethod);
}

async function executeFinalPOSCheckout(payMethod) {
  const totalAmount = cartItems.reduce((acc, item) => acc + (item.price * (item.qty || 1)), 0);
  try {
    const res = await fetch('/api/v1/pos/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        items: cartItems,
        payment_method: payMethod || 'TUNAI',
        paid_amount: totalAmount
      })
    });

    const result = await res.json();
    if (result.success) {
      const receipt = result.data.receipt;
      cartItems = [];
      renderCart();
      showReceiptModal(receipt);
      loadPOSTransactionHistory();
    } else {
      alert(result.error || 'Gagal memproses transaksi');
    }
  } catch (err) {
    console.error('POS Checkout error:', err);
    alert('Terjadi kesalahan koneksi server');
  }
}

function closeQrisModal() {
  const modal = document.getElementById('qris-modal');
  if (modal) modal.classList.remove('active');
}

async function triggerMockQrisVerify() {
  if (!activeQrisTransactionId) return;
  try {
    const res = await fetch('/api/v1/qris/verify-mock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ transaction_id: activeQrisTransactionId })
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('qris-status-text').innerText = '✅ Pembayaran QRIS Sukses Terverifikasi!';
      setTimeout(() => {
        closeQrisModal();
        executeFinalPOSCheckout('QRIS');
      }, 700);
    }
  } catch (e) {
    console.error('Verify error:', e);
  }
}

function showReceiptModal(receipt) {
  const modal = document.getElementById('receipt-modal');
  if (!modal) return;

  const createdDate = new Date(receipt.created_at || Date.now());
  const dateStr = createdDate.toISOString().split('T')[0];
  const timeStr = createdDate.toTimeString().split(' ')[0];

  document.getElementById('receipt-biz-name').innerText = receipt.business_name || 'Karis Jaya Shop';
  const bizAddrEl = document.getElementById('receipt-biz-addr');
  if (bizAddrEl) bizAddrEl.innerText = receipt.business_address || 'Jl. Dr. Ir. H. Soekarno No.19,Medokan Semampir Surabaya';
  const bizPhoneEl = document.getElementById('receipt-biz-phone');
  if (bizPhoneEl) bizPhoneEl.innerText = `No. Telp ${receipt.business_phone || '0812345678'}`;
  document.getElementById('receipt-tx-id').innerText = receipt.receipt_no || receipt.id || '16413520230802084636';

  const dateDateEl = document.getElementById('receipt-date-date');
  if (dateDateEl) dateDateEl.innerText = dateStr;
  const dateTimeEl = document.getElementById('receipt-date-time');
  if (dateTimeEl) dateTimeEl.innerText = timeStr;

  document.getElementById('receipt-cashier-name').innerText = receipt.cashier_name || 'karis';
  const custNameEl = document.getElementById('receipt-customer-name');
  if (custNameEl) custNameEl.innerText = receipt.customer_name || 'Sheila';
  const custAddrEl = document.getElementById('receipt-customer-addr');
  if (custAddrEl) custAddrEl.innerText = receipt.customer_address || 'Jl. Diponegoro 1, Sby';
  const queueNoEl = document.getElementById('receipt-queue-no');
  if (queueNoEl) queueNoEl.innerText = receipt.queue_no || 'No.0-3';

  const itemsContainer = document.getElementById('receipt-items-container');
  if (itemsContainer) {
    itemsContainer.innerHTML = (receipt.items || []).map((item, idx) => `
      <div style="margin-top: 0.35rem;">
        <strong style="color: #000; font-weight: 700;">${item.index || (idx + 1)}. ${item.name}</strong>
        <div style="display: flex; justify-content: space-between;">
          <span>${item.qty} ${item.unit || ''} x ${(item.price || 0).toLocaleString('id-ID')}</span>
          <span>Rp ${(item.subtotal || 0).toLocaleString('id-ID')}</span>
        </div>
      </div>
    `).join('');
  }

  const totalQty = receipt.total_qty || (receipt.items || []).reduce((acc, i) => acc + (i.qty || 1), 0);
  const totalQtyEl = document.getElementById('receipt-total-qty');
  if (totalQtyEl) totalQtyEl.innerText = totalQty;

  const subtotalValEl = document.getElementById('receipt-subtotal-val');
  if (subtotalValEl) subtotalValEl.innerText = `Rp ${(receipt.subtotal || receipt.total_amount || 0).toLocaleString('id-ID')}`;
  
  const totalValEl = document.getElementById('receipt-total-val');
  if (totalValEl) totalValEl.innerText = `Rp ${(receipt.total_amount || 0).toLocaleString('id-ID')}`;

  document.getElementById('receipt-pay-method').innerText = receipt.payment_method || 'Cash';

  const paidValEl = document.getElementById('receipt-paid-val');
  if (paidValEl) paidValEl.innerText = `Rp ${(receipt.paid_amount || receipt.total_amount || 0).toLocaleString('id-ID')}`;

  const changeValEl = document.getElementById('receipt-change-val');
  if (changeValEl) changeValEl.innerText = `Rp ${(receipt.change_amount || 0).toLocaleString('id-ID')}`;

  modal.classList.add('active');
}

function closeReceiptModal() {
  const modal = document.getElementById('receipt-modal');
  if (modal) modal.classList.remove('active');
}

async function loadPOSData() {
  await loadPOSStaffList();
  await loadPOSTransactionHistory();
}

async function loadPOSStaffList() {
  const tbody = document.getElementById('staff-list-table-body');
  const badge = document.getElementById('staff-quota-badge');
  if (!tbody) return;

  try {
    const res = await fetch('/api/v1/pos/staff', {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const result = await res.json();

    if (result.success) {
      const { staff_list, quota_summary } = result.data;

      // Update quota badge
      if (badge) {
        if (quota_summary.is_free_tier) {
          badge.className = 'badge';
          badge.style.cssText = 'font-size: 0.75rem; padding: 0.3rem 0.6rem; border-radius: 9999px; font-weight: 700; background: rgba(234, 179, 8, 0.2); color: #fde047; border: 1px solid rgba(234, 179, 8, 0.3);';
          badge.innerText = `Paket GRATIS: ${quota_summary.assigned_count} / 1 Kasir Terpakai`;
        } else {
          badge.className = 'badge';
          badge.style.cssText = 'font-size: 0.75rem; padding: 0.3rem 0.6rem; border-radius: 9999px; font-weight: 700; background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3);';
          badge.innerText = `Paket PREMIUM: ${quota_summary.assigned_count} Kasir (Tanpa Batas)`;
        }
      }

      if (staff_list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 1rem;">Belum ada anak buah / kasir ditambahkan.</td></tr>`;
        return;
      }

      tbody.innerHTML = staff_list.map(staff => `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <td style="padding: 0.5rem 0;"><strong>${staff.staff_name}</strong><br><span style="font-size: 0.75rem; color: var(--text-muted);">PIN: ${staff.pin}</span></td>
          <td style="padding: 0.5rem 0;">${staff.phone_number}</td>
          <td style="text-align: center; padding: 0.5rem 0;"><span class="badge" style="background: rgba(34, 197, 94, 0.2); color: #4ade80;">AKTIF</span></td>
          <td style="text-align: center; padding: 0.5rem 0;">
            <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem; color: #f87171;" onclick="handleDeleteStaff('${staff.id}')">Hapus</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Load staff error:', err);
  }
}

async function handleAddStaff(e) {
  e.preventDefault();
  const nameInput = document.getElementById('staff-name-input');
  const phoneInput = document.getElementById('staff-phone-input');
  const pinInput = document.getElementById('staff-pin-input');

  const staff_name = nameInput.value.trim();
  const phone_number = phoneInput.value.trim();
  const pin = pinInput.value.trim() || '1234';

  try {
    const res = await fetch('/api/v1/pos/staff', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ staff_name, phone_number, pin })
    });

    const result = await res.json();
    if (result.success) {
      alert(result.message);
      nameInput.value = '';
      phoneInput.value = '';
      loadPOSStaffList();
    } else {
      alert(`⚠️ ${result.error}`);
    }
  } catch (err) {
    console.error('Add staff error:', err);
    alert('Gagal menambahkan staf kasir');
  }
}

async function handleDeleteStaff(staffId) {
  if (!confirm('Apakah Anda yakin ingin menonaktifkan akun staf kasir ini?')) return;

  try {
    const res = await fetch(`/api/v1/pos/staff/${staffId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const result = await res.json();
    if (result.success) {
      alert(result.message);
      loadPOSStaffList();
    } else {
      alert(result.error);
    }
  } catch (err) {
    console.error('Delete staff error:', err);
  }
}

async function loadPOSTransactionHistory() {
  const container = document.getElementById('pos-history-container');
  const omsetEl = document.getElementById('pos-total-omset');
  const ordersEl = document.getElementById('pos-total-orders');
  if (!container) return;

  try {
    const res = await fetch('/api/v1/pos/transactions', {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const result = await res.json();

    if (result.success) {
      const { transactions, summary } = result.data;
      if (omsetEl) omsetEl.innerText = `Rp ${summary.total_revenue.toLocaleString('id-ID')}`;
      if (ordersEl) ordersEl.innerText = `${summary.total_orders} Transaksi`;

      if (transactions.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 1rem;">Belum ada riwayat transaksi penjualan hari ini.</div>`;
        return;
      }

      container.innerHTML = transactions.map(t => `
        <div style="background: rgba(0,0,0,0.2); border-left: 3px solid #34d399; padding: 0.6rem; border-radius: 6px; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>Struk #${t.id}</strong> - <span style="color: #94a3b8;">${t.cashier_name}</span><br>
            <span style="font-size: 0.75rem; color: var(--text-muted);">${t.items.map(i=>`${i.qty}x ${i.name}`).join(', ')} (${t.payment_method})</span>
          </div>
          <div style="font-weight: 800; color: #34d399; font-size: 0.9rem;">Rp ${t.total_amount.toLocaleString('id-ID')}</div>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Load transaction history error:', err);
  }
}

// ==========================================
// MODUL: KIT LOKAL NAIK KELAS (ACTION KIT V1)
// ==========================================

let kitState = {
  version: 1,
  answers: Array(12).fill(null),
  baseline: null,
  checkupComplete: false,
  qIndex: 0,
  recommended: 1,
  route: [],
  items: {},
  status: {},
  fields: {},
  wait: {},
  maintenance: { date: '', checks: {}, notes: '', next: '', person: '' },
  after: {},
  activeSubView: 'welcome',
  selectedStep: 1
};

const kitStepsDefinition = [
  { id: 1, badge: 'DITEMUKAN', verb: 'CEK', title: 'Cek & Telusuri Usaha Sendiri', result: 'Anda tahu apa yang pelanggan lihat sekarang.', why: 'Sebelum membetulkan apa pun, lihat dulu kondisi yang sebenarnya.', action: 'Cari seperti pelanggan, lalu simpan kondisi awal.' },
  { id: 2, badge: 'DITEMUKAN', verb: 'KUASAI', title: 'Klaim & Amankan Profil Usaha', result: 'Anda tahu siapa yang mempunyai akses profil dan tindakan berikutnya.', why: 'Memastikan akses sebelum mengubah informasi.', action: 'Pilih jalur sesuai keadaan profil.' },
  { id: 3, badge: 'DITEMUKAN', verb: 'BENAHI', title: 'Bereskan 7 Informasi Utama', result: 'Tujuh informasi penting sudah diperiksa.', why: 'Jam atau nomor yang salah membuat pelanggan salah lokasi/kontak.', action: 'Buka Edit profil. Periksa tiap bagian.' },
  { id: 4, badge: 'DIPERCAYA', verb: 'TUNJUKKAN', title: 'Foto Penting & Kredibilitas Visual', result: 'Paket foto dasar usaha siap.', why: 'Foto nyata membantu pelanggan mengenali tempat dan hasil kerja.', action: 'Pilih foto yang mewakili kondisi usaha.' },
  { id: 5, badge: 'DIPERCAYA', verb: 'MUDAHKAN', title: 'Membuat Jalur Pintar Ulasan', result: 'Direct Review Link tersedia dan sudah dites.', why: 'Memudahkan pelanggan menulis review.', action: 'Ambil link resmi & coba dari HP lain.' },
  { id: 6, badge: 'DIPERCAYA', verb: 'RESPONS', title: 'Mengirim Undangan Ulasan & Cara Membalas', result: 'Cara meminta dan membalas review siap dipakai.', why: 'Memelihara hubungan dengan ulasan pelanggan.', action: 'Siapkan undangan & SOP balasan.' },
  { id: 7, badge: 'DI-CHAT', verb: 'SIAPKAN CHAT', title: 'Merapikan Profil WhatsApp Business', result: 'Profil WhatsApp Business sudah diperiksa.', why: 'Memastikan profil WA profesional.', action: 'Periksa foto, deskripsi & jam.' },
  { id: 8, badge: 'DI-CHAT', verb: 'PERCEPAT', title: 'Menyiapkan Balasan Cepat / Quick Replies', result: '3–5 jawaban berulang tersimpan & dicoba.', why: 'Jawaban sama tidak perlu diketik ulang.', action: 'Buat Quick Replies di WA Business.' }
];

const kitQuestions = [
  "Ketika nama usaha dicari di Google/Maps, profil yang benar muncul?",
  "Anda tahu akun Google yang mempunyai akses mengelola profil tersebut?",
  "Nama, kategori, lokasi/area, jam dan nomor kontak sudah Anda cek baru-baru ini?",
  "Foto yang tampil masih mewakili kondisi usaha sekarang?",
  "Profil mempunyai foto nyata yang membantu pelanggan mengenali usaha?",
  "Anda tahu jumlah review yang dimiliki dan sudah membaca review terbaru?",
  "Anda sudah mempunyai link langsung untuk meminta review?",
  "Review pelanggan yang perlu respons biasanya dibalas?",
  "Anda sudah menggunakan WhatsApp Business untuk usaha?",
  "Nama, foto, deskripsi dan jam di WhatsApp Business sudah diperiksa?",
  "Anda tahu tiga pertanyaan yang paling sering ditanyakan pelanggan melalui WhatsApp?",
  "Anda sudah mempunyai Quick Replies untuk pertanyaan yang berulang?"
];

async function loadKitStateFromBackend() {
  try {
    const res = await fetch('/api/v1/kit/state', {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const result = await res.json();
    if (result.success && result.data) {
      kitState = { ...kitState, ...result.data };
      updateKitProgressUI();
      renderKitView();
    }
  } catch (err) {
    console.error('Load kit state error:', err);
  }
}

async function syncKitStateToBackend() {
  try {
    const statusEl = document.getElementById('kit-save-status');
    if (statusEl) statusEl.innerText = '⏳ Menyimpan ke cloud...';

    const res = await fetch('/api/v1/kit/state', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify(kitState)
    });
    const result = await res.json();
    if (result.success && statusEl) {
      statusEl.innerText = '✓ Tersimpan di Cloud Backend';
    }
  } catch (err) {
    console.error('Sync kit state error:', err);
  }
}

function updateKitProgressUI() {
  const doneCount = Object.values(kitState.status || {}).filter(s => s === 'done').length;
  const fillEl = document.getElementById('kit-progress-fill');
  const labelEl = document.getElementById('kit-progress-label');
  if (fillEl) fillEl.style.width = `${(doneCount / 8) * 100}%`;
  if (labelEl) labelEl.innerText = `${doneCount} dari 8 langkah selesai`;
}

function showKitSubView(subView, stepNum) {
  kitState.activeSubView = subView;
  if (stepNum) kitState.selectedStep = stepNum;

  document.querySelectorAll('.kit-nav-btn').forEach(btn => btn.classList.remove('active'));
  const targetNav = document.getElementById(`kit-nav-${subView}`) || document.getElementById('kit-nav-ai');
  if (targetNav) targetNav.classList.add('active');

  const aiPanel = document.getElementById('audit-subview-ai');
  const kitContainer = document.getElementById('kit-dynamic-view-container');

  if (subView === 'ai') {
    if (aiPanel) aiPanel.style.display = 'block';
    if (kitContainer) kitContainer.style.display = 'none';
  } else {
    if (aiPanel) aiPanel.style.display = 'none';
    if (kitContainer) kitContainer.style.display = 'block';
    renderKitView();
  }
}

function renderKitView() {
  const container = document.getElementById('kit-dynamic-view-container');
  if (!container) return;

  const view = kitState.activeSubView || 'ai';

  if (view === 'checkup') {
    container.innerHTML = renderKitCheckupHTML();
  } else if (view === 'result') {
    container.innerHTML = renderKitResultHTML();
  } else if (view === 'steps') {
    container.innerHTML = renderKitStepsHTML();
  } else if (view === 'compare') {
    container.innerHTML = renderKitCompareHTML();
  } else if (view === 'maintenance') {
    container.innerHTML = renderKitMaintenanceHTML();
  }
}

function renderKitWelcomeHTML() {
  return `
    <div class="card" style="background: rgba(18, 25, 41, 0.8); border: 1px solid rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 16px;">
      <span class="role-badge free" style="margin-bottom: 0.75rem;">DIGITAL ACTION KIT</span>
      <h2 style="font-family: 'Outfit'; font-size: 1.8rem; margin-bottom: 0.75rem; color: #ffffff;">Kalau pelanggan mencari usaha Anda hari ini, apa yang mereka lihat?</h2>
      <p style="color: #94a3b8; font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.25rem;">
        Cek dulu kondisi Google Maps, ulasan, dan WhatsApp usaha Anda. Setelah itu, tentukan bagian mana yang paling perlu dibereskan terlebih dahulu.
      </p>
      
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
        <button class="btn btn-primary" onclick="showKitSubView('checkup')">🚀 MULAI CEK KONDISI USAHA (12 SOAL)</button>
        <button class="btn btn-secondary" onclick="showKitSubView('steps')">📱 KELOLA 8 LANGKAH EKSEKUSI</button>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-top: 1rem;">
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 1rem; border-radius: 12px;">
          <div style="font-size: 0.8rem; color: #60a5fa; font-weight: 700;">01. DITEMUKAN</div>
          <div style="font-weight: 700; margin: 0.25rem 0;">Informasi Usaha Jelas</div>
          <div style="font-size: 0.8rem; color: #94a3b8;">Cek profil Maps, klaim akses pengelola & 7 info utama.</div>
        </div>
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 1rem; border-radius: 12px;">
          <div style="font-size: 0.8rem; color: #34d399; font-weight: 700;">02. DIPERCAYA</div>
          <div style="font-weight: 700; margin: 0.25rem 0;">Foto & Ulasan Nyata</div>
          <div style="font-size: 0.8rem; color: #94a3b8;">Upload foto kredibel, buat link review & siapkan balasan.</div>
        </div>
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 1rem; border-radius: 12px;">
          <div style="font-size: 0.8rem; color: #f59e0b; font-weight: 700;">03. DI-CHAT</div>
          <div style="font-weight: 700; margin: 0.25rem 0;">Jawaban WA Siap</div>
          <div style="font-size: 0.8rem; color: #94a3b8;">Rapikan WA Business & simpan 3-5 Quick Replies.</div>
        </div>
      </div>
    </div>
  `;
}

function renderKitCheckupHTML() {
  const idx = kitState.qIndex || 0;
  const currentAnswer = kitState.answers[idx];
  const answeredCount = kitState.answers.filter(Boolean).length;

  return `
    <div class="card" style="background: rgba(18, 25, 41, 0.8); border: 1px solid rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 16px;">
      <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #94a3b8; margin-bottom: 0.5rem;">
        <span>Pertanyaan ${idx + 1} dari 12</span>
        <span>${answeredCount} / 12 Terjawab</span>
      </div>
      
      <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 99px; overflow: hidden; margin-bottom: 1.25rem;">
        <div style="height: 100%; width: ${(answeredCount / 12) * 100}%; background: #3b82f6; transition: width 0.3s ease;"></div>
      </div>

      <h3 style="font-family: 'Outfit'; font-size: 1.35rem; color: #ffffff; margin-bottom: 1.25rem;">
        ${kitQuestions[idx]}
      </h3>

      <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem;">
        <button class="btn ${currentAnswer === 'yes' ? 'btn-primary' : 'btn-secondary'}" style="text-align: left; padding: 0.85rem 1.25rem;" onclick="answerKitQuestion('yes')">
          ✅ Sudah (Sudah dilakukan / siap)
        </button>
        <button class="btn ${currentAnswer === 'no' ? 'btn-primary' : 'btn-secondary'}" style="text-align: left; padding: 0.85rem 1.25rem;" onclick="answerKitQuestion('no')">
          ❌ Belum (Belum dikerjakan / butuh penanganan)
        </button>
        <button class="btn ${currentAnswer === 'unknown' ? 'btn-primary' : 'btn-secondary'}" style="text-align: left; padding: 0.85rem 1.25rem;" onclick="answerKitQuestion('unknown')">
          ❓ Tidak Tahu (Belum yakin / perlu dicek dulu)
        </button>
      </div>

      <div style="display: flex; justify-content: space-between;">
        <button class="btn btn-secondary" ${idx === 0 ? 'disabled' : ''} onclick="prevKitQuestion()">← Sebelumnya</button>
        <button class="btn btn-primary" ${!currentAnswer ? 'disabled' : ''} onclick="nextKitQuestion()">
          ${idx === 11 ? '🎯 Lihat Hasil Checkup' : 'Lanjut →'}
        </button>
      </div>
    </div>
  `;
}

function answerKitQuestion(val) {
  const idx = kitState.qIndex || 0;
  kitState.answers[idx] = val;
  syncKitStateToBackend();
  renderKitView();
}

function prevKitQuestion() {
  if (kitState.qIndex > 0) {
    kitState.qIndex--;
    renderKitView();
  }
}

function nextKitQuestion() {
  const idx = kitState.qIndex || 0;
  if (idx < 11) {
    kitState.qIndex++;
    renderKitView();
  } else {
    evaluateKitCheckupResult();
  }
}

async function evaluateKitCheckupResult() {
  try {
    const res = await fetch('/api/v1/kit/checkup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ answers: kitState.answers })
    });
    const result = await res.json();
    if (result.success) {
      kitState.checkupComplete = true;
      kitState.route = result.data.route;
      kitState.recommended = result.data.recommended_step;
      showKitSubView('result');
    }
  } catch (err) {
    console.error('Evaluate checkup error:', err);
  }
}

function renderKitResultHTML() {
  const answers = kitState.answers || Array(12).fill(null);
  const ready = answers.filter(a => a === 'yes').length;
  const needsWork = answers.filter(a => a === 'no').length;
  const unknown = answers.filter(a => a === 'unknown').length;
  const recommendedStepId = kitState.recommended || 1;
  const recommendedStep = kitStepsDefinition.find(s => s.id === recommendedStepId) || kitStepsDefinition[0];

  return `
    <div class="card" style="background: rgba(18, 25, 41, 0.8); border: 1px solid rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 16px;">
      <span class="role-badge premium" style="margin-bottom: 0.5rem;">HASIL DIAGNOSIS ETALASE DIGITAL</span>
      <h2 style="font-family: 'Outfit'; font-size: 1.5rem; color: #ffffff; margin-bottom: 1rem;">Ringkasan Checkup Usaha Anda</h2>

      <!-- Tally Box -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; text-align: center;">
        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); padding: 1rem; border-radius: 12px;">
          <div style="font-size: 2rem; font-weight: 800; color: #34d399;">${ready}</div>
          <div style="font-size: 0.8rem; color: #94a3b8;">Bagian Sudah Siap</div>
        </div>
        <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); padding: 1rem; border-radius: 12px;">
          <div style="font-size: 2rem; font-weight: 800; color: #fbbf24;">${needsWork}</div>
          <div style="font-size: 0.8rem; color: #94a3b8;">Perlu Dibereskan</div>
        </div>
        <div style="background: rgba(148, 163, 184, 0.1); border: 1px solid rgba(148, 163, 184, 0.3); padding: 1rem; border-radius: 12px;">
          <div style="font-size: 2rem; font-weight: 800; color: #cbd5e1;">${unknown}</div>
          <div style="font-size: 0.8rem; color: #94a3b8;">Perlu Dicek Kuis</div>
        </div>
      </div>

      <!-- Recommended Step Box -->
      <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%); border: 1px solid rgba(99, 102, 241, 0.4); padding: 1.25rem; border-radius: 12px; margin-bottom: 1.5rem;">
        <div style="font-size: 0.8rem; color: #60a5fa; font-weight: 700; text-transform: uppercase;">🎯 REKOMENDASI UTAMA TERDEPAN</div>
        <h3 style="font-size: 1.2rem; color: #ffffff; margin: 0.25rem 0;">Langkah ${recommendedStep.id}: ${recommendedStep.title}</h3>
        <p style="font-size: 0.88rem; color: #cbd5e1; margin-bottom: 0.75rem;">${recommendedStep.result}</p>
        <button class="btn btn-primary" onclick="showKitSubView('steps', ${recommendedStep.id})">🚀 Buka Pekerjaan Ini Sekarang →</button>
      </div>

      <div style="display: flex; gap: 0.75rem;">
        <button class="btn btn-secondary" onclick="showKitSubView('checkup')">🔄 Periksa Ulang Jawaban</button>
        <button class="btn btn-primary" onclick="showKitSubView('steps')">📱 Kelola 8 Langkah Eksekusi</button>
      </div>
    </div>
  `;
}

function renderKitStepsHTML() {
  const selectedId = kitState.selectedStep || 1;
  const step = kitStepsDefinition.find(s => s.id === selectedId) || kitStepsDefinition[0];
  const stepStatus = kitState.status[selectedId] || 'idle';
  const stepFields = kitState.fields[selectedId] || {};

  const statusBadgeColor = {
    idle: '#64748b',
    working: '#60a5fa',
    waiting: '#fbbf24',
    done: '#34d399'
  };

  return `
    <div style="display: grid; grid-template-columns: 240px 1fr; gap: 1.25rem;">
      <!-- Step Sidebar List -->
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        ${kitStepsDefinition.map(s => {
          const st = kitState.status[s.id] || 'idle';
          const isSelected = s.id === selectedId;
          return `
            <button class="btn ${isSelected ? 'btn-primary' : 'btn-secondary'}" style="text-align: left; padding: 0.75rem 1rem; display: flex; justify-content: space-between; align-items: center;" onclick="showKitSubView('steps', ${s.id})">
              <span><strong>0${s.id}.</strong> ${s.verb}</span>
              <span style="font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 99px; background: rgba(0,0,0,0.3); color: ${statusBadgeColor[st]}; font-weight: 700;">
                ${st.toUpperCase()}
              </span>
            </button>
          `;
        }).join('')}
      </div>

      <!-- Step Content Box -->
      <div class="card" style="background: rgba(18, 25, 41, 0.8); border: 1px solid rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <div>
            <span class="role-badge free">LANGKAH ${step.id} / 8 · ${step.badge}</span>
            <h2 style="font-family: 'Outfit'; font-size: 1.4rem; color: #ffffff; margin-top: 0.25rem;">${step.title}</h2>
          </div>
          <span style="font-size: 0.8rem; font-weight: 700; padding: 0.35rem 0.85rem; border-radius: 20px; background: rgba(255,255,255,0.06); color: ${statusBadgeColor[stepStatus]}; border: 1px solid rgba(255,255,255,0.1);">
            STATUS: ${stepStatus.toUpperCase()}
          </span>
        </div>

        <div style="background: rgba(255,255,255,0.03); border-left: 3px solid #3b82f6; padding: 0.85rem; border-radius: 8px; margin-bottom: 1.25rem;">
          <div style="font-size: 0.75rem; color: #60a5fa; font-weight: 700;">HASIL LANGKAH INI:</div>
          <div style="font-size: 0.95rem; color: #f8fafc; font-weight: 600;">${step.result}</div>
        </div>

        <div style="margin-bottom: 1.25rem;">
          <h4 style="color: #ffffff; margin-bottom: 0.35rem;">Kenapa ini penting?</h4>
          <p style="font-size: 0.88rem; color: #94a3b8; line-height: 1.5;">${step.why}</p>
        </div>

        <div style="margin-bottom: 1.5rem; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05);">
          <h4 style="color: #60a5fa; margin-bottom: 0.5rem;">💡 Aksi Cepat & Kartu Catatan</h4>
          
          <div class="form-group" style="margin-bottom: 0.75rem;">
            <label style="font-size: 0.8rem; color: #cbd5e1;">Catatan Evidence / Hasil Pengerjaan:</label>
            <textarea class="form-control" rows="2" id="kit-step-notes-${step.id}" placeholder="Tuliskan catatan hasil pemeriksaan atau link..." onchange="saveKitStepField(${step.id}, 'notes', this.value)">${stepFields.notes || ''}</textarea>
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <button class="btn btn-primary" onclick="setKitStepStatus(${step.id}, 'done')">✅ Tandai Langkah Selesai</button>
          <button class="btn btn-secondary" onclick="setKitStepStatus(${step.id}, 'working')">⏳ Simpan Sedang Dikerjakan</button>
          <button class="btn btn-secondary" onclick="setKitStepStatus(${step.id}, 'waiting')">⏸️ Status Menunggu Proses</button>
        </div>
      </div>
    </div>
  `;
}

function saveKitStepField(stepId, key, val) {
  kitState.fields[stepId] = { ...(kitState.fields[stepId] || {}), [key]: val };
  syncKitStateToBackend();
}

async function setKitStepStatus(stepId, status) {
  try {
    const res = await fetch('/api/v1/kit/step-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        step_id: stepId,
        status,
        fields: kitState.fields[stepId] || {}
      })
    });
    const result = await res.json();
    if (result.success) {
      kitState.status[stepId] = status;
      updateKitProgressUI();
      renderKitView();
    }
  } catch (err) {
    console.error('Set step status error:', err);
  }
}

function renderKitCompareHTML() {
  const afterData = kitState.after || {};

  return `
    <div class="card" style="background: rgba(18, 25, 41, 0.8); border: 1px solid rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 16px;">
      <span class="role-badge premium" style="margin-bottom: 0.5rem;">PERBANDINGAN HASIL KERJA</span>
      <h2 style="font-family: 'Outfit'; font-size: 1.5rem; color: #ffffff; margin-bottom: 1rem;">Sebelum vs Sesudah Dikerjakan</h2>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
        <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); padding: 1rem; border-radius: 12px;">
          <div style="font-size: 0.75rem; color: #f87171; font-weight: 700;">SEBELUM (KONDISI AWAL)</div>
          <p style="font-size: 0.85rem; color: #cbd5e1; margin-top: 0.5rem;">
            Informasi belum terverifikasi, ulasan belum dikelola, dan WhatsApp belum memiliki Quick Replies.
          </p>
        </div>
        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); padding: 1rem; border-radius: 12px;">
          <div style="font-size: 0.75rem; color: #34d399; font-weight: 700;">SESUDAH (HASIL KERJA)</div>
          <p style="font-size: 0.85rem; color: #e2e8f0; margin-top: 0.5rem;">
            ${Object.values(kitState.status || {}).filter(s => s === 'done').length} dari 8 langkah eksekusi telah selesai diverifikasi & rapi.
          </p>
        </div>
      </div>

      <div class="form-group" style="margin-bottom: 1rem;">
        <label style="font-size: 0.85rem; color: #cbd5e1;">Catatan Perubahan yang Terlihat Faktual:</label>
        <textarea class="form-control" rows="3" placeholder="Tuliskan bukti perubahan faktual setelah perbaikan..." onchange="saveKitAfterField('changes', this.value)">${afterData.changes || ''}</textarea>
      </div>

      <button class="btn btn-primary" onclick="exportKitSummaryHTML()">📥 Download Laporan Hasil HTML / PDF</button>
    </div>
  `;
}

function saveKitAfterField(key, val) {
  kitState.after = { ...(kitState.after || {}), [key]: val };
  syncKitStateToBackend();
}

function renderKitMaintenanceHTML() {
  const maint = kitState.maintenance || {};
  const checks = maint.checks || {};

  const maintItems = [
    'Jam operasional toko masih sesuai keadaan nyata',
    'Nomor kontak WhatsApp Business aktif & dapat dihubungi',
    'Foto diperiksa; tambahkan foto baru bila ada promo',
    'Ulasan terbaru pelanggan Google Maps sudah dibaca',
    'Setiap ulasan atau keluhan pelanggan sudah dibalas ramah',
    'Pertanyaan berulang pelanggan dicatat ke daftar Quick Replies',
    'Informasi profil bisnis diupdate secara berkala'
  ];

  return `
    <div class="card" style="background: rgba(18, 25, 41, 0.8); border: 1px solid rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 16px;">
      <span class="role-badge free" style="margin-bottom: 0.5rem;">MAINTENANCE 15 MENIT SEMINGGU</span>
      <h2 style="font-family: 'Outfit'; font-size: 1.5rem; color: #ffffff; margin-bottom: 1rem;">Checklist Perawatan Rutin Usaha</h2>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
        <div class="form-group">
          <label style="font-size: 0.8rem; color: #cbd5e1;">Tanggal Pemeriksaan Minggu Ini:</label>
          <input type="date" class="form-control" value="${maint.date || ''}" onchange="saveKitMaintField('date', this.value)">
        </div>
        <div class="form-group">
          <label style="font-size: 0.8rem; color: #cbd5e1;">Petugas / PIC yang Bertugas:</label>
          <input type="text" class="form-control" placeholder="Nama PIC..." value="${maint.person || ''}" onchange="saveKitMaintField('person', this.value)">
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.65rem; margin-bottom: 1.5rem;">
        ${maintItems.map((itemText, idx) => `
          <label style="display: flex; align-items: center; gap: 0.75rem; background: rgba(0,0,0,0.2); padding: 0.75rem 1rem; border-radius: 8px; cursor: pointer;">
            <input type="checkbox" ${checks[idx] ? 'checked' : ''} onchange="toggleKitMaintCheck(${idx}, this.checked)" style="width: 18px; height: 18px;">
            <span style="font-size: 0.9rem; color: #f1f5f9;">${itemText}</span>
          </label>
        `).join('')}
      </div>

      <div class="form-group" style="margin-bottom: 1.25rem;">
        <label style="font-size: 0.8rem; color: #cbd5e1;">Catatan Pembaruan Minggu Ini:</label>
        <textarea class="form-control" rows="2" placeholder="Catat perubahan promo atau ulasan..." onchange="saveKitMaintField('notes', this.value)">${maint.notes || ''}</textarea>
      </div>

      <button class="btn btn-secondary" onclick="resetKitMaintenanceWeek()">🔄 Mulai Minggu Baru (Reset Checklist)</button>
    </div>
  `;
}

function saveKitMaintField(key, val) {
  kitState.maintenance = { ...(kitState.maintenance || {}), [key]: val };
  syncKitStateToBackend();
}

function toggleKitMaintCheck(idx, checked) {
  kitState.maintenance = kitState.maintenance || {};
  kitState.maintenance.checks = kitState.maintenance.checks || {};
  kitState.maintenance.checks[idx] = checked;
  syncKitStateToBackend();
}

function resetKitMaintenanceWeek() {
  if (confirm('Mulai minggu baru? Centang pemeriksaan minggu ini akan dikosongkan.')) {
    kitState.maintenance = {
      date: new Date().toISOString().split('T')[0],
      person: kitState.maintenance ? kitState.maintenance.person : '',
      checks: {},
      notes: '',
      next: ''
    };
    syncKitStateToBackend();
    renderKitView();
  }
}

function exportKitSummaryHTML() {
  const doneCount = Object.values(kitState.status || {}).filter(s => s === 'done').length;
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="utf-8">
      <title>Laporan Kit Lokal Naik Kelas — SuperUMKM</title>
      <style>
        body { font-family: system-ui, sans-serif; max-width: 800px; margin: auto; padding: 2rem; color: #1e293b; line-height: 1.6; }
        h1, h2 { color: #0f172a; }
        .box { border: 1px solid #cbd5e1; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; background: #f8fafc; }
        .badge { display: inline-block; padding: 0.2rem 0.6rem; background: #3b82f6; color: #fff; border-radius: 4px; font-size: 0.8rem; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>🚀 Laporan Kit Lokal Naik Kelas V1</h1>
      <p><strong>Tanggal Laporan:</strong> ${new Date().toLocaleDateString('id-ID')}</p>
      <div class="box">
        <span class="badge">PROGRES PEKERJAAN</span>
        <h2>${doneCount} dari 8 Langkah Eksekusi Selesai</h2>
      </div>
      <h2>Detail Status Langkah:</h2>
      ${kitStepsDefinition.map(s => `
        <div class="box">
          <h3>Langkah ${s.id}: ${s.title} (${(kitState.status[s.id] || 'IDLE').toUpperCase()})</h3>
          <p><strong>Hasil:</strong> ${s.result}</p>
          <p><strong>Catatan:</strong> ${(kitState.fields[s.id] && kitState.fields[s.id].notes) || '-'}</p>
        </div>
      `).join('')}
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `laporan-kit-lokal-naik-kelas-${Date.now()}.html`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

/* ========================================================
   MODULE 1: CASHFLOW & P&L SAKU
======================================================== */
async function loadCashflowData() {
  try {
    const [pnlRes, recordsRes] = await Promise.all([
      fetch('/api/v1/cashflow/pnl', { headers: { 'Authorization': `Bearer ${userToken}` } }),
      fetch('/api/v1/cashflow/records', { headers: { 'Authorization': `Bearer ${userToken}` } })
    ]);

    const pnlData = await pnlRes.json();
    const recordsData = await recordsRes.json();

    if (pnlData.success) {
      const summary = pnlData.data.summary;
      document.getElementById('pnl-income').innerText = `Rp ${summary.total_income.toLocaleString('id-ID')}`;
      document.getElementById('pnl-expense').innerText = `Rp ${summary.total_expense.toLocaleString('id-ID')}`;
      document.getElementById('pnl-net').innerText = `Rp ${summary.net_profit.toLocaleString('id-ID')}`;
    }

    if (recordsData.success) {
      const container = document.getElementById('cashflow-list-container');
      if (recordsData.data.length === 0) {
        container.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 1rem;">Belum ada catatan keuangan hari ini.</div>';
      } else {
        container.innerHTML = recordsData.data.map(rec => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <div>
              <div style="font-weight: 700; color: ${rec.type === 'INCOME' ? '#4ade80' : '#f87171'};">
                ${rec.type === 'INCOME' ? '💵' : '💸'} [${rec.category}] ${rec.notes || '-'}
              </div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${new Date(rec.created_at).toLocaleTimeString('id-ID')}</div>
            </div>
            <div style="font-weight: 800; color: ${rec.type === 'INCOME' ? '#4ade80' : '#f87171'};">
              ${rec.type === 'INCOME' ? '+' : '-'} Rp ${rec.amount.toLocaleString('id-ID')}
            </div>
          </div>
        `).join('');
      }
    }
  } catch (err) {
    console.error('loadCashflowData error:', err);
  }
}

async function handleAddCashflow(e) {
  e.preventDefault();
  const type = document.getElementById('cf-type').value;
  const category = document.getElementById('cf-category').value;
  const amount = Number(document.getElementById('cf-amount').value);
  const notes = document.getElementById('cf-notes').value;

  try {
    const res = await fetch('/api/v1/cashflow/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
      body: JSON.stringify({ type, category, amount, notes })
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('cf-amount').value = '';
      document.getElementById('cf-notes').value = '';
      loadCashflowData();
    } else {
      alert(data.error || 'Gagal menyimpan transaksi');
    }
  } catch (err) {
    console.error('handleAddCashflow error:', err);
  }
}

async function exportCashflowWA() {
  try {
    const res = await fetch('/api/v1/cashflow/export-wa', {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const data = await res.json();
    if (data.success && data.data.wa_link) {
      window.open(data.data.wa_link, '_blank');
    }
  } catch (err) {
    console.error('exportCashflowWA error:', err);
  }
}

/* ========================================================
   MODULE 2: SMART WA BROADCAST & LOYALTY ENGINE
======================================================== */
async function loadLoyaltyData() {
  try {
    const [contactsRes, churnRes] = await Promise.all([
      fetch('/api/v1/loyalty/contacts', { headers: { 'Authorization': `Bearer ${userToken}` } }),
      fetch('/api/v1/loyalty/churn-alerts', { headers: { 'Authorization': `Bearer ${userToken}` } })
    ]);

    const contactsData = await contactsRes.json();
    const churnData = await churnRes.json();

    if (contactsData.success) {
      const container = document.getElementById('loyalty-contacts-list');
      if (contactsData.data.length === 0) {
        container.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 1rem;">Belum ada kontak pelanggan.</div>';
      } else {
        container.innerHTML = contactsData.data.map(c => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <div>
              <div style="font-weight: 700;">👤 ${c.name} (${c.phone})</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Sumber: ${c.source} | Kunjungan: ${c.total_visits}x</div>
            </div>
            <button class="btn btn-secondary" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;" onclick="setWATarget('${c.phone}')">📢 Chat</button>
          </div>
        `).join('');
      }
    }

    if (churnData.success) {
      const churnBox = document.getElementById('churn-alert-list');
      if (churnData.data.length === 0) {
        churnBox.innerHTML = '<span style="color: #4ade80;">✓ Tidak ada pelanggan inactive (>14 hari).</span>';
      } else {
        churnBox.innerHTML = churnData.data.map(c => `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.35rem;">
            <span>⚠️ <strong>${c.name}</strong> (${c.days_since_last_visit} hari tidak berkunjung)</span>
            <button class="btn btn-primary" style="font-size: 0.7rem; padding: 0.2rem 0.4rem;" onclick="setWATarget('${c.phone}', 'churn')">Kirim Vouchers</button>
          </div>
        `).join('');
      }
    }
  } catch (err) {
    console.error('loadLoyaltyData error:', err);
  }
}

function setWATarget(phone, templateKey = 'greetings') {
  document.getElementById('wa-target-phone').value = phone;
  applyWATemplate(templateKey);
}

function applyWATemplate(type) {
  const select = document.getElementById('wa-template-select');
  if (select) select.value = type;
  const textarea = document.getElementById('wa-message-text');

  if (type === 'churn') {
    textarea.value = `Halo kak! Kami kangen nih di Warung Kelontong Berkah. Dapatkan DISKON 15% khusus kunjungan minggu ini. Tunjukkan WA ini ya! 🙌`;
  } else if (type === 'greetings') {
    textarea.value = `Halo kak! Terima kasih sudah menjadi pelanggan setia Warung Kelontong Berkah. Cek promo sembako hemat minggu ini ya! 🎉`;
  } else if (type === 'custom') {
    textarea.value = `Halo kak, ada penawaran spesial dari toko kami hari ini...`;
  }
}

async function openWABroadcastLink() {
  const phone = document.getElementById('wa-target-phone').value;
  const message = document.getElementById('wa-message-text').value;

  if (!phone || !message) {
    alert('Harap isi nomor WA dan pesan promosi!');
    return;
  }

  try {
    const res = await fetch('/api/v1/loyalty/broadcast-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
      body: JSON.stringify({ phone, message })
    });
    const data = await res.json();
    if (data.success && data.data.wa_link) {
      window.open(data.data.wa_link, '_blank');
    }
  } catch (err) {
    console.error('openWABroadcastLink error:', err);
  }
}

/* ========================================================
   MODULE 3: MANAJEMEN STOK, BUKU BON & SUPPLIER ORDER
======================================================== */
async function loadInventoryData() {
  try {
    const [itemsRes, alertRes, debtRes] = await Promise.all([
      fetch('/api/v1/inventory/items', { headers: { 'Authorization': `Bearer ${userToken}` } }),
      fetch('/api/v1/inventory/low-stock-alerts', { headers: { 'Authorization': `Bearer ${userToken}` } }),
      fetch('/api/v1/inventory/debt-books', { headers: { 'Authorization': `Bearer ${userToken}` } })
    ]);

    const itemsData = await itemsRes.json();
    const alertData = await alertRes.json();
    const debtData = await debtRes.json();

    if (alertData.success) {
      const banner = document.getElementById('low-stock-items-list');
      if (alertData.data.length === 0) {
        banner.innerHTML = '<span style="color: #4ade80;">✓ Semua stok aman di atas batas minimum.</span>';
      } else {
        banner.innerHTML = alertData.data.map(i => `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.35rem;">
            <span>🚨 <strong>${i.item_name}</strong> (Sisa: ${i.quantity}, Min: ${i.min_threshold})</span>
            <button class="btn btn-secondary" style="font-size: 0.7rem; padding: 0.2rem 0.4rem;" onclick="orderSupplierWA('${i.id}')">📲 Re-Order WA</button>
          </div>
        `).join('');
      }
    }

    if (itemsData.success) {
      const container = document.getElementById('inventory-table-container');
      container.innerHTML = itemsData.data.map(i => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
          <div>
            <div style="font-weight: 700;">📦 ${i.item_name}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Supplier: ${i.supplier_name || '-'} (${i.supplier_phone || '-'})</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 800; color: ${i.quantity <= i.min_threshold ? '#f87171' : '#4ade80'};">
              ${i.quantity} / ${i.min_threshold} min
            </div>
            <button class="btn btn-secondary" style="font-size: 0.7rem; padding: 0.15rem 0.35rem;" onclick="orderSupplierWA('${i.id}')">WA Order</button>
          </div>
        </div>
      `).join('');
    }

    if (debtData.success) {
      const debtContainer = document.getElementById('debt-list-container');
      if (debtData.data.length === 0) {
        debtContainer.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 1rem;">Belum ada catatan bon utang-piutang.</div>';
      } else {
        debtContainer.innerHTML = debtData.data.map(d => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <div>
              <div style="font-weight: 700; color: ${d.type === 'RECEIVABLE' ? '#38bdf8' : '#fb923c'};">
                ${d.type === 'RECEIVABLE' ? '📥 Piutang' : '📤 Utang'}: ${d.person_name}
              </div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Pencatat: ${d.recorded_by} | Tempo: ${d.due_date || 'Tak terbatas'}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: 800; color: ${d.status === 'PAID' ? '#4ade80' : '#f87171'};">
                Rp ${d.amount.toLocaleString('id-ID')} (${d.status})
              </div>
              ${d.status === 'UNPAID' ? `<button class="btn btn-primary" style="font-size: 0.7rem; padding: 0.15rem 0.35rem;" onclick="payDebt('${d.id}')">✓ Lunas</button>` : ''}
            </div>
          </div>
        `).join('');
      }
    }
  } catch (err) {
    console.error('loadInventoryData error:', err);
  }
}

async function handleSaveInventory(e) {
  e.preventDefault();
  const name = document.getElementById('inv-name').value;
  const qty = Number(document.getElementById('inv-qty').value);
  const min = Number(document.getElementById('inv-min').value);
  const supplier = document.getElementById('inv-supplier').value;
  const phone = document.getElementById('inv-supplier-phone').value;

  try {
    const res = await fetch('/api/v1/inventory/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
      body: JSON.stringify({ item_name: name, quantity: qty, min_threshold: min, supplier_name: supplier, supplier_phone: phone })
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('inv-name').value = '';
      document.getElementById('inv-qty').value = '';
      loadInventoryData();
    }
  } catch (err) {
    console.error('handleSaveInventory error:', err);
  }
}

async function handleSaveDebt(e) {
  e.preventDefault();
  const type = document.getElementById('debt-type').value;
  const person = document.getElementById('debt-person').value;
  const amount = Number(document.getElementById('debt-amount').value);
  const due = document.getElementById('debt-due').value;
  const recorder = document.getElementById('debt-recorder').value;

  try {
    const res = await fetch('/api/v1/inventory/debt-books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
      body: JSON.stringify({ type, person_name: person, amount, due_date: due, recorded_by: recorder })
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('debt-person').value = '';
      document.getElementById('debt-amount').value = '';
      loadInventoryData();
    }
  } catch (err) {
    console.error('handleSaveDebt error:', err);
  }
}

async function payDebt(id) {
  try {
    const res = await fetch(`/api/v1/inventory/debt-books/${id}/pay`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const data = await res.json();
    if (data.success) {
      loadInventoryData();
    }
  } catch (err) {
    console.error('payDebt error:', err);
  }
}

async function orderSupplierWA(itemId) {
  try {
    const res = await fetch(`/api/v1/inventory/supplier-order-draft?itemId=${itemId}`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const data = await res.json();
    if (data.success && data.data.wa_link) {
      window.open(data.data.wa_link, '_blank');
    }
  } catch (err) {
    console.error('orderSupplierWA error:', err);
  }
}

/* ========================================================
   MODULE 4: AI COPYWRITING & PROMO POSTER
======================================================== */
async function handleGenerateCopywriting() {
  const productName = document.getElementById('copy-product').value;
  const tone = document.getElementById('copy-tone').value;

  try {
    const res = await fetch('/api/v1/copywriting/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
      body: JSON.stringify({ product_name: productName, tone })
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('copy-output-text').value = data.data.generated_text;
    }
  } catch (err) {
    console.error('handleGenerateCopywriting error:', err);
  }
}

async function handleGeneratePromoPoster() {
  const productName = document.getElementById('copy-product').value;
  try {
    const res = await fetch('/api/v1/copywriting/promo-poster', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
      body: JSON.stringify({ menu_name: productName })
    });
    const data = await res.json();
    if (data.success) {
      const poster = data.data;
      document.getElementById('promo-poster-preview').innerHTML = `
        <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 10px; text-align: left; border: 1px solid rgba(59, 130, 246, 0.3);">
          <div style="font-size: 0.75rem; color: #38bdf8; font-weight: 700;">🏪 ${poster.store_name}</div>
          <div style="font-size: 1.2rem; font-weight: 800; color: #ffffff; margin: 0.25rem 0;">${poster.headline}</div>
          <img src="${poster.photo_url}" style="width: 100%; height: 140px; object-fit: cover; border-radius: 8px; margin: 0.5rem 0;">
          <div style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 0.5rem;">📍 Lokasi Usaha: <a href="${poster.gmaps_url}" target="_blank" style="color: #60a5fa;">Buka Google Maps</a></div>
          <button class="btn btn-success" style="width: 100%; font-size: 0.8rem;" onclick="navigator.clipboard.writeText('${poster.headline}'); alert('Teks poster disalin!')">📋 Salin Konten Poster</button>
        </div>
      `;
    }
  } catch (err) {
    console.error('handleGeneratePromoPoster error:', err);
  }
}

/* ========================================================
   SYSTEM ADMIN EXCLUSIVE: DOKUMENTASI SISTEM (IT & DEV)
======================================================== */
let loadedSystemDocsData = null;
let currentDocsKey = 'architecture';

async function loadITAdminDocsBackend() {
  const contentBox = document.getElementById('docs-viewer-content');
  if (!contentBox) return;

  contentBox.innerHTML = '⏳ Menghubungi API Backend (/api/v1/docs)... Menerapkan Verifikasi Role System Admin...';

  try {
    const res = await fetch('/api/v1/docs', {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });

    const data = await res.json();
    if (data.success) {
      loadedSystemDocsData = data.data;
      showDocsView(currentDocsKey);
    } else {
      contentBox.innerHTML = `
        <div style="color: #f87171; font-weight: bold; font-size: 1rem;">⛔ AKSES DITOLAK (403 FORBIDDEN)</div>
        <div style="margin-top: 0.5rem; color: #cbd5e1;">${data.error || 'Anda tidak memiliki hak akses (Responsibility System Admin) untuk melihat dokumentasi teknis ini.'}</div>
        <div style="margin-top: 1rem; font-size: 0.8rem; color: #94a3b8;">Petunjuk: Gunakan simulasi peran RBAC di sidebar kiri dan pilih <strong>Super Admin Platform</strong> untuk melihat dokumen ini.</div>
      `;
    }
  } catch (err) {
    console.error('loadITAdminDocsBackend error:', err);
    contentBox.innerHTML = '<div style="color: #f87171;">Terjadi kesalahan koneksi server saat mengambil berkas dokumentasi. Pastikan server aktif.</div>';
  }
}

function showDocsView(docKey, btnEl) {
  if (docKey) currentDocsKey = docKey;

  if (btnEl) {
    document.querySelectorAll('.docs-nav-btn').forEach(b => b.classList.remove('active'));
    btnEl.classList.add('active');
  }

  const contentBox = document.getElementById('docs-viewer-content');
  const titleEl = document.getElementById('docs-viewer-title');
  const tagEl = document.getElementById('docs-viewer-tag');

  if (!loadedSystemDocsData || !loadedSystemDocsData.files) {
    if (contentBox) contentBox.innerHTML = '⏳ Memuat data dokumentasi dari server...';
    loadITAdminDocsBackend();
    return;
  }

  const fileMap = {
    architecture: {
      title: '⚙️ Spesifikasi Arsitektur Sistem & Technology Stack',
      tag: 'BERKAS: docs/ARCHITECTURE.md',
      content: loadedSystemDocsData.files.architecture
    },
    api: {
      title: '🛠️ REST API Registry & Spesifikasi Endpoints',
      tag: 'BERKAS: docs/MODULES_API.md',
      content: loadedSystemDocsData.files.modules_api
    },
    migrations: {
      title: '🗄️ Database PostgreSQL SQL DDL Migration Script',
      tag: 'BERKAS: docs/MIGRATIONS.md',
      content: loadedSystemDocsData.files.migrations_sql
    },
    rbac: {
      title: '🔐 Matriks Peran & Hak Akses (RBAC Permission Matrix)',
      tag: 'BERKAS: docs/RBAC_MATRIX.md',
      content: loadedSystemDocsData.files.rbac_matrix
    },
    user_flows: {
      title: '🔀 User Flow Sequence & Software Requirement Specs',
      tag: 'BERKAS: USER_FLOW_SPEC.md & docs/USER_FLOWS.md',
      content: (loadedSystemDocsData.files.user_flow_spec || '') + '\n\n=======================================================\n' + (loadedSystemDocsData.files.user_flows || '')
    },
    readme: {
      title: '📘 Overview Platform & Modul List Repository',
      tag: 'BERKAS: README.md',
      content: loadedSystemDocsData.files.readme
    }
  };

  const selected = fileMap[currentDocsKey] || fileMap.architecture;
  if (titleEl) titleEl.innerText = selected.title;
  if (tagEl) tagEl.innerText = selected.tag;
  if (contentBox) contentBox.innerText = selected.content || 'Berkas dokumentasi belum ditemukan.';
}

/* ========================================================
   MODULE 5: INTEGRASI QRIS KASIR & AUTO-VERIFIER
======================================================== */
async function loadQRISData() {
  const amountInput = document.getElementById('qris-input-amount');
  const amount = amountInput ? Number(amountInput.value) || 50000 : 50000;
  const isDynamic = document.getElementById('qris-input-dynamic') ? document.getElementById('qris-input-dynamic').value === 'true' : true;

  try {
    const res = await fetch('/api/v1/qris/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
      body: JSON.stringify({ amount, isDynamic })
    });
    const data = await res.json();
    if (data.success) {
      activeQrisTransactionId = data.data.transaction_id;
      const previewBox = document.getElementById('qris-tab-svg-preview');
      if (previewBox) previewBox.innerHTML = data.data.qr_svg;

      const amountDisplay = document.getElementById('qris-tab-amount-display');
      if (amountDisplay) amountDisplay.innerText = `Rp ${amount.toLocaleString('id-ID')}`;

      const payloadStr = document.getElementById('qris-tab-payload-string');
      if (payloadStr) payloadStr.innerText = data.data.qris_payload;
    }
  } catch (err) {
    console.error('loadQRISData error:', err);
  }
}

async function handleGenerateQRISForm(e) {
  e.preventDefault();
  await loadQRISData();
}

async function handleSimulateQRISWebhook() {
  if (!activeQrisTransactionId) {
    await loadQRISData();
  }

  try {
    const res = await fetch('/api/v1/qris/verify-mock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
      body: JSON.stringify({ transaction_id: activeQrisTransactionId })
    });
    const data = await res.json();
    if (data.success) {
      const historyContainer = document.getElementById('qris-history-container');
      if (historyContainer) {
        historyContainer.innerHTML = `
          <div style="background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.4); padding: 0.75rem; border-radius: 8px; margin-bottom: 0.5rem;">
            <div style="display: flex; justify-content: space-between; font-weight: 700;">
              <span style="color: #4ade80;">✅ #${data.data.transaction_id}</span>
              <span style="color: #ffffff;">Rp ${(data.data.amount || 50000).toLocaleString('id-ID')}</span>
            </div>
            <div style="font-size: 0.75rem; color: #cbd5e1; margin-top: 0.25rem;">
              Status: <strong style="color: #4ade80;">${data.data.status}</strong> | Merchant: ${data.data.merchant_name || 'Toko UMKM'}
            </div>
          </div>
        ` + historyContainer.innerHTML;
      }
      alert(`✅ Webhook Callback Sukses! Transaksi QRIS #${data.data.transaction_id} terverifikasi LUNAS (PAID).`);
    }
  } catch (err) {
    console.error('handleSimulateQRISWebhook error:', err);
  }
}

function copyQrisPayloadString() {
  const payloadStr = document.getElementById('qris-tab-payload-string');
  if (payloadStr && payloadStr.innerText) {
    navigator.clipboard.writeText(payloadStr.innerText);
    alert('📋 String Payload QRIS disalin ke clipboard!');
  }
}
