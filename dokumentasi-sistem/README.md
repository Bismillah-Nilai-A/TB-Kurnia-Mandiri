# Dokumentasi Sistem, Arsitektur & Riwayat Perubahan POS CV Kurnia Mandiri

Folder ini (`dokumentasi-sistem/`) berisi dokumentasi teknis arsitektur kode, standar antarmuka (UI/UX), serta catatan seluruh perubahan file pada sistem **Point of Sale (POS) & Persediaan CV Kurnia Mandiri**. Dokumentasi ini menjadi acuan wajib bagi seluruh anggota tim agar struktur proyek tetap rapi, modular, dan mudah dipelihara.

## Aturan Utama Struktur Folder Proyek

1. **Folder `app/` Khusus Routing Next.js & Endpoint API**:
   - **DILARANG** menaruh file komponen *frontend*, *custom hook* (`use-*.ts`), atau layanan data modul (`layanan-*.ts`) di dalam folder `app/`.
   - Folder `app/` hanya berisi file *entry point* Next.js App Router (`page.tsx` 5 baris, `layout.tsx`, `not-found.tsx`, `globals.css`) dan *route handler* backend (`app/api/**/route.ts`).
2. **Folder `components/` untuk Seluruh Kode Frontend Modular**:
   - `components/ui/`: Komponen UI dasar (`PageHeader`, `CustomSelect`, `ResponsiveTabs`, `StatusBadge`, `Card`, `Button`, `Input`, `SearchField`, dll.).
   - `components/layout/`: Komponen kerangka halaman utama (`ProtectedLayoutView.tsx`, `SidebarUtama.tsx`, `HeaderUtama.tsx`, `NotFoundView.tsx`, dan `layanan-layout.ts`).
   - `components/<modul>/`: Setiap fitur halaman (`login`, `dashboard`, `barang`, `transaksi`, `piutang`, `pengiriman`, `laporan`, `pengaturan`) dipisahkan secara modular menjadi:
     - `layanan-*.ts` (Tipe data, *fallback*, fungsi pembantu, dan *query/mutasi* Supabase)
     - `use-*.ts` (*Custom hook* state, filter, kalkulasi nilai, dan *event handler*)
     - `komponen/*.tsx` (Sub-komponen tabel, panel, kartu POS, dan modal)
     - `*Page.tsx` (Komponen tampilan utama fitur yang diimpor oleh `app/.../page.tsx`)
3. **Folder `lib/` untuk Pustaka Inti & Integrasi**:
   - Koneksi Supabase, Prisma ORM, Midtrans Payment Gateway, Resend Email, RBAC, dan utilitas global.

## Daftar Dokumen di Folder Ini

1. [**01 - Panduan Gaya, Warna, Tipografi & Tema**](./01-panduan-gaya-dan-tema.md)
   - Palet warna inti (Mode Terang & Mode Gelap).
   - Skala tipografi `Plus Jakarta Sans` dan fitur pengubah ukuran teks (`Kecil`, `Sedang`, `Besar`).
   - Prinsip desain utama (kontras, satu tombol biru primer per layar, lencana status).
2. [**02 - Komponen UI Standar & Cara Pakai**](./02-komponen-ui-standar.md)
   - Panduan kode untuk `PageHeader` (Breadcrumb), `StatusBadge`, `CustomSelect` (pengganti `<select>` bawaan browser), `ResponsiveTabs` (bar filter yang otomatis menjadi dropdown di layar kecil), `Card`, dan `Button`.
3. [**03 - Arsitektur Layout, Sidebar & Header**](./03-tata-letak-dan-navigasi.md)
   - Cara kerja sidebar *collapsible* dengan animasi halus, sub-menu *dropdown* bergaris indikator, pencarian global di header, notifikasi database dengan tombol ceklis baca, dan menu pengaturan tampilan.
4. [**04 - Arsitektur Modular, Daftar Perubahan File & Checklist Programmer**](./04-daftar-perubahan-file.md)
   - Dokumentasi pemisahan `app/` dan `components/`, rincian setiap file yang dibuat/diperbarui beserta jumlah barisnya, serta *checklist* wajib sebelum melakukan *commit*.
5. [**05 - Pembaruan Date Picker Kustom, Tombol Unduh CSV, Dropdown Mobile, Label Status & Paginasi Tabel**](./05-pembaruan-responsif-datepicker-dan-paginasi.md)
   - Dokumentasi pembuatan `CustomDatePicker` dan `TablePagination`, perbaikan tata letak tombol unduh CSV di mobile/tablet/iPad, perataan kanan *dropdown* header di layar 4-7 inci, penyeragaman ukuran `StatusBadge`, perbaikan *overflow* tabel restok di `/barang`, serta penambahan paginasi di `/barang`, `/laporan`, `/piutang`, dan `/pengiriman`.
6. [**06 - Perbaikan Input Lompat Halaman, Arah Dropdown Paginasi & Responsivitas Kartu Laporan Desktop**](./06-perbaikan-paginasi-lompat-halaman-dan-responsif-laporan.md)
   - Dokumentasi penambahan input lompat halaman (`Ke hal:`) saat data lebih dari 100 baris, perubahan arah buka *dropdown* paginasi ke atas (`placement="top"`), serta perbaikan tata letak kartu filter & tombol CSV di `/laporan` agar tidak keluar dari batas kartu pada layar desktop.
7. [**07 - Penyeragaman Panjang Label Status (`Lunas` & `Belum Lunas`)**](./07-penyeragaman-panjang-label-status-badge.md)
   - Dokumentasi penyesuaian lebar minimum `StatusBadge` ke `min-w-[9.25rem]` berbasis satuan relatif `rem` agar kapsul `Lunas` dan `Belum Lunas` memiliki panjang yang sama persis di setiap skala ukuran teks.
8. [**08 - Desain Halaman Login Split-Screen dengan Foto Tim 5**](./08-desain-halaman-login-split-screen.md)
   - Dokumentasi perombakan halaman `/login` menjadi tata letak 2 panel (*split-screen*) menggunakan foto `public/HalamanLogin/Team5.jpeg`, tab pemilih peran menyatu (`Login Pemilik`, `Login Kasir`, `Login Pengirim`), input berikon dengan tombol lihat *password*, serta tombol Mode Terang/Gelap di bagian bawah.

9. [**09 - Pembaruan Halaman Login Mengikuti DESIGN.md, Anti-Slop, dan Stop-Slop**](./09-pembaruan-login-anti-slop-design-md.md)
   - Penyesuaian desain `/login` agar konsisten dengan kanvas `.km-card` & wordmark `Kurnia Mandiri.` di `DESIGN.md`, memosisikan form sebagai fokus utama (termasuk `<h1>` di tampilan seluler `320px`), menampilkan foto `Team5.jpeg` rasio `16:9` utuh di atas panel informasi solid `#0F172A` tanpa efek kaca/lencana dekoratif, serta memenuhi kontras WCAG AA & fokus papan ketik di Mode Terang maupun Gelap.

10. [**10 - Pemangkasan Teks Slop Halaman Login dan Perbaikan `fetchPriority`**](./10-perbaikan-login-bebas-teks-slop-dan-fetchpriority.md)
    - Mengganti properti DOM `fetchpriority` menjadi `fetchPriority="high"` agar bebas galat konsol Next.js 15 / React 18, serta memangkas seluruh teks deskriptif berlebih pada panel form maupun bawah foto `Team5.jpeg` sehingga halaman login lebih ringkas dan bebas AI slop.

11. [**11 - Perbaikan Kontras Hover Mode Gelap Global & Garis Putih Sidebar Biru/Gelap**](./11-perbaikan-tema-gelap-hover-dan-garis-sidebar.md)
    - Memindahkan `* { border-color: var(--border); }` ke `@layer base`, melengkapi *override* Mode Gelap (`data-skin="dark"`) untuk semua kelas *hover*, teks, badge pastel, dan batas di seluruh halaman, menyempurnakan Mode Gelap `/login`, serta menghilangkan garis putih pada Sidebar tema Biru dan Gelap.

12. [**12 - Penggantian Akun Peran Dummy dengan Data Asli Database**](./12-pengambilan-akun-peran-dari-database.md)
    - Menghapus objek dummy `ROLE_ACCOUNTS` dan fallback statis di `lib/supabase.ts`, menggantinya dengan query langsung ke tabel `pengguna` Supabase (`muatDaftarAkunPeranSupabase` dan `cariAkunAktifPeranSupabase`) beserta sinkronisasi profil sesi otomatis saat memuat halaman.

13. [**13 - Panduan Branch, Pemisahan Commit per Folder, dan Format Pesan Commit**](./13-panduan-branch-dan-commit-git.md)
    - Mencatat aturan branch, pengelompokan commit/push per folder, pemisahan folder `dokumentasi-sistem/` (proyek utama) dengan `dokumentasi-wireframe/` (wireframe & prototype), serta daftar 10 tipe pesan commit berbahasa Indonesia (`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`) untuk tim.

> **Catatan Dokumentasi Wireframe**: Seluruh dokumentasi terkait pembuatan dan revisi wireframe serta interactive prototype dipisahkan ke dalam folder tersendiri di [`../dokumentasi-wireframe/`](../dokumentasi-wireframe/README.md).

14. [**14 - Revisi Skema Database Sesuai Class Diagram, Use Case & Activity Diagram Terbaru (Penghapusan Field Double)**](./14-revisi-database-class-diagram-terbaru.md)
    - Dokumentasi pembersihan seluruh kolom ganda (*duplicate fields*) pada `barang`, `rencana_restok`, `detail_transaksi`, `mutasi_barang`, `detail_mutasi_barang`, dan `pengiriman`, penghapusan tabel usang (`stok`, `pengaturan_sistem`), serta penambahan tabel baru sesuai Class Diagram (`satuan_barang`, `pemasok`, `tagihan_pemasok`, `pembayaran_pemasok`, `penukaran`, `detail_penukaran`).

## Batasan Logika Bisnis yang Dijaga 100%

Seluruh pembaruan arsitektur modular dan desain antarmuka menjaga 100% keutuhan:
- Skema database (`prisma/schema.prisma` dan `supabase_schema.sql`).
- Logika transaksi, perhitungan harga nego, batas kasbon, dan mutasi stok.
- Endpoint API (`/api/payment/create-transaction`, `/api/webhook/gateway`, `/api/cron/notifikasi`).
- Alur autentikasi dan pembagian hak akses peran (`admin`, `kasir`, `pengirim`).
