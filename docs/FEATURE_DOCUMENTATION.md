# 📖 Dokumentasi Fitur Platform BenPayu.com (SuperUMKM / Pandoman)

> [!NOTE]
> Dokumen ini merangkum seluruh **Spesifikasi Fitur dan Fungsi Sistem BenPayu.com** yang dikembangkan dan disempurnakan. Dokumen ini berfokus pada fungsi produk untuk pemilik toko, kasir, agen lapangan, dan pengelola sistem.

---

## 1. Siklus Utama Pendampingan: CHECK → FIX → GROW

Platform BenPayu.com beroperasi menggunakan siklus 3-pilar otomatis yang menuntun pemilik usaha awam dari diagnosis hingga pertumbuhan omset:

```
 ┌──────────────────────┐      ┌──────────────────────┐      ┌──────────────────────┐
 │   1. CHECK (Audit)   │ ───► │   2. FIX (Aksi 1-Klik)│ ───► │   3. GROW (Akselerasi│
 │  Score Engine 0-100  │      │ Top 3 Fokus Utama    │      │ Local SEO & Retensi  │
 └──────────────────────┘      └──────────────────────┘      └──────────────────────┘
```

---

## 2. Modul Fitur Unggulan Sistem

### 📊 A. Analisis Kesehatan Usaha AI (8 Dimensi Audit)
Engine evaluasi kesehatan etalase digital pedagang secara presisi dengan transparansi skor 0–100 poin:
1. **Google Business Presence (20 Poin)**: Memeriksa keberadaan profil lokasi dan verifikasi tempat usaha di Google Maps.
2. **Review & Reputasi Toko (15 Poin)**: Memeriksa jumlah dan rata-rata bintang ulasan Google Maps.
3. **Foto & Kelengkapan Visual (10 Poin)**: Memeriksa foto etalase toko dan logo produk jernih.
4. **Mini Website & Toko Instan (15 Poin)**: Memeriksa penerbitan katalog online terhubung ke WhatsApp.
5. **WhatsApp & Kontak Toko (10 Poin)**: Memeriksa nomor WhatsApp Business resmi aktif.
6. **Produk & Kesiapan Harga (10 Poin)**: Memeriksa kelengkapan rincian daftar barang dan harga.
7. **Transaksi Digital & QRIS (10 Poin)**: Memeriksa kesiapan pembayaran QRIS kasir.
8. **Kesiapan Operasional Toko (10 Poin)**: Memeriksa pencatatan keuangan harian P&L Saku.

> 🔍 **Fitur Tambahan - Detektor Konsistensi NAP (Nama, Alamat, Telepon)**:  
> Sistem secara otomatis mencocokkan Nama, Alamat, dan No. Telepon toko di Google Maps vs data faktual pedagang. Jika tingkat ketidaksesuaian >20%, sistem memberikan **penalti 5 poin** dan memicu tugas prioritas di Pusat Aksi.

---

### 📍 B. Suites Local SEO & Google Maps (Pandoman Lokal)
Fasilitas khusus untuk menaikkan peringkat toko di pencarian sekitar radius 3KM:
* **Pandoman Kata Kunci Lokal (Local Keyword Injector)**: Menghasilkan rekomendasi Judul & Deskripsi usaha optimal berbasis Nama Usaha, Produk Utama, dan Lokasi Jalan/Kecamatan (Contoh: *"Warung Sate Bu Siti - Sate Kambing Muda Antasari"*).
* **Pemetaan Kategori GMB**: Mengoptimalkan kategori bisnis sesuai standar Google Business Profile.
* **Detektor Rutinitas Post Google**: Pengingat berkala untuk melakukan pembaharuan foto/promosi Google Posts (minimal 1 kali per 7 hari).
* **Cetak Standee QR Review Akrilik**: Generator desain QR Code ulasan bintang-5 untuk diletakkan di meja kasir.
* **AI Auto-Reply Ulasan**: Mesin pembalas ulasan Google Maps otomatis berbasis kecerdasan buatan.

---

### 🌐 C. Website Instan Toko Kami (`/toko/:slug`)
Fitur pembuatan situs katalog produk instan tanpa perlu paham coding/SEO:
* **Clean URL Routing**: Toko terbit menggunakan alamat bersih ramah pembaca (`/toko/:slug`, contoh: `/toko/warung-berkah`).
* **WhatsApp Order Integration**: Tombol beli langsung mengarahkan pesanan beserta rincian barang ke WhatsApp pemilik toko.

---

### 📱 D. Mesin Kasir POS & Hak Akses Staf Kasir
Sistem pencatatan penjualan toko dengan pembatasan hak akses staf:
* **Transaksi Instant & QRIS**: Pencatatan barang belanja kilat, cetak/kirim struk digital, dan penerimaan QRIS dinamis/statis.
* **Pengaturan Kuota Staf Kasir (Role & Tier Guard)**:
  - **Paket GRATIS**: Maksimal **1 Staf Kasir**.
  - **Paket PREMIUM**: Maksimal **5 Staf Kasir** (Dapat ditambah via *Add-On Staf Kasir Rp 10.000 / staf / bulan*).
* **Akses PIN Terpisah**: Karyawan login menggunakan 4-digit PIN khusus tanpa dapat melihat laporan laba rugi rahasia pemilik toko.

---

### 💰 E. Pembukuan P&L Saku, Stok Tipis & Buku Bon
Sistem pengelolaan arus kas dan persediaan barang:
* **P&L Saku**: Pencatatan harian pemasukan dan pengeluaran secara terpisah untuk memantau untung-rugi riil.
* **Alert Stok Tipis (Low Stock Warning)**: Peringatan otomatis saat stok barang mencapai batas minimum, lengkap dengan tombol draf pemesanan ulang ke supplier via WA.
* **Buku Bon (Utang-Piutang)**: Pencatatan utang langganan secara tertata beserta status pelunasannya.

---

### 💬 F. WA Loyalty & Alert Pelanggan Churn
Fasilitas retensi pelanggan berbasis WhatsApp:
* **Review Loyalty Coupon**: Pembuat kode kupon diskon otomatis untuk mengapresiasi pembeli yang telah memberikan ulasan bintang 5.
* **Peringatan Churn Pelanggan**: Penjadwal otomatis yang mendeteksi pelanggan lama yang tidak berkunjung >30 hari dan menyiapkan draf pesan ajakan belanja kembali.

---

### 🛠️ G. Pusat Rute Pendampingan Agen Lapangan
Sistem manajemen kunjungan pendampingan fisik:
* **Tiket Pendampingan**: Pemilik toko dapat mengajukan permohonan kunjungan agen wilayah.
* **Verifikasi Geotag & Foto**: Agen lapangan mengambil foto tempat usaha berkoordinat lokasi presisi sebagai bukti fisik keberadaan toko.

---

### 🎓 H. Video Micro-Course Edukasi Usaha
Pusat pelatihan strategi bisnis lokal:
* **Integrasi Link YouTube & Google Drive**: Super Admin dapat mengunggah modul pelatihan video melalui tautan resmi.
* **Materi Step-by-Step**: Pembelajaran berjenjang khusus pemilik toko untuk mendominasi pasar sekitar.

---

## 3. Matriks Kuota & Batas Fitur per Tier Paket

| Fitur / Modul | Paket GRATIS (Rp 0) | Paket SAAS PREMIUM (Rp 29rb - 36rb/bln) | PENDAMPINGAN LAPANGAN (Rp 120rb - 150rb/tugas) |
|---|:---:|:---:|:---:|
| **Analisis Kesehatan Usaha AI** | ✅ 8 Dimensi Audit | ✅ 8 Dimensi + NAP Penalty Check | ✅ Audit Fisik Tempat |
| **Local SEO Injector** | ❌ Terbatas | ✅ Akses Penuh Keyword & Posts | ✅ Dioptimalkan Agen |
| **Website Instan Toko** | ✅ 1 Slug (`/toko/:slug`) | ✅ Multi-section + WA Link | ✅ Setup Katalog Fisik |
| **Kuota Staf Kasir POS** | **Max 1 Staf Kasir** | **Max 5 Staf Kasir (+Add-On Rp10rb)** | ✅ Bantuan Training Staf |
| **Integrasi QRIS Kasir** | ✅ QRIS Static | ✅ QRIS Dynamic + Auto Verify | ✅ Cetak Akrilik Meja Kasir |
| **Pembukuan P&L Saku & Bon** | ✅ Pencatatan Dasar | ✅ Full Laporan & Export Data | ✅ Pembenahan Pembukuan |
| **WA Loyalty & Churn Alert** | ❌ Tidak Ada | ✅ Peringatan Otomatis Pelanggan | ✅ Penataan Database Pelanggan |
