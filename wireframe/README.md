# Wireframe & Interactive Prototype - TB Kurnia Mandiri

Folder ini berisi implementasi **Low-Fidelity Grayscale Wireframe & Interactive Prototype** untuk kebutuhan dokumentasi Software Design Document (SDD) Sistem Informasi Inventaris dan Point of Sale (POS) **CV / TB Kurnia Mandiri**.

Desain wireframe mengikuti tata letak, proporsi komponen, navigasi, *custom dropdown*, dan *responsive behavior* aplikasi utama TB Kurnia Mandiri dalam bentuk *low-fidelity grayscale* (hitam, putih, dan abu-abu) tanpa elemen dekoratif berlebih. Seluruh file terisolasi di dalam folder `wireframe/` dan berjalan 100% di sisi frontend menggunakan mock data lokal tanpa koneksi ke Supabase maupun backend aplikasi utama.

## Struktur Folder

```text
wireframe/
├── index.html                      # Halaman utama (entry point) prototype interaktif
├── README.md                       # Panduan ringkas struktur & cara menjalankan prototype
├── css/
│   └── wireframe.css               # Stylesheet low-fidelity grayscale mengikuti desain aplikasi utama
├── data/
│   └── mock-data.js                # Data dummy lokal untuk 19 entitas sesuai Class Diagram & ERD
├── diagram/                        # Referensi diagram sistem terbaru (tidak diubah)
│   ├── activity-diagram/
│   ├── class-diagram/
│   ├── erd/
│   └── usecase-diagram/
└── js/
    ├── state.js                    # Manajemen state lokal, hak akses role, & log aktivitas otomatis
    ├── components.js               # Komponen UI reusable (Sidebar, Header, PageHeader, CustomSelect, ResponsiveTabs, StatusBadge, Modal)
    ├── pages-auth-dashboard.js     # Halaman Login sederhana & Dashboard 3 Role
    ├── pages-master.js             # Halaman Data Barang, Form Barang, Cetak Barcode, & Data/Form/Detail Pelanggan
    ├── pages-transaksi-kasbon.js   # Halaman Transaksi POS, Riwayat & Rekap, Penukaran Barang, & Kasbon/Piutang
    ├── pages-stok-pemasok.js       # Halaman Barang Masuk/Keluar, Form Mutasi, Stok & Restok, & Utang Pemasok
    ├── pages-pengiriman-sistem.js  # Halaman Pengiriman, Proses Lapangan, Laporan Kendala, Pengguna, & Log Aktivitas
    └── app.js                      # Router halaman & event handler seluruh interaksi
```

## Cara Menjalankan Prototype

Prototype dapat dijalankan dengan dua cara tanpa perlu `npm install` atau konfigurasi `.env` / database:

### Cara 1: Buka Langsung di Browser
Klik dua kali atau buka file berikut di Google Chrome / Microsoft Edge / Firefox:
- `wireframe/index.html`

### Cara 2: Menggunakan Server Statis Lokal (Opsional)
Jalankan perintah berikut dari terminal:
```powershell
npx serve wireframe -l 4000
```
Lalu buka `http://localhost:4000` di browser.

## Kredensial Simulasi Login (Ketik Manual)

Pada halaman login, pilih tab konteks role (**Pemilik**, **Kasir**, atau **Pengirim**). Sesuai ketentuan wireframe, memilih tab tidak mengisi kolom input secara otomatis. Ketik salah satu akun berikut secara manual:

| Tab Role | Username | Kata Sandi | Hak Akses |
| :--- | :--- | :--- | :--- |
| **Pemilik** | `admin` | `123` | Mengakses seluruh fitur Pemilik, Kasir, dan Pengirim |
| **Kasir** | `kasir` | `123` | Mengakses fitur Kasir (Dashboard, POS, Penukaran, Barang Masuk/Keluar, Pelanggan, Pembayaran Piutang, Riwayat, Penugasan Kirim) |
| **Pengirim** | `pengirim` | `123` | Mengakses fitur Pengirim (Dashboard Pengirim, Daftar Penugasan, Proses Pengiriman, Laporan Kendala, Riwayat Pengiriman) |
