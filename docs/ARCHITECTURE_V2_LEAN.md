# SuperUMKM Platform - Infrastructure Specification V2 (Lean Startup Edition)

> [!TIP]
> Dokumen ini adalah **Spesifikasi Infrastruktur Versi 2 (Lean Startup MVP)** yang dirancang hemat biaya untuk tahap rintisan/bootstrapping awal tanpa mengorbankan performa sistem. Dokumen arsitektur skala 1.000 user tetap tersimpan di [`docs/ARCHITECTURE.md`](file:///c:/1.%20Work/Private/SuperUMKM/docs/ARCHITECTURE.md).

---

## 1. Konsep Infrastruktur Ringan (Bootstrapped MVP)
Pada tahap awal peluncuran (target 100–300 UMKM pertama), arsitektur disederhanakan dari multi-instance cloud enterprise menjadi **Single Hybrid VPS Architecture**. Seluruh container Node.js App & PostgreSQL berjalan dalam satu server teroptimasi dengan pembackupan otomatis offsite.

```
 ┌───────────────────────────────────────────────────────────────────┐
 │                   Cloudflare Free Tier (Edge CDN & SSL)           │
 └─────────────────────────────────┬─────────────────────────────────┘
                                   │
 ┌─────────────────────────────────▼─────────────────────────────────┐
 │       Single VPS Hybrid Node (Hetzner / DO / Biznet Gio)          │
 │  ┌───────────────────────────┐     ┌───────────────────────────┐  │
 │  │ Node.js Express App       │     │ PostgreSQL Container      │  │
 │  │ (CHECK-FIX-GROW Engine)   │◄───►│ (Transactional Database)  │  │
 │  └─────────────┬─────────────┘     └─────────────┬─────────────┘  │
 └────────────────┼─────────────────────────────────┼────────────────┘
                  │                                 │ (Automated Cron)
 ┌────────────────▼─────────────┐     ┌─────────────▼────────────────┐
 │ Pay-as-you-go APIs           │     │ S3 Backup Storage            │
 │ (Gemini Flash & WA Gateway)  │     │ (Cloudflare R2 Free Tier)    │
 └──────────────────────────────┘     └──────────────────────────────┘
```

---

## 2. Rincian Spesifikasi & Pembiayaan Tahunan (Inc. PPN 11%)

| Komponen Infrastruktur | Spesifikasi Hardware / Service | Konsumsi / Bulan | Biaya Bulanan (IDR) | Biaya Tahunan Excl. Tax (IDR) |
|---|---|---|---|---|
| **Single Hybrid VPS** | 2 vCPU, 4 GB RAM, 50 GB NVMe SSD (DO / Hetzner / Biznet Gio) | 24/7 Node + PostgreSQL | Rp 190.000 | Rp 2.280.000 |
| **Offsite DB Backup** | Automated Daily Cron Backup ke Cloudflare R2 / S3 Storage | 5 GB Backup Storage | Rp 20.000 | Rp 240.000 |
| **Domain & Security** | Domain `.id` / `.com` + Cloudflare Free Tier (SSL/DNS/DDoS) | Unlimited Traffic | Rp 13.333 | Rp 160.000 |
| **AI LLM API Engine** | Gemini 1.5 Flash (Pay-as-you-go ultra murah) | ~3.000 Request/bulan | Rp 240.000 | Rp 2.880.000 |
| **WhatsApp Gateway** | Fonnte / Wablas Starter Plan (1 Device WA Official Gateway) | ~10.000 Pesan WA/bulan | Rp 100.000 | Rp 1.200.000 |
| **Payment Gateway** | Pay-per-use Payment Gateway (Xendit / Midtrans QRIS Dynamic) | 0 Fixed Monthly Fee | Rp 0 | Rp 0 |
| **SUBTOTAL INFRASTRUKTUR LEAN V2 (Excl. Tax)** | | | **Rp 563.333 / bln** | **Rp 6.760.000 / thn** |
| **PAJAK PPN 11%** | *Pajak Pertambahan Nilai UU HPP Indonesia* | | **Rp 61.967 / bln** | **Rp 743.600 / thn** |
| **TOTAL BIAYA PEMBIAYAAN INFRASTRUKTUR LEAN V2 (INC. PPN 11%)** | | | **Rp 625.300 / bln** | **Rp 7.503.600 / thn** |

---

## 3. Strategi Efisiensi Hemat Biaya (Cost Saving Hacks)
1. **Gemini 1.5 Flash API**: Penggunaan AI berbasis token bayar sesuai pemakaian (Pay-as-you-go) tanpa biaya minimum bulanan.
2. **Cloudflare Free Tier**: Mendapatkan SSL HTTPS gratis, DDoS Protection, dan DNS resolution tanpa biaya lisensi tahunan.
3. **Local Docker PostgreSQL**: Menghemat hingga Rp 9,6 Juta/tahun dibandingkan managed database cloud pihak ketiga pada tahap MVP.
4. **Penghematan Total**: Penghematan biaya operasional server sebesar **93,4%** (Dari Rp 114,4 Juta/thn turun menjadi **Rp 7,5 Juta/thn**).
