# 04 - Penyelarasan Katalog & Keranjang POS, Implementasi TablePagination Interaktif, serta Penyempurnaan Responsif Desktop

Dokumen ini mencatat pembaruan pada **Low-Fidelity Grayscale Wireframe & Interactive Prototype** di dalam folder `wireframe/` untuk menyejajarkan tinggi kartu Katalog dan Keranjang pada halaman **Transaksi Penjualan (POS)**, menerapkan komponen **`TablePagination`** interaktif sesuai proyek utama (`components/ui/table-pagination.tsx`), serta menyempurnakan kesejajaran grid di tampilan desktop.

---

## 1. Rincian Perbaikan

### A. Penyelarasan Kotak Kiri (Katalog) & Kotak Kanan (Keranjang) pada Transaksi POS (`wireframe/css/wireframe.css` & `wireframe/js/pages-transaksi-kasbon.js`)
- **Masalah sebelumnya**:
  1. `.wf-grid-pos` menggunakan `align-items: start;`, sehingga kotak kiri (`Katalog Barang`) memiliki tinggi yang lebih pendek daripada kotak kanan (`Keranjang`) dan batas bawah kedua kartu tidak sejajar di layar desktop.
  2. Di dalam kotak kiri, `.wf-grid-2` yang menggunakan `align-items: start;` membuat kartu produk (`.wf-pos-item`) pada baris yang sama memiliki tinggi berbeda ketika nama barang terdiri dari 2 baris.
  3. Di dalam kotak kanan (`Keranjang`), dropdown `Satuan` (`36px`) dan input `Jumlah` (`44px`) memiliki tinggi berbeda karena aturan `.wf-input` menimpa `.wf-input-sm`.
- **Solusi**:
  1. Mengubah `.wf-grid-pos` menjadi `align-items: stretch;` dengan `.wf-grid-pos > .wf-card { height: 100%; display: flex; flex-direction: column; }`, serta menempatkan `TablePagination` di bagian paling bawah kartu kiri (`margin-top: auto;`) dan blok `Total Tagihan + Proses Pembayaran` di bagian paling bawah kartu kanan (`margin-top: auto;`). Kini batas atas dan batas bawah kotak kiri maupun kotak kanan di halaman Transaksi POS **100% sejajar**.
  2. Membuat `.wf-pos-catalog-grid` menggunakan `align-items: stretch;` dan `.wf-pos-item { height: 100%; }` sehingga setiap pasang kartu produk di baris yang sama memiliki tinggi dan posisi tombol `+ Tambah` yang sejajar lurus.
  3. Menyeragamkan tinggi eksplisit `.wf-input.wf-input-sm` dan `.wf-custom-select-sm .wf-custom-select-trigger` menjadi tepat `36px` (`height: 36px; min-height: 36px;`), serta tinggi standar `.wf-input` dan `.wf-custom-select-trigger` menjadi tepat `44px` (`height: 44px; min-height: 44px;`), sehingga kolom `Satuan` dan `Jumlah` sejajar hingga ke piksel yang sama.

### B. Implementasi Desain `TablePagination` Interaktif Sesuai Proyek Utama (`wireframe/js/components.js` & `wireframe/data/mock-data.js`)
- Menambahkan helper `window.WFUI.paginate(list, key, defaultPageSize, pageSizeOptions, itemLabel)` yang mereplikasi desain dan perilaku `components/ui/table-pagination.tsx`:
  - **Sisi Kiri**: Informasi `Menampilkan 1-6 dari 12 barang` (dengan angka tebal) beserta dropdown `CustomSelect` ukuran halaman (`4 / hal`, `6 / hal`, `12 / hal` atau `5 / hal`, `10 / hal`, `25 / hal`) yang membuka menu ke arah atas (`placement: "top"`).
  - **Sisi Kanan**: Tombol `< Sebelumnya`, deretan nomor halaman (`1`, `2`, `3`, dst. dengan halaman aktif berwarna gelap kontras), tombol `Berikutnya >`, serta input lompat halaman `Ke hal: [ ] [Buka]`.
- Menambahkan data dummy realistis pada `wireframe/data/mock-data.js` (`12` data barang `A001` s/d `A012`, `8` nota transaksi, `7` pelanggan, `6` mutasi stok, `6` penugasan pengiriman, dan `7` log aktivitas) serta memperbarui kunci `sessionStorage` ke `tbkm_wireframe_prototype_state_v2` agar paginasi multi-halaman (`Halaman 1, 2, 3`) langsung terlihat dan dapat dipraktikkan oleh pengguna maupun *programmer* pada:
  - **Katalog Barang POS** (`Transaksi Penjualan (POS)`)
  - **Data Barang & Barcode**
  - **Data Pelanggan**
  - **Riwayat & Rekap Penjualan**
  - **Penukaran Barang**
  - **Kasbon & Pembayaran Piutang**
  - **Barang Masuk & Keluar** (Tabel Stok & Tabel Riwayat Mutasi)
  - **Stok Minimum & Restok**
  - **Penugasan & Riwayat Pengiriman Barang**
  - **Log Aktivitas Pengguna**

### C. Penyempurnaan Responsif Desktop di Seluruh Halaman (`wireframe/css/wireframe.css`)
- Mengubah `.wf-grid-2` dan `.wf-grid-stats` menjadi `align-items: stretch;` dengan `.wf-card { display: flex; flex-direction: column; }` dan `.wf-table-wrap { flex: 1; }`, sehingga seluruh kartu yang berdampingan 2 kolom atau 4 kolom di layar desktop (`Dashboard`, `Stok Minimum & Restok`, `Laporan Kendala`, `Proses Pengiriman`) selalu memiliki tinggi yang sama rata.
- Mengatur `.wf-field { display: flex; flex-direction: column; justify-content: flex-end; }` dengan `.wf-label { margin-bottom: auto; }` sehingga dua input/dropdown yang berdampingan di dalam form 2 kolom selalu sejajar rata bawah meskipun salah satu label memiliki teks lebih panjang.

---

## 2. Daftar File yang Diperbarui

1. `wireframe/data/mock-data.js`
2. `wireframe/css/wireframe.css`
3. `wireframe/js/state.js`
4. `wireframe/js/components.js`
5. `wireframe/js/pages-master.js`
6. `wireframe/js/pages-transaksi-kasbon.js`
7. `wireframe/js/pages-stok-pemasok.js`
8. `wireframe/js/pages-pengiriman-sistem.js`
9. `wireframe/js/app.js`
10. `dokumentasi-wireframe/04-penyelarasan-pos-pagination-dan-responsif-desktop.md`
