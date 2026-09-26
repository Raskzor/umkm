# PostgreSQL Database Migration DDL Schema

Documentasi skema DDL SQL untuk 5 modul ekosistem baru SuperUMKM:
- `cashflow_records` (Pembukuan Sederhana & Laba/Rugi Saku)
- `customer_contacts` (Pelanggan Loyalty & WhatsApp Broadcast)
- `inventory_items` & `stock_alerts` (Stok Gudang & Re-Order Supplier)
- `debt_books` (Buku Bon Utang-Piutang)
- `qris_transactions` (Integrasi QRIS Kasir)

---

```sql
-- Migration: Add Ecosystem Expansion Tables
-- Date: 2026-09-26

-- 1. Cashflow & P&L Saku Table
CREATE TABLE IF NOT EXISTS cashflow_records (
    id VARCHAR(64) PRIMARY KEY,
    owner_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(16) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    category VARCHAR(64) NOT NULL, -- BAHAN_BAKU, UTILITAS, SEWA, GAJI, PENJUALAN_HARIAN, LAINNYA
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cashflow_owner_date ON cashflow_records(owner_id, date);

-- 2. Customer Contacts & Loyalty Table (Harvested from POS receipts & QR review scans)
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

-- 3. Inventory Items & Stock Alerts Table
CREATE TABLE IF NOT EXISTS inventory_items (
    id VARCHAR(64) PRIMARY KEY,
    owner_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_name VARCHAR(128) NOT NULL,
    category VARCHAR(64) DEFAULT 'Umum',
    unit_price DECIMAL(12, 2) DEFAULT 0.00,
    current_stock INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 5,
    supplier_name VARCHAR(128),
    supplier_phone VARCHAR(32),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_owner_stock ON inventory_items(owner_id, current_stock, min_stock);

-- 4. Debt Books (Buku Bon Utang-Piutang) Table
CREATE TABLE IF NOT EXISTS debt_books (
    id VARCHAR(64) PRIMARY KEY,
    owner_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    debtor_name VARCHAR(128) NOT NULL,
    phone_number VARCHAR(32),
    type VARCHAR(16) NOT NULL CHECK (type IN ('DEBT', 'RECEIVABLE')), -- DEBT = Utang Toko, RECEIVABLE = Piutang Orang ke Toko
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    recorder_name VARCHAR(128) NOT NULL,
    due_date DATE,
    status VARCHAR(16) NOT NULL DEFAULT 'UNPAID' CHECK (status IN ('UNPAID', 'PAID', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_debt_owner_status ON debt_books(owner_id, status, due_date);

-- 5. Dynamic QRIS Transactions Table
CREATE TABLE IF NOT EXISTS qris_transactions (
    id VARCHAR(64) PRIMARY KEY,
    owner_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    qr_string TEXT NOT NULL,
    qr_code_svg TEXT,
    status VARCHAR(16) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'EXPIRED')),
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_qris_owner_status ON qris_transactions(owner_id, status);
```
