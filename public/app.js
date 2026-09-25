// SuperUMKM Client Portal & Interactive Engine
let currentRole = 'UMKM_OWNER_FREE';
let userToken = '';

const roleUsers = {
  UMKM_OWNER_FREE: { id: 'u-free-001', name: 'Budi Santoso', phone: '081234567890', role: 'UMKM_OWNER_FREE', badge: 'free', badgeText: 'UMKM FREE TIER' },
  UMKM_OWNER_PREMIUM: { id: 'u-prem-002', name: 'Siti Rahma', phone: '089876543210', role: 'UMKM_OWNER_PREMIUM', badge: 'premium', badgeText: 'UMKM PREMIUM TIER' },
  FIELD_AGENT: { id: 'u-agent-003', name: 'Rian Hidayat (Agen)', phone: '085551234567', role: 'FIELD_AGENT', badge: 'agent', badgeText: 'FIELD CONSULTANT' },
  SUPER_ADMIN: { id: 'u-admin-004', name: 'Super Admin System', phone: '080011223344', role: 'SUPER_ADMIN', badge: 'admin', badgeText: 'SUPER ADMIN' }
};

document.addEventListener('DOMContentLoaded', () => {
  switchRole('UMKM_OWNER_FREE');
});

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
}

// Navigation Tabs
function switchTab(tabId, el) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));

  document.getElementById(tabId).classList.add('active');
  if (el) el.classList.add('active');

  const titles = {
    'audit-tab': { title: 'AI Business Health Audit', subtitle: 'Diagnosis otomatis AI kesehatan digital usaha UMKM Anda dalam 5 menit' },
    'gmaps-tab': { title: 'Google Maps & AI Review Engine', subtitle: 'Cetak QR Code Review, balasan otomatis AI, dan kupon loyalitas' },
    'landing-tab': { title: 'Builder Website Sementara UMKM', subtitle: 'Buat katalog web instan dengan tautan WhatsApp otomatis' },
    'services-tab': { title: 'Jasa Pendampingan & Smart Route Dispatch', subtitle: 'Manajemen tiket pengerjaan verifikasi lokasi & rute efisien agen' },
    'learning-tab': { title: 'Video Micro-Course Edukasi', subtitle: 'Modul pelatihan strategi pemasaran digital & Google Maps' }
  };

  if (titles[tabId]) {
    document.getElementById('active-tab-title').innerText = titles[tabId].title;
    document.getElementById('active-tab-subtitle').innerText = titles[tabId].subtitle;
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

      // Render recommendations with interactive click-to-course support
      const recContainer = document.getElementById('recommendations-list');
      recContainer.innerHTML = result.data.recommendations.map(rec => `
        <div class="checklist-item interactive" onclick="openCourseDetail('${rec.target_course_id || 'tut-001'}', '${rec.course_title || 'Modul Edukasi UMKM'}', '${rec.text}')">
          <div class="checklist-icon">💡</div>
          <div style="flex: 1;">
            <div style="font-size: 0.9rem; font-weight: 600;">${rec.text}</div>
            <div class="course-badge-btn">
              <span>🎓 Pelajari di Micro-Course:</span>
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
function openCourseDetail(courseId, title, description) {
  document.getElementById('modal-title').innerText = title;
  document.getElementById('modal-description').innerText = description || 'Ikuti langkah-langkah praktis dalam video edukasi ini untuk menerapkan rekomendasi aksi pada usaha Anda.';
  
  // Set video URL
  const iframe = document.getElementById('modal-video-iframe');
  iframe.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1';

  document.getElementById('course-modal').classList.add('active');
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

// Build Website Sementara
async function handleBuildLanding(e) {
  e.preventDefault();

  const payload = {
    business_name: document.getElementById('landing-name').value,
    category: document.getElementById('landing-category').value,
    description: document.getElementById('landing-desc').value,
    whatsapp_number: document.getElementById('landing-wa').value
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
