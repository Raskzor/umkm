# PostgreSQL Database Migration DDL Schema Specification

Dokumentasi komprehensif skema DDL SQL PostgreSQL untuk **seluruh 13 Modul Ecosystem SuperUMKM**:
1. `users` & `business_profiles` (Otentikasi, Peran RBAC & Profil Usaha)
2. `audit_logs` & `system_audit_trails` (Diagnosis Kesehatan AI & Audit.log Events)
3. `kit_states` (Kit "Lokal Naik Kelas" 8 Langkah Eksekusi & Tracker Mingguan)
4. `review_replies` & `review_coupons` (Google Maps AI Auto-Reply & Kupon Ulasan)
5. `landing_pages` & `mini_catalogs` (Builder Website Katalog WhatsApp)
6. `pos_staff` & `pos_transactions` (Mesin Kasir Instant & Manajemen Staf)
7. `cashflow_records` (Pembukuan Sederhana & Laba/Rugi P&L Saku)
8. `customer_contacts` (Pelanggan Loyalty, Churn Alert & WhatsApp Broadcast)
9. `inventory_items`, `stock_alerts` & `debt_books` (Stok Gudang, Re-Order Supplier & Buku Bon)
10. `qris_transactions` (Integrasi QRIS Dinamis/Statis & Auto-Verifier Webhook)
11. `service_requests` & `service_tasks` (Tiket Pendampingan Lapangan & Geotag Agent)
12. `tutorial_contents` (Video Micro-Course Edukasi Berjenjang)

---

```sql
-- PostgreSQL Master Database Migration Script
-- Project: Ekosistem SuperUMKM Platform Engine
-- Date: 2026-09-26

-- Enable UUID extension if required
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================================
-- 1. CORE AUTHENTICATION & BUSINESS PROFILES MODULE
-- ========================================================

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    phone_number VARCHAR(32) NOT NULL UNIQUE,
    full_name VARCHAR(128) NOT NULL,
    role_code VARCHAR(32) NOT NULL CHECK (role_code IN ('UMKM_OWNER_FREE', 'UMKM_OWNER_PREMIUM', 'CASHIER', 'FIELD_AGENT', 'SUPER_ADMIN')),
    owner_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL, -- Null for owners, populated for cashiers
    pin VARCHAR(16) DEFAULT '1234',
    status VARCHAR(16) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_role_phone ON users(role_code, phone_number);

CREATE TABLE IF NOT EXISTS business_profiles (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL,
    address_text TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    gmaps_url VARCHAR(255),
    landing_page_slug VARCHAR(128) UNIQUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- 2. BUSINESS HEALTH CHECK AUDIT & SYSTEM AUDIT LOG (AUDIT.LOG)
-- ========================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    business_id VARCHAR(64) REFERENCES business_profiles(id) ON DELETE SET NULL,
    health_score INT NOT NULL CHECK (health_score BETWEEN 0 AND 100),
    status_grade VARCHAR(32) DEFAULT 'NEEDS_OPTIMIZATION',
    audit_answers JSONB NOT NULL,
    breakdown JSONB NOT NULL,
    recommendations JSONB NOT NULL,
    ai_diagnosis_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table mirroring physical logs/audit.log entries
CREATE TABLE IF NOT EXISTS system_audit_trails (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(64),
    role VARCHAR(32),
    action VARCHAR(255) NOT NULL,
    resource VARCHAR(128),
    details JSONB,
    ip_address VARCHAR(64),
    status VARCHAR(16) DEFAULT 'SUCCESS'
);

CREATE INDEX idx_system_audit_timestamp ON system_audit_trails(timestamp DESC);

-- ========================================================
-- 3. KIT "LOKAL NAIK KELAS" UNIFIED ACTION ENGINE MODULE
-- ========================================================

CREATE TABLE IF NOT EXISTS kit_states (
    id VARCHAR(64) PRIMARY KEY,
    owner_id VARCHAR(64) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    version INT DEFAULT 1,
    answers JSONB,
    status JSONB, -- Step completion status (e.g. {"1": "done", "2": "in_progress"})
    fields JSONB,
    maintenance JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- 4. GOOGLE MAPS OPTIMIZATION & REVIEWS MODULE
-- ========================================================

CREATE TABLE IF NOT EXISTS review_replies (
    id VARCHAR(64) PRIMARY KEY,
    owner_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewer_name VARCHAR(128) NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    ai_generated_reply TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS review_coupons (
    id VARCHAR(64) PRIMARY KEY,
    owner_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    coupon_code VARCHAR(32) NOT NULL UNIQUE,
    discount_description VARCHAR(128) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- 5. MINI CATALOG & LANDING PAGE BUILDER MODULE
-- ========================================================

CREATE TABLE IF NOT EXISTS landing_pages (
    id VARCHAR(64) PRIMARY KEY,
    owner_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    slug VARCHAR(128) NOT NULL UNIQUE,
    title VARCHAR(128) NOT NULL,
    banner_url TEXT,
    whatsapp_number VARCHAR(32) NOT NULL,
    products_catalog JSONB NOT NULL,
    is_published BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- 6. POS INSTANT & CASHIER STAFF MODULE
-- ========================================================

CREATE TABLE IF NOT EXISTS pos_staff (
    id VARCHAR(64) PRIMARY KEY,
    owner_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    staff_name VARCHAR(128) NOT NULL,
    phone_number VARCHAR(32) NOT NULL,
    pin VARCHAR(16) NOT NULL DEFAULT '1234',
    status VARCHAR(16) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pos_transactions (
    id VARCHAR(64) PRIMARY KEY,
    owner_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cashier_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    receipt_code VARCHAR(32) NOT NULL UNIQUE,
    items_array JSONB NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    discount_amount DECIMAL(12, 2) DEFAULT 0.00,
    grand_total DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(32) DEFAULT 'TUNAI', -- TUNAI, QRIS, TRANSFER
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pos_tx_owner ON pos_transactions(owner_id, created_at DESC);

-- ========================================================
-- 7. CASHFLOW & P&L SAKU MODULE
-- ========================================================

CREATE TABLE IF NOT EXISTS cashflow_records (
    id VARCHAR(64) PRIMARY KEY,
    owner_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(16) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    category VARCHAR(64) NOT NULL, -- Bahan Baku, Utilitas/Listrik, Sewa, Gaji, Penjualan Tunai, Lain-lain
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cashflow_owner_date ON cashflow_records(owner_id, date);

-- ========================================================
-- 8. CUSTOMER LOYALTY & SMART WA BROADCAST MODULE
-- ========================================================

CREATE TABLE IF NOT EXISTS customer_contacts (
    id VARCHAR(64) PRIMARY KEY,
    owner_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    customer_name VARCHAR(128) NOT NULL,
    phone_number VARCHAR(32) NOT NULL,
    source VARCHAR(32) DEFAULT 'POS_RECEIPT', -- POS_RECEIPT, QR_REVIEW_SCAN, MANUAL
    total_visits INT DEFAULT 1,
    total_spent DECIMAL(12, 2) DEFAULT 0.00,
    last_visit_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_owner_customer_phone UNIQUE (owner_id, phone_number)
);

CREATE INDEX idx_contacts_owner_visit ON customer_contacts(owner_id, last_visit_date);

-- ========================================================
-- 9. INVENTORY, BUKU BON & SUPPLIER ORDER MODULE
-- ========================================================

CREATE TABLE IF NOT EXISTS inventory_items (
    id VARCHAR(64) PRIMARY KEY,
    owner_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_name VARCHAR(128) NOT NULL,
    current_stock INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 5,
    unit VARCHAR(32) DEFAULT 'Pcs',
    supplier_name VARCHAR(128),
    supplier_phone VARCHAR(32),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_low_stock ON inventory_items(owner_id, current_stock, min_stock);

CREATE TABLE IF NOT EXISTS debt_books (
    id VARCHAR(64) PRIMARY KEY,
    owner_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(16) NOT NULL CHECK (type IN ('RECEIVABLE', 'PAYABLE')), -- RECEIVABLE (Piutang), PAYABLE (Utang)
    person_name VARCHAR(128) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    due_date DATE,
    recorded_by VARCHAR(128) DEFAULT 'Dewi (Kasir)',
    status VARCHAR(16) DEFAULT 'UNPAID' CHECK (status IN ('UNPAID', 'PAID', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- 10. QRIS KASIR INTEGRATION MODULE
-- ========================================================

CREATE TABLE IF NOT EXISTS qris_transactions (
    id VARCHAR(64) PRIMARY KEY,
    owner_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_id VARCHAR(64) NOT NULL UNIQUE,
    merchant_name VARCHAR(128) DEFAULT 'Toko UMKM',
    amount DECIMAL(12, 2) NOT NULL,
    qris_payload TEXT NOT NULL,
    is_dynamic BOOLEAN DEFAULT TRUE,
    status VARCHAR(16) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'EXPIRED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- 11. FIELD SERVICE TICKETING & SMART ROUTE DISPATCH MODULE
-- ========================================================

CREATE TABLE IF NOT EXISTS service_requests (
    id VARCHAR(64) PRIMARY KEY,
    client_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_type VARCHAR(64) NOT NULL,
    current_status VARCHAR(32) DEFAULT 'OPEN',
    requirement_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS service_tasks (
    id VARCHAR(64) PRIMARY KEY,
    request_id VARCHAR(64) NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    consultant_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    task_step VARCHAR(128) NOT NULL,
    proof_evidence_url TEXT,
    task_status VARCHAR(32) DEFAULT 'UNASSIGNED',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- 12. VIDEO MICRO-COURSE EDUCATION MODULE
-- ========================================================

CREATE TABLE IF NOT EXISTS tutorial_contents (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(128) NOT NULL,
    module_category VARCHAR(64) NOT NULL,
    video_url TEXT NOT NULL,
    duration_seconds INT DEFAULT 300,
    minimum_tier VARCHAR(32) DEFAULT 'FREE', -- FREE vs PREMIUM
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```
