# Software Requirements & Specification: SuperUMKM Platform

Platform pendampingan, konsultasi, dan operasional digital terpadu untuk UMKM segmen Menengah-Bawah Indonesia (Diagnosis AI & Kit Lokal Naik Kelas, Google Maps Optimization, Mini Catalog Web Builder, POS Instant & QRIS, Pembukuan P&L Saku, Smart WA Loyalty Engine, Stok & Buku Bon, AI Promo Generator, Marketplace & Komunitas UMKM).

---

## 1. User Roles & Permission Matrix (RBAC)

Sistem menggunakan model *Role-Based Access Control* (RBAC) dengan 5 entitas pengguna utama:

| Fitur / Modul | UMKM Owner (Free) | UMKM Owner (Premium) | Cashier (Anak Buah) | Consultant / Field Agent | Super Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Self-Audit & Action Kit** | Read / Execute | Read / Execute | No Access | Read All | Read All / Manage |
| **Google Maps & QR Review** | Standard PDF | Custom Branded PDF | Read / Print | Assist Setup | Manage Templates |
| **Landing Page / Web Builder** | 1 Page Builder | Multi-section + WA Hook | Read Catalog | Assist Setup | Full Manage |
| **POS Instant & Transaksi** | Full Access | Full Access | Transaction Entry | View Reports | Full Access |
| **Staff Assignment (Kasir)** | **Max 1 Staf** | **Unlimited Staf** | No Access | No Access | Full Manage |
| **Cashflow & P&L Saku** | Read / Create | Read / Create / Export | Create Entry | View Summary | Full Access |
| **Smart WA Broadcast & Loyalty**| Basic Contacts | Full Churn Alert & WA | View Contacts | Assist Broadcast | Full Access |
| **Stok, Bon & Supplier Order** | Low Stock Alert | Unlimited Re-Order | Record Bon | View Stock | Full Access |
| **AI Promo & Poster Generator**| Standard Tone | Priority AI & Poster | No Access | Assist Copywriting| Full Access |
| **Integrasi QRIS Kasir** | Static QRIS | Dynamic QRIS + Auto Verify| Generate & Scan | Assist Setup | Full Access |
| **Marketplace & Komunitas** | View & Post Basic | Priority Listing & Forum | View Only | Moderation Assist | Full Manage |
| **Field Service (Pin Maps)** | View Status | View Status + Report | No Access | Update Geotag | Full Oversight |
| **Video Micro-Tutorials** | Basic Tier | All Tiers (Premium) | Read Basic | Read All | Manage / Upload |

---

## 2. Core User Flows (System Interactions)

### 2.1. Onboarding, Automated Business Health Check & Kit "Lokal Naik Kelas" Flow
Pemilik UMKM mendaftar, menjawab audit kesehatan digital (5 menit), serta menjalankan 8 langkah eksekusi etalase digital.

```mermaid
sequenceDiagram
    autonumber
    actor UMKM as Pemilik UMKM
    participant UI as Mobile/Web Frontend
    participant API as Backend Service
    participant DB as Database Engine

    UMKM->>UI: Registrasi via No WhatsApp / Email
    UI->>API: POST /api/v1/auth/register
    API->>DB: Simpan akun & role UMKM_OWNER_FREE
    API-->>UI: Token JWT & Profile State

    UMKM->>UI: Mulai Diagnosis Kesehatan AI (5 Menit)
    UI->>API: POST /api/v1/audit/evaluate (Data Profil, GMaps Status, Rating)
    API->>API: Hitung Health Score (0-100) & Priority Recommendations
    API->>DB: Insert ke business_audit_logs
    API-->>UI: Tampilkan Health Score Card & 8 Langkah Kit Action Checklist

    UMKM->>UI: Update Status Langkah Kit (Contoh: Step 1 Done)
    UI->>API: PUT /api/v1/kit/state (Update step status & notes)
    API->>DB: Upsert ke kit_states
    API-->>UI: Refleksikan Progress Fill Bar (e.g. 12.5% Complete)
```

---

### 2.2. POS Transaction, QRIS Auto-Verification & Digital Receipt Flow
Kasir atau pemilik toko menginput produk ke keranjang, memilih metode bayar QRIS dinamis, menyimulasi verifikasi pembayaran otomatis, dan mencetak struk digital.

```mermaid
sequenceDiagram
    autonumber
    actor Cashier as Kasir Toko
    participant POS as POS Client Engine
    participant QRIS as QRIS Gateway Module
    participant API as POS Core API
    participant DB as Database Engine

    Cashier->>POS: Pilih Produk Katalog / Entry Custom
    POS->>POS: Hitung Subtotal & Grand Total

    alt Pembayaran via QRIS
        Cashier->>POS: Pilih Metode "QRIS" & Klik Proses
        POS->>QRIS: POST /api/v1/qris/generate (amount, isDynamic)
        QRIS-->>POS: Payload String QRIS & SVG Render
        POS-->>Cashier: Tampilkan Pop-up QRIS Modal
        
        alt Verifikasi Pembayaran Automatis
            QRIS->>API: POST /api/v1/qris/verify-mock (transaction_id)
            API->>DB: Update status qris_transactions -> PAID
            API-->>POS: Event Success Callback
        end
    end

    Cashier->>API: POST /api/v1/pos/transactions (items, payment_method)
    API->>DB: Simpan Transaksi & Auto-harvest Kontak Pelanggan
    API-->>POS: Return Digital Receipt Payload
    POS-->>Cashier: Tampilkan Modal Struk Digital & Tombol Print
```

---

### 2.3. Cashflow & P&L Saku Recording & WhatsApp Export Flow
Pencatatan harian pemasukan/pengeluaran dengan kategori UMKM, penghitungan omzet bersih otomatis, dan ekspor laporan ringkas via WhatsApp.

```mermaid
sequenceDiagram
    autonumber
    actor UMKM as Pemilik UMKM
    participant UI as Dashboard Client
    participant CF as Cashflow Service
    participant DB as Database Engine

    UMKM->>UI: Input Pemasukan / Pengeluaran (Tipe, Kategori, Nominal, Catatan)
    UI->>CF: POST /api/v1/cashflow/records
    CF->>DB: Simpan ke cashflow_records
    CF-->>UI: Konfirmasi Simpan & Refresh List

    UMKM->>UI: Klik "Laporan Laba/Rugi (P&L Saku)"
    UI->>CF: GET /api/v1/cashflow/pnl
    CF->>DB: Aggregate SUM(INCOME) - SUM(EXPENSE) + POS Revenue
    CF-->>UI: Return Summary (Total Income, Total Expense, Net Profit, Status)

    UMKM->>UI: Klik "Export via WA"
    UI->>CF: GET /api/v1/cashflow/export-wa
    CF-->>UI: Return Direct wa.me URL dengan Text Formatting Laporan
    UI-->>UMKM: Buka Aplikasi WhatsApp untuk Kirim Ringkasan Laporan
```

---

### 2.4. Smart WhatsApp Loyalty, Contact Harvesting & Churn Alert Flow
Himpunan kontak pelanggan dari transaksi kasir & ulasan QR, deteksi pelanggan inaktif (>14 hari), dan pengiriman broadcast promo `wa.me`.

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Pelanggan
    actor Owner as Pemilik UMKM
    participant App as System Engine
    participant Loyalty as Loyalty Module
    participant DB as Database Engine

    Customer->>App: Melakukan Transaksi Kasir / Scan QR Review
    App->>Loyalty: Harvest Nama & No WA Pelanggan
    Loyalty->>DB: Upsert ke customer_contacts (Increment total_visits & update last_visit)

    Note over Loyalty,DB: Cron / Scheduler System (Daily Job)
    Loyalty->>DB: Query customer_contacts WHERE last_visit < NOW() - 14 Days
    DB-->>Loyalty: Return List Pelanggan Inaktif (Churn Risk)

    Owner->>App: Buka Modul "Smart WA & Loyalty"
    App->>Loyalty: GET /api/v1/loyalty/churn-alerts
    Loyalty-->>App: Tampilkan Warning Banner & Daftar Pelanggan Churn
    Owner->>App: Pilih Template Promo Kangen & Klik Broadcast
    App->>Loyalty: POST /api/v1/loyalty/broadcast-link (phone, message)
    Loyalty-->>Owner: Open Tautan wa.me Click-to-Chat
```

---

### 2.5. Inventory Monitoring, Low Stock Trigger, Supplier WA Order & Buku Bon Flow
Monitoring stok barang/bahan baku, peringatan otomatis saat menyentuh batas minimum, draft re-order WA supplier, serta pencatatan bon utang-piutang.

```mermaid
sequenceDiagram
    autonumber
    actor Owner as Pemilik UMKM / Kasir
    participant Inv as Inventory Engine
    participant DB as Database Engine

    Owner->>Inv: Input Barang / Bahan (Nama, Qty, Min Threshold, Supplier WA)
    Inv->>DB: Save to inventory_items

    loop Monitoring Stok Real-time
        Inv->>DB: Check Qty <= Min Threshold
        DB-->>Inv: Trigger Low Stock Alert
    end

    Owner->>Inv: Buka Tab "Stok & Bon"
    Inv-->>Owner: Tampilkan Banner Alert Barang Kritis
    Owner->>Inv: Klik "Re-Order WA Supplier" (itemId)
    Inv->>Inv: Generate Text Draft: "Halo Supplier X, mau order barang Y qty Z"
    Inv-->>Owner: Buka WhatsApp Direct Chat Supplier

    Owner->>Inv: Catat Bon (Tipe RECEIVABLE/PAYABLE, Nama, Nominal, Due Date)
    Inv->>DB: Save to debt_books (status: UNPAID)
    Owner->>Inv: Klik "Pelunasan Bon" (debtId)
    Inv->>DB: Update debt_books SET status = 'PAID'
```

---

### 2.6. AI Copywriting & Promo Poster Data Linker Flow
Penataan kalimat promosi kontekstual lokal berbasis tone dan rendering poster visual produk yang menautkan foto, toko, dan Google Maps.

```mermaid
sequenceDiagram
    autonumber
    actor Owner as Pemilik UMKM
    participant Copy as Copywriting Module
    participant AI as AI Engine Wrapper

    Owner->>Copy: Input Nama Produk ("Es Kopi Aren") & Pilih Tone ("Santai WA")
    Copy->>AI: POST /api/v1/copywriting/generate
    AI-->>Copy: Return Text Copywriting Promo (Formatted with Emojis & Hook)
    Copy-->>Owner: Tampilkan Teks Siap-Copy di Textarea

    Owner->>Copy: Klik "Render Data Poster Promo"
    Copy->>AI: POST /api/v1/copywriting/promo-poster
    AI-->>Copy: Link Foto Produk, Nama Toko, Headline & URL Google Maps
    Copy-->>Owner: Tampilkan Poster Card Preview Responsif
```

---

### 2.7. Marketplace & Komunitas UMKM Engagement Flow
Pemilik UMKM mengunggah katalog produk ke marketplace lokal dan berpartisipasi dalam forum komunitas antar pengusaha.

```mermaid
sequenceDiagram
    autonumber
    actor UMKM as Pemilik UMKM
    participant Portal as Client Dashboard
    participant Mkt as Marketplace Engine
    participant Forum as Community Module

    UMKM->>Portal: Publikasikan Produk ke Marketplace Platform
    Portal->>Mkt: Sync Produk dari Katalog / Landing Page
    Mkt-->>Portal: Tampilkan Listing di Katalog Publik Marketplace

    UMKM->>Portal: Buka Forum Komunitas UMKM
    Portal->>Forum: Ambil Topik Diskusi & Sharing Pengalaman
    UMKM->>Portal: Buat Diskusi Baru / Balas Topik
    Forum-->>Portal: Update Feed Diskusi Komunitas Real-time
```

---

### 2.8. Field Service Request & Task Execution Flow
Permintaan pendampingan verifikasi etalase & lokasi oleh Agen Wilayah.

```mermaid
sequenceDiagram
    autonumber
    actor UMKM as Pemilik UMKM
    participant App as Client Portal
    participant Service as Service Engine
    actor Agent as Field Consultant
    participant Admin as System Admin

    UMKM->>App: Ajukan Tiket Jasa ("Optimasi Google Maps & Verifikasi Lokasi")
    App->>Service: POST /api/v1/services/order
    Service->>Admin: Broadcast Task Baru
    Admin->>Service: Assign Task ke Agent Wilayah Terdekat
    Service-->>Agent: Notifikasi Tugas Baru di Dashboard Agen

    Agent->>Service: PATCH /api/v1/services/tasks/{id}/status (IN_PROGRESS)
    Agent->>Agent: Kunjungi Lokasi & Ambili Foto Geotag Bukti
    Agent->>Service: POST /api/v1/services/tasks/{id}/evidence (Upload Bukti Selesai)
    Service-->>UMKM: Notifikasi: "Lokasi Anda Telah Terverifikasi"
    UMKM->>App: Konfirmasi Penyelesaian & Berikan Rating Konsultan
    Service->>Service: PATCH /api/v1/services/tasks/{id}/status (CLOSED)
```

---

### 2.9. Landing Page & Catalog Publishing State Flow
```mermaid
stateDiagram-v2
    [*] --> FormInput: Input Nama Toko, Kategori, & WA Contact
    FormInput --> TemplateSelection: Pilih Template (F&B / Retail / Jasa)
    TemplateSelection --> AssetUpload: Upload Foto Produk / Banner Toko
    AssetUpload --> PreviewMode: Review Tampilan Responsive System
    PreviewMode --> Published: Klik "Terbitkan" (Generate Link & Slug Instan)
    Published --> [*]: Tautan Siap Dibagikan di Bio Instagram & Google Maps
```

---

## 3. Database Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o{ BUSINESS_PROFILES : owns
    USERS ||--o{ AUDIT_LOGS : takes
    USERS ||--o{ KIT_STATES : manages
    USERS ||--o{ SERVICE_REQUESTS : orders
    USERS ||--o{ POS_TRANSACTIONS : creates
    USERS ||--o{ CASHFLOW_RECORDS : logs
    USERS ||--o{ CUSTOMER_CONTACTS : collects
    USERS ||--o{ INVENTORY_ITEMS : manages
    USERS ||--o{ DEBT_BOOKS : records
    USERS ||--o{ QRIS_TRANSACTIONS : generates

    USERS {
        uuid id PK
        varchar phone_number UK
        varchar full_name
        varchar role_code
        varchar status
        timestamp created_at
    }

    BUSINESS_PROFILES {
        uuid id PK
        uuid user_id FK
        varchar business_name
        varchar category
        text address_text
        decimal latitude
        decimal longitude
        varchar gmaps_url
        varchar landing_page_slug UK
        timestamp updated_at
    }

    AUDIT_LOGS {
        uuid id PK
        uuid user_id FK
        uuid business_id FK
        integer health_score
        jsonb audit_answers
        jsonb recommendations
        timestamp created_at
    }

    KIT_STATES {
        uuid id PK
        uuid owner_id FK
        jsonb step_statuses
        jsonb step_fields
        jsonb maintenance_checklist
        timestamp updated_at
    }

    POS_TRANSACTIONS {
        uuid id PK
        uuid owner_id FK
        uuid cashier_id FK
        jsonb items_array
        decimal grand_total
        varchar payment_method
        varchar receipt_code
        timestamp created_at
    }

    CASHFLOW_RECORDS {
        uuid id PK
        uuid owner_id FK
        varchar type
        varchar category
        decimal amount
        text notes
        date date
        timestamp created_at
    }

    CUSTOMER_CONTACTS {
        uuid id PK
        uuid owner_id FK
        varchar name
        varchar phone UK
        varchar source
        integer total_visits
        date last_visit
        timestamp created_at
    }

    INVENTORY_ITEMS {
        uuid id PK
        uuid owner_id FK
        varchar item_name
        integer quantity
        integer min_threshold
        varchar supplier_name
        varchar supplier_phone
        timestamp updated_at
    }

    DEBT_BOOKS {
        uuid id PK
        uuid owner_id FK
        varchar type
        varchar person_name
        decimal amount
        date due_date
        varchar recorded_by
        varchar status
        timestamp created_at
    }

    QRIS_TRANSACTIONS {
        uuid id PK
        uuid owner_id FK
        varchar transaction_id UK
        decimal amount
        text qris_payload
        varchar status
        timestamp created_at
    }

    SERVICE_REQUESTS {
        uuid id PK
        uuid client_id FK
        varchar service_type
        varchar current_status
        text requirement_notes
        timestamp created_at
    }

    TUTORIAL_CONTENTS {
        uuid id PK
        varchar title
        varchar module_category
        text video_url
        integer duration_seconds
        varchar minimum_tier
        boolean is_active
    }
```

---

## 4. Modular Codebase Architecture Map

```text
├── docs/
│   ├── ARCHITECTURE.md       # Architectural overview & Stack
│   ├── MIGRATIONS.md          # PostgreSQL SQL DDL Scripts
│   ├── MODULES_API.md          # Complete REST API specification
│   ├── RBAC_MATRIX.md          # Comprehensive role permission table
│   └── USER_FLOWS.md          # Core sequence & state diagrams
├── src/
│   ├── modules/
│   │   ├── audit/             # Business Health Check AI Engine
│   │   ├── auth/              # JWT Auth & RBAC Middleware Guards
│   │   ├── cashflow/          # Cashflow & P&L Saku Controller
│   │   ├── copywriting/       # AI Promo Generator & Poster Data Linker
│   │   ├── gmaps/             # Review QR Generator & Auto-Reply AI
│   │   ├── inventory/         # Stock Alerts, Supplier Orders & Buku Bon
│   │   ├── kit/               # Unified Kit "Lokal Naik Kelas" Engine
│   │   ├── landing/           # Static Web Builder & WA Hook
│   │   ├── learning/          # Video Micro-Course Module
│   │   ├── loyalty/           # Smart WA Broadcast & Churn Alerts
│   │   ├── pos/               # POS Instant & Staff Management
│   │   ├── qris/              # QRIS Generator & Mock Auto-Verifier
│   │   └── services/          # Ticketing & Field Agent Smart Route
│   └── shared/
│       ├── database/          # In-Memory DB Persistence Layer & Seeds
│       └── utils/             # RBAC Guards & JWT Utilities
├── public/                    # Client Dashboard & Landing Pages
│   ├── app.js                 # Frontend Interactive Engine
│   ├── home.html              # Marketing Landing Page Utama
│   ├── index.html             # Main Portal Dashboard App
│   └── styles.css             # Glassmorphism Design System
├── test/                      # Node Test Suite (25 Tests Pass 100%)
└── USER_FLOW_SPEC.md          # Software Requirements & Specification
```
