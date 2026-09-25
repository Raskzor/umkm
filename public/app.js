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

  // Initial load
  handleAuditEvaluateDefault();
  loadTasks();
  loadCourses();
  loadPOSData();
}

// Navigation Tabs
function switchTab(tabId, el) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));

  document.getElementById(tabId).classList.add('active');
  if (el) {
    el.classList.add('active');
  } else {
    const matchingMenu = Array.from(document.querySelectorAll('.menu-item')).find(item => item.getAttribute('onclick').includes(tabId));
    if (matchingMenu) matchingMenu.classList.add('active');
  }

  const titles = {
    'audit-tab': { title: 'AI Business Health Audit', subtitle: 'Diagnosis otomatis AI kesehatan digital usaha UMKM Anda dalam 5 menit' },
    'gmaps-tab': { title: 'Google Maps & AI Review Engine', subtitle: 'Cetak QR Code Review, balasan otomatis AI, dan kupon loyalitas' },
    'landing-tab': { title: 'Builder Website Sementara UMKM', subtitle: 'Buat katalog web instan dengan tautan WhatsApp & upload foto' },
    'pos-tab': { title: 'Mesin Kasir & Kelola Anak Buah (Staf)', subtitle: 'Pencatatan transaksi instan, cetak struk, dan kelola staf kasir toko' },
    'services-tab': { title: 'Jasa Pendampingan & Smart Route Dispatch', subtitle: 'Manajemen tiket pengerjaan verifikasi lokasi & rute efisien agen' },
    'learning-tab': { title: 'Video Micro-Course Edukasi', subtitle: 'Modul pelatihan strategi pemasaran digital & Google Maps' }
  };

  if (titles[tabId]) {
    document.getElementById('active-tab-title').innerText = titles[tabId].title;
    document.getElementById('active-tab-subtitle').innerText = titles[tabId].subtitle;
  }

  if (tabId === 'pos-tab') {
    loadPOSData();
  }
}

// Evaluate Audit Default
async function handleAuditEvaluateDefault() {
  const payload = {
    has_gmaps_profile: true,
    gmaps_rating: 4.6,
    review_count: 15,
    has_website_or_catalog: false,
    has_whatsapp_business: true,
    photos_count: 8,
    weekly_post_updates: false
  };
  await runAuditEvaluation(payload);
}

// Audit Evaluation Form Submit (AI-Powered)
async function handleAuditSubmit(e) {
  e.preventDefault();
  
  const payload = {
    has_gmaps_profile: document.getElementById('audit-gmaps').value === 'true',
    gmaps_rating: parseFloat(document.getElementById('audit-rating').value),
    review_count: parseInt(document.getElementById('audit-reviews').value),
    has_website_or_catalog: document.getElementById('audit-catalog').value === 'true',
    has_whatsapp_business: document.getElementById('audit-wa').value === 'true',
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
      document.getElementById('score-val').innerText = result.data.health_score;
      document.getElementById('score-status').innerText = result.data.status_grade;
      document.getElementById('ai-diagnosis-summary').innerText = result.data.ai_diagnosis_summary;

      currentRecommendations = result.data.recommendations || [];

      // Render recommendations with interactive click-to-course support
      const recContainer = document.getElementById('recommendations-list');
      recContainer.innerHTML = currentRecommendations.map((rec, index) => `
        <div class="checklist-item interactive" onclick="openCourseDetailByIndex(${index})">
          <div class="checklist-icon">💡</div>
          <div style="flex: 1;">
            <div style="font-size: 0.9rem; font-weight: 600;">${rec.text}</div>
            <div class="course-badge-btn">
              <span>🎓 Pelajari Video & Step-by-Step:</span>
              <span>${rec.course_title || 'Lihat Tutorial'}</span>
            </div>
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Gagal menghitung skor audit:', err);
  }
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
      const pubLink = `/landing.html?slug=${result.data.slug}`;
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

      document.getElementById('wa-order-btn').href = `https://wa.me/62${payload.whatsapp_number.replace(/^0/, '')}?text=Halo%20${encodeURIComponent(payload.business_name)}`;
      
      alert('Website Sementara UMKM berhasil diterbitkan! Klik "Buka Web Publik" untuk melihat hasilnya.');
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

// Load Video Courses
async function loadCourses() {
  const container = document.getElementById('courses-grid');
  if (!container) return;

  try {
    const res = await fetch('/api/v1/learning/courses', {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const result = await res.json();

    if (result.success) {
      container.innerHTML = result.data.map(course => `
        <div class="card video-card" onclick="openCourseDetail('${course.id}', '${course.title}', 'Modul Edukasi: ${course.module_category}. Durasi ${Math.round(course.duration_seconds/60)} Menit.')">
          <div class="video-thumb" style="background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.8));">
            ▶️
            ${course.is_locked ? `
              <div class="lock-overlay">
                <span style="font-size: 2rem;">🔒</span>
                <span style="font-size: 0.8rem; font-weight: 700;">PREMIUM ONLY</span>
              </div>
            ` : ''}
          </div>
          <div style="font-size: 0.75rem; color: #60a5fa; font-weight: 700; text-transform: uppercase;">${course.module_category}</div>
          <div style="font-size: 1rem; font-weight: 700; margin: 0.4rem 0;">${course.title}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">Durasi: ${Math.round(course.duration_seconds / 60)} Menit</div>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Courses load error:', err);
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

async function handlePOSCheckout() {
  if (cartItems.length === 0) {
    alert('Keranjang belanja masih kosong!');
    return;
  }

  const payMethod = document.getElementById('pos-pay-method').value;

  try {
    const res = await fetch('/api/v1/pos/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        items: cartItems,
        payment_method: payMethod
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

function showReceiptModal(receipt) {
  const modal = document.getElementById('receipt-modal');
  if (!modal) return;

  document.getElementById('receipt-biz-name').innerText = receipt.business_name || 'Toko UMKM';
  document.getElementById('receipt-tx-id').innerText = `Struk #${receipt.id}`;
  document.getElementById('receipt-date').innerText = new Date(receipt.created_at).toLocaleString('id-ID');
  document.getElementById('receipt-cashier-name').innerText = receipt.cashier_name;
  document.getElementById('receipt-pay-method').innerText = receipt.payment_method;
  document.getElementById('receipt-total-amount').innerText = `Rp ${receipt.total_amount.toLocaleString('id-ID')}`;

  const itemsBody = document.getElementById('receipt-items-body');
  itemsBody.innerHTML = receipt.items.map(item => `
    <tr>
      <td style="padding: 0.35rem 0; color: #cbd5e1;">${item.qty}x ${item.name}</td>
      <td style="padding: 0.35rem 0; text-align: right; color: #f1f5f9; font-weight: 600;">Rp ${item.subtotal.toLocaleString('id-ID')}</td>
    </tr>
  `).join('');

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
