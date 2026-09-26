# Core User Flows Specification

## 1. Progressive Onboarding Audit Wizard & Action Center Flow
Pemilik UMKM melakukan pengisian audit 4-langkah (Profil Usaha → Google Maps → Digital Presence & Katalog → Transaksi & Operasional) dengan conditional branching (melewati rating/review jika belum punya Maps), dan menerima Health Score deterministik (0-100 poin), transparansi 8 dimensi, serta **Action Center: Fokus Minggu Ini** (Top 3 prioritas dengan dampak poin tertinggi).

```mermaid
sequenceDiagram
    autonumber
    actor UMKM as Pemilik UMKM
    participant UI as Progressive Audit Wizard
    participant API as Audit Engine (/api/v1/audit)
    participant DB as Database Engine

    UMKM->>UI: Input Step 1: Profil Utama Usaha
    UMKM->>UI: Input Step 2: Google Maps Status
    alt Memiliki Google Maps
        UI-->>UMKM: Tampilkan Form Rating & Jumlah Review
    else Belum Punya Google Maps
        UI-->>UMKM: Skip Rating/Review & Set Task Klaim GMaps ke Action Center
    end
    UMKM->>UI: Input Step 3: Etalase Digital & Katalog
    UMKM->>UI: Input Step 4: Transaksi & Staf Kasir
    
    UI->>API: POST /api/v1/audit/evaluate (State 8 Dimensi)
    API->>API: Hitung Deterministic Score (0-100) & Transparansi Breakdown 8 Dimensi
    API->>DB: Insert Audit Log & Update Business State
    API-->>UI: Return Health Score Card, 8-Dimension Breakdown, & Top 3 Focus Tasks
    
    UI-->>UMKM: Render Action Center: "Skor X/100" & "Fokus Minggu Ini (+15 Poin)"
    UMKM->>UI: Klik "🚀 Eksekusi" pada Task Fokus
    UI->>UI: Arahkan Langsung ke Modul Eksekusi Terkait (Mini Website / Standee QR / Learning)
```

## 2. Customer Public Store Flow (`/toko/:slug`)
Pelanggan mengakses tautan toko instan UMKM via clean URL `/toko/:slug`, melihat katalog produk, dan melakukan pemesanan langsung via WhatsApp.

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Pelanggan
    participant Web as Clean Store Page (/toko/:slug)
    participant API as Landing API Engine
    actor Owner as WhatsApp Pemilik UMKM

    Customer->>Web: Buka http://localhost:3000/toko/warung-berkah
    Web->>API: GET /api/v1/landing/warung-berkah
    API-->>Web: Return Data Toko, Foto Banner, Medsos & List Produk
    Web-->>Customer: Tampilkan Mini Website & Katalog Instan
    Customer->>Web: Klik "💬 Pesan Produk Ini"
    Web-->>Owner: Buka wa.me Link dengan Pre-filled Message Produk & Harga
```

## 3. POS Transaction & QRIS Auto-Verification Flow
Staf Kasir Toko memasukkan produk ke keranjang, memilih bayar QRIS dinamis, dan sistem menyimulasi verifikasi pembayaran instan.

```mermaid
sequenceDiagram
    autonumber
    actor Cashier as Staf Kasir Toko
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

## 4. Cashflow & P&L Saku Recording & WhatsApp Export Flow
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

## 5. Smart WA Loyalty & Churn Alert Flow
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

## 6. Field Service Request & Task Execution Flow
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
    Agent->>Agent: Kunjungi Lokasi & Ambil Foto Geotag Bukti
    Agent->>Service: POST /api/v1/services/tasks/{id}/evidence (Upload Bukti)
    Service-->>UMKM: Notifikasi: "Lokasi Telah Terverifikasi & Teroptimasi"
    UMKM->>App: Konfirmasi Penyelesaian & Rating
    Service->>Service: PATCH /api/v1/services/tasks/{id}/status (CLOSED)
```
