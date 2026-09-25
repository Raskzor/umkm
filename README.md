# SuperUMKM Platform - Pendampingan Digital UMKM

Platform pendampingan dan konsultasi digital UMKM segmen Menengah-Bawah (Google Maps Optimization, Review Management, Landing Page Builder, dan Video Edukasi Mandiri).

## 🌟 Fitur Utama
1. **Automated Business Health Check Engine**: Diagnosis mandiri kesehatan digital usaha (skor 0-100 & rekomendasi aksi cepat).
2. **Google Maps Optimization & QR Review Generator**: Cetak Standee QR Code review Google Maps dengan kustomisasi branding & template PDF.
3. **Mini Catalog & Landing Page Builder**: Halaman katalog produk ringkas 3-menit dengan hook WhatsApp ordering instan.
4. **Jasa Pendampingan Lapangan (Field Service & Ticketing)**: Manajemen tiket tugas verifikasi titik lokasi & geotagging bukti foto oleh Agen Konsultan Wilayah.
5. **Video Micro-Course Edukasi**: Modul pembelajaran strategi digital marketing berbasis tier aksesibilitas RBAC.

## 🔐 Matriks Akses Peran (RBAC)
- `UMKM_OWNER_FREE`: Akses dasar audit, QR standar, 1 landing page, video basic.
- `UMKM_OWNER_PREMIUM`: Kustomisasi QR branded, multi-section landing, video premium, priority ticket.
- `FIELD_AGENT`: Menangani task pendampingan wilayah & mengunggah bukti foto geotag.
- `SUPER_ADMIN`: Manajemen pengguna, assign tugas ke agen, upload tutorial video, dan audit sistem.

## 🛠️ Cara Menjalankan Project
```bash
# Install dependencies
npm install

# Menjalankan Server & Client Dashboard (Port 3000)
npm start

# Menjalankan Test Suite
npm test
```

## 📂 Struktur Repositori
- `docs/ARCHITECTURE.md` - Spesifikasi arsitektur & REST API registry
- `docs/RBAC_MATRIX.md` - Matriks hak akses per peran pengguna
- `docs/USER_FLOWS.md` - Diagram alur sequence & state diagram
- `src/modules/` - Auth, Audit, GMaps, Landing, Learning, Services
- `src/shared/` - DB Persistence Layer, JWT, RBAC guards
- `public/` - Web Portal Dashboard UI & Client Engine
- `test/` - Integration & Unit Test suite
