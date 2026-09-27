# BenPayu.com Platform - AI Business Consultant & Operating System Pendamping Usaha

Platform pendampingan, konsultasi, dan operasional digital terpadu untuk UMKM segmen Menengah-Bawah Indonesia berbasis siklus **CHECK → FIX → GROW** (Deterministic Audit Engine 8 Dimensi, Action Center "Fokus Minggu Ini", Google Maps Optimization, Mini Website & Toko Online Instan, POS Instant & QRIS, Pembukuan P&L, WA Loyalty Engine, Stok & Buku Bon, AI Promo Generator, Marketplace & Komunitas UMKM).

---

## 🌟 Fitur Utama Ekosistem

1. **Deterministic Business Health Score Engine**: Diagnosis kesehatan digital usaha berbasis rule-engine 100 poin transparan (8 Dimensi: Google Maps 20%, Review 15%, Foto Visual 10%, Mini Website 15%, WA Business 10%, Harga 10%, QRIS 10%, Operasional 10%).
2. **Progressive Onboarding Audit Wizard**: Form audit 4-langkah (Profil Usaha → Google Maps → Digital Presence & Katalog → Transaksi & Operasional) dengan conditional branching otomatis.
3. **Action Center & "Fokus Minggu Ini"**: Visualisasi skor kesehatan usaha (`X/100`), perbandingan progres sebelum/sesudah, dan 3 tugas prioritas teratas dengan indikator dampak poin tertinggi (contoh: `+15 Poin`).
4. **Google Maps Optimization & QR Review Engine**: Generator Standee QR Code review Google Maps dengan template *"Berikan Ulasan Jujur Anda"*, balasan otomatis AI, dan kupon loyalitas.
5. **Mini Website & Toko Online Instan (`/toko/:slug`)**: Katalog web instan 3-langkah dengan clean routing slug `/toko/:slug`, tautan WhatsApp ordering, media sosial, dan upload foto dari HP.
6. **Mesin Kasir Instant & Kelola Staf Kasir (POS)**: Pencatatan transaksi kasir instan, cetak struk digital, integrasi QRIS dinamis, dan manajemen akun staf kasir toko.
7. **Modul Cashflow & P&L Saku (Pembukuan Sederhana)**: Pencatatan harian pemasukan/pengeluaran kategori UMKM, omzet bersih otomatis, dan 1-klik export WA.
8. **Smart WhatsApp Broadcast & Loyalty Engine**: Himpunan kontak otomatis dari transaksi kasir & ulasan QR, scheduler churn alert, serta wa.me click-to-chat.
9. **Manajemen Stok, Buku Bon & Supplier Order**: Trigger low stock alert, auto draft order WA supplier, dan pencatatan utang-piutang bon lengkap dengan jatuh tempo.
10. **Generator Promosi & AI Copywriting Lokal**: Wrapper prompt AI teks promosi santai kontekstual lokal & data linker visual poster promo.
11. **Integrasi QRIS Kasir**: Payload QRIS dinamis/statis, QR SVG renderer, dan mock auto-verifier status pembayaran instan.
12. **Jasa Pendampingan Lapangan (Field Service & Pusat Rute Agen)**: Manajemen tiket tugas verifikasi titik lokasi & geotagging bukti foto oleh Agen Konsultan Wilayah (Monetisasi Assisted Service).
13. **Video Micro-Course Edukasi**: Modul pembelajaran strategi digital marketing & Google Maps berbasis tier aksesibilitas pengguna.
14. **Kit "Lokal Naik Kelas"**: Action kit interaktif 8 langkah eksekusi etalase digital beserta tracker maintenance mingguan.

---

## 🔐 Matriks Akses Peran & Hak Pengguna

- `UMKM_OWNER_FREE`: Akses dasar audit, QR standar, 1 toko instan, kasir POS (maks 1 staf kasir), video basic.
- `UMKM_OWNER_PREMIUM`: Kustomisasi QR branded, multi-section toko instan, kasir POS (unlimited staf kasir), video premium, priority ticket & priority route.
- `CASHIER` (Staf Kasir Toko): Input transaksi POS, cetak struk, scan QRIS, catat bon harian.
- `FIELD_AGENT` (Konsultan Wilayah): Menangani task pendampingan lapangan, verifikasi lokasi & mengunggah bukti foto geotag.
- `SUPER_ADMIN`: Manajemen pengguna, assign tugas ke agen, upload tutorial video, audit sistem, dan oversight penuh.

---

## 🛠️ Cara Menjalankan Project

```bash
# Install dependencies
npm install

# Menjalankan Server & Client Dashboard (Port 3000)
npm start

# Menjalankan Test Suite (30 Tests Lulus 100%)
npm test
```

---

## 📂 Struktur Dokumentasi

- `docs/ARCHITECTURE.md` - Spesifikasi arsitektur platform, siklus CHECK → FIX → GROW & deterministic scoring engine
- `docs/MIGRATIONS.md` - SQL DDL Migration script (PostgreSQL DDL)
- `docs/MODULES_API.md` - Dokumentasi REST API registry seluruh modul platform
- `docs/RBAC_MATRIX.md` - Matriks hak akses staf & peran pengguna
- `docs/USER_FLOWS.md` - Diagram sequence & state progressive audit wizard & Action Center flow
- `USER_FLOW_SPEC.md` - Spesifikasi kebutuhan perangkat lunak & spesifikasi pengguna lengkap
- `src/modules/` - `audit`, `auth`, `cashflow`, `copywriting`, `gmaps`, `inventory`, `kit`, `landing`, `learning`, `loyalty`, `pos`, `qris`, `services`, `docs`, `users`
- `src/shared/` - Persistence layer, database seeds, JWT auth & RBAC guards
- `public/` - Client Portal Web App (`index.html`, `home.html`, `landing.html`, `app.js`, `styles.css`)
- `test/` - Unit Test suite (`server.test.js`, `ecosystem.test.js`, `auth.test.js`, `navigation.test.js`, `kit.test.js`)
