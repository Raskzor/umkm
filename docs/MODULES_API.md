# SuperUMKM Ecosystem Expansion - API Documentation

Dokumentasi lengkap HTTP Endpoints, Request Body, dan Response Samples untuk 5 modul ekosistem baru SuperUMKM:
1. Modul Cashflow & P&L Saku
2. Modul Smart WhatsApp Broadcast & Loyalty Engine
3. Modul Manajemen Stok, Buku Bon, & Supplier Order
4. Modul Generator Promosi & AI Copywriting Lokal
5. Modul Integrasi QRIS Kasir

---

## 1. Modul Cashflow & P&L Saku (Pembukuan Sederhana)

### 1.1. Catat Pemasukan / Pengeluaran Harian
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

### 1.2. Hitung Laporan Laba / Rugi (P&L Saku) 1-Klik
- **HTTP Method**: `GET`
- **Route**: `/api/v1/cashflow/pnl`
- **Headers**: `Authorization: Bearer <token>`
- **Response Sample**:
  ```json
  {
    "success": true,
    "data": {
      "business_name": "Warung Kelontong Berkah",
      "summary": {
        "total_income": 450000,
        "pos_revenue": 101000,
        "total_expense": 230000,
        "net_profit": 220000,
        "profit_margin_percent": 49,
        "status": "UNTHUNTUNG (SURPLUS)"
      },
      "category_breakdown": {
        "PENJUALAN_HARIAN": 450000,
        "BAHAN_BAKU": 180000,
        "UTILITAS": 50000
      }
    }
  }
  ```

---

## 2. Modul Smart WhatsApp Broadcast & Loyalty Engine

### 2.1. Deteksi Pelanggan Inaktif (Churn Alert Scheduler)
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

### 2.2. Generate Click-to-Chat WhatsApp Broadcast Link (`wa.me`)
- **HTTP Method**: `POST`
- **Route**: `/api/v1/loyalty/broadcast-link`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "customer_name": "Budi Raharjo",
    "phone_number": "081299887766",
    "promo_title": "Kangen Belanja di Toko Kami!",
    "promo_code": "PROMO-RETENSI-10K",
    "discount_text": "Diskon Rp 10.000"
  }
  ```

---

## 3. Modul Manajemen Stok, Buku Bon, & Supplier Order

### 3.1. Low Stock Alert Trigger
- **HTTP Method**: `GET`
- **Route**: `/api/v1/inventory/low-stock-alerts`
- **Headers**: `Authorization: Bearer <token>`
- **Response Sample**:
  ```json
  {
    "success": true,
    "low_stock_count": 1,
    "data": [
      {
        "id": "inv-001",
        "item_name": "Beras Premium 5kg",
        "current_stock": 3,
        "min_stock": 5,
        "stock_status": "LOW_STOCK_WARNING",
        "suggested_reorder_qty": 15
      }
    ]
  }
  ```

### 3.2. Pencatatan Buku Bon (Utang - Piutang)
- **HTTP Method**: `POST`
- **Route**: `/api/v1/inventory/debt-books`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "debtor_name": "Pak Ahmad (Tetangga)",
    "phone_number": "085211223344",
    "type": "RECEIVABLE",
    "amount": 75000,
    "notes": "Bon Beras 5kg",
    "due_date": "2026-10-01"
  }
  ```

---

## 4. Modul Generator Promosi & AI Copywriting Lokal

### 4.1. AI Prompt Wrapper Copywriting Status WA & Medsos
- **HTTP Method**: `POST`
- **Route**: `/api/v1/copywriting/generate`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "product_name": "Kopi Susu Senja",
    "discount_price": "Rp 15.000",
    "tone_style": "SANTAI_LOKAL"
  }
  ```

---

## 5. Modul Integrasi QRIS Kasir

### 5.1. Generate QRIS Dinamis & SVG Image URL
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

### 5.2. Mock Auto-Verification Listener (Instant Check Out)
- **HTTP Method**: `POST`
- **Route**: `/api/v1/qris/verify-mock`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "qris_id": "qris-1001",
    "auto_approve": true
  }
  ```
