\# Software Requirements \& Specification: Business Consultant UMKM Platform



Platform pendampingan dan konsultasi digital UMKM segmen Menengah-Bawah (Google Maps Optimization, Review Management, Landing Page Builder, dan Video Edukasi Mandiri).



\---



\## 1. User Roles \& Permission Matrix (RBAC)



Sistem menggunakan model \*Role-Based Access Control\* (RBAC) dengan 4 entitas pengguna utama:



| Fitur / Modul | UMKM Owner (Free/Standard) | UMKM Owner (Premium) | Consultant / Field Agent | Super Admin |

| :--- | :---: | :---: | :---: | :---: |

| \*\*Self-Audit (Business Health Check)\*\* | Read / Execute | Read / Execute | Read All | Read All |

| \*\*Video Micro-Tutorials\*\* | Read (Basic Tier) | Read (All Tiers) | Read | Manage / Upload |

| \*\*QR Code Review Generator\*\* | Generate Basic PDF | Custom Branding PDF | Read / Assist | Manage Templates |

| \*\*Landing Page / Mini Catalog\*\* | 1 Page (Subdomain) | Multi-section + Custom WA | Assist Setup | Manage / Deploy |

| \*\*Consultation Ticket / Service Request\*\* | Basic (Async FAQ/Ticket) | Priority 1-on-1 Chat | Handle \& Resolve | Audit / Assign |

| \*\*Field Execution (Pin Maps / Foto)\*\* | View Status | View Status + Report | Update Progress \& Geotag | Full Oversight |

| \*\*User \& Subscription Management\*\* | Self Profile | Self Profile | Read Assigned Client | Full CRUD |



\---



\## 2. Core User Flows (System Interactions)



\### 2.1. Onboarding \& Automated Business Health Check Flow



Alur saat pemilik UMKM pertama kali mendaftar, melakukan diagnosis mandiri, dan mendapatkan rekomendasi solusi aksi cepat.



```mermaid

sequenceDiagram

&#x20;   autonumber

&#x20;   actor UMKM as Pemilik UMKM

&#x20;   participant UI as Mobile/Web Frontend

&#x20;   participant API as Backend Service

&#x20;   participant DB as PostgreSQL Database



&#x20;   UMKM->>UI: Registrasi via No WhatsApp / Email

&#x20;   UI->>API: POST /api/v1/auth/register

&#x20;   API->>DB: Simpan akun \& role UMKM\_OWNER

&#x20;   API-->>UI: Token JWT \& Profile State



&#x20;   UMKM->>UI: Mulai Kuesioner "Audit Kesehatan Digital" (5 Menit)

&#x20;   UI->>API: POST /api/v1/audit/evaluate (Data Profil, Titik Maps, Status Web)

&#x20;   API->>API: Hitung Health Score (0-100) \& Generate Rekomendasi

&#x20;   API->>DB: Insert ke business\_audit\_logs

&#x20;   API-->>UI: Tampilkan Health Score Card \& Action Checklist

&#x20;   UI-->>UMKM: Rekomendasi: Optimasi Google Maps \& Cetak QR Review

sequenceDiagram

&#x20;   autonumber

&#x20;   actor UMKM as Pemilik UMKM

&#x20;   participant App as Client Portal

&#x20;   participant Service as Ticket/Task Engine

&#x20;   actor Agent as Field Consultant

&#x20;   participant Admin as System Admin



&#x20;   UMKM->>App: Ajukan Tiket Jasa ("Optimasi Google Maps")

&#x20;   App->>Service: POST /api/v1/services/order (Attach data usaha)

&#x20;   Service->>Admin: Notifikasi Task Baru

&#x20;   Admin->>Service: Assign Task ke Agent Wilayah Terdekat

&#x20;   Service-->>Agent: Notifikasi Tugas Baru di Dashboard Agen



&#x20;   Agent->>Service: PATCH /api/v1/tasks/{id}/status (IN\_PROGRESS)

&#x20;   Agent->>Agent: Kunjungi Lokasi / Verifikasi Online \& Foto Geotag

&#x20;   Agent->>Service: POST /api/v1/tasks/{id}/evidence (Upload Bukti Selesai)

&#x20;   Service-->>UMKM: Notifikasi: "Toko Anda Sudah Teroptimasi"

&#x20;   UMKM->>App: Konfirmasi Penyelesaian \& Berikan Rating Konsultan

&#x20;   Service->>Service: PATCH /api/v1/tasks/{id}/status (CLOSED)

stateDiagram-v2

&#x20;   \[\*] --> FormInput: Input Nama Toko, Kategori, \& Kontak WA

&#x20;   FormInput --> TemplateSelection: Pilih Template Sederhana (F\&B / Retail / Jasa)

&#x20;   TemplateSelection --> AssetUpload: Upload Foto Produk / Banner Toko

&#x20;   AssetUpload --> PreviewMode: Review Tampilan Mobile Responsive

&#x20;   PreviewMode --> Published: Klik "Terbitkan" (Generate Link \& Slug)

&#x20;   Published --> \[\*]: Tautan Siap Dibagikan ke Bio / Google Maps Profile

erDiagram

&#x20;   USERS ||--o{ BUSINESS\_PROFILES : owns

&#x20;   USERS ||--o{ AUDIT\_LOGS : takes

&#x20;   USERS ||--o{ SERVICE\_REQUESTS : orders

&#x20;   USERS ||--o{ CONSULTANT\_ASSIGNMENTS : assigned\_to



&#x20;   USERS {

&#x20;       uuid id PK

&#x20;       varchar phone\_number UK

&#x20;       varchar full\_name

&#x20;       varchar role\_code

&#x20;       varchar status

&#x20;       timestamp created\_at

&#x20;   }



&#x20;   BUSINESS\_PROFILES {

&#x20;       uuid id PK

&#x20;       uuid user\_id FK

&#x20;       varchar business\_name

&#x20;       varchar category

&#x20;       text address\_text

&#x20;       decimal latitude

&#x20;       decimal longitude

&#x20;       varchar gmaps\_url

&#x20;       varchar landing\_page\_slug UK

&#x20;       timestamp updated\_at

&#x20;   }



&#x20;   AUDIT\_LOGS {

&#x20;       uuid id PK

&#x20;       uuid user\_id FK

&#x20;       uuid business\_id FK

&#x20;       integer health\_score

&#x20;       jsonb audit\_answers

&#x20;       jsonb recommendations

&#x20;       timestamp created\_at

&#x20;   }



&#x20;   SERVICE\_REQUESTS {

&#x20;       uuid id PK

&#x20;       uuid client\_id FK

&#x20;       varchar service\_type

&#x20;       varchar current\_status

&#x20;       text requirement\_notes

&#x20;       timestamp created\_at

&#x20;   }



&#x20;   SERVICE\_TASKS {

&#x20;       uuid id PK

&#x20;       uuid request\_id FK

&#x20;       uuid consultant\_id FK

&#x20;       varchar task\_step

&#x20;       text proof\_evidence\_url

&#x20;       varchar task\_status

&#x20;       timestamp updated\_at

&#x20;   }



&#x20;   TUTORIAL\_CONTENTS {

&#x20;       uuid id PK

&#x20;       varchar title

&#x20;       varchar module\_category

&#x20;       text video\_url

&#x20;       integer duration\_seconds

&#x20;       varchar minimum\_tier

&#x20;       boolean is\_active

&#x20;   }

├── docs/

│   ├── ARCHITECTURE.md

│   ├── RBAC\_MATRIX.md

│   └── USER\_FLOWS.md

├── src/

│   ├── modules/

│   │   ├── auth/          # Authentication \& RBAC Guards

│   │   ├── audit/         # Self-Assessment Business Health Check Engine

│   │   ├── gmaps/         # Review QR Generator \& Maps Verification Task

│   │   ├── landing/       # Static Page Builder \& WhatsApp Hook

│   │   ├── learning/      # Video Micro-Course Module

│   │   └── services/      # Ticketing \& Field Agent Assignment

│   └── shared/

│       ├── database/      # Migrations \& Models

│       └── utils/

└── README.md

