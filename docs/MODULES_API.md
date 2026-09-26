# SuperUMKM Ecosystem Expansion - API Documentation

Dokumentasi lengkap HTTP Endpoints, Request Body, dan Response Samples untuk modul ekosistem SuperUMKM:
1. Modul Deterministic Health Score Engine & Action Center (`/api/v1/audit`)
2. Modul Mini Website & Toko Online Instan (`/api/v1/landing` & `/toko/:slug`)
3. Modul Cashflow & P&L Saku (`/api/v1/cashflow`)
4. Modul Smart WhatsApp Broadcast & Loyalty Engine (`/api/v1/loyalty`)
5. Modul Manajemen Stok, Buku Bon, & Supplier Order (`/api/v1/inventory`)
6. Modul Generator Promosi & AI Copywriting Lokal (`/api/v1/copywriting`)
7. Modul Integrasi QRIS Kasir (`/api/v1/qris`)
8. Modul Staf Kasir & Hak Akses Menu (`/api/v1/pos` & `/api/v1/users`)
9. Modul Local SEO & Google Maps Optimization (`/api/v1/gmaps`)

---

## 1. Modul Deterministic Health Score Engine & Action Center

### 1.1. Evaluasi Skor Kesehatan Usaha (100-Point Rule Engine)
- **HTTP Method**: `POST`
- **Route**: `/api/v1/audit/evaluate`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "has_gmaps_profile": true,
    "gmaps_rating": 4.6,
    "review_count": 15,
    "has_website_or_catalog": false,
    "has_whatsapp_business": true,
    "has_qris_payment": true,
    "has_physical_banner": true,
    "has_social_media": false,
    "has_promo_program": true,
    "photos_count": 8,
    "weekly_post_updates": false
  }
  ```
- **Response Sample**:
  ```json
  {
    "success": true,
    "data": {
      "health_score": 75,
      "status_grade": "PERLU OPTIMALISASI LOKAL",
      "ai_diagnosis_summary": "🤖 Analisis Kesehatan Usaha AI: Usaha Warung Kelontong Berkah berstatus PERLU OPTIMALISASI LOKAL (Skor: 75/100). Prioritas perbaikan utama: Belum menerbitkan Mini Website & Toko Online Instan. Dengan melengkapi aksi rekomendasi di bawah, potensi pelanggan lokal Anda akan meningkat pesat.",
      "breakdown": [
        { "dimension": "Google Business Presence", "earned": 20, "max": 20, "gap_reason": "Lokasi toko sudah terdaftar dan terverifikasi resmi di Google Maps." },
        { "dimension": "Review & Reputasi Toko", "earned": 15, "max": 15, "gap_reason": "Rating ulasan Google Maps sudah optimal (4.6 ⭐)." },
        { "dimension": "Foto & Kelengkapan Visual", "earned": 10, "max": 10, "gap_reason": "Jumlah foto produk & toko sudah memenuhi standar visual." },
        { "dimension": "Mini Website & Toko Online Instan", "earned": 0, "max": 15, "gap_reason": "Belum menerbitkan Mini Website & Toko Online Instan." },
        { "dimension": "WhatsApp & Kontak Toko", "earned": 10, "max": 10, "gap_reason": "Nomor WA Business resmi sudah terhubung." },
        { "dimension": "Produk & Kesiapan Harga", "earned": 10, "max": 10, "gap_reason": "Rutin menyajikan program promo dan harga bersaing." },
        { "dimension": "Transaksi Digital & QRIS", "earned": 10, "max": 10, "gap_reason": "Sudah menerima pembayaran QRIS / Transfer digital." },
        { "dimension": "Kesiapan Operasional Toko", "earned": 0, "max": 10, "gap_reason": "Diperlukan konsistensi posting konten media sosial secara rutin." }
      ],
      "top_focus_tasks": [
        {
          "title": "📱 Buat Mini Website & Toko Online Instan",
          "description": "Terbitkan toko instan untuk mempermudah pemesanan katalog produk via WhatsApp.",
          "impact_points": 15,
          "action_tab_id": "landing-tab"
        }
      ],
      "recommendations": [
        {
          "id": "rec-catalog",
          "text": "Terbitkan Mini Website & Toko Online Instan (Estimasi Dampak: +15 Poin)",
          "category": "Digital Catalog",
          "course_title": "Panduan Membuat Katalog Instan 3 Menit",
          "action_tab_id": "landing-tab",
          "action_button_label": "🚀 Terbitkan Toko Online Instan"
        }
      ]
    }
  }
  ```

---

## 2. Modul Mini Website & Toko Online Instan

### 2.1. Terbitkan / Update Toko Online Instan
- **HTTP Method**: `POST`
- **Route**: `/api/v1/landing/create`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "business_name": "Warung Kelontong Berkah",
    "category": "Retail & Sembako",
    "description": "Kebutuhan pokok harian lengkap dan terpercaya.",
    "whatsapp_number": "081234567890",
    "banner_url": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
    "social_links": {
      "instagram": "https://instagram.com/warung.berkah",
      "tiktok": "https://tiktok.com/@warungberkah"
    },
    "items": [
      { "name": "Minyak Goreng 2L", "price": "Rp 34.000", "description": "Kemasan hemat", "image_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400" }
    ]
  }
  ```
- **Response Sample**:
  ```json
  {
    "success": true,
    "data": {
      "slug": "warung-berkah",
      "publicUrl": "/toko/warung-berkah",
      "landing_data": { ... }
    }
  }
  ```

### 2.2. Publik Clean Store Route Endpoint
- **HTTP Method**: `GET`
- **Route**: `/toko/:slug` (Serves `landing.html` directly)
- **API Endpoint**: `GET /api/v1/landing/:slug`

---

## 3. Modul Cashflow & P&L Saku (Pembukuan Sederhana)

### 3.1. Catat Pemasukan / Pengeluaran Harian
- **HTTP Method**: `POST`
- **Route**: `/api/v1/cashflow/records`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "type": "EXPENSE",
    "category": "BAHAN_BAKU",
    "amount": 180000,
    "notes": "Kulakan Minyak & Beras",
    "date": "2026-09-26"
  }
  ```
- **Response Sample**:
  ```json
  {
    "success": true,
    "message": "Berhasil mencatat Pengeluaran sebesar Rp 180.000",
    "data": {
      "id": "cf-1758921600000",
      "owner_id": "u-free-001",
      "type": "EXPENSE",
      "category": "BAHAN_BAKU",
      "amount": 180000,
      "notes": "Kulakan Minyak & Beras",
      "date": "2026-09-26",
      "created_at": "2026-09-26T14:00:00.000Z"
    }
  }
  ```

---

## 4. Modul Smart WhatsApp Broadcast & Loyalty Engine

### 4.1. Deteksi Pelanggan Inaktif (Churn Alert Scheduler)
- **HTTP Method**: `GET`
- **Route**: `/api/v1/loyalty/churn-alerts?days=14`
- **Headers**: `Authorization: Bearer <token>`
- **Response Sample**:
  ```json
  {
    "success": true,
    "threshold_days": 14,
    "total_churned": 1,
    "data": [
      {
        "id": "cnt-001",
        "customer_name": "Budi Raharjo",
        "phone_number": "081299887766",
        "days_inactive": 42,
        "status_alert": "CRITICAL_CHURN"
      }
    ]
  }
  ```

---

## 5. Modul Manajemen Stok, Buku Bon, & Supplier Order

### 5.1. Low Stock Alert Trigger
- **HTTP Method**: `GET`
- **Route**: `/api/v1/inventory/low-stock-alerts`
- **Headers**: `Authorization: Bearer <token>`

---

## 6. Modul Integrasi QRIS Kasir

### 6.1. Generate QRIS Dinamis & SVG Image URL
- **HTTP Method**: `POST`
- **Route**: `/api/v1/qris/generate`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "amount": 101000,
    "transaction_id": "TX-1001"
  }
  ```

---

## 7. Modul Staf Kasir & Hak Akses Menu

### 7.1. Tambah Staf Kasir Baru (Freemium Quota Enforcement)
- **HTTP Method**: `POST`
- **Route**: `/api/v1/pos/staff`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
---

## 8. Modul Local SEO & Google Maps Optimization (`/api/v1/gmaps`)

### 8.1. Pandoman Kata Kunci Lokal (Local Keyword Injector)
- **HTTP Method**: `POST`
- **Route**: `/api/v1/gmaps/keyword-optimizer`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "business_name": "Warung Sate Bu Siti",
    "core_product": "Sate Kambing Muda",
    "location_street_or_district": "Antasari"
  }
  ```
- **Response Sample**:
  ```json
  {
    "success": true,
    "data": {
      "suggested_title": "Warung Sate Bu Siti - Sate Kambing Muda Antasari",
      "suggested_description": "Warung Sate Bu Siti menyediakan Sate Kambing Muda berkualitas dan harga terjangkau di Antasari. Siap melayani pelanggan lokal dengan pengiriman cepat dan pemesanan instan via WhatsApp.",
      "keywords": [
        "Sate Kambing Muda Antasari",
        "Warung Sate Bu Siti Antasari",
        "Toko Sate Kambing Muda Terdekat Antasari"
      ]
    }
  }
  ```

### 8.2. Suluh Kategori Bisnis (Category Optimizer)
- **HTTP Method**: `GET` / `POST`
- **Route**: `/api/v1/gmaps/categories`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body (POST)**:
  ```json
  {
    "primary_gmb_category": "Restaurant",
    "secondary_gmb_categories": ["Cafe", "Indonesian Restaurant", "Caterer"]
  }
  ```

### 8.3. Pengingat Posting Rutin (Google Posts Scheduler)
- **HTTP Method**: `GET` (`/api/v1/gmaps/posts-status`) / `POST` (`/api/v1/gmaps/posts-update`)
- **Headers**: `Authorization: Bearer <token>`

### 8.4. Deteksi Inkonsistensi NAP (Name, Address, Phone Check)
- **HTTP Method**: `POST`
- **Route**: `/api/v1/gmaps/nap-check`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "local_phone": "081234567890",
    "local_address": "Jl. Melati No. 12",
    "gmaps_phone": "089999999999",
    "gmaps_address": "Jl. Sudirman No. 99"
  }
  ```

### 8.5. Panduan Foto & Video (Visual Standardization Checklist)
- **HTTP Method**: `GET` / `POST`
- **Route**: `/api/v1/gmaps/visual-checklist`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body (POST)**:
  ```json
  {
    "front_photos_count": 2,
    "interior_photos_count": 3,
    "product_photos_count": 5
  }
  ```

