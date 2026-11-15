# PRD — Sistem Informasi Penjualan dan Persediaan CV Kurnia Mandiri

> **Versi:** 1.4 · **Tanggal:** 16 November 2026 · **Pemilik produk:** Irfan
> **Sumber kebenaran:**
> 1. **Logika bisnis, alur proses, peran, navigasi, dan model data:** file draw.io `CV kurnia mandiri (1)` (Activity Diagram As-Is & To-Be, Class Diagram 15 Entitas termasuk `LaporanKendala`, Use Case, Struktur Navigasi).
> 2. **Lapisan teknis dan batasan cakupan:** Spesifikasi Final v1.4 (Next.js App Router, TypeScript, Supabase PostgreSQL 17.x + `pg_cron`/`pg_net`, Supabase Auth, Supabase Storage, Prisma ORM, Resend Email, Midtrans Snap Sandbox; cakupan *single store* tanpa cabang, tanpa master supplier, dan tanpa utang usaha).
>
> **Jika ada konflik antara PRD ini dan diagram draw.io, diagram menang untuk logika bisnis sedangkan spesifikasi v1.4 menang untuk stack teknis dan cakupan, lalu catat konfliknya di Bagian 13 ("Pertanyaan Terbuka & Asumsi").**

---

## 0. Cara Memakai Dokumen Ini (untuk AI Agent)

1. Baca seluruh dokumen sebelum menulis kode. Kerjakan **per fase** di Bagian 12, jangan lompat fase.
2. **Jangan menambah fitur** yang tidak ada di dokumen ini. Fitur di Bagian 11 (Di Luar Cakupan) — termasuk multi-cabang, master supplier/Purchase Order, dan utang usaha ke pemasok — tidak boleh dibuat.
3. Nama tabel & kolom di schema `public` **harus sama persis** dengan Class Diagram (Bagian 7.1), huruf kecil `snake_case`, bahasa Indonesia, **kecuali** penyimpangan terdokumentasi pada **D5/S6** (kolom `password` dihapus dari tabel `pengguna` karena dikelola oleh Supabase Auth, dan `pengguna.id_pengguna` bernilai UUID yang sama dengan `auth.users.id`) serta penyesuaian skema di Bagian 7.3 (S1–S7) yang wajib ditandai di file migrasi dengan komentar `-- PRD 7.3`.
4. Semua teks antarmuka berbahasa Indonesia. Zona waktu `Asia/Jakarta`, mata uang Rupiah (`Rp 1.250.000`, tanpa desimal di tampilan).
5. Bila ada hal ambigu yang tidak terjawab di sini, **pilih opsi default yang tertulis (ditandai `⚠ Asumsi`)**, lalu catat di Bagian 13 dan `docs/KEPUTUSAN.md`. Jangan berhenti dan jangan mengarang di luar default.
6. Setiap fitur selesai hanya bila memenuhi **Kriteria Penerimaan** di Bagian 9 dan punya minimal satu pengujian otomatis (Bagian 10.6).
7. **Struktur Folder & Konvensi Kode yang Diharapkan:**
   ```text
   ├── prisma/
   │   ├── schema.prisma           # Skema Prisma (Lampiran A)
   │   ├── migrations/             # Migrasi SQL + constraint manual & kebijakan RLS
   │   └── seed.ts                 # Seeder (Supabase Auth + tabel public)
   ├── src/                        # (atau langsung di root sesuai konfigurasi tsconfig)
   │   ├── app/                    # Next.js App Router (halaman, layout, Route Handlers)
   │   │   ├── (auth)/             # Halaman login & ganti password wajib
   │   │   ├── (admin)/admin/      # Halaman khusus peran admin
   │   │   ├── (kasir)/kasir/      # Halaman khusus peran kasir (POS, mutasi, piutang)
   │   │   ├── (pengirim)/pengirim/# Halaman mobile-first khusus peran pengirim
   │   │   └── api/                # Route Handlers (webhook gateway, cron notifikasi, unduh/cetak)
   │   ├── components/             # Komponen UI (shadcn/ui, form, tabel, struk cetak)
   │   ├── lib/                    # Utilitas umum (format Rupiah, tanggal, enkripsi AES-256-GCM, klien Supabase/Prisma)
   │   └── server/                 # Kode khusus sisi server (wajib 'server-only')
   │       ├── auth/               # Helper sesi & otorisasi: requireRole(), getCurrentUser()
   │       ├── actions/            # Next.js Server Actions per modul (tipis, validasi Zod + panggil service)
   │       ├── services/           # Logika bisnis utama (TransaksiService, StokService, dll.)
   │       ├── gateways/           # PaymentGatewayInterface, MidtransGateway, XenditGateway
   │       └── notifications/      # NotifikasiChannel, EmailChannel, WhatsappChannel
   └── tests/
       ├── unit/                   # Unit & integrasi service (Vitest)
       └── e2e/                    # Pengujian alur ujung-ke-ujung (Playwright)
   ```
   - **Konvensi lapisan server:** Komponen Client tidak boleh memanggil database atau Supabase Storage secara langsung. Semua mutasi data berjalan melalui **Server Actions** (`src/server/actions/*`) atau **Route Handlers** (`src/app/api/*`) yang memvalidasi input dengan **Zod**, memeriksa hak akses dengan `requireRole([...])` (`src/server/auth/*`), dan mengeksekusi logika bisnis di **Service Layer** (`src/server/services/*`).

---

## 1. Ringkasan Produk

### 1.1 Latar Belakang (kondisi As-Is)

CV Kurnia Mandiri adalah toko bangunan skala kecil (semen, pasir, bata, dan sejenisnya). Proses saat ini manual:

- Pelanggan datang, memesan barang secara lisan/tulisan.
- Pegawai toko mencatat pesanan, mengecek stok secara fisik ke gudang/rak, mencatat nota tulis tangan, dan menghitung total secara manual.
- Pembayaran tunai diterima langsung; **kasbon dicatat di buku piutang** dan disetujui pemilik secara lisan.
- Pengantaran barang ke lokasi pelanggan dilakukan karyawan lapangan tanpa pencatatan status maupun bukti terima.

Masalah utama: stok tidak akurat, nota/hitungan rawan salah, piutang sulit dilacak, pengiriman tidak termonitor, pemilik tidak punya rekap penjualan dan jejak aktivitas.

### 1.2 Tujuan Produk

| # | Tujuan | Indikator keberhasilan |
|---|--------|------------------------|
| G1 | Transaksi penjualan cepat dan akurat (scan barcode, hitung otomatis, struk thermal) | Satu transaksi tunai selesai < 1 menit |
| G2 | Stok selalu real-time dan berkurang otomatis | Tidak ada stok negatif; setiap perubahan stok punya jejak mutasi |
| G3 | Piutang/kasbon pelanggan terkendali dan disetujui pemilik lewat sistem | 100% kasbon punya keputusan tercatat (disetujui/ditolak + alasan) |
| G4 | Pengiriman barang termonitor sampai ada bukti terima | Setiap pengiriman berstatus jelas dan punya foto bukti saat terkirim |
| G5 | Pemilik memegang kendali penuh (rekap, log aktivitas, hak akses) | Rekap dapat diunduh Excel/PDF; semua aksi penting tercatat di log |

### 1.3 Ruang Lingkup Singkat & Batasan Cakupan

Aplikasi web *Point of Sale* (POS) dan persediaan internal untuk **toko bangunan skala kecil (*single store*)** dengan **3 peran login** (Pemilik/Admin, Pegawai Toko/Kasir, Karyawan Lapangan/Pengirim). Pelanggan **tidak** login; pelanggan dan Payment Gateway adalah aktor eksternal.

Penegasan batasan cakupan bisnis (**D1–D3**):
- **Single store (D1):** Sistem hanya mengelola satu toko dan satu lokasi stok. Tidak ada tabel maupun kolom cabang atau multi-gudang, dan tabel `pengaturan_sistem` hanya memiliki tepat satu baris konfigurasi.
- **Tanpa modul supplier (D2):** Sistem **tidak** memiliki tabel master supplier maupun fitur *Purchase Order* (PO). Kolom `mutasi_barang.supplier` (`varchar(50)`) tetap dipertahankan sesuai Class Diagram sebagai **teks bebas** untuk mencatat nama pemasok/asal barang saat Barang Masuk. Tabel `rencana_restok` tetap ada sebagai daftar rencana belanja internal toko tanpa relasi ke entitas supplier.
- **Tanpa utang usaha ke supplier, tetapi kasbon/piutang pelanggan tetap termasuk (D3):** Sistem **tidak** mencatat utang dagang/utang usaha toko kepada supplier. Sebaliknya, **kasbon dan piutang pelanggan kepada toko tetap termasuk penuh** di dalam cakupan karena merupakan piutang penjualan toko.

---

## 2. Peran Pengguna & Aktor

| Peran | Nilai `pengguna.role` | Perangkat utama | Tanggung jawab |
|-------|----------------------|-----------------|----------------|
| Pemilik / Admin | `admin` | Laptop/PC, HP | Kelola master data, setujui kasbon, stok & restok, rekap, monitoring pengiriman, log aktivitas, akun & hak akses, pengaturan sistem |
| Pegawai Toko (Kasir) | `kasir` | PC kasir (scanner barcode + printer thermal) | Transaksi penjualan, barang masuk/keluar, data pelanggan, pembayaran piutang, riwayat transaksi, penugasan pengiriman |
| Karyawan Lapangan / Pengirim | `pengirim` | **HP (mobile-first)** | Lihat & proses penugasan, unggah bukti terima, laporkan kendala, riwayat pengiriman |
| Pelanggan (eksternal) | — (tidak login) | — | Memesan, membayar (tunai / QRIS / Virtual Account), menerima barang |
| Payment Gateway (eksternal) | — | — | Midtrans **atau** Xendit (dipilih di Pengaturan Sistem); membuat kode QRIS/VA dan mengirim webhook |

> Pemilik dan Admin diperlakukan sebagai **satu peran `admin`** (form tambah akun hanya menawarkan Admin / Kasir / Pengirim).

---

## 3. Tech Stack & Arsitektur

Spesifikasi teknologi di bawah ini bersifat **final** untuk versi 1.1:
Spesifikasi teknologi di bawah ini bersifat **final** untuk versi 1.2:

| Lapisan | Spesifikasi Final |
|---------|-------------------|
| Hosting & Deployment | **Vercel** (Next.js Serverless, tanpa ketergantungan pada Vercel Cron) |
| Frontend | **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **shadcn/ui** |
| Form & Tabel | **React Hook Form** + **Zod** (validasi skema client & server), **TanStack Table** (tabel data & paginasi) |
| Backend | **Next.js Server Actions** (mutasi UI internal) + **Route Handlers** (webhook, cron, unduhan file), **TypeScript** |
| Database | **Supabase PostgreSQL (17.x)** (PK `uuid`, waktu `timestamptz`, nominal/kuantitas `numeric(15,2)`) |
| ORM & Migrasi | **Prisma ORM** (`prisma migrate` untuk skema & constraint SQL, `prisma/seed.ts` untuk data awal) |
| ORM & Migrasi | **Prisma ORM** dengan **native `enum` Prisma** (`prisma migrate` untuk skema & constraint SQL, `prisma/seed.ts` untuk data awal) |
| Koneksi DB | Dua *connection string*: `DATABASE_URL` (Supabase connection pooler / Supavisor untuk runtime) dan `DIRECT_URL` (koneksi langsung untuk `prisma migrate`) |
| Autentikasi | **Supabase Auth** (login `username` dipetakan ke email sintetis `<username>@kurnia.local`; manajemen akun via Supabase Admin API di server) |
| Autentikasi | **Supabase Auth** (login `username` dipetakan ke email sintetis default `<username>@kurnia.local`; manajemen akun via Supabase Admin API di server) |
| Otorisasi | Nilai `role` dan `status` di tabel `pengguna` sebagai sumber kebenaran; setiap Server Action & Route Handler wajib memanggil `requireRole([...])` di server |
| Penyimpanan File | **Supabase Storage** (bucket **privat** untuk `foto_bukti_url` dan `bukti_transfer_url`, diakses lewat *signed URL* berumur pendek dari server) |
| Proses Latar Belakang | Pola **Outbox** pada tabel `notifikasi` (`status_kirim = 'antri'`): pengiriman segera via `after()` Next.js + *retry* terjadwal via Route Handler `/api/cron/notifikasi` |
| Proses Latar Belakang | Pola **Outbox** pada tabel `notifikasi` (`status_kirim = 'antri'`): pengiriman segera via `after()` Next.js + *retry* terjadwal via **Supabase `pg_cron` + `pg_net`** yang memanggil Route Handler `/api/cron/notifikasi` |
| Export Dokumen | `exceljs` (Excel `.xlsx`), `@react-pdf/renderer` atau `pdf-lib` (PDF) |
| Barcode | `bwip-js` atau `jsbarcode` (Code 128) |
| Struk Thermal | Halaman HTML khusus cetak dengan CSS `@media print` (lebar kertas 58/80 mm) melalui dialog cetak browser |
| Pemindai Barcode | Scanner USB mode *keyboard wedge* (input teks + Enter) — tidak memerlukan driver khusus |
| Payment Gateway | Antarmuka `PaymentGatewayInterface` dengan adapter `MidtransGateway` & `XenditGateway`; `kunci_api` dienkripsi **AES-256-GCM** di level aplikasi |
| Notifikasi | Antarmuka `NotifikasiChannel` dengan implementasi `EmailChannel` (SMTP/Resend `⚠ Asumsi`) dan `WhatsappChannel` (antarmuka + *stub*/HTTP API `⚠ belum ditentukan`, lihat Bagian 13) |
| Notifikasi | Antarmuka `NotifikasiChannel` dengan implementasi `EmailChannel` (SMTP/Resend `⚠ Asumsi`) dan `WhatsappChannel` (antarmuka + *stub/log* karena penyedia masih ditunda, lihat Bagian 13) |
| Pengujian & Kualitas | **Vitest** (unit & integrasi service), **Playwright** (E2E alur utama), **ESLint** + **Prettier** |

### Prinsip Arsitektur & Keamanan Teknis (D4–D20)

1. **Service Layer Terpusat:**
   - Seluruh logika bisnis ditempatkan di `src/server/services/` (`TransaksiService`, `StokService`, `KasbonService`, `PengirimanService`, `NotifikasiService`, `LogAktivitasService`, `PembayaranService`).
   - Server Actions (`src/server/actions/`) dan Route Handlers (`src/app/api/`) dijaga tetap tipis: hanya mengurus autentikasi/otorisasi (`requireRole`), validasi input (Zod), memanggil method Service, dan merevalidasi cache halaman (`revalidatePath`).
   - Metode pada Class Diagram (mis. `simpanTransaksi()`, `perbaruiStok()`, `setujuiKasbon()`) dipetakan menjadi method pada Service terkait.

2. **Autentikasi & Otorisasi dengan Supabase Auth (D4–D8):**
   - **Pemetaan Username ke Email Sintetis (D4):** Karena Supabase Auth berbasis email+password sedangkan sistem memakai `username`, pengguna tetap login menggunakan `username` dan password. Di sisi server, `username` diubah menjadi email internal sintetis `<username>@kurnia.local` (huruf kecil, di-*trim*) saat memanggil Supabase Auth. Alamat email sungguhan untuk keperluan notifikasi disimpan terpisah di kolom `pengguna.email` (nullable).
   - **Sinkronisasi Identitas (D5):** `pengguna.id_pengguna` menggunakan UUID yang **sama persis** dengan `auth.users.id` milik Supabase Auth. Kolom `password` pada Class Diagram **dihapus** dari tabel `pengguna` karena kredensial dikelola sepenuhnya oleh Supabase Auth.
   - **Penjaga Peran di Server (D6):** Tabel `pengguna` (`role` dan `status`) adalah sumber kebenaran otorisasi. Setiap Server Action dan Route Handler **wajib** memanggil helper `requireRole([...])` di sisi server yang memverifikasi sesi Supabase Auth sekaligus memastikan baris `pengguna` berstatus `aktif` dan memiliki peran yang diizinkan. Middleware Next.js (`middleware.ts`) hanya berfungsi untuk *redirect* pengalaman pengguna (UX), bukan satu-satunya penjaga keamanan.
   - **Manajemen Akun via Supabase Admin API (D7):** Pembuatan akun baru, reset password, dan penonaktifan akun wajib dieksekusi dari server menggunakan Supabase Admin API (`SUPABASE_SERVICE_ROLE_KEY`). Kunci *service role* tidak boleh pernah diekspos ke client atau diawali `NEXT_PUBLIC_`. Saat akun dinonaktifkan, server mengubah `pengguna.status = 'nonaktif'` sekaligus melakukan *ban* (`ban_duration`) pada user di Supabase Auth serta mencabut sesi aktifnya.
   - **Pembatasan Percobaan Login (D8):** Menggunakan fitur *rate limit* bawaan Supabase Auth ditambah pembatasan sederhana di Server Action login (mis. maks 5 percobaan gagal per menit per `username` + IP).

3. **Integritas Database, Row Locking, dan RLS (D9–D14):**
   - **Row-Level Locking untuk Stok (D11):** Karena Prisma tidak menyediakan operator *lock for update* bawaan pada query biasa, setiap operasi yang memeriksa dan mengubah stok atau tagihan (finalisasi transaksi penjualan, mutasi barang masuk/keluar, dan pemrosesan webhook pembayaran) **wajib** berjalan di dalam `prisma.$transaction` dan mengunci baris `barang` terkait menggunakan `$queryRaw`:
     ```sql
     SELECT id_barang, stok, harga, stok_minimum FROM barang WHERE id_barang IN (...) FOR UPDATE
     ```
   - **Row Level Security (RLS) Deny-All (D12):** Seluruh tabel di schema `public` wajib mengaktifkan RLS (`ENABLE ROW LEVEL SECURITY`) **tanpa** policy publik (default *deny-all* untuk peran `anon` dan `authenticated` PostgREST). Dengan demikian, tidak ada data yang dapat dibaca atau dimodifikasi secara langsung dari browser menggunakan `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Seluruh akses data dilakukan melalui Prisma di sisi server.
   - **Constraint Database Manual (D14):** Migrasi SQL Prisma wajib menambahkan `CHECK` constraint pada database: `stok >= 0`, `harga >= 0`, `jumlah > 0`, dan `sisa_tagihan >= 0`.

4. **Penyimpanan File Privat (D15):**
   - Foto bukti penerimaan pengiriman (`pengiriman.foto_bukti_url`) dan foto bukti transfer pembayaran piutang (`pembayaran.bukti_transfer_url`) disimpan di bucket **Supabase Storage privat** (mis. `bukti-transaksi`).
   - Kolom di database hanya menyimpan **path objek** (mis. `pengiriman/2026/11/<uuid>.webp`), bukan URL publik.
   - Pengunggahan dilakukan melalui server setelah memvalidasi tipe MIME (`image/jpeg`, `image/png`, `image/webp`), ukuran maksimal 5 MB, dan penamaan acak berbasis UUID. Untuk menampilkan gambar di antarmuka, server memeriksa otorisasi pengguna lalu membuat *signed URL* berumur pendek (mis. 5–15 menit).

5. **Outbox Notifikasi, Webhook, dan Enkripsi Kunci API (D16–D18):**
   - **Outbox Notifikasi (D16):** Tabel `notifikasi` berfungsi sebagai *transactional outbox* dengan status awal `status_kirim = 'antri'`. Setelah transaksi utama selesai, server memicu pengiriman asinkron non-blocking menggunakan fungsi `after()` dari Next.js. Untuk menangani kegagalan jaringan sementara, tersedia Route Handler `app/api/cron/notifikasi/route.ts` yang dilindungi header rahasia (`CRON_SECRET`) untuk mencoba ulang pengiriman berstatus `antri` atau `gagal` hingga maksimal 3 kali percobaan.
   - **Outbox Notifikasi (D16):** Tabel `notifikasi` berfungsi sebagai *transactional outbox* dengan status awal `status_kirim = 'antri'`. Setelah transaksi utama selesai, server memicu pengiriman asinkron non-blocking menggunakan fungsi `after()` dari Next.js. Untuk menangani kegagalan jaringan sementara, ekstensi **Supabase `pg_cron` + `pg_net`** dijadwalkan untuk memanggil Route Handler `app/api/cron/notifikasi/route.ts` (dilindungi header rahasia `CRON_SECRET`) guna mencoba ulang pengiriman berstatus `antri` atau `gagal` hingga maksimal 3 kali percobaan. Sistem **tidak** bergantung pada Vercel Cron.
   - **Route Handler Webhook (D17):** Endpoint penerima notifikasi Payment Gateway **wajib** diimplementasikan sebagai Route Handler di `app/api/webhook/gateway/route.ts` (bukan Server Action), tidak bergantung pada cookie sesi, memverifikasi *signature* kriptografis dari gateway, dan bersifat idempoten.
   - **Enkripsi Kunci API (D18):** Nilai `pengaturan_sistem.kunci_api` dienkripsi di level aplikasi menggunakan algoritma **AES-256-GCM** (kunci 32-byte dari environment variable server `APP_ENCRYPTION_KEY`) sebelum disimpan ke database, dan hanya ditampilkan dalam bentuk ter-mask (mis. `SB-Mid-****-xxxx`) di halaman pengaturan.

---

## 4. Matriks Hak Akses (RBAC)

✅ = boleh · 👁 = hanya lihat · ❌ = tidak boleh

| Modul / Fitur | admin | kasir | pengirim |
|---------------|:----:|:-----:|:--------:|
| Login / Logout / Dashboard | ✅ | ✅ | ✅ |
| Data Barang — lihat daftar, harga, stok | ✅ | 👁 (lewat Barang Masuk & Keluar / pencarian transaksi) | ❌ |
| Data Barang — tambah / ubah / hapus / cetak barcode | ✅ | ❌ | ❌ |
| Data Pelanggan — lihat, tambah, ubah | ✅ | ✅ | ❌ |
| Data Pelanggan — hapus | ✅ | ❌ | ❌ |
| Riwayat transaksi & piutang per pelanggan | ✅ | ✅ | ❌ |
| Transaksi Penjualan | ❌ | ✅ | ❌ |
| Barang Masuk & Keluar | ❌ | ✅ | ❌ |
| Pembayaran & Piutang (bayar cicilan/pelunasan) | ❌ | ✅ | ❌ |
| Kasbon & Piutang — keputusan setujui/tolak | ✅ | ❌ (hanya mengajukan lewat transaksi) | ❌ |
| Stok & Restok (batas minimum, rencana restok) | ✅ | ❌ | ❌ |
| Riwayat Transaksi — kasir (filter, cetak ulang struk) | ❌ | ✅ | ❌ |
| Riwayat Transaksi & Rekap Penjualan (semua, nota, unduh) | ✅ | ❌ | ❌ |
| Penugasan Pengiriman (membuat) | ❌ | ✅ | ❌ |
| Monitoring Pengiriman (semua pengiriman) | ✅ | ❌ | ❌ |
| Daftar Penugasan, Proses Pengiriman, Laporan Kendala, Riwayat Pengiriman (milik sendiri) | ❌ | ❌ | ✅ |
| Log Aktivitas | ✅ | ❌ | ❌ |
| Pengguna & Hak Akses | ✅ | ❌ | ❌ |
| Pengaturan Sistem (notifikasi, payment gateway) | ✅ | ❌ | ❌ |

Aturan: pengirim **hanya** melihat pengiriman yang `pengirim_id`-nya miliknya. Akses ke halaman atau Server Action/Route Handler yang bukan haknya → ditolak oleh `requireRole` dengan respons HTTP 403 / halaman akses ditolak.

---

## 5. Struktur Navigasi

Tipe navigasi (sesuai diagram): **Hierarki** dari Login ke tiap menu utama; **Non-linier** antar menu utama (sidebar, bebas berpindah); **Linier** untuk alur bertahap di dalam satu menu.

### 5.1 Pemilik / Admin

Sidebar: **Dashboard · Data Barang · Data Pelanggan · Kasbon & Piutang · Stok & Restok · Riwayat Transaksi & Rekap Penjualan · Monitoring Pengiriman · Log Aktivitas · Pengguna & Hak Akses · Pengaturan Sistem · Logout**

| Menu | Halaman turunan |
|------|-----------------|
| Data Barang | Form Tambah/Ubah Barang → Cetak Label Barcode Produk |
| Data Pelanggan | Form Tambah/Ubah Pelanggan → Riwayat Transaksi & Piutang Pelanggan |
| Kasbon & Piutang | Detail Kasbon (batas, sisa piutang, riwayat bayar) → Keputusan Kasbon (Setujui/Tolak + alasan) |
| Stok & Restok | Form Batas Stok Minimum → Form Rencana Restok |
| Riwayat Transaksi & Rekap Penjualan | Nota Pelanggan → Unduh Rekap Penjualan (Excel/PDF) |
| Monitoring Pengiriman | Detail Pengiriman → Bukti Penerimaan Barang |
| Log Aktivitas | Detail Aktivitas (data sebelum & sesudah) → Unduh Log (Excel/PDF) |
| Pengguna & Hak Akses | Form Tambah Akun → Pengaturan Hak Akses → Reset Password → Konfirmasi Nonaktifkan Akun |
| Pengaturan Sistem | Pengaturan Notifikasi (Email/WhatsApp) → Pengaturan Payment Gateway |

### 5.2 Pegawai Toko (Kasir)

Sidebar: **Dashboard · Transaksi Penjualan · Barang Masuk & Keluar · Data Pelanggan · Pembayaran & Piutang · Riwayat Transaksi · Penugasan Pengiriman · Logout**

| Menu | Alur linier |
|------|-------------|
| Transaksi Penjualan | Keranjang Belanja → Pilih Pelanggan & Jenis Pembayaran → Proses Pembayaran (Tunai / Kasbon / QRIS-VA) → Struk Transaksi |
| Barang Masuk & Keluar | Form Barang Masuk/Keluar → Pemindaian Barcode & Input Jumlah |
| Data Pelanggan | Form Tambah/Ubah Pelanggan → Riwayat Transaksi & Piutang Pelanggan |
| Pembayaran & Piutang | Daftar Piutang & Sisa Tagihan → Form Pembayaran Piutang → Struk Pembayaran |
| Riwayat Transaksi | Struk Transaksi (cetak ulang) |
| Penugasan Pengiriman | Daftar Transaksi yang Perlu Dikirim → Form Pengirim & Alamat Tujuan |

### 5.3 Karyawan Lapangan / Pengirim

Sidebar/bottom-nav (mobile): **Dashboard · Daftar Penugasan · Proses Pengiriman · Laporan Kendala · Riwayat Pengiriman · Logout**

| Menu | Alur linier |
|------|-------------|
| Daftar Penugasan Pengiriman | Detail Penugasan (nota, pemesan, alamat, barang) |
| Proses Pengiriman Barang | Pemeriksaan Kelengkapan Barang → Pengantaran & Pemeriksaan di Lokasi → Unggah Foto Bukti Penerimaan |
| Laporan Kendala Pengiriman | Form Laporan Kendala (jenis & deskripsi) |
| Riwayat Pengiriman | Detail & Bukti Penerimaan Pengiriman |

### 5.4 Struktur Route Next.js App Router

Menggunakan *route groups* per peran agar layout dan pemeriksaan otorisasi di tingkat segmen terpisah rapi:

```text
# Autentikasi & Umum
app/(auth)/login/page.tsx                          -> /login
app/(auth)/ganti-password/page.tsx                 -> /ganti-password (wajib ganti password sementara)
app/dashboard/page.tsx                             -> /dashboard (redirect/render sesuai peran)

# Peran Admin / Pemilik — layout memanggil requireRole(['admin'])
app/(admin)/admin/dashboard/page.tsx               -> /admin/dashboard
app/(admin)/admin/barang/page.tsx                  -> /admin/barang
app/(admin)/admin/barang/tambah/page.tsx           -> /admin/barang/tambah
app/(admin)/admin/barang/[id]/ubah/page.tsx        -> /admin/barang/[id]/ubah
app/(admin)/admin/barang/[id]/barcode/page.tsx     -> /admin/barang/[id]/barcode
app/(admin)/admin/pelanggan/page.tsx               -> /admin/pelanggan
app/(admin)/admin/pelanggan/[id]/riwayat/page.tsx  -> /admin/pelanggan/[id]/riwayat
app/(admin)/admin/kasbon/page.tsx                  -> /admin/kasbon
app/(admin)/admin/kasbon/[id]/page.tsx             -> /admin/kasbon/[id]
app/(admin)/admin/stok/page.tsx                    -> /admin/stok
app/(admin)/admin/stok/minimum/page.tsx            -> /admin/stok/minimum
app/(admin)/admin/stok/restok/page.tsx             -> /admin/stok/restok
app/(admin)/admin/transaksi/page.tsx               -> /admin/transaksi
app/(admin)/admin/transaksi/[id]/nota/page.tsx     -> /admin/transaksi/[id]/nota
app/(admin)/admin/pengiriman/page.tsx              -> /admin/pengiriman
app/(admin)/admin/pengiriman/[id]/page.tsx         -> /admin/pengiriman/[id]
app/(admin)/admin/log/page.tsx                     -> /admin/log
app/(admin)/admin/log/[id]/page.tsx                -> /admin/log/[id]
app/(admin)/admin/pengguna/page.tsx                -> /admin/pengguna
app/(admin)/admin/pengguna/tambah/page.tsx         -> /admin/pengguna/tambah
app/(admin)/admin/pengguna/[id]/akses/page.tsx     -> /admin/pengguna/[id]/akses
app/(admin)/admin/pengaturan/page.tsx              -> /admin/pengaturan
app/(admin)/admin/pengaturan/notifikasi/page.tsx   -> /admin/pengaturan/notifikasi
app/(admin)/admin/pengaturan/gateway/page.tsx      -> /admin/pengaturan/gateway

# Peran Kasir — layout memanggil requireRole(['kasir'])
app/(kasir)/kasir/dashboard/page.tsx               -> /kasir/dashboard
app/(kasir)/kasir/transaksi/page.tsx               -> /kasir/transaksi (POS)
app/(kasir)/kasir/transaksi/[id]/struk/page.tsx    -> /kasir/transaksi/[id]/struk (cetak thermal)
app/(kasir)/kasir/mutasi/page.tsx                  -> /kasir/mutasi
app/(kasir)/kasir/pelanggan/page.tsx               -> /kasir/pelanggan
app/(kasir)/kasir/pelanggan/[id]/riwayat/page.tsx  -> /kasir/pelanggan/[id]/riwayat
app/(kasir)/kasir/piutang/page.tsx                 -> /kasir/piutang
app/(kasir)/kasir/piutang/[id]/struk/page.tsx      -> /kasir/piutang/[id]/struk
app/(kasir)/kasir/riwayat/page.tsx                 -> /kasir/riwayat
app/(kasir)/kasir/pengiriman/page.tsx              -> /kasir/pengiriman

# Peran Pengirim — layout mobile-first memanggil requireRole(['pengirim'])
app/(pengirim)/pengirim/dashboard/page.tsx         -> /pengirim/dashboard
app/(pengirim)/pengirim/penugasan/page.tsx         -> /pengirim/penugasan
app/(pengirim)/pengirim/proses/[id]/page.tsx       -> /pengirim/proses/[id]
app/(pengirim)/pengirim/kendala/page.tsx           -> /pengirim/kendala
app/(pengirim)/pengirim/riwayat/page.tsx           -> /pengirim/riwayat

# Route Handlers (API)
app/api/webhook/gateway/route.ts                   -> POST /api/webhook/gateway (publik, verifikasi signature, idempoten, tanpa sesi)
app/api/cron/notifikasi/route.ts                   -> POST/GET /api/cron/notifikasi (dilindungi CRON_SECRET, retry outbox notifikasi)
app/api/admin/transaksi/export/route.ts            -> GET /api/admin/transaksi/export (unduh Excel/PDF rekap penjualan)
app/api/admin/log/export/route.ts                  -> GET /api/admin/log/export (unduh Excel/PDF log aktivitas)
```

---

## 6. Alur Proses Utama (To-Be)

### 6.1 Login (semua peran)
Buka halaman login → input `username` & `password` → Server Action memetakan `username` ke `<username>@kurnia.local` dan memvalidasi lewat Supabase Auth serta memeriksa status di tabel `pengguna` → valid: masuk Dashboard sesuai peran (atau diarahkan ke halaman ganti password bila `wajib_ganti_password = true`); tidak valid: kembali ke halaman login dengan pesan error umum. Akun `nonaktif` tidak bisa login. Logout mengakhiri sesi Supabase Auth dan **mencatat log aktivitas**.

### 6.2 Transaksi Penjualan (Kasir) — alur terpenting

1. Kasir menerima pesanan pelanggan, lalu **mencari produk**: scan barcode **atau** cari nama.
2. Sistem menampilkan data produk & **memeriksa stok real-time**.
   - Stok tidak tersedia → kasir menawarkan **produk alternatif**; bila pelanggan setuju, cari produk lain.
3. Kasir menambahkan barang ke keranjang & mengisi jumlah. Sistem menghitung subtotal otomatis dan memvalidasi harga & stok. Ulangi bila ada barang lain.
4. Kasir memilih **pelanggan** (proyek/perorangan) dan **jenis pembayaran**.
5. Percabangan pembayaran:
   - **Tunai:** kasir menerima uang dan menginput nominal.
   - **Kasbon:** sistem cek `batas_kasbon` & sisa piutang pelanggan → kirim **permintaan persetujuan** ke pemilik (email/WhatsApp) → pemilik memutuskan di menu Kasbon & Piutang.
     - Ditolak → kasir menginformasikan ke pelanggan dan **memilih metode lain**.
     - Disetujui → lanjut simpan/finalisasi transaksi.
   - **QRIS / Virtual Account:** sistem meminta kode ke Payment Gateway → kasir menunjukkan kode → pelanggan membayar → gateway mengirim **webhook** ke `/api/webhook/gateway` → sistem menandai berhasil.
6. Sistem **menyimpan/memfinalisasi transaksi** dalam transaksi database dengan penguncian baris (`SELECT ... FOR UPDATE`), memperbarui `status_bayar`, membuat struk.
7. Sistem **mengurangi stok otomatis** dan mencatat **barang keluar** (mutasi).
8. Bila stok ≤ `stok_minimum` → kirim **notifikasi stok hampir habis** (email/WhatsApp) melalui outbox `notifikasi`.
9. Kasir **mencetak struk** (printer thermal) dan menyerahkan barang.
10. Bila `perlu_dikirim` = true → sistem **membuat/menyiapkan penugasan pengiriman** & notifikasi ke pengirim.
11. Semua langkah penting **dicatat di log aktivitas**.

### 6.3 Pengiriman (Pengirim)
Lihat daftar penugasan (filter tanggal, status) → lihat detail (nomor nota, pemesan, alamat, daftar barang) → pilih penugasan untuk diproses → **cek kelengkapan barang**:
- Tidak lengkap → laporkan; sistem simpan laporan & notifikasi ke Kasir.
- Lengkap → muat ke kendaraan → status **Dalam Perjalanan** (`dikirim`) → antar ke lokasi → pelanggan periksa barang:
  - Tidak sesuai → catat alasan retur → status **Retur** (`retur`) + notifikasi ke Kasir.
  - Sesuai → minta tanda terima & **unggah foto bukti** ke bucket privat Supabase Storage → sistem validasi → status **Terkirim** (`terkirim`) + notifikasi Kasir & Pemilik.

Terpisah dari alur di atas, pengirim dapat mengisi **Laporan Kendala** (jenis & deskripsi) → notifikasi ke Kasir & Pemilik.

---

## 7. Model Data (dari Class Diagram)

### 7.1 Tabel & Kolom

Semua PK `uuid` (kecuali `pengaturan_sistem.id_pengaturan` yang bertipe `integer`). Waktu = `timestamptz`. Jumlah/uang = `numeric(15,2)`. Gunakan nama tabel dan kolom persis seperti di bawah ini.

> **Catatan jumlah tabel (D9):** Bagian 7.1 memuat **15 tabel** aplikasi di schema `public` sesuai Class Diagram, ditambah **1 tabel sistem `auth.users`** di schema `auth` milik Supabase Auth yang berelasi 1:1 dengan `pengguna` (total 16 entitas tabel dalam arsitektur database).

- **`pengguna`** — `id_pengguna` PK (`uuid`, sama persis dengan `auth.users.id`) · `nama` varchar(50) · `username` varchar(20) **unique** · *(kolom `password` dari Class Diagram **dihapus** sesuai **D5/S6** karena dikelola di `auth.users` Supabase Auth)* · `role` varchar(10) · `status` varchar(10) · `created_at` *(+ kolom penyesuaian S1, S3, S4 di Bagian 7.3)*
- **`log_aktivitas`** — `id_log` PK · `pengguna_id` FK→pengguna · `modul` varchar(30) · `aktivitas` varchar(50) · `data_sebelum` text · `data_sesudah` text · `waktu`
- **`notifikasi`** — `id_notifikasi` PK · `jenis` varchar(30) · `penerima` varchar(100) · `saluran` varchar(10) · `pesan` text · `status_kirim` varchar(10) · `waktu` *(+ kolom penyesuaian S7 untuk retry outbox)*
- **`pengaturan_sistem`** — `id_pengaturan` **integer** PK (hanya 1 baris, nilai `1`) · `saluran_notifikasi` varchar(10) · `penerima_notifikasi` varchar(100) · `penyedia_gateway` varchar(10) · `kunci_api` text (**dienkripsi AES-256-GCM**) · `updated_at`
- **`barang`** — `id_barang` PK · `kode_barang` varchar(20) unique · `nama` varchar(100) · `merk` varchar(50) *(S8 — dari Excel)* · `kategori` varchar(30) · `barcode` varchar(30) unique · `harga_beli` numeric(15,2) *(Harga Modal, S8 — dari Excel)* · `harga` numeric(15,2) *(Harga Jual)* · `stok_awal` numeric(15,2) *(S8 — dari Excel)* · `stok` numeric(15,2) · `stok_minimum` numeric(15,2) · `satuan` varchar(15) · `keterangan` text *(S8 — dari Excel)* · `created_at` *(+ S2, S3)*
- **`pelanggan`** — `id_pelanggan` PK · `nama` varchar(50) · `jenis` varchar(10) · `kontak` varchar(20) · `alamat` text · `batas_kasbon` numeric(15,2) · `status_kasbon` varchar(10) · `created_at` *(+ S2, S3)*
- **`transaksi`** — `id_transaksi` PK · `no_nota` varchar(20) unique · `pengguna_id` FK (kasir) · `pelanggan_id` FK · `jenis_pembayaran` varchar(10) · `total` numeric(15,2) · `jumlah_dibayar` numeric(15,2) · `sisa_tagihan` numeric(15,2) · `status_bayar` varchar(10) · `perlu_dikirim` boolean · `tanggal` *(+ S3)*
- **`detail_transaksi`** — `id_detail_transaksi` PK · `transaksi_id` FK · `barang_id` FK · `jumlah` numeric(15,2) · `harga_modal` numeric(15,2) *(S9)* · `harga_asli` numeric(15,2) *(S9)* · `harga_nego` numeric(15,2) nullable *(S9 — wajib `>= harga_modal`)* · `harga_satuan` numeric(15,2) · `subtotal` numeric(15,2)
- **`pembayaran`** — `id_pembayaran` PK · `transaksi_id` FK · `metode` varchar(10) · `nominal` numeric(15,2) · `bukti_transfer_url` text *(menyimpan path objek di bucket privat Supabase Storage — **D15/S7**)* · `referensi_gateway` varchar(50) · `status` varchar(10) · `tanggal`
- **`kasbon`** — `id_kasbon` PK · `pelanggan_id` FK · `transaksi_id` FK · `jumlah_kasbon` numeric(15,2) · `status` varchar(10) · `alasan_penolakan` text · `tanggal_pengajuan` · `tanggal_keputusan` *(+ S3)*
- **`mutasi_barang`** — `id_mutasi` PK · `pengguna_id` FK · `jenis` varchar(10) · `supplier` varchar(50) *(**teks bebas**, tanpa tabel master supplier — **D2**)* · `no_referensi` varchar(30) · `tujuan` varchar(50) · `alasan` text · `tanggal`
- **`detail_mutasi_barang`** — `id_detail_mutasi` PK · `mutasi_id` FK · `barang_id` FK · `jumlah` numeric(15,2) · `stok_sebelum` numeric(15,2) · `stok_sesudah` numeric(15,2) · `harga_satuan` numeric(15,2) *(Harga Beli/Jual saat mutasi, S8 — dari Excel)* · `total_harga` numeric(15,2) *(S8 — dari Excel)* · `keterangan` text *(S8 — dari Excel)*
- **`rencana_restok`** — `id_restok` PK · `barang_id` FK · `jumlah_restok` numeric(15,2) · `status` varchar(10) · `tanggal` *(rencana internal tanpa relasi ke supplier — **D2**, + S3)*
- **`pengiriman`** — `id_pengiriman` PK · `transaksi_id` FK · `pengirim_id` FK→pengguna · `alamat_tujuan` text · `status` varchar(15) · `foto_bukti_url` text *(menyimpan path objek di bucket privat Supabase Storage — **D15/S7**)* · `alasan_retur` text · `tanggal_penugasan` · `tanggal_terima` *(+ S3)*
- **`laporan_kendala`** — `id_laporan` PK · `pengiriman_id` FK · `jenis_kendala` varchar(30) · `deskripsi` text · `created_at`

### 7.2 Relasi & Kardinalitas

| Relasi | Kardinalitas | Catatan |
|--------|--------------|---------|
| pengguna → log_aktivitas | 1 : 0..* | |
| pengguna → mutasi_barang | 1 : 0..* | pencatat |
| pengguna → pengiriman | 1 : 0..* | sebagai `pengirim_id` |
| pengguna → transaksi | 1 : 0..* | sebagai kasir |
| transaksi → pengiriman | 1 : 0..1 | satu transaksi maksimal satu pengiriman (`transaksi_id` unique di `pengiriman`) |
| pengiriman → laporan_kendala | 1 : 0..* | |
| transaksi → detail_transaksi | 1 : 1..* | komposisi (hapus induk = hapus detail) |
| barang → detail_transaksi | 1 : 0..* | |
| mutasi_barang → detail_mutasi_barang | 1 : 1..* | komposisi |
| barang → detail_mutasi_barang | 1 : 0..* | |
| barang → rencana_restok | 1 : 0..* | |
| pelanggan → transaksi | 1 : 0..* | |
| pelanggan → kasbon | 1 : 0..* | |
| transaksi → kasbon | 1 : 0..1 | `transaksi_id` unique di `kasbon` |
| transaksi → pembayaran | 1 : 0..* | satu transaksi bisa dibayar bertahap (piutang) |

### 7.3 Nilai Enum & Penyesuaian Skema

> **Keputusan Teknis Enum Prisma (D9 — Ditetapkan):**
> Nilai-nilai status/jenis di bawah ini didefinisikan menggunakan **native `enum` Prisma** (dipetakan dengan `@@map` ke tipe enum PostgreSQL seperti pada Lampiran A) agar menghasilkan *type-safety* penuh di Prisma Client dan TypeScript, dengan seluruh nilai anggota dijaga tetap di bawah batas panjang karakter `varchar(n)` pada Class Diagram.

| Kolom | Nama Enum Prisma | Nilai |
|-------|------------------|-------|
| `pengguna.role` | `RolePengguna` | `admin`, `kasir`, `pengirim` |
| `pengguna.status` | `StatusPengguna` | `aktif`, `nonaktif` |
| `pelanggan.jenis` | `JenisPelanggan` | `proyek`, `perorangan` |
| `pelanggan.status_kasbon` | `StatusKasbonPelanggan` | `nonaktif`, `aktif` |
| `transaksi.jenis_pembayaran` | `JenisPembayaran` | `tunai`, `kasbon`, `qris`, `va` |
| `transaksi.status_bayar` | `StatusBayarTransaksi` | `pending`, `lunas`, `piutang`, `batal` |
| `pembayaran.metode` | `MetodePembayaran` | `tunai`, `transfer`, `qris`, `va` |
| `pembayaran.status` | `StatusPembayaran` | `pending`, `berhasil`, `gagal` |
| `kasbon.status` | `StatusKasbon` | `menunggu`, `disetujui`, `ditolak` |
| `mutasi_barang.jenis` | `JenisMutasi` | `masuk`, `keluar` |
| `rencana_restok.status` | `StatusRestok` | `rencana`, `dipesan`, `diterima` |
| `pengiriman.status` | `StatusPengiriman` | `ditugaskan`, `dikirim` (= "Dalam Perjalanan"), `terkirim`, `retur` |
| `notifikasi.saluran` | `SaluranNotifikasi` | `email`, `whatsapp` |
| `notifikasi.status_kirim` | `StatusKirimNotifikasi` | `antri`, `terkirim`, `gagal` |
| `pengaturan_sistem.penyedia_gateway` | `PenyediaGateway` | `midtrans`, `xendit` |
| `laporan_kendala.jenis_kendala` | `JenisKendala` | `kendaraan_rusak`, `jalan_tidak_bisa_dilalui`, `alamat_tidak_ditemukan`, `pelanggan_tidak_di_lokasi`, `cuaca`, `lainnya` |

> Catatan: `pengiriman.status` dibatasi 15 karakter di Class Diagram, sehingga status "Dalam Perjalanan" disimpan sebagai `dikirim` di database dan ditampilkan sebagai **"Dalam Perjalanan"** di UI.

**Penyesuaian skema di luar Class Diagram (ditandai `-- PRD 7.3` di migrasi):**

| # | Penyesuaian | Alasan |
|---|-------------|--------|
| S1 | Tambah `pengguna.email` (`varchar(100)`, nullable) dan `pengguna.no_whatsapp` (`varchar(20)`, nullable) | Notifikasi ke Kasir/Pengirim membutuhkan alamat tujuan per pengguna; email login internal di Supabase Auth memakai email sintetis `<username>@kurnia.local` (D4) |
| S2 | Tambah `deleted_at` (`timestamptz`, nullable, soft delete) pada `barang` dan `pelanggan` | Barang/pelanggan yang sudah dipakai di transaksi tidak boleh hilang dari riwayat nota |
| S3 | Tambah `updated_at` (`timestamptz`) pada tabel yang sering berubah (`pengguna`, `barang`, `pelanggan`, `transaksi`, `kasbon`, `rencana_restok`, `pengiriman`) | Jejak waktu pembaruan baris untuk audit sederhana |
| S4 | Tambah `pengguna.wajib_ganti_password` (`boolean`, default `false`) | Password sementara hasil fitur Reset Password harus diganti pengguna saat login pertama |
| S5 | Seed satu pelanggan `Pelanggan Umum` (`jenis = 'perorangan'`, `status_kasbon = 'nonaktif'`) | `transaksi.pelanggan_id` wajib FK, sedangkan pembeli eceran tunai sering tidak mendaftarkan data diri |
| S6 | **Penyimpangan Terdokumentasi D5:** Hapus kolom `password` dari tabel `pengguna`; tetapkan `pengguna.id_pengguna` sama persis dengan `auth.users.id` (UUID dari Supabase Auth) | Autentikasi dan hashing password dikelola sepenuhnya oleh Supabase Auth; mencegah duplikasi kredensial di schema `public` |
| S7 | **Penyimpanan Path Storage (D15) & Outbox Retry (D16):** `pembayaran.bukti_transfer_url` dan `pengiriman.foto_bukti_url` menyimpan path objek di bucket privat Supabase Storage (bukan URL publik); tambah `notifikasi.jumlah_percobaan` (`integer`, default `0`, `⚠ Asumsi`) | File bukti hanya boleh diakses lewat *signed URL* berumur pendek dari server; kolom `jumlah_percobaan` membatasi retry cron notifikasi maksimal 3 kali |
| S8 | **Penyesuaian File Excel Katalog & Laporan Stok CV Kurnia Mandiri:** Tambah `merk` (`varchar(50)`, default `'-'`), `harga_beli` (`numeric(15,2)`, Harga Modal), `stok_awal` (`numeric(15,2)`), dan `keterangan` (`text`, nullable) pada tabel `barang`; serta `harga_satuan` (`numeric(15,2)`), `total_harga` (`numeric(15,2)`), dan `keterangan` (`text`) pada `detail_mutasi_barang` | Menyelaraskan database dengan struktur file Excel asli toko (*Daftar Harga Barang Periode November 2026* & *Laporan Stok Barang Masuk/Keluar* di mana `Harga Jual = Harga Modal × 1,3` dan `Nilai Stok = Stok Akhir × Harga Beli`) |
| S9 | **Fitur Harga Nego / Tawar di POS Kasir:** Tambah `harga_modal` (`numeric(15,2)`), `harga_asli` (`numeric(15,2)`), dan `harga_nego` (`numeric(15,2)`, nullable) beserta constraint `CHECK (harga_nego IS NULL OR harga_nego >= harga_modal)` pada `detail_transaksi` | Mengakomodasi transaksi tawar-menawar di toko bangunan dengan proteksi agar harga nego tidak boleh di bawah harga modal |
| S10 | **Sinkronisasi Penuh Class Diagram `CV kurnia mandiri (1)` & Bukti Foto Pengiriman:** Tabel `laporan_kendala` (`id`, `pengiriman_id` FK, `jenis_kendala`, `deskripsi`, `created_at`), relasi FK `pengiriman.transaksi_id` & `pengiriman.pengirim_id`, atribut `pengaturan_sistem` (`saluran_notifikasi`, `penerima_notifikasi`, `penyedia_gateway`, `kunci_api`, `updated_at`), `rencana_restok` (`jumlah_restok`, `status`), `barang.stok_minimum`, serta metadata kamera/upload bukti serah terima (`nama_penerima_aktual`, `foto_bukti_nama`, `foto_bukti_mime`) | Memastikan kesesuaian 100% antara Class Diagram terbaru (`CV kurnia mandiri (1)`), skema database PostgreSQL Supabase, Prisma ORM, dan antarmuka aplikasi |

---

## 8. Kebutuhan Fungsional

Format: **ID — Peran — Kebutuhan.** Kata "sistem **harus**" = wajib. Setiap aksi yang mengubah data **wajib** memanggil `LogAktivitasService` (modul, aktivitas, data sebelum & sesudah dalam JSON) dan memeriksa hak akses melalui `requireRole([...])` di sisi server.

### 8.1 AUTH — Autentikasi & Akun

- **AUTH-01** — Semua — Login dengan `username` & `password` melalui Server Action. Server mengubah `username` menjadi email sintetis `<username>@kurnia.local` (D4) dan memverifikasi kredensial ke Supabase Auth. Sesi disimpan dalam HTTP-only cookie yang dikelola `@supabase/ssr`. Gagal login → tampilkan pesan error umum tanpa membocorkan apakah `username` atau `password` yang salah.
- **AUTH-02** — Semua — Akun dengan `pengguna.status = 'nonaktif'` (atau berstatus *banned* di Supabase Auth) wajib ditolak saat login maupun saat mengakses halaman terproteksi.
- **AUTH-03** — Semua — Logout melalui Server Action mengakhiri sesi Supabase Auth (`auth.signOut()`) dan mencatat baris di `log_aktivitas`.
- **AUTH-04** — Semua — Setelah login berhasil, arahkan pengguna ke halaman Dashboard sesuai perannya (`/admin/dashboard`, `/kasir/dashboard`, atau `/pengirim/dashboard`).
- **AUTH-05** — Semua — Batasi percobaan login menggunakan *rate limit* bawaan Supabase Auth ditambah pembatasan di Server Action login (maks. 5 percobaan gagal per menit per `username` + alamat IP, D8).
- **AUTH-06** — Semua — Bila `pengguna.wajib_ganti_password = true`, paksa pengguna mengganti password terlebih dahulu di `/ganti-password` (memperbarui password di Supabase Auth dan mengubah flag menjadi `false`) sebelum dapat mengakses menu lain (S4).

### 8.2 DASH — Dashboard

- **DASH-01** — admin — Ringkasan penjualan (hari ini / bulan ini), daftar barang dengan stok hampir habis, dan total piutang berjalan.
- **DASH-02** — kasir — Ringkasan transaksi hari ini milik kasir yang sedang login & daftar barang dengan stok hampir habis.
- **DASH-03** — pengirim — Daftar penugasan pengiriman hari ini milik pengirim yang sedang login.

### 8.3 BRG — Data Barang (admin)

- **BRG-01** — Daftar barang menampilkan kode, nama, kategori, harga, stok, satuan, stok minimum; tersedia pencarian & filter kategori; barang dengan `stok <= stok_minimum` diberi penanda visual.
- **BRG-02** — Tambah barang: `kode_barang`, `nama`, `kategori`, `harga`, `stok_minimum` (+ `satuan`). Validasi dengan Zod di server: wajib diisi, `kode_barang` unik, `harga >= 0`. Gagal validasi → form menampilkan pesan kesalahan. Sukses → simpan via Prisma, **buat nilai `barcode` unik otomatis**, catat log.
- **BRG-03** — Ubah barang: tampilkan data lama, validasi Zod di server, simpan perubahan, catat log (data sebelum & sesudah).
- **BRG-04** — Hapus barang: wajib dialog konfirmasi; lakukan *soft delete* (`deleted_at = now()`, S2); catat log. Barang yang sudah pernah dipakai di transaksi tidak hilang dari riwayat nota.
- **BRG-05** — Cetak label barcode: render barcode Code 128 (`bwip-js` / `jsbarcode`) dan halaman label siap cetak (ukuran label dapat diatur sederhana); catat log.
- **BRG-06** — `stok` **tidak boleh diubah langsung lewat form barang**; stok hanya berubah lewat mutasi (transaksi penjualan / barang masuk / barang keluar). Stok awal diisi melalui menu Barang Masuk.

### 8.3a Stok Barang — Aturan Umum

- **STK-01** — Stok tidak boleh negatif (`stok >= 0`); jumlah desimal diperbolehkan (`numeric(15,2)`, mis. pasir dalam satuan m³). Operasi pembacaan dan pengurangan/penambahan stok wajib memakai `prisma.$transaction` + `$queryRaw` `SELECT ... FOR UPDATE` pada baris `barang` (D11).
- **STK-02** — Setiap perubahan stok wajib membuat baris `detail_mutasi_barang` dengan mencatat `stok_sebelum` dan `stok_sesudah` secara akurat.
- **STK-03** — Setelah stok berubah, bila `stok <= stok_minimum` → buat entri outbox di `notifikasi` untuk "stok hampir habis" (hindari spam: maksimal 1 notifikasi per barang per hari `⚠ Asumsi`).

### 8.4 PLG — Data Pelanggan (admin & kasir)

- **PLG-01** — Daftar & pencarian pelanggan (`proyek` / `perorangan`) yang belum dihapus (`deleted_at IS NULL`).
- **PLG-02** — Tambah pelanggan: `nama`, `jenis`, `kontak`, `alamat`; validasi Zod; simpan; catat log. (admin & kasir)
- **PLG-03** — Ubah pelanggan; validasi Zod; simpan; catat log. (admin & kasir)
- **PLG-04** — Hapus pelanggan dengan dialog konfirmasi; *soft delete* (`deleted_at`); catat log. (**admin saja**, dicek dengan `requireRole(['admin'])`).
- **PLG-05** — Lihat **riwayat transaksi & piutang** per pelanggan (daftar nota, total, sisa tagihan, status). Aksi membuka riwayat ini dicatat di `log_aktivitas`.
- **PLG-06** — `batas_kasbon` & `status_kasbon` hanya dapat diubah oleh `admin` (melalui menu Kasbon & Piutang atau form pelanggan khusus admin).

### 8.5 TRX — Transaksi Penjualan (kasir)

- **TRX-01** — Cari produk lewat scan barcode (input fokus otomatis, tombol Enter langsung menambahkan 1 item) **atau** pencarian nama produk (autocomplete).
- **TRX-02** — Tampilkan stok real-time. Bila stok kurang/habis → tampilkan peringatan dan saran produk alternatif (kategori sama dengan stok tersedia).
- **TRX-03** — Keranjang belanja: tambah/ubah jumlah/hapus item; subtotal & total dihitung otomatis; harga satuan selalu diambil dari `barang.harga` di server saat penyimpanan (kasir **tidak** mengubah harga dan tidak ada fitur diskon `⚠ Asumsi`).
- **TRX-04** — Pilih pelanggan (default `Pelanggan Umum`) dan `jenis_pembayaran` (`tunai`, `kasbon`, `qris`, `va`).
- **TRX-05** — **Tunai:** kasir menginput nominal uang diterima; sistem menghitung kembalian; bila `jumlah_dibayar >= total` → `status_bayar = 'lunas'` dan langsung masuk ke proses finalisasi. (`⚠ Asumsi`: pembayaran metode tunai wajib lunas; bila bayar sebagian/cicilan harus menggunakan alur Kasbon.)
- **TRX-06** — **Kasbon:** hanya dapat diajukan untuk pelanggan terdaftar (bukan `Pelanggan Umum`) bila `pelanggan.status_kasbon = 'aktif'` atau pemilik menyetujui pengajuan baru. Sistem memeriksa `batas_kasbon` dan sisa piutang berjalan (lihat Bagian 8.7). Buat baris `kasbon` berstatus `menunggu`, kirim notifikasi permintaan persetujuan ke pemilik, dan simpan transaksi berstatus `pending` (stok **belum** dikurangi sampai disetujui).
- **TRX-07** — **QRIS / VA:** panggil adapter Payment Gateway aktif untuk membuat kode QRIS/nomor VA → tampilkan di layar kasir → transaksi berstatus `pending` dan `pembayaran` berstatus `pending` → saat Route Handler webhook (`/api/webhook/gateway`) menerima konfirmasi sukses yang valid, ubah `pembayaran.status = 'berhasil'`, `transaksi.status_bayar = 'lunas'`, dan jalankan finalisasi transaksi. Bila kode kedaluwarsa → status transaksi `batal`.
- **TRX-08** — **Finalisasi transaksi** (dijalankan saat tunai terbayar / kasbon disetujui admin / webhook QRIS-VA sukses), wajib dieksekusi di dalam satu `prisma.$transaction` dengan mengunci baris barang menggunakan `$queryRaw` `SELECT ... FOR UPDATE` (D11): validasi ulang kecukupan stok tiap item → simpan/perbarui `transaksi` & `detail_transaksi` → buat/perbarui `pembayaran` (bila ada) → kurangi `barang.stok` & buat `mutasi_barang` berjenis `keluar` beserta `detail_mutasi_barang` (`stok_sebelum`, `stok_sesudah`) → pastikan nomor nota unik → catat `log_aktivitas`.
- **TRX-09** — Format nomor nota: `KM-YYYYMMDD-NNNN` (urut harian, unik) `⚠ Asumsi`.
- **TRX-10** — Struk (printer thermal): menampilkan nama toko, `no_nota`, tanggal & waktu, nama kasir, nama pelanggan, daftar item (nama, jumlah, harga satuan, subtotal), total, jumlah dibayar, kembalian/sisa tagihan, dan metode pembayaran. Tersedia tombol cetak (`window.print()` dengan CSS `@media print`) dan cetak ulang.
- **TRX-11** — Opsi **"Barang perlu dikirim?"**: bila dicentang → set `perlu_dikirim = true` sehingga transaksi muncul di daftar Penugasan Pengiriman kasir.
- **TRX-12** — Setelah finalisasi transaksi selesai, periksa batas stok minimum tiap barang yang terjual dan jadwalkan notifikasi bila memenuhi syarat (STK-03).

### 8.6 MUT — Barang Masuk & Keluar (kasir)

- **MUT-01** — Tampilkan daftar barang & jumlah stok terkini.
- **MUT-02** — Pilih jenis mutasi:
  - **Masuk:** isi `supplier` (**input teks bebas** `varchar(50)` untuk nama pemasok/toko asal tanpa relasi ke tabel master supplier atau PO sesuai **D2**) dan `no_referensi` (nomor surat jalan/faktur pemasok).
  - **Keluar:** isi `tujuan` dan `alasan` (mis. barang rusak, pemakaian internal).
- **MUT-03** — Pindai barcode atau cari barang & isi jumlah; dukung penambahan banyak barang sekaligus dalam satu dokumen mutasi (multi-baris).
- **MUT-04** — Validasi di server: barang valid & `jumlah > 0`; untuk mutasi keluar, `jumlah` tidak boleh melebihi `barang.stok` saat ini. Eksekusi di dalam `prisma.$transaction` dengan `SELECT ... FOR UPDATE` pada baris `barang` (D11): perbarui `barang.stok`, simpan `mutasi_barang` dan `detail_mutasi_barang` (`stok_sebelum`, `stok_sesudah`), cek batas stok minimum (STK-03), dan catat `log_aktivitas`.

### 8.7 KSB — Kasbon & Piutang (admin menyetujui; kasir mengajukan)

> **Penegasan Cakupan (D3):** Modul ini mengelola **kasbon dan piutang pelanggan kepada toko**. Pencatatan utang usaha toko kepada supplier tidak termasuk dalam sistem.

- **KSB-01** — Admin melihat daftar permintaan persetujuan kasbon & daftar piutang pelanggan berjalan (dengan filter status).
- **KSB-02** — Halaman detail kasbon menampilkan `batas_kasbon` pelanggan, total sisa piutang berjalan, rincian barang pada transaksi yang diajukan, dan riwayat pembayaran piutang pelanggan tersebut.
- **KSB-03** — **Setujui:** ubah `kasbon.status = 'disetujui'`, isi `tanggal_keputusan = now()`, aktifkan status kasbon pelanggan (`pelanggan.status_kasbon = 'aktif'` `⚠ Asumsi`), dan jalankan finalisasi transaksi (TRX-08, termasuk pengurangan stok dengan row lock D11) dengan `status_bayar = 'piutang'`, `jumlah_dibayar = 0`, dan `sisa_tagihan = total`; catat `log_aktivitas`.
- **KSB-04** — **Tolak:** wajib mengisi `alasan_penolakan`; ubah `kasbon.status = 'ditolak'`, isi `tanggal_keputusan = now()`; ubah status transaksi menjadi `batal` (atau kembalikan ke kasir untuk memilih metode pembayaran lain); catat `log_aktivitas`.
- **KSB-05** — Setelah keputusan disimpan, buat notifikasi hasil keputusan ke Kasir melalui outbox `notifikasi` (email/WhatsApp), lalu arahkan admin kembali ke daftar kasbon untuk memproses permintaan berikutnya.
- **KSB-06** — Aturan batas kasbon: `total sisa piutang pelanggan + total transaksi baru <= pelanggan.batas_kasbon`. Bila melampaui batas tersebut, sistem menampilkan peringatan jelas kepada kasir saat pengajuan dan kepada admin saat pengambilan keputusan (admin tetap berwenang menyetujui sebagai diskresi pemilik). `⚠ Asumsi`.

### 8.8 BYR — Pembayaran & Piutang (kasir)

- **BYR-01** — Cari & pilih pelanggan → tampilkan daftar transaksi berstatus `piutang`, rincian `sisa_tagihan`, dan riwayat pembayaran sebelumnya.
- **BYR-02** — Pilih transaksi piutang → input pembayaran cicilan/pelunasan: metode **tunai** (terima uang) atau **transfer** (kasir memeriksa bukti transfer dan dapat mengunggah foto bukti transfer ke bucket privat Supabase Storage; kolom `bukti_transfer_url` menyimpan path objek sesuai **D15**).
- **BYR-03** — Validasi nominal pembayaran di server: wajib `nominal > 0` dan `nominal <= sisa_tagihan`. Bila tidak valid → tolak dan tampilkan pesan kesalahan.
- **BYR-04** — Sukses (dalam `prisma.$transaction` dengan penguncian baris `transaksi`): buat baris `pembayaran` berstatus `berhasil`, perbarui `transaksi.jumlah_dibayar` dan `transaksi.sisa_tagihan`; bila `sisa_tagihan == 0` → ubah `transaksi.status_bayar = 'lunas'`, selain itu tetap `piutang`; catat `log_aktivitas`.
- **BYR-05** — Sediakan tampilan & tombol cetak **struk pembayaran piutang** (format printer thermal).

### 8.9 RTR — Riwayat Transaksi & Rekap Penjualan

- **RTR-01** (kasir) — Filter berdasarkan periode tanggal, pelanggan, dan `status_bayar`; lihat daftar riwayat transaksi; **cetak ulang struk** thermal.
- **RTR-02** (admin) — Filter yang sama; tampilkan **rekap penjualan harian**, ringkasan piutang, dan daftar nota pelanggan.
- **RTR-03** (admin) — Lihat dan cetak **nota pelanggan** (halaman cetak nota; aksi cetak dicatat di `log_aktivitas`).
- **RTR-04** (admin) — Unduh rekap penjualan dalam format **Excel (`.xlsx` via `exceljs`)** atau **PDF (via `@react-pdf/renderer` / `pdf-lib`)** melalui Route Handler sesuai filter yang sedang aktif; catat pengunduhan di `log_aktivitas`.
- **RTR-05** — Pencetakan ulang struk/nota harus menampilkan penanda **"SALINAN"** agar tidak disalahgunakan `⚠ Asumsi`.

### 8.10 STR — Stok & Restok (admin)

- **STR-01** — Tampilkan daftar barang yang hampir habis (`stok <= stok_minimum`) beserta daftar stok seluruh barang terkini.
- **STR-02** — Atur nilai `stok_minimum` per barang; validasi (`stok_minimum >= 0`); simpan & catat `log_aktivitas`.
- **STR-03** — Rencanakan restok: pilih barang & isi `jumlah_restok` (`> 0`); simpan ke tabel `rencana_restok` dengan `status = 'rencana'`. Sesuai **D2**, rencana restok adalah pencatatan internal toko **tanpa** pemilihan supplier dan **tanpa** pembuatan dokumen Purchase Order (PO). Kirim notifikasi rencana restok (lihat 8.15) dan catat `log_aktivitas`.
- **STR-04** — Ubah status rencana restok secara bertahap (`rencana` → `dipesan` → `diterima`). Perubahan status menjadi `diterima` **tidak** otomatis menambah `barang.stok`; penambahan stok fisik tetap dilakukan oleh kasir melalui modul Barang Masuk (MUT) saat barang benar-benar tiba di toko. `⚠ Asumsi`.

### 8.11 KRM — Penugasan & Proses Pengiriman

**Kasir — Penugasan (`KRM-A`)**
- **KRM-A1** — Tampilkan daftar transaksi yang memiliki `perlu_dikirim = true` dan sudah terfinalisasi (`lunas` atau `piutang`), namun belum memiliki baris `pengiriman`.
- **KRM-A2** — Pilih transaksi → pilih **pengirim** (daftar pengguna berstatus `aktif` dengan `role = 'pengirim'`) & isi `alamat_tujuan` (default terisi dari `pelanggan.alamat`, dapat disesuaikan).
- **KRM-A3** — Validasi input → simpan baris `pengiriman` berstatus `ditugaskan`, jadwalkan notifikasi ke pengirim yang ditugaskan, dan catat `log_aktivitas`.

**Pengirim (`KRM-B`)**
- **KRM-B1** — Tampilkan daftar penugasan milik pengirim yang sedang login (`pengirim_id = currentUser.id_pengguna`); filter tanggal & status; halaman detail menampilkan nomor nota, nama pemesan, alamat tujuan, dan daftar barang yang harus diantar.
- **KRM-B2** — Proses tahap 1: **pemeriksaan kelengkapan barang**. Bila barang tidak lengkap → isi form laporan ketidaklengkapan → simpan laporan & kirim notifikasi ke Kasir, status pengiriman tetap `ditugaskan`.
- **KRM-B3** — Bila barang lengkap → konfirmasi barang dimuat ke kendaraan → ubah `pengiriman.status = 'dikirim'` (ditampilkan sebagai **"Dalam Perjalanan"**); catat `log_aktivitas`.
- **KRM-B4** — Proses tahap 2 di lokasi pelanggan: **apakah barang sesuai?**
  - **Tidak sesuai:** wajib mengisi `alasan_retur` → ubah `pengiriman.status = 'retur'` + kirim notifikasi ke Kasir + catat `log_aktivitas`.
  - **Sesuai:** wajib mengunggah **foto bukti penerimaan**. Sesuai **D15**, file diunggah melalui server ke bucket **Supabase Storage privat** setelah validasi tipe MIME (`image/jpeg`, `image/png`, `image/webp`) dan ukuran maksimal 5 MB dengan nama objek acak (UUID). Kolom `foto_bukti_url` menyimpan path objek di bucket; ubah `pengiriman.status = 'terkirim'`, isi `tanggal_terima = now()`, kirim notifikasi ke Kasir & Pemilik, dan catat `log_aktivitas`.
- **KRM-B5** — **Laporan kendala**: pengirim memilih penugasan miliknya, memilih `jenis_kendala` & mengisi `deskripsi` → simpan ke `laporan_kendala`, kirim notifikasi ke Kasir & Pemilik, catat `log_aktivitas`.
- **KRM-B6** — Riwayat pengiriman milik sendiri: filter periode & status; lihat detail pengiriman beserta foto bukti penerimaan (ditampilkan lewat *signed URL* berumur pendek dari server).

**Admin (`KRM-C`)**
- **KRM-C1** — Monitoring pengiriman: filter berdasarkan periode, pengirim, dan status; lihat daftar & status seluruh pengiriman toko.
- **KRM-C2** — Lihat detail pengiriman + **foto bukti penerimaan** (diambil menggunakan *signed URL* berumur pendek yang dibuat server setelah memverifikasi peran `admin`, D15); catat akses di `log_aktivitas`.

### 8.12 LOG — Log Aktivitas (admin)

- **LOG-01** — Tampilkan riwayat aktivitas (siapa, kapan, modul apa, aktivitas apa) untuk seluruh peran (Kasir, Pengirim, Admin); sediakan filter berdasarkan pengguna, peran, rentang tanggal, dan modul/jenis aktivitas.
- **LOG-02** — Halaman detail aktivitas menampilkan perbandingan **data sebelum & data sesudah** (JSON terformat rapi).
- **LOG-03** — Unduh laporan log aktivitas dalam format Excel/PDF sesuai filter aktif; aksi pengunduhan ini juga dicatat di `log_aktivitas`.
- **LOG-04** — Log bersifat **append-only**: tidak ada fitur ubah atau hapus log di dalam aplikasi. Sistem dilarang keras menyimpan password, token sesi, atau nilai asli `kunci_api` di dalam `data_sebelum` maupun `data_sesudah` (wajib di-mask/dihilangkan sebelum disimpan).

### 8.13 USR — Pengguna & Hak Akses (admin)

- **USR-01** — Tampilkan daftar seluruh akun pengguna beserta `username`, peran (`role`), kontak (`email`, `no_whatsapp`), dan `status`.
- **USR-02** — Tambah akun baru (D4, D5, D7): input `nama`, `username` (unik, huruf kecil/angka), password awal, peran (`admin` / `kasir` / `pengirim`), serta opsional `email` notifikasi dan `no_whatsapp`. Server memvalidasi input, memanggil **Supabase Admin API** (`supabaseAdmin.auth.admin.createUser`) dengan email sintetis `<username>@kurnia.local` dan `email_confirm: true`, lalu menyimpan baris di tabel `pengguna` menggunakan `id_pengguna = authUser.id`; catat `log_aktivitas`.
- **USR-03** — Ubah hak akses (peran) dan kontak pengguna; validasi; simpan di `pengguna`; catat `log_aktivitas`. Admin tidak boleh menurunkan perannya sendiri apabila ia adalah satu-satunya admin berstatus `aktif`.
- **USR-04** — Reset password (D7): server membuat **password sementara** secara acak, memperbarui password user di Supabase Auth melalui **Supabase Admin API** (`supabaseAdmin.auth.admin.updateUserById`), mengatur `pengguna.wajib_ganti_password = true` (S4), menampilkan password sementara satu kali kepada admin untuk disampaikan ke pengguna, dan mencatat `log_aktivitas`.
- **USR-05** — Nonaktifkan akun dengan dialog konfirmasi (D7): akun yang sudah memiliki riwayat tidak pernah dihapus secara fisik. Server mengubah `pengguna.status = 'nonaktif'` sekaligus memanggil **Supabase Admin API** untuk melakukan *ban* pada user (`ban_duration`) dan mencabut sesi aktifnya; catat `log_aktivitas`. Admin tidak dapat menonaktifkan akunnya sendiri.

### 8.14 SET — Pengaturan Sistem (admin)

- **SET-01** — Tampilkan konfigurasi notifikasi & payment gateway saat ini dari baris tunggal `pengaturan_sistem` (`id_pengaturan = 1`).
- **SET-02** — Atur konfigurasi notifikasi: `penerima_notifikasi` (alamat email / nomor WhatsApp pemilik) & `saluran_notifikasi` (`email` / `whatsapp`); validasi format; simpan; catat `log_aktivitas`.
- **SET-03** — Atur konfigurasi payment gateway (D18): pilih `penyedia_gateway` (**`midtrans`** atau **`xendit`**) dan isi `kunci_api`. Server memvalidasi input, mengenkripsi nilai `kunci_api` di level aplikasi menggunakan **AES-256-GCM** (dengan kunci rahasia dari environment variable `APP_ENCRYPTION_KEY`) sebelum menyimpannya ke database, dan hanya menampilkan versi ter-mask (mis. `****-xxxx`) saat halaman pengaturan dibuka kembali; catat `log_aktivitas` (dengan nilai `kunci_api` ter-mask).

### 8.15 NTF — Notifikasi (lintas modul)

Sesuai **D16**, pengiriman notifikasi menggunakan pola **Outbox** pada tabel `notifikasi`:
1. Saat kejadian bisnis terjadi, sistem menyimpan baris di tabel `notifikasi` dengan `status_kirim = 'antri'` dan `jumlah_percobaan = 0`.
2. Server menjadwalkan pengiriman segera secara non-blocking menggunakan `after()` dari Next.js. Bila berhasil, `status_kirim` diubah menjadi `'terkirim'`; bila gagal, diubah menjadi `'gagal'` dan `jumlah_percobaan` ditambah 1.
3. Kegagalan pengiriman notifikasi **tidak boleh** menggagalkan atau me-*rollback* transaksi bisnis utama.
4. Route Handler `app/api/cron/notifikasi/route.ts` (dilindungi header `Authorization: Bearer <CRON_SECRET>`) dijalankan secara berkala oleh pemicu cron untuk mengirim ulang baris `notifikasi` yang berstatus `'antri'` atau `'gagal'` dengan `jumlah_percobaan < 3`.
4. Route Handler `app/api/cron/notifikasi/route.ts` (dilindungi header `Authorization: Bearer <CRON_SECRET>`) dipicu secara berkala oleh **Supabase `pg_cron` + `pg_net`** (bukan Vercel Cron) untuk mengirim ulang baris `notifikasi` yang berstatus `'antri'` atau `'gagal'` dengan `jumlah_percobaan < 3`.

| Kejadian | Penerima | Saluran |
|----------|----------|---------|
| Permintaan persetujuan kasbon | Pemilik (`penerima_notifikasi`) | Email / WhatsApp |
| Hasil keputusan kasbon (setuju/tolak) | Kasir pembuat transaksi (`pengguna.email` / `no_whatsapp`) | Email / WhatsApp |
| Stok barang mencapai/di bawah batas minimum | Penerima di Pengaturan Sistem | Email / WhatsApp |
| Rencana restok disimpan | Penerima di Pengaturan Sistem | Email / WhatsApp |
| Penugasan pengiriman baru | Pengirim yang ditugaskan (`pengguna.email` / `no_whatsapp`) | Email / WhatsApp |
| Barang tidak lengkap / Retur pengiriman | Kasir | Email / WhatsApp |
| Pengiriman berhasil terkirim | Kasir & Pemilik | Email / WhatsApp |
| Laporan kendala pengiriman | Kasir & Pemilik | Email / WhatsApp |

### 8.16 PGW — Integrasi Payment Gateway

- **PGW-01** — Implementasikan kontrak TypeScript `PaymentGatewayInterface` (`buatKodeQris`, `buatVirtualAccount`, `verifikasiWebhook`, `cekStatus`) di `src/server/gateways/` dengan dua adapter (`MidtransGateway` dan `XenditGateway`). Adapter yang dipakai saat runtime dipilih berdasarkan nilai `pengaturan_sistem.penyedia_gateway`, dan kunci API didekripsi di server menggunakan helper AES-256-GCM (D18).
- **PGW-02** — Endpoint webhook publik **wajib** berupa Next.js Route Handler di `app/api/webhook/gateway/route.ts` (D17), berjalan tanpa sesi user, dan wajib memverifikasi *signature* kriptografis dari Midtrans/Xendit sebelum memproses payload. Permintaan dengan signature tidak valid wajib ditolak dengan HTTP 401/403.
- **PGW-03** — Pemrosesan webhook harus **idempoten** dan aman dari kondisi balapan (*race condition*): jalankan di dalam `prisma.$transaction` dengan mengunci baris pembayaran/transaksi dan baris `barang` (`SELECT ... FOR UPDATE`, D11). Notifikasi webhook ganda untuk `referensi_gateway` yang sudah berstatus `berhasil` harus langsung mengembalikan HTTP 200 tanpa menggandakan pembayaran ataupun mengurangi stok dua kali.
- **PGW-04** — Simpan `referensi_gateway` pada tabel `pembayaran`. Sediakan dukungan mode *sandbox* untuk pengembangan, dan gunakan *mock* gateway pada seluruh pengujian otomatis (Vitest & Playwright, D20).

---

## 9. Kriteria Penerimaan (ringkas, per modul)

| Modul | Fitur dianggap selesai bila… |
|-------|------------------------------|
| AUTH | Peran salah → ditolak `requireRole` (403); akun `nonaktif`/banned tidak bisa login; login dengan `username` berhasil lewat pemetaan internal; logout tercatat di `log_aktivitas` |
| KEAMANAN DB & KEY | **Tidak ada akses data via `anon` key** (RLS *deny-all* aktif di seluruh tabel schema `public`); **`SUPABASE_SERVICE_ROLE_KEY`, `APP_ENCRYPTION_KEY`, dan `kunci_api` tidak ada di bundle client** |
| BRG | Tambah barang otomatis menghasilkan barcode unik; `kode_barang` duplikat ditolak; hapus membutuhkan konfirmasi (*soft delete*) dan riwayat transaksi lama tetap utuh |
| PLG | Kasir tidak melihat tombol hapus dan ditolak di server bila mencoba menghapus; riwayat transaksi & piutang pelanggan akurat |
| TRX | Scan barcode menambah item; total akurat; stok berkurang tepat sekali; struk thermal tercetak; dua kasir yang memfinalisasi penjualan barang yang sama secara bersamaan **tidak** menghasilkan stok negatif berkat `SELECT ... FOR UPDATE` |
| KSB | Kasbon melebihi batas memunculkan peringatan; penolakan tanpa alasan ditolak validasi; keputusan pemilik memicu outbox notifikasi ke kasir |
| BYR | Nominal > `sisa_tagihan` ditolak; saat `sisa_tagihan = 0` status transaksi otomatis menjadi `lunas`; bukti transfer tersimpan di bucket privat |
| MUT | `stok_sebelum` dan `stok_sesudah` tercatat akurat; mutasi keluar > stok saat ini ditolak; kolom `supplier` bekerja sebagai teks bebas tanpa tabel supplier |
| STR | Perubahan `stok_minimum` langsung memperbarui daftar barang hampir habis; `rencana_restok` berjalan sebagai pencatatan internal tanpa relasi supplier |
| KRM | Pengirim hanya dapat melihat & memproses tugas miliknya sendiri; status `terkirim` ditolak tanpa unggah foto bukti ke bucket privat; foto bukti hanya tampil lewat *signed URL*; status `retur` wajib alasan |
| LOG | Setiap aksi tulis di modul lain menghasilkan baris `log_aktivitas` dengan `data_sebelum` & `data_sesudah` tanpa membocorkan password atau `kunci_api` |
| USR | Tambah/reset/nonaktifkan akun terintegrasi dengan Supabase Admin API di server; reset password menghasilkan password sementara & memaksa ganti password; admin aktif terakhir tidak bisa dinonaktifkan |
| SET | `kunci_api` tersimpan terenkripsi (AES-256-GCM) di database dan hanya tampil ter-mask di layar |
| NTF | Kegagalan kirim notifikasi tidak membatalkan transaksi; Route Handler `/api/cron/notifikasi` memproses ulang notifikasi `antri/gagal` maksimal 3x |
| PGW | Route Handler `/api/webhook/gateway` menolak signature palsu; pengiriman webhook ganda untuk referensi yang sama bersifat idempoten |
| Ekspor | File Excel (`exceljs`) dan PDF mengikuti filter yang sedang aktif di halaman rekap/log |

---

## 10. Kebutuhan Non-Fungsional

### 10.1 Keamanan
- **Autentikasi & Sesi:** Dikelola oleh Supabase Auth (`@supabase/ssr`) menggunakan HTTP-only cookie (`secure`, `httpOnly`, `sameSite=lax`) dan HTTPS wajib di lingkungan produksi.
- **Otorisasi Berlapis (D6):** Setiap Server Action dan Route Handler **wajib** memanggil `requireRole([...])` di sisi server dan memverifikasi kepemilikan data (mis. `pengirim_id === user.id_pengguna`). Middleware Next.js hanya digunakan untuk pengalihan halaman (UX), bukan sebagai satu-satunya penjaga keamanan.
- **Row Level Security (RLS) Deny-All (D12):** Semua tabel di schema `public` wajib mengaktifkan RLS tanpa policy untuk peran `anon`/`authenticated` agar PostgREST publik tidak dapat membaca atau memodifikasi data lewat `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Kerahasiaan Kunci Server (D7, D18):** `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `DIRECT_URL`, `APP_ENCRYPTION_KEY`, dan `CRON_SECRET` hanya boleh diakses di kode server (`server-only`) dan dilarang keras memakai prefiks `NEXT_PUBLIC_`. Nilai `pengaturan_sistem.kunci_api` wajib dienkripsi dengan **AES-256-GCM** sebelum disimpan ke database dan tidak boleh pernah muncul secara utuh di log, notifikasi, ataupun respons ke client.
- **Penyimpanan Objek Privat (D15):** Bucket Supabase Storage untuk foto bukti penerimaan dan bukti transfer wajib disetel **privat**. Server memvalidasi tipe MIME (`image/jpeg`, `image/png`, `image/webp`) dan ukuran file (maks. 5 MB), menyimpan file dengan nama acak berbasis UUID, menyimpan path objek di database, dan membuat *signed URL* berumur pendek hanya setelah memverifikasi otorisasi peminta.
- **Validasi Input & Keamanan Endpoint (D17):** Semua input Server Action dan Route Handler divalidasi dengan skema **Zod** di sisi server. Route Handler `/api/webhook/gateway` wajib memverifikasi *signature* dari penyedia gateway, sedangkan `/api/cron/notifikasi` wajib memverifikasi `CRON_SECRET`.

### 10.2 Integritas Data
- Semua PK menggunakan `uuid` (kecuali `pengaturan_sistem.id_pengaturan` yang bertipe `integer` dengan nilai tunggal `1`). Foreign key menggunakan ` onDelete: Restrict` kecuali relasi komposisi (`detail_transaksi` dan `detail_mutasi_barang` menggunakan `onDelete: Cascade`).
- Koneksi database menggunakan `DATABASE_URL` (pooler) untuk runtime aplikasi dan `DIRECT_URL` (koneksi langsung) untuk eksekusi `prisma migrate` (D10).
- Seluruh operasi yang memeriksa dan memodifikasi stok, saldo piutang, atau finalisasi transaksi wajib dijalankan di dalam `prisma.$transaction` ditambah penguncian baris eksplisit menggunakan `$queryRaw` `SELECT ... FOR UPDATE` pada tabel `barang` / `transaksi` (D11).
- Constraint `CHECK` pada level PostgreSQL ditambahkan melalui file migrasi SQL manual (D14):
  - `barang`: `stok >= 0`, `harga >= 0`, `stok_minimum >= 0`
  - `detail_transaksi` & `detail_mutasi_barang`: `jumlah > 0`
  - `rencana_restok`: `jumlah_restok > 0`
  - `transaksi`: `total >= 0`, `jumlah_dibayar >= 0`, `sisa_tagihan >= 0`
  - `pembayaran`: `nominal > 0`
- Perhitungan uang dan kuantitas di TypeScript wajib menggunakan `Prisma.Decimal` (`decimal.js`) atau aritmetika bilangan bulat/desimal presisi — jangan menggunakan tipe `number` floating-point standar untuk akumulasi nominal uang.

### 10.3 Performa & Ketersediaan
- Halaman POS siap digunakan < 2 detik; pencarian produk < 500 ms untuk ≥ 10.000 baris barang (buat indeks database pada `kode_barang`, `barcode`, `nama`, dan `kategori`).
- Tabel berkapasitas besar (`transaksi`, `mutasi_barang`, `log_aktivitas`, `notifikasi`) menggunakan paginasi sisi server (*server-side pagination*) yang diintegrasikan dengan TanStack Table.
- Cadangan (*backup*) database harian melalui fasilitas backup Supabase PostgreSQL atau skrip `pg_dump` terjadwal (dokumentasikan di `README.md`).

### 10.4 Antarmuka & Pengalaman Pengguna
- Antarmuka **modern, cepat, dan bersih** menggunakan **Tailwind CSS** dan komponen **shadcn/ui**; navigasi *sidebar* untuk Admin & Kasir di layar desktop, serta **bottom navigation** untuk Pengirim di perangkat HP.
- Halaman POS Kasir: ramah keyboard & pemindai barcode USB (autofocus pada kolom scan, pintasan tombol Enter/F-key untuk bayar) serta ukuran tombol yang nyaman untuk layar sentuh.
- Halaman Pengirim: **mobile-first**, tombol aksi berukuran besar, dan input unggah foto bukti mendukung pengambilan langsung dari kamera HP (`accept="image/jpeg,image/png,image/webp" capture="environment"`).
- Setiap aksi destruktif (hapus barang, hapus pelanggan, nonaktifkan akun, tolak kasbon) wajib menampilkan dialog konfirmasi (`AlertDialog` shadcn/ui); setiap form menggunakan React Hook Form + Zod dengan pesan validasi bahasa Indonesia yang jelas.

### 10.5 Kompatibilitas
- Browser modern (Chrome, Edge, Firefox versi terbaru di desktop; Chrome Android di HP). Pencetakan struk thermal 58 mm / 80 mm berjalan melalui dialog cetak standar browser menggunakan aturan CSS `@media print`.

### 10.6 Pengujian & Kualitas (D13, D20)
- **Unit & Integration Test (Vitest):** Menguji logika service (`TransaksiService`, `StokService`, `KasbonService`, `PembayaranService`, helper enkripsi AES-256-GCM, penomoran nota, aturan batas kasbon, otorisasi `requireRole`, serta idempotensi webhook). Gunakan *mock* untuk Payment Gateway dan Supabase Admin API.
- **End-to-End Test (Playwright):** Menguji alur utama dari antarmuka: login per peran, transaksi penjualan tunai sampai struk, pengajuan & persetujuan kasbon, pembayaran piutang, mutasi barang masuk/keluar, alur pengiriman sampai unggah bukti terima, dan penolakan akses lintas peran.
- **Seeder (`prisma/seed.ts`, D13):** Membuat akun awal di Supabase Auth sekaligus baris di tabel `pengguna` (1 `admin`, 1 `kasir`, 1 `pengirim`), baris tunggal `pengaturan_sistem`, pelanggan default `Pelanggan Umum`, dan ± 20 data barang bangunan contoh.
- **Kualitas Kode:** Pemeriksaan tipe statis `tsc --noEmit`, linting dengan **ESLint**, dan pemformatan kode dengan **Prettier** wajib lulus tanpa error sebelum setiap fase dinyatakan selesai.

---

## 11. Di Luar Cakupan (jangan dibuat)

- **Multi-cabang atau multi-gudang (D1):** Sistem hanya untuk satu toko (*single store*). Jangan membuat tabel cabang, gudang, atau transfer stok antar-cabang.
- **Master Supplier & Purchase Order / PO (D2):** Jangan membuat tabel `supplier`, manajemen kontak pemasok, maupun fitur pemesanan pembelian (PO) ke pemasok. Kolom `mutasi_barang.supplier` hanya berupa teks bebas, dan `rencana_restok` hanya berupa catatan rencana internal.
- **Utang Usaha ke Supplier (D3):** Jangan membuat modul pencatatan utang toko kepada supplier/pemasok. *(Catatan: **Kasbon dan piutang pelanggan kepada toko tetap termasuk** di dalam cakupan).*
- Login/aplikasi untuk pelanggan, katalog toko online (*e-commerce*), atau pemesanan mandiri oleh pelanggan.
- Pajak (PPN), diskon/promo, atau harga bertingkat per jenis pelanggan *(tidak ada di diagram)*.
- Akuntansi/buku besar dan laporan laba-rugi.
- Retur pembelian ke supplier.
- Pelacakan lokasi GPS kurir secara langsung (*live tracking*).
- Aplikasi mobile native (Android/iOS).
- Halaman bertuliskan "ga jadi dipake" pada file draw.io adalah draf yang dibatalkan — **abaikan**.

---

## 12. Rencana Pengerjaan Bertahap (untuk Agent)

Selesaikan, uji (Vitest/Playwright + `tsc` + ESLint), dan *commit* satu fase sebelum melangkah ke fase berikutnya.

| Fase | Isi | Hasil yang bisa didemokan |
|------|-----|---------------------------|
| **0. Fondasi** | Setup proyek Next.js (App Router, TypeScript, Tailwind CSS, shadcn/ui); konfigurasi project Supabase (Database, Auth, Storage bucket privat); setup Prisma (`schema.prisma` sesuai Lampiran A, `DATABASE_URL` & `DIRECT_URL`); jalankan `prisma migrate` + tambahkan constraint `CHECK` SQL manual (D14) + aktifkan **RLS deny-all** di semua tabel `public` (D12); implementasi autentikasi Supabase Auth (pemetaan `username` → `<username>@kurnia.local`) + helper `requireRole([...])` di `src/server/auth` + halaman ganti password wajib; buat seeder `prisma/seed.ts` (membuat user di Supabase Auth + baris `pengguna`, `Pelanggan Umum`, `pengaturan_sistem`, ± 20 barang); implementasi `LogAktivitasService`; bangun layout & navigasi per peran beserta halaman Dashboard kerangka | Login 3 peran dengan `username`, proteksi `requireRole` & RLS aktif, log login/logout tercatat |
| **1. Master Data** | CRUD Barang (validasi Zod, generate barcode otomatis, cetak label barcode Code 128 dengan `bwip-js`/`jsbarcode`, *soft delete*); CRUD Pelanggan sesuai hak akses peran; kerangka halaman riwayat transaksi & piutang per pelanggan | Barang punya barcode siap cetak; kasir tidak bisa menghapus pelanggan/barang |
| **2. Penjualan Tunai** | Halaman POS Kasir (scan barcode / cari produk, keranjang reaktif, validasi stok real-time & saran alternatif); pembayaran tunai; finalisasi transaksi dengan `prisma.$transaction` + `$queryRaw` `SELECT ... FOR UPDATE`; mutasi keluar otomatis; penomoran nota `KM-YYYYMMDD-NNNN`; halaman struk thermal (`@media print`); pemeriksaan batas stok minimum | Satu transaksi penjualan tunai *end-to-end* sampai cetak struk & pengurangan stok aman dari *race condition* |
| **3. Barang Masuk & Keluar** | Form mutasi barang masuk (dengan input teks bebas `supplier` & `no_referensi`) dan barang keluar (`tujuan` & `alasan`) multi-baris dengan pemindaian barcode; pencatatan `stok_sebelum` & `stok_sesudah` dengan row locking | Stok awal dan mutasi masuk/keluar tercatat akurat |
| **4. Kasbon & Piutang** | Pengajuan kasbon dari POS Kasir; menu Kasbon & Piutang Admin (detail piutang, keputusan setuju/tolak + alasan, aktivasi kasbon pelanggan); menu Pembayaran & Piutang Kasir (bayar tunai atau transfer dengan unggah `bukti_transfer_url` ke bucket privat Supabase Storage + tampilan via *signed URL*); cetak struk pembayaran piutang | Siklus kasbon pelanggan dari pengajuan sampai pelunasan berjalan penuh |
| **5. Notifikasi** | Implementasi `NotifikasiService`, `EmailChannel`, dan `WhatsappChannel` (antarmuka + *stub*/provider); pola outbox pada tabel `notifikasi` dengan eksekusi segera via `after()` Next.js + Route Handler retry `/api/cron/notifikasi` (dilindungi `CRON_SECRET`, maks. 3x); hubungkan ke seluruh kejadian di Bagian 8.15 | Semua kejadian penting menghasilkan notifikasi di outbox dan terkirim tanpa menghambat transaksi |
| **5. Notifikasi** | Implementasi `NotifikasiService`, `EmailChannel`, dan `WhatsappChannel` (antarmuka + *stub/log*); pola outbox pada tabel `notifikasi` dengan eksekusi segera via `after()` Next.js + Route Handler retry `/api/cron/notifikasi` (dilindungi `CRON_SECRET`, maks. 3x) yang dipicu oleh **Supabase `pg_cron` + `pg_net`**; hubungkan ke seluruh kejadian di Bagian 8.15 | Semua kejadian penting menghasilkan notifikasi di outbox dan terkirim tanpa menghambat transaksi |
| **6. Pengiriman** | Penugasan pengiriman oleh Kasir; antarmuka *mobile-first* Pengirim (cek kelengkapan barang, konfirmasi keberangkatan, status retur dengan alasan atau terkirim dengan unggah `foto_bukti_url` ke bucket privat Supabase Storage); form laporan kendala; riwayat pengiriman; halaman Monitoring Pengiriman Admin (lihat foto bukti via *signed URL*) | Alur pengiriman lapangan dari penugasan sampai bukti terima selesai |
| **7. Stok & Restok + Rekap** | Pengaturan batas `stok_minimum` & pencatatan `rencana_restok` internal (tanpa relasi supplier/PO); halaman Riwayat Transaksi Kasir & Rekap Penjualan Admin; cetak nota pelanggan & struk salinan; Route Handler ekspor rekap ke Excel (`exceljs`) dan PDF (`@react-pdf/renderer`/`pdf-lib`) | Admin dapat memantau rencana restok dan mengunduh rekap penjualan Excel/PDF |
| **8. Log, Pengguna, Pengaturan** | Halaman Log Aktivitas Admin (filter, detail JSON sebelum/sesudah, ekspor Excel/PDF); manajemen Pengguna & Hak Akses terintegrasi dengan **Supabase Admin API** (tambah akun, ubah peran, reset password sementara + `wajib_ganti_password`, nonaktifkan/ban akun); halaman Pengaturan Sistem (notifikasi & enkripsi `kunci_api` dengan AES-256-GCM) | Pemilik memegang kendali penuh atas audit, akun, dan konfigurasi |
| **9. Payment Gateway** | Implementasi `PaymentGatewayInterface` beserta `MidtransGateway` & `XenditGateway`; alur pembayaran QRIS & Virtual Account di POS Kasir; Route Handler webhook `app/api/webhook/gateway/route.ts` (verifikasi signature, idempoten, row locking) | Pembayaran nontunai QRIS/VA berjalan *end-to-end* di mode sandbox/mock |
| **10. Hardening** | Audit menyeluruh pemanggilan `requireRole` di semua Server Action & Route Handler, verifikasi RLS & ketiadaan *secret* di bundle client, kelengkapan pengujian Vitest & Playwright, perapian UI/UX, dan penulisan `README.md` (instalasi, variabel `.env`, migrasi, cron, cadangan DB, panduan cetak thermal) | Sistem siap *User Acceptance Testing* (UAT) & produksi |

---

## 13. Pertanyaan Terbuka & Asumsi (mohon dikonfirmasi)
## 13. Pertanyaan Terbuka & Asumsi (Status Konfirmasi)

Item dengan tanda `⚠` menggunakan keputusan default di kolom kanan agar pengerjaan tidak terhambat, dan dapat disesuaikan bila pemilik produk memberikan arahan berbeda:
Tabel di bawah mencatat keputusan yang telah **Terjawab/Ditetapkan (`✅`)**, **Ditunda (`⏸`)**, serta **Asumsi Default (`⚠`)** yang dipakai Agent:

| # | Topik / Pertanyaan | Keputusan Default / `⚠ Asumsi` yang Dipakai Agent |
|---|--------------------|---------------------------------------------------|
| Q1 | **Target Hosting & Deployment** (`⚠ belum ditentukan`) | Aplikasi dirancang kompatibel dengan **Vercel** maupun **VPS/Container Node.js** standar. Semua operasi file memakai Supabase Storage (bukan filesystem lokal) dan koneksi runtime memakai Supabase Pooler (`DATABASE_URL`). |
| Q2 | **Penyedia Layanan WhatsApp** (`⚠ belum ditentukan`) | Diagram hanya menyebut "Email / WhatsApp". `WhatsappChannel` dibuat mengikuti kontrak `NotifikasiChannel` dengan implementasi default berupa HTTP webhook generik (mis. Fonnte/Wablas/Cloud API yang dikonfigurasi lewat env var) + mode *stub/log* bila kredensial belum diisi; saluran Email menjadi saluran aktif utama. |
| Q3 | **Pemicu Cron untuk Outbox Notifikasi (`/api/cron/notifikasi`)** (`⚠ belum ditentukan`) | Endpoint `/api/cron/notifikasi` dibuat standar (menerima `GET`/`POST` dengan header `Authorization: Bearer <CRON_SECRET>`), sehingga dapat dipicu baik oleh **Vercel Cron** (`vercel.json`), **Supabase `pg_cron` + `pg_net`**, maupun *cron* sistem di VPS setiap 1–5 menit. |
| Q4 | **Pemetaan Login `username` ke Email Supabase Auth (D4)** | Pengguna login dengan `username`. Server memetakannya secara deterministik menjadi `<username>@kurnia.local` saat memanggil Supabase Auth. Email asli pengguna (bila ada) disimpan di `pengguna.email` khusus untuk pengiriman notifikasi. |
| Q5 | **Representasi Enum di Prisma Schema vs `varchar` (D9)** (`⚠ Asumsi`) | Menggunakan deklarasi **`enum` Prisma** (lihat Lampiran A) agar *type-safe* di Prisma Client dan TypeScript, dengan panjang string setiap nilai enum dijaga ≤ batas `varchar(n)` pada Class Diagram. *(Bila diinginkan kolom fisik tetap `varchar` murni di PostgreSQL, ubah tipe field di Prisma menjadi `String @db.VarChar(n)` dan gunakan konstanta union TypeScript + `z.enum` di Zod).* |
| Q6 | **Rekonsiliasi Jumlah Tabel di D9 (15 vs 16 tabel)** (`⚠ Catatan`) | Bagian 7.1 memiliki **15 tabel** di schema `public` sesuai Class Diagram, ditambah **1 tabel `auth.users`** di schema `auth` Supabase yang berelasi 1:1 dengan `pengguna` (total 16 entitas). Tidak ada tabel tambahan yang dikarang di luar Class Diagram. |
| Q7 | **Penyesuaian Skema S1–S7** (kontak pengguna, *soft delete*, `updated_at`, `wajib_ganti_password`, `Pelanggan Umum`, penghapusan `pengguna.password` D5, path storage privat & `jumlah_percobaan` notifikasi) | Disetujui dan diterapkan di `schema.prisma` (Lampiran A). |
| Q8 | **Pelanggan Tunai yang Tidak Terdaftar** | Menggunakan baris khusus `Pelanggan Umum` (`jenis = 'perorangan'`, `status_kasbon = 'nonaktif'`, S5) yang dibuat oleh seeder. |
| Q9 | **Arti "Mengaktifkan Kasbon" saat Disetujui Pemilik** (`⚠ Asumsi`) | Saat pemilik menyetujui pengajuan kasbon, sistem menyetujui transaksi kasbon tersebut (`kasbon.status = 'disetujui'`) **sekaligus** memastikan `pelanggan.status_kasbon = 'aktif'`. |
| Q10 | **Perubahan Harga & Diskon oleh Kasir** (`⚠ Asumsi`) | Kasir **tidak** dapat mengubah harga satuan barang dan tidak ada fitur diskon di POS; harga selalu mengacu pada `barang.harga`. |
| Q11 | **Penerima Notifikasi Stok Hampir Habis & Rencana Restok** | Dikirim ke nilai `penerima_notifikasi` dan `saluran_notifikasi` pada tabel `pengaturan_sistem` (maksimal 1 notifikasi stok minimum per barang per hari agar tidak spam `⚠ Asumsi`). |
| Q12 | **Waktu Pengurangan Stok untuk Transaksi QRIS / VA** | Stok dikurangi **saat pembayaran berhasil** (ketika webhook diterima dan terverifikasi), dengan validasi ulang stok di dalam transaksi database yang memakai `SELECT ... FOR UPDATE`. |
| Q13 | **Satuan Barang & Konversi** | Satu satuan tetap per barang (`sak`, `kg`, `m3`, `buah`, dll.) tanpa tabel konversi antar-satuan; kolom `stok` dan `jumlah` mendukung nilai desimal `numeric(15,2)`. |
| Q14 | **Penghapusan Barang & Pelanggan** | Menggunakan *soft delete* (`deleted_at`) agar riwayat transaksi dan nota lama tetap utuh. |
| Q15 | **Ukuran Kertas Printer Thermal & Salinan Struk** (`⚠ Asumsi`) | Lebar kertas default **80 mm** (dapat diubah ke 58 mm lewat variabel CSS); pencetakan ulang struk/nota diberi penanda **"SALINAN"**. |
| Q16 | **Pengiriman Parsial** | Tidak ada pengiriman parsial; satu transaksi memiliki maksimal satu pengiriman (relasi `1 : 0..1` sesuai Class Diagram). |
| # | Topik / Pertanyaan | Status | Keputusan Final / Default yang Dipakai Agent |
|---|--------------------|:------:|----------------------------------------------|
| Q1 | **Target Hosting & Deployment** | ✅ **Terjawab** | Di-deploy ke **Vercel**. Seluruh penyimpanan file menggunakan Supabase Storage (bukan filesystem lokal) dan koneksi database runtime menggunakan Supabase Pooler (`DATABASE_URL`). |
| Q2 | **Penyedia Layanan WhatsApp** | ⏸ **Ditunda** | Penyedia belum ditentukan. `WhatsappChannel` dibangun mengikuti kontrak `NotifikasiChannel` dengan implementasi *stub/log* (siap disambungkan ke HTTP API pihak ketiga lewat env var nantinya); **Email** menjadi saluran aktif utama saat ini. |
| Q3 | **Pemicu Cron untuk Outbox Notifikasi (`/api/cron/notifikasi`)** | ✅ **Terjawab** | Menggunakan **Supabase `pg_cron` + `pg_net`** yang memanggil endpoint `POST /api/cron/notifikasi` dengan header `Authorization: Bearer <CRON_SECRET>`. **Tidak bergantung pada Vercel Cron.** |
| Q4 | **Pemetaan Login `username` ke Email Supabase Auth (D4)** | ✅ **Terjawab** | Memakai domain sintetis **`<username>@kurnia.local`** sebagai default saat memanggil Supabase Auth. Email asli pengguna disimpan terpisah di `pengguna.email` untuk keperluan notifikasi. |
| Q5 | **Representasi Enum di Prisma Schema vs `varchar` (D9)** | ✅ **Terjawab** | Memakai **native `enum` Prisma** seperti yang tertulis di Lampiran A (`@@map` ke tipe enum PostgreSQL), dengan seluruh nilai anggota muat dalam batas panjang karakter Class Diagram. |
| Q6 | **Rekonsiliasi Jumlah Tabel di D9 (15 vs 16 tabel)** | ℹ️ **Catatan** | Bagian 7.1 memiliki **15 tabel** di schema `public` sesuai Class Diagram, ditambah **1 tabel `auth.users`** di schema `auth` Supabase yang berelasi 1:1 dengan `pengguna` (total 16 entitas). Tidak ada tabel tambahan di luar Class Diagram. |
| Q7 | **Penyesuaian Skema S1–S7** (kontak pengguna, *soft delete*, `updated_at`, `wajib_ganti_password`, `Pelanggan Umum`, penghapusan `pengguna.password` D5, path storage privat & `jumlah_percobaan` notifikasi) | ⚠ **Asumsi Default** | Diterapkan penuh di `schema.prisma` (Lampiran A). |
| Q8 | **Pelanggan Tunai yang Tidak Terdaftar** | ⚠ **Asumsi Default** | Menggunakan baris khusus `Pelanggan Umum` (`jenis = 'perorangan'`, `status_kasbon = 'nonaktif'`, S5) yang dibuat oleh seeder. |
| Q9 | **Arti "Mengaktifkan Kasbon" saat Disetujui Pemilik** | ⚠ **Asumsi Default** | Saat pemilik menyetujui pengajuan kasbon, sistem menyetujui transaksi kasbon tersebut (`kasbon.status = 'disetujui'`) **sekaligus** memastikan `pelanggan.status_kasbon = 'aktif'`. |
| Q10 | **Perubahan Harga & Diskon oleh Kasir** | ⚠ **Asumsi Default** | Kasir **tidak** dapat mengubah harga satuan barang dan tidak ada fitur diskon di POS; harga selalu mengacu pada `barang.harga`. |
| Q11 | **Penerima Notifikasi Stok Hampir Habis & Rencana Restok** | ⚠ **Asumsi Default** | Dikirim ke nilai `penerima_notifikasi` dan `saluran_notifikasi` pada tabel `pengaturan_sistem` (maksimal 1 notifikasi stok minimum per barang per hari agar tidak spam). |
| Q12 | **Waktu Pengurangan Stok untuk Transaksi QRIS / VA** | ⚠ **Asumsi Default** | Stok dikurangi **saat pembayaran berhasil** (ketika webhook diterima dan terverifikasi), dengan validasi ulang stok di dalam transaksi database yang memakai `SELECT ... FOR UPDATE`. |
| Q13 | **Satuan Barang & Konversi** | ⚠ **Asumsi Default** | Satu satuan tetap per barang (`sak`, `kg`, `m3`, `buah`, dll.) tanpa tabel konversi antar-satuan; kolom `stok` dan `jumlah` mendukung nilai desimal `numeric(15,2)`. |
| Q14 | **Penghapusan Barang & Pelanggan** | ⚠ **Asumsi Default** | Menggunakan *soft delete* (`deleted_at`) agar riwayat transaksi dan nota lama tetap utuh. |
| Q15 | **Ukuran Kertas Printer Thermal & Salinan Struk** | ⚠ **Asumsi Default** | Lebar kertas default **80 mm** (dapat diubah ke 58 mm lewat variabel CSS); pencetakan ulang struk/nota diberi penanda **"SALINAN"**. |
| Q16 | **Pengiriman Parsial** | ⚠ **Asumsi Default** | Tidak ada pengiriman parsial; satu transaksi memiliki maksimal satu pengiriman (relasi `1 : 0..1` sesuai Class Diagram). |

---

## 14. Glosarium

| Istilah | Arti |
|---------|------|
| Kasbon | Pembelian barang oleh pelanggan dengan pembayaran ditunda (piutang pelanggan kepada toko) yang wajib disetujui pemilik |
| Piutang | Sisa tagihan pelanggan kepada toko yang belum dilunasi *(berbeda dengan utang usaha toko ke supplier yang berada di luar cakupan)* |
| Nota / Struk | Bukti transaksi penjualan; struk = versi cetak thermal untuk kasir/pelanggan, nota = versi cetak/rekap pada menu admin |
| Mutasi barang | Pencatatan perubahan stok barang: barang masuk (dari pembelian/pemasok) atau barang keluar (penjualan maupun non-penjualan) |
| Restok | Rencana internal toko untuk pengadaan ulang barang yang stoknya mencapai batas minimum |
| Retur | Barang yang ditolak pelanggan saat proses pengiriman di lokasi dan dikembalikan ke toko |
| QRIS / VA | Pembayaran nontunai menggunakan kode QR standar atau Virtual Account melalui Payment Gateway |
| Webhook | Panggilan HTTP POST otomatis dari Payment Gateway ke endpoint `/api/webhook/gateway` untuk memberi tahu status pembayaran |
| Outbox | Pola penyimpanan pesan notifikasi di tabel `notifikasi` sebelum dikirim secara asinkron agar tahan terhadap kegagalan jaringan |
| Signed URL | Tautan sementara berumur pendek yang dibuat server untuk membuka file di bucket Supabase Storage privat secara aman |

---

## Lampiran A. Draf Lengkap `prisma/schema.prisma`

Draf skema di bawah ini memetakan seluruh 15 tabel aplikasi di schema `public` dari Bagian 7.1 (yang berpasangan dengan `auth.users` dari Supabase Auth sesuai D5/D9) beserta penyesuaian Bagian 7.3 (S1–S7):

```prisma
// prisma/schema.prisma
// Sumber kebenaran: PRD v1.1 Bagian 7.1 & 7.3
// Sumber kebenaran: PRD v1.2 Bagian 7.1 & 7.3

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ==========================================
// ENUM (PRD Bagian 7.3 — D9)
// ==========================================

enum RolePengguna {
  admin
  kasir
  pengirim

  @@map("role_pengguna")
}

enum StatusPengguna {
  aktif
  nonaktif

  @@map("status_pengguna")
}

enum JenisPelanggan {
  proyek
  perorangan

  @@map("jenis_pelanggan")
}

enum StatusKasbonPelanggan {
  nonaktif
  aktif

  @@map("status_kasbon_pelanggan")
}

enum JenisPembayaran {
  tunai
  kasbon
  qris
  va

  @@map("jenis_pembayaran")
}

enum StatusBayarTransaksi {
  pending
  lunas
  piutang
  batal

  @@map("status_bayar_transaksi")
}

enum MetodePembayaran {
  tunai
  transfer
  qris
  va

  @@map("metode_pembayaran")
}

enum StatusPembayaran {
  pending
  berhasil
  gagal

  @@map("status_pembayaran")
}

enum StatusKasbon {
  menunggu
  disetujui
  ditolak

  @@map("status_kasbon")
}

enum JenisMutasi {
  masuk
  keluar

  @@map("jenis_mutasi")
}

enum StatusRestok {
  rencana
  dipesan
  diterima

  @@map("status_restok")
}

enum StatusPengiriman {
  ditugaskan
  dikirim
  terkirim
  retur

  @@map("status_pengiriman")
}

enum SaluranNotifikasi {
  email
  whatsapp

  @@map("saluran_notifikasi")
}

enum StatusKirimNotifikasi {
  antri
  terkirim
  gagal

  @@map("status_kirim_notifikasi")
}

enum PenyediaGateway {
  midtrans
  xendit

  @@map("penyedia_gateway")
}

enum JenisKendala {
  kendaraan_rusak
  jalan_tidak_bisa_dilalui
  alamat_tidak_ditemukan
  pelanggan_tidak_di_lokasi
  cuaca
  lainnya

  @@map("jenis_kendala")
}

// ==========================================
// MODEL TABEL (PRD Bagian 7.1 & 7.3)
// ==========================================

/// D5 & S6: id_pengguna diisi dengan UUID dari auth.users.id (Supabase Auth).
/// Kolom password dihapus karena kredensial dikelola oleh Supabase Auth.
model Pengguna {
  id_pengguna          String         @id @db.Uuid
  nama                 String         @db.VarChar(50)
  username             String         @unique @db.VarChar(20)
  role                 RolePengguna   @default(kasir)
  status               StatusPengguna @default(aktif)
  email                String?        @db.VarChar(100) // PRD 7.3 S1
  no_whatsapp          String?        @db.VarChar(20)  // PRD 7.3 S1
  wajib_ganti_password Boolean        @default(false)  // PRD 7.3 S4
  created_at           DateTime       @default(now()) @db.Timestamptz(6)
  updated_at           DateTime       @updatedAt @db.Timestamptz(6) // PRD 7.3 S3

  log_aktivitas LogAktivitas[]
  mutasi_barang MutasiBarang[]
  pengiriman    Pengiriman[]
  transaksi     Transaksi[]

  @@map("pengguna")
}

model LogAktivitas {
  id_log       String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  pengguna_id  String   @db.Uuid
  modul        String   @db.VarChar(30)
  aktivitas    String   @db.VarChar(50)
  data_sebelum String?  @db.Text
  data_sesudah String?  @db.Text
  waktu        DateTime @default(now()) @db.Timestamptz(6)

  pengguna Pengguna @relation(fields: [pengguna_id], references: [id_pengguna], onDelete: Restrict)

  @@index([pengguna_id])
  @@index([waktu])
  @@index([modul])
  @@map("log_aktivitas")
}

model Notifikasi {
  id_notifikasi    String                @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  jenis            String                @db.VarChar(30)
  penerima         String                @db.VarChar(100)
  saluran          SaluranNotifikasi
  pesan            String                @db.Text
  status_kirim     StatusKirimNotifikasi @default(antri)
  jumlah_percobaan Int                   @default(0) // PRD 7.3 S7 (D16: maks 3x retry)
  waktu            DateTime              @default(now()) @db.Timestamptz(6)

  @@index([status_kirim, jumlah_percobaan])
  @@index([waktu])
  @@map("notifikasi")
}

/// D1: Hanya terdiri dari 1 baris konfigurasi (id_pengaturan = 1).
/// D18: kunci_api disimpan dalam bentuk terenkripsi AES-256-GCM.
model PengaturanSistem {
  id_pengaturan       Int               @id @default(1)
  saluran_notifikasi  SaluranNotifikasi @default(email)
  penerima_notifikasi String            @db.VarChar(100)
  penyedia_gateway    PenyediaGateway   @default(midtrans)
  kunci_api           String?           @db.Text
  updated_at          DateTime          @updatedAt @db.Timestamptz(6)

  @@map("pengaturan_sistem")
}

model Barang {
  id_barang    String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  kode_barang  String    @unique @db.VarChar(20)
  nama         String    @db.VarChar(100)
  merk         String?   @default("-") @db.VarChar(50)  // PRD 7.3 S8 (Excel)
  kategori     String    @db.VarChar(30)
  barcode      String    @unique @db.VarChar(30)
  harga_beli   Decimal   @default(0) @db.Decimal(15, 2) // PRD 7.3 S8 (Harga Modal Excel)
  harga        Decimal   @default(0) @db.Decimal(15, 2) // Harga Jual (default Modal * 1.3)
  stok_awal    Decimal   @default(0) @db.Decimal(15, 2) // PRD 7.3 S8 (Stok Awal Excel)
  stok         Decimal   @default(0) @db.Decimal(15, 2)
  stok_minimum Decimal   @default(0) @db.Decimal(15, 2)
  satuan       String    @db.VarChar(15)
  keterangan   String?   @db.Text                       // PRD 7.3 S8 (Keterangan Excel)
  created_at   DateTime  @default(now()) @db.Timestamptz(6)
  updated_at   DateTime  @updatedAt @db.Timestamptz(6) // PRD 7.3 S3
  deleted_at   DateTime? @db.Timestamptz(6)            // PRD 7.3 S2

  detail_transaksi     DetailTransaksi[]
  detail_mutasi_barang DetailMutasiBarang[]
  rencana_restok       RencanaRestok[]

  @@index([nama])
  @@index([kategori])
  @@index([deleted_at])
  @@map("barang")
}

model Pelanggan {
  id_pelanggan  String                @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  nama          String                @db.VarChar(50)
  jenis         JenisPelanggan        @default(perorangan)
  kontak        String                @db.VarChar(20)
  alamat        String                @db.Text
  batas_kasbon  Decimal               @default(0) @db.Decimal(15, 2)
  status_kasbon StatusKasbonPelanggan @default(nonaktif)
  created_at    DateTime              @default(now()) @db.Timestamptz(6)
  updated_at    DateTime              @updatedAt @db.Timestamptz(6) // PRD 7.3 S3
  deleted_at    DateTime?             @db.Timestamptz(6)            // PRD 7.3 S2

  transaksi Transaksi[]
  kasbon    Kasbon[]

  @@index([nama])
  @@index([jenis])
  @@index([deleted_at])
  @@map("pelanggan")
}

model Transaksi {
  id_transaksi     String               @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  no_nota          String               @unique @db.VarChar(20)
  pengguna_id      String               @db.Uuid
  pelanggan_id     String               @db.Uuid
  jenis_pembayaran JenisPembayaran
  total            Decimal              @default(0) @db.Decimal(15, 2)
  jumlah_dibayar   Decimal              @default(0) @db.Decimal(15, 2)
  sisa_tagihan     Decimal              @default(0) @db.Decimal(15, 2)
  status_bayar     StatusBayarTransaksi @default(pending)
  perlu_dikirim    Boolean              @default(false)
  tanggal          DateTime             @default(now()) @db.Timestamptz(6)
  updated_at       DateTime             @updatedAt @db.Timestamptz(6) // PRD 7.3 S3

  pengguna         Pengguna          @relation(fields: [pengguna_id], references: [id_pengguna], onDelete: Restrict)
  pelanggan        Pelanggan         @relation(fields: [pelanggan_id], references: [id_pelanggan], onDelete: Restrict)
  detail_transaksi DetailTransaksi[]
  pembayaran       Pembayaran[]
  kasbon           Kasbon?
  pengiriman       Pengiriman?

  @@index([tanggal])
  @@index([pelanggan_id])
  @@index([pengguna_id])
  @@index([status_bayar])
  @@map("transaksi")
}

model DetailTransaksi {
  id_detail_transaksi String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  transaksi_id        String  @db.Uuid
  barang_id           String  @db.Uuid
  jumlah              Decimal @db.Decimal(15, 2)
  harga_satuan        Decimal @db.Decimal(15, 2)
  subtotal            Decimal @db.Decimal(15, 2)

  transaksi Transaksi @relation(fields: [transaksi_id], references: [id_transaksi], onDelete: Cascade)
  barang    Barang    @relation(fields: [barang_id], references: [id_barang], onDelete: Restrict)

  @@index([transaksi_id])
  @@index([barang_id])
  @@map("detail_transaksi")
}

/// D15 & S7: bukti_transfer_url menyimpan path objek di bucket privat Supabase Storage.
model Pembayaran {
  id_pembayaran      String           @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  transaksi_id       String           @db.Uuid
  metode             MetodePembayaran
  nominal            Decimal          @db.Decimal(15, 2)
  bukti_transfer_url String?          @db.Text
  referensi_gateway  String?          @db.VarChar(50)
  status             StatusPembayaran @default(pending)
  tanggal            DateTime         @default(now()) @db.Timestamptz(6)

  transaksi Transaksi @relation(fields: [transaksi_id], references: [id_transaksi], onDelete: Restrict)

  @@index([transaksi_id])
  @@index([referensi_gateway])
  @@map("pembayaran")
}

model Kasbon {
  id_kasbon         String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  pelanggan_id      String       @db.Uuid
  transaksi_id      String       @unique @db.Uuid
  jumlah_kasbon     Decimal      @db.Decimal(15, 2)
  status            StatusKasbon @default(menunggu)
  alasan_penolakan  String?      @db.Text
  tanggal_pengajuan DateTime     @default(now()) @db.Timestamptz(6)
  tanggal_keputusan DateTime?    @db.Timestamptz(6)
  updated_at        DateTime     @updatedAt @db.Timestamptz(6) // PRD 7.3 S3

  pelanggan Pelanggan @relation(fields: [pelanggan_id], references: [id_pelanggan], onDelete: Restrict)
  transaksi Transaksi @relation(fields: [transaksi_id], references: [id_transaksi], onDelete: Restrict)

  @@index([pelanggan_id])
  @@index([status])
  @@map("kasbon")
}

/// D2: Kolom supplier adalah teks bebas (varchar 50), tidak berelasi ke tabel supplier.
model MutasiBarang {
  id_mutasi    String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  pengguna_id  String      @db.Uuid
  jenis        JenisMutasi
  supplier     String?     @db.VarChar(50)
  no_referensi String?     @db.VarChar(30)
  tujuan       String?     @db.VarChar(50)
  alasan       String?     @db.Text
  tanggal      DateTime    @default(now()) @db.Timestamptz(6)

  pengguna             Pengguna             @relation(fields: [pengguna_id], references: [id_pengguna], onDelete: Restrict)
  detail_mutasi_barang DetailMutasiBarang[]

  @@index([tanggal])
  @@index([jenis])
  @@map("mutasi_barang")
}

model DetailMutasiBarang {
  id_detail_mutasi String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  mutasi_id        String  @db.Uuid
  barang_id        String  @db.Uuid
  jumlah           Decimal @db.Decimal(15, 2)
  stok_sebelum     Decimal @db.Decimal(15, 2)
  stok_sesudah     Decimal @db.Decimal(15, 2)
  harga_satuan     Decimal @default(0) @db.Decimal(15, 2) // PRD 7.3 S8 (Harga Beli/Jual mutasi Excel)
  total_harga      Decimal @default(0) @db.Decimal(15, 2) // PRD 7.3 S8 (Total Harga mutasi Excel)
  keterangan       String? @db.Text                       // PRD 7.3 S8 (Keterangan mutasi Excel)

  mutasi MutasiBarang @relation(fields: [mutasi_id], references: [id_mutasi], onDelete: Cascade)
  barang Barang       @relation(fields: [barang_id], references: [id_barang], onDelete: Restrict)

  @@index([mutasi_id])
  @@index([barang_id])
  @@map("detail_mutasi_barang")
}

/// D2: Rencana restok internal tanpa relasi ke supplier atau Purchase Order.
model RencanaRestok {
  id_restok     String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  barang_id     String       @db.Uuid
  jumlah_restok Decimal      @db.Decimal(15, 2)
  status        StatusRestok @default(rencana)
  tanggal       DateTime     @default(now()) @db.Timestamptz(6)
  updated_at    DateTime     @updatedAt @db.Timestamptz(6) // PRD 7.3 S3

  barang Barang @relation(fields: [barang_id], references: [id_barang], onDelete: Restrict)

  @@index([barang_id])
  @@index([status])
  @@map("rencana_restok")
}

/// D15 & S7: foto_bukti_url menyimpan path objek di bucket privat Supabase Storage.
model Pengiriman {
  id_pengiriman     String           @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  transaksi_id      String           @unique @db.Uuid
  pengirim_id       String           @db.Uuid
  alamat_tujuan     String           @db.Text
  status            StatusPengiriman @default(ditugaskan)
  foto_bukti_url    String?          @db.Text
  alasan_retur      String?          @db.Text
  tanggal_penugasan DateTime         @default(now()) @db.Timestamptz(6)
  tanggal_terima    DateTime?        @db.Timestamptz(6)
  updated_at        DateTime         @updatedAt @db.Timestamptz(6) // PRD 7.3 S3

  transaksi       Transaksi        @relation(fields: [transaksi_id], references: [id_transaksi], onDelete: Restrict)
  pengirim        Pengguna         @relation(fields: [pengirim_id], references: [id_pengguna], onDelete: Restrict)
  laporan_kendala LaporanKendala[]

  @@index([pengirim_id, status])
  @@index([tanggal_penugasan])
  @@map("pengiriman")
}

model LaporanKendala {
  id_laporan    String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  pengiriman_id String       @db.Uuid
  jenis_kendala JenisKendala
  deskripsi     String       @db.Text
  created_at    DateTime     @default(now()) @db.Timestamptz(6)

  pengiriman Pengiriman @relation(fields: [pengiriman_id], references: [id_pengiriman], onDelete: Restrict)

  @@index([pengiriman_id])
  @@map("laporan_kendala")
}
```

---

## 15. Riwayat Perubahan

| Versi | Tanggal | Ringkasan Perubahan & Alasan |
|-------|---------|------------------------------|
| **1.0** | 2 November 2026 | Dokumen PRD awal berdasarkan ekstraksi diagram draw.io `CV_kurnia_mandiri` (Activity Diagram As-Is & To-Be, Class Diagram, Use Case, Struktur Navigasi) dengan asumsi awal stack monolitik PHP. |
| **1.1** | 2 November 2026 | **Penyesuaian Stack Teknologi & Batasan Cakupan Final (D1–D20):**<br>1. **Tech Stack (Bagian 0, 3, 5.4, 12):** Mengganti seluruh spesifikasi stack lama menjadi **Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui**, **Server Actions + Route Handlers**, **Supabase PostgreSQL 17.x + Supabase Auth + Supabase Storage**, serta **Prisma ORM**.<br>2. **Penegasan Cakupan (Bagian 1.3, 8.6, 8.7, 8.10, 11):** Menegaskan target *single store* tanpa cabang/multi-gudang (D1), tanpa master supplier/PO dengan `mutasi_barang.supplier` tetap sebagai teks bebas dan `rencana_restok` sebagai rencana internal (D2), serta tanpa utang usaha ke supplier namun tetap mencakup kasbon/piutang pelanggan secara penuh (D3).<br>3. **Autentikasi & Otorisasi (Bagian 3, 7, 8.1, 8.13, 10.1):** Pemetaan login `username` ke `<username>@kurnia.local` (D4), penyamaan `pengguna.id_pengguna` dengan `auth.users.id` dan penghapusan kolom `password` dari tabel `pengguna` (D5/S6), kewajiban helper `requireRole([...])` di server (D6), penggunaan Supabase Admin API untuk manajemen akun (D7), dan *rate limit* login (D8).<br>4. **Database, Prisma & Storage (Bagian 3, 7, 8, 9, 10, Lampiran A):** Penambahan draf lengkap `prisma/schema.prisma` (D9), konfigurasi `DATABASE_URL` & `DIRECT_URL` (D10), penguncian baris stok via `prisma.$transaction` + `$queryRaw` `SELECT ... FOR UPDATE` (D11), kebijakan **RLS deny-all** di schema `public` (D12), seeder `prisma/seed.ts` (D13), constraint SQL manual (D14), dan penyimpanan foto bukti di bucket Supabase Storage privat dengan *signed URL* (D15/S7).<br>5. **Outbox, Webhook, Enkripsi & Pengujian (Bagian 3, 8.14–8.16, 10.6, 13):** Pola outbox pada tabel `notifikasi` dengan `after()` Next.js + Route Handler `/api/cron/notifikasi` (D16), webhook Payment Gateway sebagai Route Handler `/api/webhook/gateway` (D17), enkripsi `kunci_api` dengan AES-256-GCM (D18), penetapan library standar Zod/React Hook Form/TanStack Table/`exceljs`/`bwip-js` (D19), pengujian Vitest + Playwright (D20), serta pembaruan daftar pertanyaan terbuka di Bagian 13. |
| **1.2** | 2 November 2026 | **Konfirmasi Keputusan Teknis Bagian 13 (Q1–Q5):**<br>1. **Hosting (Q1 — Terjawab):** Menetapkan **Vercel** sebagai target deployment.<br>2. **Penyedia WhatsApp (Q2 — Ditunda):** Ditandai *Ditunda*; menggunakan antarmuka `NotifikasiChannel` dengan implementasi *stub/log* sementara dan Email sebagai saluran utama.<br>3. **Pemicu Cron Outbox Notifikasi (Q3 — Terjawab):** Menetapkan penggunaan **Supabase `pg_cron` + `pg_net`** untuk memanggil `/api/cron/notifikasi` (tidak bergantung pada Vercel Cron).<br>4. **Domain Email Sintetis Login (Q4 — Terjawab):** Menetapkan `@kurnia.local` (`<username>@kurnia.local`) sebagai default.<br>5. **Enum Database (Q5 — Terjawab):** Menetapkan penggunaan **native `enum` Prisma** sesuai Lampiran A. |
| **1.3** | 10 November 2026 | **Implementasi Penuh Aplikasi POS (Fase 0–9) & Penyesuaian Kebutuhan Operasional Toko:**<br>1. **Sinkronisasi Katalog Excel & Mutasi Gudang:** Menambahkan 130 barang asli CV Kurnia Mandiri (`A001–A088` dari *Daftar Harga Nov 2026* & `B001–B042` dari *Laporan Stok Jan 2026*) beserta kolom `merk`, `harga_beli` (Harga Modal), `stok_awal`, `keterangan` pada `barang`, dan `stok_sebelum`, `stok_sesudah`, `harga_satuan`, `total_harga`, `keterangan` pada `detail_mutasi_barang`.<br>2. **Fitur Harga Nego / Tawar dengan Batas Harga Modal:** Menambahkan kolom `harga_modal`, `harga_asli`, dan `harga_nego` pada `detail_transaksi` beserta constraint PostgreSQL `chk_harga_nego_diatas_modal` (`harga_nego IS NULL OR harga_nego >= harga_modal`) serta validasi real-time di keranjang POS.<br>3. **Kamera & Upload Foto Bukti Penerimaan:** Menambahkan fitur tangkap foto langsung dari kamera (*WebRTC / mobile camera capture*) dan upload file perangkat (`JPG/PNG/WebP` terkompresi) pada modul `pengiriman` beserta kolom `nama_penerima_aktual`, `foto_bukti_nama`, dan `foto_bukti_mime`.<br>4. **Integrasi Midtrans Snap Sandbox & Outbox Email Resend:** Mengaktifkan pembayaran QRIS/Virtual Account via Midtrans Snap Popup (`/api/payment/create-transaction` & `/api/webhook/gateway`) serta pengiriman email notifikasi outbox via Resend (`/api/cron/notifikasi`) ke `muhamadirfan.mi966@gmail.com`. |
