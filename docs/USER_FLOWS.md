# Core User Flows Specification

## 1. Onboarding & Business Health Check Flow
Pemilik UMKM melakukan registrasi, pengisian audit 5 menit, dan mendapatkan Health Score serta Action Plan.

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
    UI->>API: POST /api/v1/audit/evaluate (Data Profil, Titik Maps, Status Web)
    API->>API: Hitung Health Score (0-100) & Recommendations
    API->>DB: Insert audit log
    API-->>UI: Return Health Score Card & Action Checklist
    UI-->>UMKM: Tampilkan Rekomendasi: Optimasi Google Maps & QR Review
```

## 2. Field Service Request & Task Execution Flow
Pemilik UMKM mengajukan permintaan pendampingan lapangan (misal verifikasi lokasi / cetak QR). Task dialokasikan Admin ke Agen Wilayah.

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
    Agent->>Agent: Kunjungi Lokasi & Foto Geotag Bukti
    Agent->>Service: POST /api/v1/services/tasks/{id}/evidence (Upload Bukti)
    Service-->>UMKM: Notifikasi: "Lokasi Telah Terverifikasi & Teroptimasi"
    UMKM->>App: Konfirmasi Penyelesaian & Rating
    Service->>Service: PATCH /api/v1/services/tasks/{id}/status (CLOSED)
```

## 3. Landing Page & Catalog Publishing State Flow
```mermaid
stateDiagram-v2
    [*] --> FormInput: Input Nama Toko, Kategori, & WA
    FormInput --> TemplateSelection: Pilih Template (F&B / Retail / Jasa)
    TemplateSelection --> AssetUpload: Upload Foto Produk / Banner
    AssetUpload --> PreviewMode: Review Tampilan Responsive
    PreviewMode --> Published: Klik "Terbitkan" (Generate Link & Slug)
    Published --> [*]: Tautan Siap Dibagikan di Bio / Maps
```
