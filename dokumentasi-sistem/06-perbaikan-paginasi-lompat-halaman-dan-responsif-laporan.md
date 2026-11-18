# 06 - Perbaikan Input Lompat Halaman, Arah Dropdown Paginasi & Responsivitas Kartu Laporan Desktop

Dokumen ini mencatat penambahan fitur lompat halaman pada tabel berdata lebih dari 100 baris, perbaikan arah buka *dropdown* jumlah baris per halaman, serta penataan ulang kartu filter dan unduh CSV pada halaman `/laporan`.

---

## 1. Input Lompat Halaman (`totalItems > 100`) & Arah Dropdown ke Atas pada Paginasi

File yang diperbarui:
- [`components/ui/custom-select.tsx`](../components/ui/custom-select.tsx)
- [`components/ui/table-pagination.tsx`](../components/ui/table-pagination.tsx)

Rincian perubahan:
1. **Arah Buka Dropdown ke Atas (`placement="top"`)**:
   - Menambahkan properti `placement?: "bottom" | "top"` pada `<CustomSelect />`.
   - Pada `<TablePagination />`, pemilih jumlah baris (`10 / hal`, `25 / hal`, `50 / hal`) kini menggunakan `placement="top"` (`bottom-[calc(100%+6px)]`) sehingga menu pilihan selalu membuka **ke arah atas** dan tidak pernah terpotong di bagian bawah tabel atau layar.
   - Lebar daftar pilihan disesuaikan dengan `min-w-full w-max` agar selaras dengan lebar tombol pemicunya.
2. **Input Lompat Halaman (`Ke hal: [ ... ] [Buka]`)**:
   - Ketika jumlah data tabel lebih dari 100 baris (`totalItems > 100`), bagian kanan bar paginasi otomatis menampilkan kolom input angka **`Ke hal:`** beserta tombol **`Buka`**.
   - Pengguna dapat mengetik nomor halaman tujuan (misalnya halaman `12`) lalu menekan `Enter` atau klik **`Buka`** untuk langsung berpindah halaman tanpa harus menekan tombol *Berikutnya* berulang kali.

---

## 2. Perbaikan Responsivitas Kartu Filter & Unduh CSV di `/laporan` pada Layar Desktop

File yang diperbarui:
- [`components/laporan/LaporanPage.tsx`](../components/laporan/LaporanPage.tsx)

Rincian perubahan:
1. **Akar Masalah Sebelumnya**:
   - Menempatkan 2 pemilih tanggal (`Dari Tanggal`, `Sampai Tanggal`), tombol `Terapkan Periode`, serta 4 tombol unduh CSV (`CSV Stok`, `CSV Mutasi`, `CSV Penjualan`, `CSV Piutang`) dalam satu baris horizontal yang sama membutuhkan lebar lebih dari `1.160px`, sehingga pada layar laptop/desktop `1280px–1366px` (dengan sidebar `260px` terbuka) tombol `CSV Piutang` keluar menembus batas kanan kartu putih.
2. **Solusi Tata Letak Dua Baris Terstruktur di Dalam Kartu**:
   - **Baris Pertama (Filter Periode)**: Menggunakan `grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] items-end gap-3 w-full` sehingga pemilih *Dari Tanggal*, *Sampai Tanggal*, dan tombol *Terapkan Periode* mengisi lebar kartu secara proporsional tanpa pernah keluar dari batas kartu.
   - **Baris Kedua (Unduh Laporan CSV)**: Dipisahkan dengan garis tipis (`border-t border-[#E2E8F0] pt-3.5`):
     - Pada layar **Mobile (`< 640px`)**: Menampilkan satu tombol *dropdown* **`Unduh Laporan CSV`** (1 baris).
     - Pada layar **Tablet, iPad, dan Desktop (`>= 640px`)**: Menampilkan **1 baris Grid 4 Kolom Sama Lebar (`sm:grid-cols-4 gap-2.5 w-full`)** untuk `CSV Stok`, `CSV Mutasi`, `CSV Penjualan`, dan `CSV Piutang`. Keempat tombol selalu berada dalam satu baris yang rata dan 100% berada di dalam batas kartu pada seluruh ukuran layar desktop maupun tablet.
