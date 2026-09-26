# SuperUMKM Platform - System Architecture Specification

## 1. System Overview
Platform pendampingan, konsultasi, dan operasional digital terpadu untuk UMKM segmen Menengah-Bawah Indonesia (Diagnosis AI, Kit Lokal Naik Kelas, Google Maps Optimization, Mini Catalog Web Builder, POS Instant & QRIS, Pembukuan P&L, WA Loyalty Engine, Stok & Buku Bon, AI Promo Generator, Marketplace & Komunitas UMKM).

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                           Client Layer                                 │
 │  ┌───────────────────┐  ┌───────────────────┐  ┌────────────────────┐ │
 │  │ UMKM Owner Portal │  │ Field Agent Mobile│  │ Super Admin Portal │ │
 │  └─────────┬─────────┘  └─────────┬─────────┘  └─────────┬──────────┘ │
 └────────────┼──────────────────────┼──────────────────────┼────────────┘
              │                      │                      │
 ┌────────────▼──────────────────────▼──────────────────────▼────────────┐
 │                            API Gateway / Express Router               │
 │  ┌─────────────────────────────────────────────────────────────────┐  │
 │  │ JWT & RBAC Middleware Guard (Free, Premium, Agent, Admin)      │  │
 │  └─────────────────────────────────────────────────────────────────┘  │
 └────────────┬─────────────────────────────────────────────┬────────────┘
              │                                             │
 ┌────────────▼─────────────────────────────────────────────▼────────────┐
 │                          Core Modules Engine                          │
 │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
 │  │ Auth Module  │ │ Audit Module │ │ GMaps Module │ │Landing Module│  │
 │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘  │
 │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
 │  │  POS Module  │ │ Cashflow Mod │ │ Loyalty Mod  │ │Inventory Mod │  │
 │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘  │
 │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
 │  │ Copywriting  │ │  QRIS Mod    │ │ Services Mod │ │ Learning Mod │  │
 │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘  │
 └────────────┬─────────────────────────────────────────────┬────────────┘
              │                                             │
 ┌────────────▼─────────────────────────────────────────────▼────────────┐
 │                           Persistence Layer                           │
 │ ┌───────────────────────────────────────────────────────────────────┐ │
 │ │ PostgreSQL Database / In-Memory Data Store                        │ │
 │ └───────────────────────────────────────────────────────────────────┘ │
 └───────────────────────────────────────────────────────────────────────┘
```

## 2. Technology Stack
- **Runtime & Language**: Node.js (v18+), ES6+ JavaScript
- **Web & API Framework**: Express.js REST API Architecture
- **Frontend Layer**: Modern HTML5, Custom Vanilla CSS (Glassmorphism System), Vanilla JS Async Fetch Engine
- **Database Engine**: PostgreSQL Schema (DDL SQL compatibility) / Shared Persistence Layer (`db.js`)
- **Authentication & Security**: JWT (JSON Web Tokens) with granular RBAC & ABAC Guards
- **Testing Framework**: Native `node --test` runner (100% passing tests)

## 3. Database Entity ERD
```mermaid
erDiagram
    USERS ||--o{ BUSINESS_PROFILES : owns
    USERS ||--o{ AUDIT_LOGS : takes
    USERS ||--o{ KIT_STATES : manages
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
    }

    BUSINESS_PROFILES {
        uuid id PK
        uuid user_id FK
        varchar business_name
        varchar category
        varchar gmaps_url
        varchar landing_page_slug UK
    }

    CASHFLOW_RECORDS {
        uuid id PK
        uuid owner_id FK
        varchar type
        varchar category
        decimal amount
        text notes
    }

    CUSTOMER_CONTACTS {
        uuid id PK
        uuid owner_id FK
        varchar name
        varchar phone UK
        integer total_visits
        date last_visit
    }

    INVENTORY_ITEMS {
        uuid id PK
        uuid owner_id FK
        varchar item_name
        integer quantity
        integer min_threshold
        varchar supplier_phone
    }

    DEBT_BOOKS {
        uuid id PK
        uuid owner_id FK
        varchar type
        varchar person_name
        decimal amount
        varchar recorded_by
        varchar status
    }

    QRIS_TRANSACTIONS {
        uuid id PK
        uuid owner_id FK
        varchar transaction_id UK
        decimal amount
        varchar status
    }
```

## 4. Module Registry Overview
- `audit` - Engine diagnosis kesehatan AI usaha (skor 0-100 & rekomendasi)
- `auth` - Authentikasi & Middleware Guards (RBAC, Tier, ABAC)
- `cashflow` - Catatan harian pemasukan/pengeluaran & P&L Saku
- `copywriting` - AI Copywriting promosi harian & Poster Data Linker
- `gmaps` - Generator QR Review, Balasan ulasan AI, Kupon loyalitas
- `inventory` - Stok Kritis Alert, Draft Order Supplier WA, & Buku Bon
- `kit` - Engine Kit "Lokal Naik Kelas" 8 langkah eksekusi & tracker mingguan
- `landing` - Builder catalog web 3-menit & WhatsApp ordering hook
- `learning` - Micro-course video edukasi berjenjang
- `loyalty` - Broadcast WA, customer contact harvester, & Churn alert
- `pos` - POS Kasir instant, cetak struk digital & limit staf
- `qris` - Payload QRIS dinamis/statis & Mock auto-verifier
- `services` - Field Service Ticket Assignment & Smart Route Geotag
