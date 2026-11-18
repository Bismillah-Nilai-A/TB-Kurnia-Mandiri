# 04 - Arsitektur Modular, Daftar Perubahan File & Checklist Programmer

Dokumen ini mencatat seluruh perubahan arsitektur kode, pemisahan folder `app/` dari file *frontend*, pemecahan halaman (*modular refactoring*) ke dalam `components/`, serta daftar periksa (*checklist*) bagi anggota tim yang melanjutkan pekerjaan.

---

## 1. Pemisahan Folder `app/` dan `components/` (Perubahan Terbaru)

Untuk menjaga kebersihan arsitektur **Next.js App Router**, folder `app/` kini **bebas dari file implementasi frontend**:
- Folder `app/` **hanya** menyimpan file *routing* Next.js (`page.tsx` masing-masing 5 baris, `layout.tsx`, `not-found.tsx`, `globals.css`) dan *endpoint* backend (`app/api/**/route.ts`).
- Seluruh file tampilan halaman (`*Page.tsx`), sub-komponen (`komponen/*.tsx`), *custom hooks* (`use-*.ts`), dan layanan data halaman (`layanan-*.ts`) telah dipindahkan ke dalam folder **`components/<nama-modul>/`**.
- Nama folder dokumentasi juga telah disesuaikan dari `dokumentasi-desain/` menjadi **`dokumentasi-sistem/`** agar mencakup dokumentasi sistem, arsitektur kode, desain UI/UX, dan riwayat perubahan proyek secara menyeluruh.

### Struktur File di Dalam `app/` (Hanya Routing & API)

| File di `app/` | Jumlah Baris | Peran |
|---|---:|---|
| [`app/globals.css`](../app/globals.css) | 323 | Variabel tema warna Terang/Gelap, skala ukuran teks, dan kelas utilitas global |
| [`app/layout.tsx`](../app/layout.tsx) | 26 | Root layout Next.js & konfigurasi font `Plus Jakarta Sans` |
| [`app/page.tsx`](../app/page.tsx) | 6 | Redirect halaman utama (`/`) ke `/dashboard` |
| [`app/not-found.tsx`](../app/not-found.tsx) | 5 | Entry point 404 yang merender `<NotFoundView />` dari `components/layout/` |
| [`app/(auth)/layout.tsx`](../app/(auth)/layout.tsx) | 5 | Wrapper layout halaman autentikasi |
| [`app/(auth)/login/page.tsx`](../app/(auth)/login/page.tsx) | 5 | Entry point `/login` yang merender `<LoginPage />` |
| [`app/(dashboard)/(protected)/layout.tsx`](../app/(dashboard)/(protected)/layout.tsx) | 9 | Entry point layout dashboard yang merender `<ProtectedLayoutView />` |
| [`app/(dashboard)/(protected)/dashboard/page.tsx`](../app/(dashboard)/(protected)/dashboard/page.tsx) | 5 | Entry point `/dashboard` yang merender `<DashboardPage />` |
| [`app/(dashboard)/(protected)/barang/page.tsx`](../app/(dashboard)/(protected)/barang/page.tsx) | 5 | Entry point `/barang` yang merender `<BarangPage />` |
| [`app/(dashboard)/(protected)/transaksi/page.tsx`](../app/(dashboard)/(protected)/transaksi/page.tsx) | 5 | Entry point `/transaksi` yang merender `<TransaksiPage />` |
| [`app/(dashboard)/(protected)/piutang/page.tsx`](../app/(dashboard)/(protected)/piutang/page.tsx) | 5 | Entry point `/piutang` yang merender `<PiutangPage />` |
| [`app/(dashboard)/(protected)/pengiriman/page.tsx`](../app/(dashboard)/(protected)/pengiriman/page.tsx) | 5 | Entry point `/pengiriman` yang merender `<PengirimanPage />` |
| [`app/(dashboard)/(protected)/laporan/page.tsx`](../app/(dashboard)/(protected)/laporan/page.tsx) | 5 | Entry point `/laporan` yang merender `<LaporanPage />` |
| [`app/(dashboard)/(protected)/pengaturan/page.tsx`](../app/(dashboard)/(protected)/pengaturan/page.tsx) | 5 | Entry point `/pengaturan` yang merender `<PengaturanPage />` |
| [`app/api/cron/notifikasi/route.ts`](../app/api/cron/notifikasi/route.ts) | 75 | Endpoint API pengiriman outbox notifikasi email |
| [`app/api/payment/create-transaction/route.ts`](../app/api/payment/create-transaction/route.ts) | 108 | Endpoint API pembuatan token pembayaran Midtrans Snap |
| [`app/api/webhook/gateway/route.ts`](../app/api/webhook/gateway/route.ts) | 127 | Endpoint API webhook callback status pembayaran Midtrans |

---

## 2. Daftar Modul Frontend di Dalam `components/`

### A. Komponen UI Standar (`components/ui/`)
- [`components/ui/page-header.tsx`](../components/ui/page-header.tsx): Komponen kepala halaman dengan *breadcrumb* (`Kategori > Nama Halaman`), judul halaman, dan slot tombol aksi.
- [`components/ui/status-badge.tsx`](../components/ui/status-badge.tsx): Komponen lencana status terpadu (*warna + ikon + tulisan*).
- [`components/ui/custom-select.tsx`](../components/ui/custom-select.tsx): Komponen *dropdown select* kustom pengganti `<select>` bawaan browser.
- [`components/ui/custom-date-picker.tsx`](../components/ui/custom-date-picker.tsx): Komponen kalender pemilih tanggal kustom berbahasa Indonesia pengganti `<input type="date">` bawaan browser.
- [`components/ui/table-pagination.tsx`](../components/ui/table-pagination.tsx): Komponen paginasi tabel responsif (indikator halaman ringkas di mobile, nomor halaman dan pilihan jumlah baris per halaman di tablet/desktop).
- [`components/ui/responsive-tabs.tsx`](../components/ui/responsive-tabs.tsx): Komponen tab/filter yang tampil sebagai bar menyatu di desktop (`>= 1024px`) dan otomatis berubah menjadi *dropdown* `CustomSelect` di layar kecil (`< 1024px`).
- [`components/ui/card.tsx`](../components/ui/card.tsx): Kartu gaya Dashbyte (`.km-card`).
- [`components/ui/button.tsx`](../components/ui/button.tsx): Tombol dengan tinggi minimal 44px (`h-11`).
- [`components/ui/input.tsx`](../components/ui/input.tsx): Input dengan tinggi 44px (`h-11`).
- [`components/ui/nav-link.tsx`](../components/ui/nav-link.tsx): Tautan navigasi dengan penanda aktif garis kiri biru (`3px`).
- [`components/ui/index.tsx`](../components/ui/index.tsx): Ekspor terpusat seluruh komponen UI.

### B. Modul Tata Letak & Navigasi (`components/layout/`)
- [`components/layout/ProtectedLayoutView.tsx`](../components/layout/ProtectedLayoutView.tsx) (450 baris): State autentikasi RBAC, tema tampilan (`skinMode`, `sidebarSkin`, `textSize`), pencarian cepat header, dan kerangka utama dashboard.
- [`components/layout/SidebarUtama.tsx`](../components/layout/SidebarUtama.tsx) (255 baris): Sidebar Dashbyte *collapsible* dengan *dropdown* sub-menu dan panel akun di bagian bawah.
- [`components/layout/HeaderUtama.tsx`](../components/layout/HeaderUtama.tsx) (348 baris): Header dengan tombol `#menuSidebar`, pencarian cepat global, pengaturan tampilan, notifikasi database dengan ceklis baca, dan menu profil.
- [`components/layout/layanan-layout.ts`](../components/layout/layanan-layout.ts) (245 baris): Konfigurasi menu `NAV_GROUPS`, akun peran, serta query pencarian & notifikasi header ke Supabase.
- [`components/layout/NotFoundView.tsx`](../components/layout/NotFoundView.tsx) (23 baris): Tampilan halaman 404.

### C. Modul Login (`components/login/`)
- [`components/login/layanan-login.ts`](../components/login/layanan-login.ts) (77 baris): `QUICK_ROLES` dan fungsi `prosesLoginPengguna()` (verifikasi tabel `pengguna`, sinkronisasi sesi Supabase Auth, dan pencatatan `logAktivitas`).
- [`components/login/LoginPage.tsx`](../components/login/LoginPage.tsx) (134 baris): Tampilan form login dan tombol masuk cepat peran.

### D. Modul Dashboard (`components/dashboard/`)
- [`components/dashboard/layanan-dashboard.ts`](../components/dashboard/layanan-dashboard.ts) (111 baris): Tipe `TransactionRow`, data *fallback*, dan fungsi `muatDataDashboard()`.
- [`components/dashboard/DashboardPage.tsx`](../components/dashboard/DashboardPage.tsx) (166 baris): Tampilan `PageHeader`, 3 kartu ringkasan utama, dan tabel transaksi terakhir dengan `StatusBadge`.

### E. Modul Barang & Stok (`components/barang/`)
- [`components/barang/layanan-barang.ts`](../components/barang/layanan-barang.ts) (366 baris): Tipe data barang/mutasi/restok, fungsi `renderCode128SVG()`, serta fungsi query & mutasi Supabase.
- [`components/barang/use-barang.ts`](../components/barang/use-barang.ts) (290 baris): Custom hook `useBarang()` yang mengelola state tab, pencarian, filter kategori/stok, kalkulasi nilai modal/jual, dan handler CRUD barang/mutasi/restok.
- [`components/barang/komponen/TabelKatalogBarang.tsx`](../components/barang/komponen/TabelKatalogBarang.tsx) (191 baris): Bar pencarian + `CustomSelect` kategori + filter stok dan tabel katalog barang.
- [`components/barang/komponen/TabelMutasiBarang.tsx`](../components/barang/komponen/TabelMutasiBarang.tsx) (138 baris): Kartu dan tabel riwayat barang masuk & keluar.
- [`components/barang/komponen/PanelRestokBarang.tsx`](../components/barang/komponen/PanelRestokBarang.tsx) (178 baris): Panel 2 kolom daftar stok menipis dan rencana restok internal.
- [`components/barang/komponen/ModalBarang.tsx`](../components/barang/komponen/ModalBarang.tsx) (531 baris): Modal Tambah/Edit Barang, Modal Input Mutasi, Modal Rencana Restok, dan Modal Cetak Label Barcode Code 128.
- [`components/barang/BarangPage.tsx`](../components/barang/BarangPage.tsx) (236 baris): Komponen utama halaman Barang & Stok.

### F. Modul Transaksi Kasir POS (`components/transaksi/`)
- [`components/transaksi/layanan-transaksi.ts`](../components/transaksi/layanan-transaksi.ts) (367 baris): Tipe data POS, kalkulasi harga modal/nego, integrasi Midtrans `/api/payment/create-transaction`, dan penyimpanan transaksi ke Supabase.
- [`components/transaksi/use-transaksi.ts`](../components/transaksi/use-transaksi.ts) (350 baris): Custom hook `useTransaksi()` untuk operasi keranjang belanja, validasi batas nego, dan *checkout* tunai/non-tunai/kasbon.
- [`components/transaksi/komponen/KatalogPos.tsx`](../components/transaksi/komponen/KatalogPos.tsx) (121 baris): Kartu katalog pemilihan barang di sisi kiri POS.
- [`components/transaksi/komponen/KeranjangPos.tsx`](../components/transaksi/komponen/KeranjangPos.tsx) (349 baris): Kartu keranjang belanja, input negosiasi harga, pemilihan pelanggan (`CustomSelect`), metode pembayaran, dan tombol bayar di sisi kanan POS.
- [`components/transaksi/komponen/TabelRiwayatTransaksi.tsx`](../components/transaksi/komponen/TabelRiwayatTransaksi.tsx) (125 baris): Tampilan tab riwayat nota transaksi dengan `SearchField` dan `ResponsiveTabs`.
- [`components/transaksi/komponen/ModalStrukTransaksi.tsx`](../components/transaksi/komponen/ModalStrukTransaksi.tsx) (247 baris): Modal pembayaran Midtrans Snap dan modal cetak struk kasir *thermal* 80mm.
- [`components/transaksi/TransaksiPage.tsx`](../components/transaksi/TransaksiPage.tsx) (169 baris): Komponen utama halaman Transaksi Kasir.

### G. Modul Piutang & Pelanggan (`components/piutang/`)
- [`components/piutang/layanan-piutang.ts`](../components/piutang/layanan-piutang.ts) (285 baris): Tipe data tagihan/kasbon/pelanggan serta fungsi pelunasan cicilan, persetujuan/penolakan kasbon, dan CRUD pelanggan di Supabase.
- [`components/piutang/use-piutang.ts`](../components/piutang/use-piutang.ts) (249 baris): Custom hook `usePiutang()`.
- [`components/piutang/komponen/TabelTagihanPiutang.tsx`](../components/piutang/komponen/TabelTagihanPiutang.tsx) (188 baris): Tabel tagihan belum lunas dan tabel persetujuan kasbon.
- [`components/piutang/komponen/TabelDataPelanggan.tsx`](../components/piutang/komponen/TabelDataPelanggan.tsx) (104 baris): Pencarian dan tabel data pelanggan beserta batas kredit kasbon.
- [`components/piutang/komponen/ModalPiutangPelanggan.tsx`](../components/piutang/komponen/ModalPiutangPelanggan.tsx) (380 baris): Modal pembayaran cicilan piutang, modal tolak kasbon, dan modal tambah/ubah pelanggan.
- [`components/piutang/PiutangPage.tsx`](../components/piutang/PiutangPage.tsx) (195 baris): Komponen utama halaman Piutang & Pelanggan.

### H. Modul Pengiriman (`components/pengiriman/`)
- [`components/pengiriman/layanan-pengiriman.ts`](../components/pengiriman/layanan-pengiriman.ts) (302 baris): Tipe data pengiriman/kendala, kompresi foto bukti (`compressImageToDataUrl`), dan fungsi mutasi status pengiriman di Supabase.
- [`components/pengiriman/use-pengiriman.ts`](../components/pengiriman/use-pengiriman.ts) (321 baris): Custom hook `usePengiriman()` termasuk pengelolaan kamera WebRTC dan unggah foto bukti.
- [`components/pengiriman/komponen/TabelPengiriman.tsx`](../components/pengiriman/komponen/TabelPengiriman.tsx) (280 baris): Tabel daftar penugasan pengiriman dan tabel laporan kendala lapangan.
- [`components/pengiriman/komponen/ModalPengiriman.tsx`](../components/pengiriman/komponen/ModalPengiriman.tsx) (491 baris): Modal buat penugasan pengiriman, modal konfirmasi/kamera bukti serah terima, dan modal pratinjau foto.
- [`components/pengiriman/PengirimanPage.tsx`](../components/pengiriman/PengirimanPage.tsx) (189 baris): Komponen utama halaman Pengiriman.

### I. Modul Laporan (`components/laporan/`)
- [`components/laporan/layanan-laporan.ts`](../components/laporan/layanan-laporan.ts) (122 baris): Tipe `ReportSummary`, pembantu unduh CSV Excel (`downloadExcelCSV`), dan query rekap laporan ke Supabase.
- [`components/laporan/use-laporan.ts`](../components/laporan/use-laporan.ts) (194 baris): Custom hook `useLaporan()` untuk filter rentang tanggal dan ekspor CSV 4 jenis laporan.
- [`components/laporan/komponen/TabelPratinjauLaporan.tsx`](../components/laporan/komponen/TabelPratinjauLaporan.tsx) (224 baris): Kartu pratinjau dan 4 tabel laporan (`penjualan`, `stok`, `mutasi`, `piutang`).
- [`components/laporan/LaporanPage.tsx`](../components/laporan/LaporanPage.tsx) (144 baris): Komponen utama halaman Laporan.

### J. Modul Pengaturan (`components/pengaturan/`)
- [`components/pengaturan/layanan-pengaturan.ts`](../components/pengaturan/layanan-pengaturan.ts) (193 baris): Tipe pengguna/log/notifikasi serta fungsi manajemen akun staf, audit log, dan pemicu outbox notifikasi.
- [`components/pengaturan/use-pengaturan.ts`](../components/pengaturan/use-pengaturan.ts) (234 baris): Custom hook `usePengaturan()`.
- [`components/pengaturan/komponen/FormSistemGateway.tsx`](../components/pengaturan/komponen/FormSistemGateway.tsx) (153 baris): Kartu pengaturan notifikasi toko dan *Payment Gateway* Midtrans.
- [`components/pengaturan/komponen/TabelPenggunaLogNotif.tsx`](../components/pengaturan/komponen/TabelPenggunaLogNotif.tsx) (344 baris): Tabel daftar pengguna (RBAC), tabel log aktivitas, tabel riwayat pengiriman notifikasi, dan modal tambah pengguna.
- [`components/pengaturan/PengaturanPage.tsx`](../components/pengaturan/PengaturanPage.tsx) (141 baris): Komponen utama halaman Pengaturan.

---

## 3. Checklist Wajib bagi Programmer Saat Menambah / Mengubah Fitur

Sebelum melakukan *commit* atau menyerahkan perubahan, pastikan seluruh poin berikut terpenuhi:

- [ ] **Tidak ada file frontend di dalam `app/`**: File `page.tsx` di dalam `app/` hanya boleh berisi 5-10 baris yang mengimpor komponen `*Page.tsx` dari `components/<modul>/`.
- [ ] **Setiap perubahan dicatat di `dokumentasi-sistem/`**: Setiap penambahan/perubahan file atau arsitektur wajib diperbarui di [`dokumentasi-sistem/04-daftar-perubahan-file.md`](./04-daftar-perubahan-file.md).
- [ ] **Breadcrumb tersedia**: Halaman memiliki `<PageHeader crumbs={[...]} title="..." />` di bagian paling atas.
- [ ] **Tidak ada `<select>` HTML biasa**: Semua *dropdown* menggunakan `<CustomSelect>` dari `@/components/ui`.
- [ ] **Tab/Filter memakai `<ResponsiveTabs>`**: Semua bar tab atau filter multi-opsi menggunakan `<ResponsiveTabs>` agar di layar HP/tablet otomatis menjadi *dropdown*.
- [ ] **Status memakai `<StatusBadge>`**: Tidak ada status yang hanya menggunakan warna atau teks polos tanpa ikon.
- [ ] **Satu tombol utama biru per layar**: Hanya CTA utama yang memakai `<Button>` biru primer; tombol lainnya memakai `variant="secondary"` atau `variant="outline"`.
- [ ] **Bebas catatan teknis & *AI Slop***: Tidak ada kode spesifikasi (`SET-02`, `D18`, `transaksi_id`), tidak ada kotak catatan/info yang menumpuk, dan tidak ada karakter *em-dash*.
- [ ] **Lolos uji tipe TypeScript**: Jalankan `npx tsc --noEmit` untuk memastikan tidak ada *error* tipe data (jangan menjalankan `npx next build` bersamaan saat `npm run dev` sedang aktif).
