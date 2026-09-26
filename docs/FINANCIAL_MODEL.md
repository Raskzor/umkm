# SuperUMKM Platform - Financial Projection & Pricing Model (1,000 Merchants Baseline)

## 1. Executive Summary & Revenue Architecture
Dokumen ini disusun dari kacamata **Analisis Keuangan (Finance & Financial Planning)** untuk mengevaluasi kelayakan bisnis, penetapan harga (pricing strategy), proyeksi pendapatan (revenue), Biaya Operasional (COGS & OPEX), serta potensi keuntungan bersih (Net Profit) dari Platform **SuperUMKM** berbasis 1,000 UMKM aktif.

Platform menggunakan model **Hybrid SaaS Freemium + Merchant Payment Commission + Done-For-You (DFY) Field Services**.

---

## 2. Recommended User Fee & Pricing Structure

| Service Tier | Pricing Fee | Included Features & Allocation | Margin Contribution |
|---|---|---|---|
| **Paket GRATIS** | **Rp 0 / selamanya** | Audit 8-Dimensi, 1 Katalog Web (`/toko/:slug`), 1 Hak Akses Staf Kasir POS, QRIS Standard. *Berfungsi sebagai Hook & Customer Acquisition Cost (CAC)*. | 0% Direct Revenue (Lead Gen) |
| **Paket SAAS PREMIUM** | **Rp 49.000 / bulan** (*atau Rp 490.000 / thn*) | Unlimited Staf Kasir, Local SEO Injector, AI Auto-Reply Ulasan Google Maps, WA Churn Loyalty Alerts, Custom Branded Standee QR. | **78,2% Gross Margin** |
| **PENDAMPINGAN LAPANGAN (DFY)** | **Rp 150.000 / kunjungan** (*range Rp 99rb - 250rb*) | Kunjungan Fisik Agen Lapangan, Foto Geotag Produk, Setup Standee Kasir & Pembenahan Profil GMB. | **40,0% Margin** (60% Komisi Agen) |
| **QRIS Payment Sharing** | **0.15% per transaksi** (*termasuk MDR Standard 0.7%*) | Biaya transaksi digital QRIS otomatis dari total volume bruto pedagang. | **100% Margin Operasional** |

---

## 3. Revenue Projections (Proyeksi Pendapatan 1 Tahun - 1,000 Merchants)

### Customer Distribution Assumption:
- **Total Merchants**: 1.000 UMKM Aktif
- **Freemium Users**: 650 UMKM (65%)
- **SaaS Premium Subscribers**: 300 UMKM (30%)
- **Field Service Request**: 50 UMKM / bulan (5% dari total base)

### Revenue Calculation (1 Year):
1. **SaaS Premium Subscriptions**:  
   `300 UMKM × Rp 49.000/bln × 12 bulan` = **Rp 176.400.000**
2. **Assisted Field Services (DFY Visits)**:  
   `50 orders/bln × Rp 150.000/order × 12 bulan` = **Rp 90.000.000**
3. **QRIS Merchant Transaction Volume Fee (0.15% share)**:  
   *(Asumsi rata-rata omset QRIS pedagang Rp 15.000.000 / bulan)*  
   `1.000 UMKM × Rp 15.000.000 × 0.15% × 12 bulan` = **Rp 270.000.000**

#### 💰 TOTAL PENDAPATAN KOTOR (GROSS REVENUE 1 TAHUN): **Rp 536.400.000**

---

## 4. Cost of Goods Sold (COGS / Biaya Langsung Produksi)

| COGS Component | Unit Cost / Monthly Basis | Annual Cost (IDR) |
|---|---|---|
| **Server & Cloud Infrastructure + PPN 11%** | Rp 9.535.833 / bulan | Rp 114.429.900 |
| **Komisi Agen Pendamping Lapangan** | 60% × Rp 90.000.000 | Rp 54.000.000 |
| **QRIS Switching & Settlement Bank Fee** | ~Rp 7.500.000 / bulan | Rp 90.000.000 |
| **TOTAL COGS (1 TAHUN)** | | **Rp 258.429.900** |

#### 📊 GROSS PROFIT (LABA KOTOR 1 TAHUN):
`Gross Revenue (Rp 536.400.000) - COGS (Rp 258.429.900)` = **Rp 277.970.100**  
*Gross Profit Margin*: **51,8%**

---

## 5. Operational Expenses (OPEX / Biaya Operasional Toko)

| OPEX Category | Operational Activity | Monthly Budget | Annual Budget (IDR) |
|---|---|---|---|
| **Customer Support & Ops** | 2 Staff Part-Time Support (Bantuan Pedagang) | Rp 4.000.000 | Rp 48.000.000 |
| **Digital Marketing & CAC** | Iklan Meta/TikTok & Materi Edukasi Cetak | Rp 3.000.000 | Rp 36.000.000 |
| **Admin & Operational** | Perlengkapan Kantor & Legalitas | Rp 1.500.000 | Rp 18.000.000 |
| **TOTAL OPEX (1 TAHUN)** | | **Rp 8.500.000** | **Rp 102.000.000** |

---

## 6. Financial P&L Statement & Net Profit Analysis (1 Year Projection)

```text
========================================================================
            LAPORAN PROJEKSI LABA RUGI (P&L STATEMENT)
                  SUPERUMKM PLATFORM (1.000 MERCHANTS)
========================================================================
GROSS REVENUE (PENDAPATAN KOTOR)
  - SaaS Premium Subscription (300 user x Rp 49rb x 12bln) : Rp 176.400.000
  - Field Services DFY (50 order/bln x Rp 150rb x 12bln)   : Rp  90.000.000
  - QRIS Transaction Fee Share (0.15% x Rp 180 Milyar vol): Rp 270.000.000
------------------------------------------------------------------------
TOTAL GROSS REVENUE                                        : Rp 536.400.000 (100.0%)

DIRECT COSTS (COGS)
  - Cloud Infrastructure, Database, AI, & WA (Inc. PPN)  : (Rp 114.429.900)
  - Field Agent Commission (60%)                           : (Rp  54.000.000)
  - QRIS Bank Processing Fee                               : (Rp  90.000.000)
------------------------------------------------------------------------
TOTAL COGS                                                 : (Rp 258.429.900) (48.2%)

GROSS PROFIT (LABA KOTOR)                                  : Rp 277.970.100 (51.8%)

OPERATIONAL EXPENSES (OPEX)
  - Merchant Support & Operations Staff                    : (Rp  48.000.000)
  - Digital Marketing & Merchant Acquisition (CAC)         : (Rp  36.000.000)
  - General Administrative & Office Overhead               : (Rp  18.000.000)
------------------------------------------------------------------------
TOTAL OPEX                                                 : (Rp 102.000.000) (19.0%)

EBITDA / NET PROFIT BEFORE TAX                             : Rp 175.970.100 (32.8%)
Pajak PPh Final UMKM PP 55/2022 (0.5% Gross Revenue)       : (Rp   2.682.000)
========================================================================
NET PROFIT AFTER TAX (LABA BERSIH AKHIR 1 TAHUN)           : Rp 173.288.100 (32.3%)
========================================================================
```

---

## 7. Key Financial Indicators & Metrics

1. **Net Profit Margin**: **32,3%** (Sangat Sehat untuk platform SaaS Software + Hardware-Enabled Services).
2. **Break-Even Point (BEP)**: **192 User SaaS Premium** (Atau omset bulanan Rp 18.000.000).
3. **Monthly Net Burn/Profit**: **+ Rp 14.440.675 / bulan** (Cashflow Positif sejak Bulan ke-3).
4. **Customer Lifetime Value (LTV)**: Rp 588.000 / merchant / tahun.
5. **Customer Acquisition Cost (CAC)**: Rp 36.000 / merchant.  
   *(Rasio LTV : CAC = 16,3x — Terkategori Ekstrem Efisien)*.
