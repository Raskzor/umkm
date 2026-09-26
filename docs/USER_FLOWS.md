# Core User Flows Specification

## 1. Onboarding & Business Health Check + Kit Flow
Pemilik UMKM melakukan registrasi, pengisian audit 5 menit, dan mendapatkan Health Score serta Kit "Lokal Naik Kelas" Action Plan.

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

    UMKM->>UI: Mulai Audit Kesehatan Digital (5 Menit)
    UI->>API: POST /api/v1/audit/evaluate (Data Profil, GMaps Status, Rating)
    API->>API: Hitung Health Score (0-100) & Recommendations
    API->>DB: Insert audit log
    API-->>UI: Return Health Score Card & Action Checklist
    UI-->>UMKM: Tampilkan Rekomendasi: Optimasi Google Maps & QR Review
```

## 2. POS Transaction & QRIS Auto-Verification Flow
Kasir memasukkan produk ke keranjang, memilih bayar QRIS dinamis, dan sistem menyimulasi verifikasi pembayaran instan.

```mermaid
sequenceDiagram
    autonumber
    actor Cashier as Kasir Toko
    participant POS as POS Engine
    participant QRIS as QRIS Gateway Module
    participant API as Backend API

    Cashier->>POS: Pilih Produk & Grand Total
    Cashier->>POS: Pilih Metode "QRIS"
    POS->>QRIS: POST /api/v1/qris/generate
    QRIS-->>POS: Return QR String & SVG
    POS-->>Cashier: Tampilkan Pop-up QRIS Modal
    QRIS->>API: POST /api/v1/qris/verify-mock
    API-->>POS: Callback Status "PAID"
    POS->>API: POST /api/v1/pos/transactions
    API-->>Cashier: Tampilkan Struk Digital
```

## 3. Cashflow & P&L Saku Recording & WhatsApp Export Flow
Pencatatan harian pemasukan/pengeluaran dengan kategori UMKM, omzet bersih otomatis, dan 1-klik export laporan WA.

```mermaid
sequenceDiagram
    autonumber
    actor UMKM as Pemilik UMKM
    participant CF as Cashflow Engine
    participant DB as Database Engine

    UMKM->>CF: POST /api/v1/cashflow/records (type, category, amount, notes)
    CF->>DB: Save to cashflow_records
    UMKM->>CF: GET /api/v1/cashflow/pnl
    CF->>DB: Calculate Income - Expense + POS Revenue
    CF-->>UMKM: Return P&L Summary Card
    UMKM->>CF: GET /api/v1/cashflow/export-wa
    CF-->>UMKM: Open Direct wa.me Link dengan Format Text Laporan
```

## 4. Smart WA Loyalty & Churn Alert Flow
Himpunan kontak otomatis dari transaksi kasir & ulasan QR, deteksi pelanggan inaktif (>14 hari), dan pengiriman broadcast promo `wa.me`.

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Pelanggan
    participant Loyalty as Loyalty Module
    actor Owner as Pemilik UMKM

    Customer->>Loyalty: Transaksi Kasir / Review QR
    Loyalty->>Loyalty: Auto-harvest Name & Phone to DB
    Loyalty->>Loyalty: Check Last Visit > 14 Days (Churn Alert)
    Owner->>Loyalty: GET /api/v1/loyalty/churn-alerts
    Loyalty-->>Owner: Display Churn Customer List & Action Button
    Owner->>Loyalty: POST /api/v1/loyalty/broadcast-link
    Loyalty-->>Owner: Open wa.me Direct Chat
```

## 5. Field Service Request & Task Execution Flow
Pemilik UMKM mengajukan permintaan pendampingan lapangan. Task dialokasikan Admin ke Agen Wilayah dengan bukti foto geotag.

```mermaid
sequenceDiagram
    autonumber
    actor UMKM as Pemilik UMKM
    participant App as Client Portal
    participant Service as Service Engine
    actor Agent as Field Consultant
    participant Admin as System Admin

    UMKM->>App: Ajukan Tiket Jasa ("Optimasi Google Maps")
    App->>Service: POST /api/v1/services/order
    Service->>Admin: Broadcast Task Baru
    Admin->>Service: Assign Task ke Agent Wilayah Terdekat
    Service-->>Agent: Notifikasi Tugas Baru di Dashboard Agen

    Agent->>Service: PATCH /api/v1/services/tasks/{id}/status (IN_PROGRESS)
    Agent->>Agent: Kunjungi Lokasi & Ambili Foto Geotag Bukti
    Agent->>Service: POST /api/v1/services/tasks/{id}/evidence (Upload Bukti)
    Service-->>UMKM: Notifikasi: "Lokasi Telah Terverifikasi & Teroptimasi"
    UMKM->>App: Konfirmasi Penyelesaian & Rating
    Service->>Service: PATCH /api/v1/services/tasks/{id}/status (CLOSED)
```

## 6. Landing Page & Catalog Publishing State Flow
```mermaid
stateDiagram-v2
    [*] --> FormInput: Input Nama Toko, Kategori, & WA
    FormInput --> TemplateSelection: Pilih Template (F&B / Retail / Jasa)
    TemplateSelection --> AssetUpload: Upload Foto Produk / Banner
    AssetUpload --> PreviewMode: Review Tampilan Responsive
    PreviewMode --> Published: Klik "Terbitkan" (Generate Link & Slug)
    Published --> [*]: Tautan Siap Dibagikan di Bio / Maps
```
