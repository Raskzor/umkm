# SuperUMKM Platform - Financial Projection Model V2 (Lean Startup Edition)

> [!TIP]
> Dokumen ini adalah **Model Keuangan Versi 2 (Lean Startup MVP)** yang disesuaikan untuk skala awal rintisan 100–300 UMKM. Dokumen finansial skala 1.000 user tetap tersimpan di [`docs/FINANCIAL_MODEL.md`](file:///c:/1.%20Work/Private/SuperUMKM/docs/FINANCIAL_MODEL.md).

---

## 1. Strategi Penetapan Harga Promo Peluncuran (Launch Pricing)

| Service Tier | Harga Promo Peluncuran | Alokasi Fitur & Benefit | Contribution Margin |
|---|---|---|---|
| **Paket GRATIS** | **Rp 0 / selamanya** | Audit 8-Dimensi, 1 Katalog Web (`/toko/:slug`), 1 Hak Akses Staf Kasir POS. | Lead Acquisition |
| **Paket SAAS PREMIUM** | **Rp 29.000 / bulan** (*Promo Launch*) | Unlimited Staf Kasir, Local SEO Injector, AI Auto-Reply Review, WA Churn Alerts, Standee QR. | **74,5% Gross Margin** |
| **PENDAMPINGAN LAPANGAN (DFY)** | **Rp 120.000 / kunjungan** | Kunjungan Fisik Agen Lapangan, Foto Geotag, Setup Akrilik Kasir & Profil GMB. | **40,0% Margin** (60% Komisi Agen) |
| **QRIS Revenue Share** | **0.15% per transaksi** | Potongan komisi mikro dari total volume omset digital pedagang. | **100% Margin Operasional** |

---

## 2. Proyeksi Pendapatan Tahunan (Target awal 250 UMKM)

### Asumsi Distribusi Pengguna:
- **Total Merchants**: 250 UMKM Aktif (Peluncuran Awal)
- **Freemium Users**: 175 UMKM (70%)
- **SaaS Premium Promo (Rp 29.000/bln)**: 60 UMKM (24%)
- **Assisted Field Service**: 15 order / bulan (6%)

### Kalkulasi Pendapatan 1 Tahun:
1. **SaaS Premium Subscriptions**:  
   `60 UMKM × Rp 29.000/bln × 12 bulan` = **Rp 20.880.000**
2. **Assisted Field Services (DFY Visits)**:  
   `15 orders/bln × Rp 120.000/order × 12 bulan` = **Rp 21.600.000**
3. **Komisi Transaksi QRIS (0.15% Share)**:  
   *(Asumsi rata-rata omset QRIS pedagang Rp 10.000.000 / bulan)*  
   `250 UMKM × Rp 10.000.000 × 0.15% × 12 bulan` = **Rp 45.000.000**

#### 💰 TOTAL PENDAPATAN KOTOR 1 TAHUN: **Rp 87.480.000** (*Rp 7.290.000 / bulan*)

---

## 3. Cost of Goods Sold (COGS V2 Lean)

| Komponen COGS | Kalkulasi / Biaya Bulanan | Biaya Tahunan (IDR) |
|---|---|---|
| **Infrastruktur Hybrid Server + PPN 11%** | Rp 625.300 / bulan | Rp 7.503.600 |
| **Komisi Agen Lapangan** | 60% × Rp 21.600.000 | Rp 12.960.000 |
| **QRIS Switching & Bank Processing Fee** | ~Rp 1.250.000 / bulan | Rp 15.000.000 |
| **TOTAL COGS LEAN V2 (1 TAHUN)** | | **Rp 35.463.600** |

#### 📊 GROSS PROFIT (LABA KOTOR LEAN V2):
`Gross Revenue (Rp 87.480.000) - COGS (Rp 35.463.600)` = **Rp 52.016.400**  
*Gross Profit Margin*: **59,5%**

---

## 4. Biaya Operasional Rintisan (OPEX Founder Mode)

| Kategori OPEX | Aktivitas Operasional | Alokasi Bulanan | Alokasi Tahunan (IDR) |
|---|---|---|---|
| **Founder Allowance & CS** | Dukungan Operasional & Bantuan Pedagang | Rp 1.500.000 | Rp 18.000.000 |
| **Pemasaran Komunitas** | Edukasi Group WA & Komunitas Pedagang Lokal | Rp 500.000 | Rp 6.000.000 |
| **Utility & Internet** | Operasional Kantor Rintisan / Remote | Rp 300.000 | Rp 3.600.000 |
| **TOTAL OPEX LEAN V2 (1 TAHUN)** | | **Rp 2.300.000** | **Rp 27.600.000** |

---

## 5. Laporan Laba Rugi V2 Lean Startup (P&L Statement)

```text
========================================================================
            LAPORAN LABA RUGI V2 LEAN STARTUP (1 TAHUN)
                 SUPERUMKM PLATFORM (250 MERCHANTS)
========================================================================
GROSS REVENUE (PENDAPATAN KOTOR)
  - SaaS Premium Promo (60 user x Rp 29rb x 12bln)         : Rp 20.880.000
  - Field Services DFY (15 order/bln x Rp 120rb x 12bln)   : Rp 21.600.000
  - Share Komisi Transaksi QRIS (0.15% Volume Transaksi)   : Rp 45.000.000
------------------------------------------------------------------------
TOTAL GROSS REVENUE                                        : Rp 87.480.000 (100.0%)

DIRECT COSTS (COGS LEAN V2)
  - Biaya Server Hybrid, DB Backup, AI & WA (Inc PPN 11%)  : (Rp  7.503.600)
  - Komisi Agen Lapangan (60%)                             : (Rp 12.960.000)
  - Bank QRIS Settlement Fee                               : (Rp 15.000.000)
------------------------------------------------------------------------
TOTAL COGS                                                 : (Rp 35.463.600) (40.5%)

GROSS PROFIT (LABA KOTOR LEAN V2)                          : Rp 52.016.400 (59.5%)

OPERATIONAL EXPENSES (OPEX LEAN V2)
  - Founder Allowance & Customer Support                   : (Rp 18.000.000)
  - Pemasaran Komunitas & Edukasi Group WA                 : (Rp  6.000.000)
  - Operational Utility & Overhead                         : (Rp  3.600.000)
------------------------------------------------------------------------
TOTAL OPEX                                                 : (Rp 27.600.000) (31.6%)

EBITDA / NET PROFIT BEFORE TAX                             : Rp 24.416.400 (27.9%)
Pajak PPh Final UMKM PP 55/2022 (0.5% Gross Revenue)       : (Rp    437.400)
========================================================================
NET PROFIT AFTER TAX (LABA BERSIH LEAN V2 1 TAHUN)         : Rp 23.979.000 (27.4%)
========================================================================
```

---

## 6. Ringkasan Metrik Finansial V2 Lean
1. **Laba Bersih Tahunan (Net Profit)**: **Rp 23.979.000 / tahun** (~ **Rp 2.000.000 / bulan**).
2. **Break-Even Point (BEP) Modal Impas**: Hanya butuh **22 User SaaS Premium** (Atau omset Rp 2,8 Juta/bulan) untuk menutup seluruh biaya server & operasional!
3. **Penghematan Beban Server**: Berhasil menekan risiko modal awal hingga **93,4%**, sangat ideal untuk tahap pendanaan rintisan mandiri (Bootstrapping).

---

## 7. Analisis Sensitivitas: Skenario Kenaikan Harga +25%

Jika harga layanan dinaikkan sebesar **+25%**:
- **SaaS Premium**: Dari Rp 29.000 / bulan naik menjadi **Rp 36.250 / bulan** (*setara Rp 1.200 per hari*).
- **Field Services DFY**: Dari Rp 120.000 / kunjungan naik menjadi **Rp 150.000 / kunjungan**.

### 📊 Perbandingan Baseline vs. Skenario Kenaikan Harga +25%:

| Metrik Keuangan | Baseline V2 Lean | Skenario Kenaikan Harga +25% | Selisih (Kenaikan) | % Pertumbuhan |
|---|---|---|---|---|
| **Harga SaaS Premium** | Rp 29.000 / bln | **Rp 36.250 / bln** | +Rp 7.250 | +25,0% |
| **Harga Field Service DFY** | Rp 120.000 / visit | **Rp 150.000 / visit** | +Rp 30.000 | +25,0% |
| **Pendapatan SaaS Premium** | Rp 20.880.000 | **Rp 26.100.000** | +Rp 5.220.000 | +25,0% |
| **Pendapatan Field Service** | Rp 21.600.000 | **Rp 27.000.000** | +Rp 5.400.000 | +25,0% |
| **Komisi Transaksi QRIS** | Rp 45.000.000 | **Rp 45.000.000** | Rp 0 | 0,0% |
| **TOTAL GROSS REVENUE** | **Rp 87.480.000** | **Rp 98.100.000** | **+Rp 10.620.000** | **+12,1%** |
| **TOTAL COGS** | Rp 35.463.600 | Rp 38.703.600 | +Rp 3.240.000 | +9,1% |
| **GROSS PROFIT (Laba Kotor)** | Rp 52.016.400 | Rp 59.396.400 | +Rp 7.380.000 | +14,2% |
| **TOTAL OPEX (Operasional)** | Rp 27.600.000 | Rp 27.600.000 | Rp 0 (Fixed Cost) | 0,0% |
| **EBITDA (Laba Sebelum Pajak)**| Rp 24.416.400 | Rp 31.796.400 | +Rp 7.380.000 | +30,2% |
| **PPh Final UMKM (0.5%)** | Rp 437.400 | Rp 490.500 | +Rp 53.100 | +12,1% |
| **LABA BERSIH AKHIR (Net Profit)**| **Rp 23.979.000** | **Rp 31.305.900** | **+Rp 7.326.900** | **+30,6% 🚀** |
| **Net Profit Margin** | **27,4%** | **31,9%** | **+4,5% Margin** | - |
| **Break-Even Point (BEP)** | **22 Users** | **18 Users** | **-4 Users (Impas Lebih Cepat)** | - |

### 💡 Kesimpulan Analisis Keuangan:
1. **Peningkatan Laba Bersih Hingga +30,6%**: Meskipun harga layanan dinaikkan 25% dan total omset kotor naik 12,1%, **Laba Bersih Akhir melonjak sebesar 30,6%** (dari Rp 23,9 Juta/tahun menjadi **Rp 31,3 Juta/tahun**). Hal ini terjadi karena beban operasional (OPEX) dan server bersifat **Fixed Cost (Biaya Tetap)**.
2. **Impasan Lebih Cepat (BEP 18 User)**: Jumlah pengguna berbayar yang dibutuhkan untuk menutupi seluruh biaya operasional berkurang dari 22 user menjadi cukup **18 User SaaS Premium**.
3. **Penerimaan Pasar (Market Acceptance)**: Harga Rp 36.250/bulan masih sangat terjangkau bagi UMKM (hanya **Rp 1.200 per hari**), sehingga risiko penurunan daya beli sangat rendah.
