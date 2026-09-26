const express = require('express');
const router = express.Router();
const db = require('../../shared/database/db');
const { authenticate, authorizeRoles } = require('../../shared/utils/rbac');

const STEPS_DATA = [
  {
    id: 1,
    badge: 'DITEMUKAN',
    verb: 'CEK',
    title: 'Cek & Telusuri Usaha Sendiri',
    result: 'Anda tahu apa yang pelanggan lihat sekarang.',
    why: 'Sebelum membetulkan apa pun, lihat dulu kondisi yang sebenarnya. Yang sudah benar tidak perlu diubah.',
    action: 'Cari seperti pelanggan, lalu simpan kondisi awal.',
    rule: 'Satu pencarian tidak membuktikan posisi tetap atau kerusakan profil.',
    avoid: 'Jangan langsung membetulkan semuanya atau menyimpulkan usaha bermasalah hanya karena tidak muncul sekali.'
  },
  {
    id: 2,
    badge: 'DITEMUKAN',
    verb: 'KUASAI',
    title: 'Klaim & Amankan Profil Usaha',
    result: 'Anda tahu siapa yang mempunyai akses profil dan apa tindakan berikutnya.',
    why: 'Profil mungkin dulu dibuatkan staf atau saudara. Kita perlu memastikan akses sebelum mengubah informasinya.',
    action: 'Pilih jalur sesuai keadaan profil.',
    rule: 'Satu profil untuk satu usaha sesuai kelayakannya. Jangan membuat profil duplikat.',
    avoid: 'Jangan membagikan password atau menghapus akses orang sebelum perannya jelas.'
  },
  {
    id: 3,
    badge: 'DITEMUKAN',
    verb: 'BENAHI',
    title: 'Bereskan 7 Informasi Utama',
    result: 'Tujuh informasi penting sudah diperiksa.',
    why: 'Jam atau nomor yang salah bisa membuat pelanggan datang atau menghubungi pada tempat yang keliru.',
    action: 'Buka Edit profil. Periksa tiap bagian, simpan yang berubah, lalu lihat statusnya.',
    rule: 'Nama, alamat, kategori, dan informasi usaha harus sesuai kenyataan.',
    avoid: 'Jangan menumpuk kata pencarian pada nama, memakai alamat palsu, atau mengirim perubahan berulang.'
  },
  {
    id: 4,
    badge: 'DIPERCAYA',
    verb: 'TUNJUKKAN',
    title: 'Foto Penting & Kredibilitas Visual',
    result: 'Paket foto dasar usaha siap.',
    why: 'Foto nyata membantu pelanggan mengenali tempat, proses, atau hasil pekerjaan Anda.',
    action: 'Pilih foto yang masih mewakili kondisi usaha sekarang.',
    rule: 'Gunakan materi yang berhak Anda tampilkan dan hindari publikasi informasi pribadi.',
    avoid: 'Jangan memakai hasil kerja orang lain seolah milik sendiri.'
  },
  {
    id: 5,
    badge: 'DIPERCAYA',
    verb: 'MUDAHKAN',
    title: 'Membuat Jalur Pintar Ulasan',
    result: 'Direct Review Link tersedia dan sudah dites.',
    why: 'Pelanggan yang ingin bercerita tidak perlu mencari sendiri tempat menulis ulasan.',
    action: 'Ambil link resmi, lalu coba dari perangkat atau akun lain.',
    rule: 'Ulasan harus berasal dari pengalaman nyata. Akun Google diperlukan.',
    avoid: 'Jangan menggunakan link profil usaha lain atau menulis ulasan untuk usaha sendiri saat mengetes.'
  },
  {
    id: 6,
    badge: 'DIPERCAYA',
    verb: 'RESPONS',
    title: 'Mengirim Undangan Ulasan & Cara Membalas',
    result: 'Cara meminta dan membalas review sudah siap dipakai.',
    why: 'Pelanggan boleh puas, memberi catatan, atau mengeluh. Kita memberi kesempatan yang sama.',
    action: 'Siapkan undangan, balasan, dan kebiasaan yang bisa diikuti.',
    rule: 'Google melarang ulasan palsu, insentif untuk ulasan, serta meminta ulasan positif secara selektif.',
    avoid: 'Jangan bayar, pilih-pilih pelanggan puas, arahkan rating, atau mendikte isi ulasan.'
  },
  {
    id: 7,
    badge: 'DI-CHAT',
    verb: 'SIAPKAN CHAT',
    title: 'Merapikan Profil WhatsApp Business',
    result: 'Profil WhatsApp Business sudah diperiksa.',
    why: 'Nama, foto, dan informasi yang konsisten membantu orang mengenali usaha.',
    action: 'Periksa profil dan catat tiga pertanyaan yang sering masuk.',
    rule: 'Profil bisnis memuat informasi yang terlihat oleh pelanggan.',
    avoid: 'Jangan menampilkan alamat rumah hanya agar kolom terisi, atau memasang harga yang belum jelas.'
  },
  {
    id: 8,
    badge: 'DI-CHAT',
    verb: 'PERCEPAT',
    title: 'Menyiapkan Balasan Cepat / Quick Replies',
    result: '3–5 jawaban berulang tersimpan dan sudah dicoba.',
    why: 'Jawaban yang sama tidak perlu diketik dari awal terus-menerus.',
    action: 'Buat satu sampai berhasil, lalu ulangi untuk jawaban lainnya.',
    rule: 'Quick Replies menyimpan pesan yang bisa dipilih saat menjawab. Ini bukan chatbot otomatis.',
    avoid: 'Jangan menjanjikan biaya atau slot yang belum diketahui.'
  }
];

const QUESTIONS = [
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

const Q_STEPS = [1, 2, 3, 4, 4, 6, 5, 6, 7, 7, 7, 8];

function computePriorityOrder(answers) {
  const gaps = new Set();
  answers.forEach((a, i) => {
    if (a !== 'yes') gaps.add(Q_STEPS[i]);
  });
  if (gaps.has(8) && (answers[8] !== 'yes' || answers[9] !== 'yes' || answers[10] !== 'yes')) gaps.add(7);
  if (gaps.has(6) && answers[6] !== 'yes') gaps.add(5);
  if ([...gaps].some(n => n >= 3 && n <= 6) && answers[1] !== 'yes') gaps.add(2);
  if (answers[0] !== 'yes') gaps.add(1);

  return [...gaps].sort((a, b) => a - b).concat(STEPS_DATA.map(s => s.id).filter(i => !gaps.has(i)));
}

function getFreshState() {
  return {
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
    updated_at: new Date().toISOString()
  };
}

/**
 * @route GET /api/v1/kit/state
 * @desc Get authenticated user's Kit Lokal Naik Kelas state
 */
router.get('/state', authenticate, (req, res) => {
  const userId = req.user.id;
  if (!db.userKits[userId]) {
    db.userKits[userId] = getFreshState();
  }

  return res.json({
    success: true,
    data: db.userKits[userId]
  });
});

/**
 * @route POST /api/v1/kit/state
 * @desc Save/update full Kit Lokal Naik Kelas state
 */
router.post('/state', authenticate, authorizeRoles('UMKM_OWNER_FREE', 'UMKM_OWNER_PREMIUM', 'FIELD_AGENT', 'SUPER_ADMIN'), (req, res) => {
  const userId = req.user.id;
  const newState = req.body;

  if (!newState || typeof newState !== 'object') {
    return res.status(400).json({ success: false, error: 'Data state tidak valid' });
  }

  db.userKits[userId] = {
    ...(db.userKits[userId] || getFreshState()),
    ...newState,
    updated_at: new Date().toISOString()
  };

  return res.json({
    success: true,
    message: 'State Kit Lokal Naik Kelas berhasil disimpan.',
    data: db.userKits[userId]
  });
});

/**
 * @route POST /api/v1/kit/checkup
 * @desc Submit checkup answers (12 questions) & calculate priority route
 */
router.post('/checkup', authenticate, (req, res) => {
  const { answers } = req.body;

  if (!answers || !Array.isArray(answers) || answers.length !== 12) {
    return res.status(400).json({ success: false, error: 'Jawaban checkup harus berisi 12 item' });
  }

  const userId = req.user.id;
  const userState = db.userKits[userId] || getFreshState();

  userState.answers = answers;
  userState.checkupComplete = true;
  userState.baseline = userState.baseline || [...answers];
  userState.route = computePriorityOrder(answers);
  userState.recommended = userState.route[0] || 1;
  userState.updated_at = new Date().toISOString();

  db.userKits[userId] = userState;

  const tally = {
    ready: answers.filter(a => a === 'yes').length,
    needs_work: answers.filter(a => a === 'no').length,
    unclear: answers.filter(a => a === 'unknown').length
  };

  return res.json({
    success: true,
    message: 'Checkup berhasil dievaluasi!',
    data: {
      tally,
      route: userState.route,
      recommended_step: userState.recommended,
      steps_overview: STEPS_DATA
    }
  });
});

/**
 * @route POST /api/v1/kit/step-status
 * @desc Update single step status (idle, working, waiting, done)
 */
router.post('/step-status', authenticate, (req, res) => {
  const { step_id, status, fields, items, wait_info } = req.body;
  const stepId = Number(step_id);

  if (!stepId || stepId < 1 || stepId > 8) {
    return res.status(400).json({ success: false, error: 'Step ID tidak valid (1-8)' });
  }

  const validStatuses = ['idle', 'working', 'waiting', 'done'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: 'Status step tidak valid' });
  }

  const userId = req.user.id;
  const userState = db.userKits[userId] || getFreshState();

  userState.status[stepId] = status;

  if (fields) {
    userState.fields[stepId] = { ...(userState.fields[stepId] || {}), ...fields };
  }
  if (items) {
    userState.items[stepId] = { ...(userState.items[stepId] || {}), ...items };
  }
  if (wait_info) {
    userState.wait[stepId] = { ...(userState.wait[stepId] || {}), ...wait_info };
  }

  userState.updated_at = new Date().toISOString();
  db.userKits[userId] = userState;

  return res.json({
    success: true,
    message: `Status Langkah ${stepId} diperbarui menjadi '${status}'`,
    data: {
      step_id: stepId,
      status,
      user_state: userState
    }
  });
});

/**
 * @route GET /api/v1/kit/steps
 * @desc Get all 8 action steps definition & rules
 */
router.get('/steps', (req, res) => {
  return res.json({
    success: true,
    data: {
      steps: STEPS_DATA,
      questions: QUESTIONS
    }
  });
});

module.exports = router;
