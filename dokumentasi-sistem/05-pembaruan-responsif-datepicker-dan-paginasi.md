# 05 - Pembaruan Date Picker Kustom, Tombol Unduh CSV, Dropdown Mobile, Label Status & Paginasi Tabel

Dokumen ini mencatat perbaikan antarmuka, responsivitas layar kecil (4-7 inci, tablet, dan iPad), serta penambahan komponen baru pada sistem **POS & Persediaan CV Kurnia Mandiri**.

---

## 1. Komponen Baru di `components/ui/`

### A. `CustomDatePicker` ([`components/ui/custom-date-picker.tsx`](../components/ui/custom-date-picker.tsx))
Menggantikan `<Input type="date" />` bawaan browser pada halaman `/laporan`:
- Tombol pemicu setinggi `44px` (`h-11`) dengan lencana ikon kalender biru, tanggal format Bahasa Indonesia (`01 Jan 2026`), dan panah indikator yang berputar saat terbuka.
- Panel kalender melayang (*popover*) dengan navigasi bulan dan tahun berbahasa Indonesia (`Januari` hingga `Desember`), grid 7 hari (`Sen` hingga `Min`), penanda hari aktif berwarna biru primer (`#2563EB`), serta tiga tombol pintasan cepat di bagian bawah: **Awal Tahun**, **Awal Bulan**, dan **Hari Ini**.
- Pada layar ponsel (`< 640px`), panel kalender diposisikan terpusat (`fixed inset-x-3`) agar tidak terpotong tepi layar.

### B. `TablePagination` ([`components/ui/table-pagination.tsx`](../components/ui/table-pagination.tsx))
Komponen paginasi responsif untuk tabel berdata besar:
- Menampilkan rentang baris aktif (`Menampilkan 1-10 dari 131 barang`) beserta *dropdown* `<CustomSelect>` untuk memilih jumlah baris per halaman (`10 / hal`, `25 / hal`, `50 / hal`).
- **Tampilan Mobile (`< 640px`)**: Menampilkan tombol `Sebelumnya`, indikator ringkas `Hal 1 / 14`, dan tombol `Berikutnya` dalam satu baris yang rapi.
- **Tampilan Tablet & Desktop (`>= 640px`)**: Menampilkan deretan nomor halaman (`1`, `2`, `3`, `...`, `14`) dengan halaman aktif berwarna biru primer (`#2563EB`).

---

## 2. Perbaikan Halaman Laporan (`/laporan`)

File yang diperbarui:
- [`components/laporan/LaporanPage.tsx`](../components/laporan/LaporanPage.tsx)
- [`components/laporan/komponen/TabelPratinjauLaporan.tsx`](../components/laporan/komponen/TabelPratinjauLaporan.tsx)

Rincian perubahan:
1. **Input Tanggal**: Menggunakan `<CustomDatePicker />` untuk filter *Dari Tanggal* dan *Sampai Tanggal*.
2. **Tombol Unduh CSV Anti-Terbelah Dua Baris**:
   - Pada layar mobile, tablet, dan iPad (`< 1280px`), keempat tombol CSV digabung ke dalam satu tombol menu **`Unduh Laporan CSV`** setinggi `44px` yang membuka daftar pilihan format CSV lengkap dengan ikon, nama laporan, dan jumlah baris data. Tombol tidak lagi terbelah menjadi dua baris yang timpang.
   - Pada layar desktop lebar (`>= 1280px`), keempat tombol (`CSV Stok`, `CSV Mutasi`, `CSV Penjualan`, `CSV Piutang`) tampil dalam satu baris horizontal utuh (`flex-nowrap`) dengan kotak ikon biru muda (`bg-[#EFF6FF]`) yang berubah warna saat disentuh kursor.
3. **Konsistensi Label & Ukuran Teks pada Tabel Rekapitulasi Penjualan**:
   - Komponen [`components/ui/status-badge.tsx`](../components/ui/status-badge.tsx) kini memiliki lebar minimum seragam (`min-w-[116px] justify-center`) dan ukuran huruf `text-xs` yang selaras dengan sel tabel, sehingga lencana `Lunas` dan `Belum Lunas` memiliki ukuran kotak dan tinggi yang sama persis.
   - Nomor nota (`INV-...`) tidak lagi memakai font *monospace* yang tampak lebih kecil dari nama pelanggan, melainkan memakai `Plus Jakarta Sans` tebal (`font-bold text-blue-600`).
4. **Paginasi 4 Tabel Pratinjau Laporan**:
   - Ditambahkan `<TablePagination />` pada tab *Penjualan*, *Stok & Harga*, *Keluar Masuk*, dan *Kasbon*.

---

## 3. Perbaikan Posisi Dropdown Header pada Layar Mobile 4-7 Inci

File yang diperbarui:
- [`components/layout/HeaderUtama.tsx`](../components/layout/HeaderUtama.tsx)

Rincian perubahan:
- Sebelumnya, panel `.dropdown-skin` (Pengaturan Tampilan) dan `.dropdown-notification` (Notifikasi) menggunakan `absolute right-0` terhadap masing-masing ikonnya, sehingga pada layar ponsel 4-7 inci panel terdorong terlalu jauh ke tepi kiri layar.
- Kini pada layar mobile (`< 640px`), panel Pengaturan Tampilan menggunakan `fixed right-3 top-[76px] w-[min(276px,calc(100vw-24px))]` dan panel Notifikasi menggunakan `fixed right-3 left-3 top-[76px] ml-auto max-w-[360px]`, sehingga keduanya rata kanan tepat di bawah deretan ikon header dengan jarak tepi kanan `12px` yang proporsional.
- Label `5 belum dibaca` dan tombol `Baca Semua` di kepala dropdown notifikasi diberi `whitespace-nowrap` agar tetap satu baris.

---

## 4. Perbaikan Responsivitas Halaman Barang (`/barang`)

File yang diperbarui:
- [`components/barang/BarangPage.tsx`](../components/barang/BarangPage.tsx)
- [`components/barang/komponen/TabelKatalogBarang.tsx`](../components/barang/komponen/TabelKatalogBarang.tsx)
- [`components/barang/komponen/TabelMutasiBarang.tsx`](../components/barang/komponen/TabelMutasiBarang.tsx)
- [`components/barang/komponen/PanelRestokBarang.tsx`](../components/barang/komponen/PanelRestokBarang.tsx)
- [`components/barang/komponen/ModalBarang.tsx`](../components/barang/komponen/ModalBarang.tsx)

Rincian perubahan:
1. **Tab Stok Menipis & Rencana Restok (`PanelRestokBarang.tsx`)**:
   - Mengubah grid dua kartu dari `lg:grid-cols-2` menjadi `xl:grid-cols-2` agar pada layar tablet/iPad (`< 1280px`) kedua tabel tampil penuh satu kolom dari kiri ke kanan.
   - Membungkus kedua tabel (`Daftar Barang Stok Menipis` dan `Daftar Rencana Restok Internal`) dengan `<div className="overflow-x-auto">` sehingga kolom `Status Restok` dan `Catatan Target` tidak pernah keluar menembus batas kanan kartu.
2. **Bar Filter Katalog (`TabelKatalogBarang.tsx`)**:
   - Menggunakan CSS Grid responsif (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_220px_auto]`) sehingga kolom pencarian, dropdown kategori, dan tombol filter stok tersusun rata penuh di layar ponsel maupun tablet.
3. **Form Modal (`ModalBarang.tsx`)**:
   - Input bersebelahan diubah menjadi `grid-cols-1 sm:grid-cols-2` dan `grid-cols-1 sm:grid-cols-3` agar nyaman diisi pada layar ponsel 4-7 inci.
4. **Paginasi di Seluruh Tabel `/barang`**:
   - Ditambahkan `<TablePagination />` pada tabel *Katalog Barang*, *Riwayat Barang Masuk & Keluar*, *Daftar Barang Stok Menipis*, dan *Daftar Rencana Restok Internal*.

---

## 5. Penambahan Paginasi pada Halaman Piutang (`/piutang`) & Pengiriman (`/pengiriman`)

File yang diperbarui:
- [`components/piutang/komponen/TabelTagihanPiutang.tsx`](../components/piutang/komponen/TabelTagihanPiutang.tsx): Paginasi pada tabel *Tagihan Belum Lunas* dan tabel *Persetujuan Kasbon*.
- [`components/piutang/komponen/TabelDataPelanggan.tsx`](../components/piutang/komponen/TabelDataPelanggan.tsx): Paginasi pada tabel *Data Pelanggan* yang terintegrasi dengan pencarian pelanggan.
- [`components/pengiriman/komponen/TabelPengiriman.tsx`](../components/pengiriman/komponen/TabelPengiriman.tsx): Paginasi pada tabel *Daftar Pengiriman* dan tabel *Laporan Kendala*.
