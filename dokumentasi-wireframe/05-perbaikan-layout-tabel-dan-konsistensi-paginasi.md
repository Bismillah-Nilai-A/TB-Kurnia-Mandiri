# 05 - Perbaikan Tata Letak Tabel Lebar Penuh, Penghapusan Paginasi Katalog POS, & Konsistensi TablePagination

Dokumen ini mencatat pembaruan pada **Low-Fidelity Grayscale Wireframe & Interactive Prototype** di dalam folder `wireframe/` untuk merapikan tata letak tabel di **Dashboard (`Ringkasan Hari Ini`)** dan **Stok Minimum & Perencanaan Restok**, menghapus paginasi dari **Katalog Transaksi Kasir (POS)**, menyeragamkan komponen **`TablePagination`** di halaman **Penukaran Barang** dan tabel lainnya sesuai spesifikasi di `dokumentasi-sistem/05` dan `06`, serta menghapus item `Pengaturan Akun` dari dropdown profil di Header.

---

## 1. Rincian Perbaikan

### A. Penghapusan Paginasi pada Katalog Transaksi Kasir (POS) (`wireframe/js/pages-transaksi-kasbon.js` & `wireframe/css/wireframe.css`)
- Menghapus bar paginasi dari kotak kiri (**Pilih Barang**) pada halaman **Transaksi Kasir (POS)** agar sesuai dengan `components/transaksi/komponen/KatalogPos.tsx` pada proyek utama.
- Daftar barang di dalam kotak kiri kini ditampilkan di dalam wadah *scrollable* (`.wf-pos-catalog-scroll` dengan `max-height: 580px; overflow-y: auto;`), sedangkan `.wf-grid-pos` tetap menjaga `align-items: stretch` sehingga tinggi kotak kiri dan kotak kanan (`Keranjang Belanja`) tetap sejajar.

### B. Penataan Ulang Halaman `Stok Minimum & Perencanaan Restok` agar Tabel Tidak Sempit (`wireframe/js/pages-stok-pemasok.js` & `wireframe/css/wireframe.css`)
- **Masalah sebelumnya**: Tabel `Batas Stok Minimum Barang` ditempatkan berdampingan 2 kolom (`.wf-grid-2`) dengan form `Buat Rencana Restok`, sehingga tabel hanya mendapat setengah lebar layar (`~50%`), teks nama barang terlipat menjadi 4 baris, muncul *horizontal scrollbar*, dan bar paginasi di bawahnya terpotong menjadi dua baris.
- **Solusi**:
  1. Mengubah tata letak halaman menjadi susunan lebar penuh (`.wf-stack` `100%`).
  2. Kartu **Buat Rencana Restok Barang** diletakkan di bagian atas dengan grid form horizontal 4 kolom di layar desktop (`.wf-restok-form-grid`: `Pilih Barang`, `Jumlah Rencana Restok`, `Pemasok Tujuan`, dan tombol `Simpan Rencana Restok`).
  3. Kartu tabel **Batas Stok Minimum Barang** dan **Daftar Rencana Restok Barang** masing-masing menggunakan lebar penuh (`100%`) lengkap dengan `TablePagination` satu baris yang rapi di bagian bawahnya.

### C. Penataan Ulang Tabel di Halaman `Ringkasan Hari Ini` (Dashboard) menjadi Lebar Penuh (`wireframe/js/pages-auth-dashboard.js`)
- **Masalah sebelumnya**: Tabel `Transaksi Terakhir` (6 kolom) dan `Barang Hampir Habis` (4 kolom) dibagi ke dalam 2 kolom bersebelahan (`.wf-grid-2`), sehingga tabel menyempit dan sulit dibaca.
- **Solusi**: Mengubah pembungkus kedua kartu tabel pada `renderDashboardPage()` dari `.wf-grid-2` menjadi `.wf-stack` (satu kartu penuh per baris seperti `DashboardPage.tsx` pada aplikasi utama), sehingga tabel `Transaksi Terakhir` dan `Barang Hampir Habis` tampil lebar penuh (`100%`) dan mudah dibaca di layar desktop.

### D. Konsistensi Style `TablePagination` di `Penukaran Barang` & Seluruh Tabel (`wireframe/js/components.js` & `wireframe/data/mock-data.js`)
- Menyesuaikan logika `window.WFUI.paginate(...)` di `wireframe/js/components.js` agar mengikuti aturan `components/ui/table-pagination.tsx` serta `dokumentasi-sistem/05` dan `06`:
  - Input lompat halaman (`Ke hal: [ ] [Buka]`) **hanya** ditampilkan apabila jumlah total data lebih dari 100 baris (`totalItems > 100`), sehingga tidak memenuhi sisi kanan bar paginasi pada tabel biasa.
  - Dropdown pemilih baris per halaman (`5 / hal`, `10 / hal`, `25 / hal`) membuka ke arah atas (`placement="top"`).
  - Bar paginasi (`.wf-pagination`) tampil dalam satu baris horizontal yang sejajar (`Menampilkan 1-5 dari ...` + `5 / hal` di kiri; `< Sebelumnya`, nomor halaman `1`, `2`, ..., `Berikutnya >` di kanan).
- Melengkapi jumlah data dummy pada `wireframe/data/mock-data.js` untuk `penukaran` (`6` data), `kasbon` (`6` data), `rencana_restok` (`6` data), `tagihan_pemasok` (`6` data), dan `pengguna` (`6` data) serta memperbarui kunci `sessionStorage` ke `tbkm_wireframe_prototype_state_v3`. Kini halaman **Penukaran Barang** dan seluruh halaman tabel lainnya menampilkan desain paginasi 2 halaman (`1`, `2`) yang seragam.

### E. Penghapusan `Pengaturan Akun` pada Dropdown Profil Header (`wireframe/js/components.js`)
- Menghapus tombol `Pengaturan Akun` dari `.wf-profile-dropdown` di Header sehingga dropdown profil hanya menampilkan informasi akun aktif (`Avatar`, `Nama`, `Peran (@username)`) dan tombol **Keluar**.

---

## 2. Daftar File yang Diperbarui

1. `wireframe/data/mock-data.js`
2. `wireframe/css/wireframe.css`
3. `wireframe/js/state.js`
4. `wireframe/js/components.js`
5. `wireframe/js/pages-auth-dashboard.js`
6. `wireframe/js/pages-transaksi-kasbon.js`
7. `wireframe/js/pages-stok-pemasok.js`
8. `wireframe/js/pages-pengiriman-sistem.js`
9. `dokumentasi-wireframe/05-perbaikan-layout-tabel-dan-konsistensi-paginasi.md`
