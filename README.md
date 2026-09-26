# SuperUMKM Platform - Pendampingan & Ekosistem Digital UMKM

Platform pendampingan, konsultasi, dan operasional digital terpadu untuk UMKM segmen Menengah-Bawah Indonesia (Diagnosis AI, Google Maps Optimization, Mini Catalog Web Builder, POS Instant & QRIS, Pembukuan P&L, WA Loyalty Engine, Stok & Buku Bon, AI Promo Generator, Marketplace & Komunitas UMKM).

---

## 🌟 Fitur Utama Ekosistem

1. **Automated Business Health Check Engine**: Diagnosis mandiri kesehatan digital usaha (skor 0-100, pertimbangan Google Maps, dan rekomendasi aksi cepat).
2. **Kit "Lokal Naik Kelas"**: Action kit interaktif 8 langkah eksekusi etalase digital beserta tracker maintenance mingguan.
3. **Google Maps Optimization & QR Review Engine**: Cetak Standee QR Code review Google Maps dengan kustomisasi branding, balasan otomatis AI, dan kupon ulasan.
4. **Mini Catalog & Landing Page Builder**: Halaman katalog produk ringkas 3-menit dengan hook WhatsApp ordering & upload foto dari HP.
5. **Mesin Kasir Instant & Kelola Anak Buah (POS)**: Pencatatan transaksi kasir instan, cetak struk digital, dan manajemen akun staf kasir toko.
6. **Modul Cashflow & P&L Saku (Pembukuan Sederhana)**: Pencatatan harian pemasukan/pengeluaran kategori UMKM, omzet bersih otomatis, dan 1-klik export WA.
7. **Smart WhatsApp Broadcast & Loyalty Engine**: Himpunan kontak otomatis dari transaksi kasir & ulasan QR, scheduler churn alert, serta wa.me click-to-chat.
8. **Manajemen Stok, Buku Bon & Supplier Order**: Trigger low stock alert, auto draft order WA supplier, dan pencatatan utang-piutang bon lengkap dengan jatuh tempo.
9. **Generator Promosi & AI Copywriting Lokal**: Wrapper prompt AI teks promosi santai kontekstual lokal & data linker visual poster promo.
10. **Integrasi QRIS Kasir**: Payload QRIS dinamis/statis, QR SVG renderer, dan mock auto-verifier status pembayaran instan.
11. **Platform Marketplace UMKM**: Platform e-commerce terintegrasi untuk promosi dan penjualan produk UMKM.
12. **Komunitas UMKM**: Forum diskusi, networking, dan berbagi pengalaman antar pemilik UMKM.
13. **Jasa Pendampingan Lapangan (Field Service & Smart Route)**: Manajemen tiket tugas verifikasi titik lokasi & geotagging bukti foto oleh Agen Konsultan Wilayah.
14. **Video Micro-Course Edukasi**: Modul pembelajaran strategi digital marketing & Google Maps berbasis tier aksesibilitas RBAC.

---

## 🔐 Matriks Akses Peran (RBAC)

- `UMKM_OWNER_FREE`: Akses dasar audit, QR standar, 1 landing page, kasir POS (maks 1 staf), video basic.
- `UMKM_OWNER_PREMIUM`: Kustomisasi QR branded, multi-section landing, kasir POS (unlimited staf), video premium, priority ticket & priority route.
- `CASHIER` (Kasir Toko): Input transaksi POS, cetak struk, scan QRIS, catat bon harian.
- `FIELD_AGENT` (Konsultan Wilayah): Menangani task pendampingan lapangan, verifikasi lokasi & mengunggah bukti foto geotag.
- `SUPER_ADMIN`: Manajemen pengguna, assign tugas ke agen, upload tutorial video, audit sistem, dan oversight penuh.

---

## 🛠️ Cara Menjalankan Project

```bash
# Install dependencies
npm install

# Menjalankan Server & Client Dashboard (Port 3000)
npm start

# Menjalankan Test Suite (25 Tests Lulus 100%)
npm test
```

---

## 📂 Struktur Repositori

- `docs/ARCHITECTURE.md` - Spesifikasi arsitektur & sistem teknis
- `docs/MIGRATIONS.md` - SQL DDL Migration script (PostgreSQL)
- `docs/MODULES_API.md` - Dokumentasi REST API registry seluruh modul
- `docs/RBAC_MATRIX.md` - Matriks hak akses per peran pengguna
- `docs/USER_FLOWS.md` - Diagram sequence & state user flow
- `USER_FLOW_SPEC.md` - Software Requirements & Specification lengkap
- `src/modules/` - `audit`, `auth`, `cashflow`, `copywriting`, `gmaps`, `inventory`, `kit`, `landing`, `learning`, `loyalty`, `pos`, `qris`, `services`
- `src/shared/` - Persistence layer, database seeds, JWT auth & RBAC guards
- `public/` - Client Portal Web App (`index.html`, `home.html`, `app.js`, `styles.css`)
- `test/` - Unit Test suite (`ecosystem.test.js`, `auth.test.js`, `kit.test.js`)
