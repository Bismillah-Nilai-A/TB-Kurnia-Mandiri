# 07 - Penyeragaman Panjang Label Status (`Lunas` & `Belum Lunas`)

Dokumen ini mencatat perbaikan ukuran lebar minimum pada komponen lencana status `<StatusBadge />` agar label **`Lunas`** dan **`Belum Lunas`** memiliki panjang kapsul yang sama persis di seluruh tabel aplikasi.

---

## 1. Akar Masalah

Pada [`app/globals.css`](../app/globals.css), variabel `--text-xs` bernilai `0.9375rem` (`15px` pada ukuran teks standar `16px`). Dengan ukuran huruf tersebut, lencana **`Belum Lunas`** (ikon `14px` + jarak `6px` + teks `"Belum Lunas"` + ruang tepi `px-3`) membutuhkan lebar sekitar **`8.75rem` (`140px`)**.

Saat `<StatusBadge />` menggunakan `min-w-[116px]`, lencana **`Lunas`** tertahan di lebar `116px` sedangkan **`Belum Lunas`** melebar hingga `140px`, sehingga panjang kedua kapsul masih tampak berbeda.

---

## 2. Solusi yang Diterapkan

File yang diperbarui:
- [`components/ui/status-badge.tsx`](../components/ui/status-badge.tsx)

Rincian perubahan:
- Mengubah kelas lebar minimum pada `<StatusBadge />` dari `min-w-[116px]` menjadi **`min-w-[9.25rem]`** (`148px` pada ukuran teks standar) dengan perataan tengah (`justify-center`).
- Penggunaan satuan relatif `rem` (`9.25rem`) memastikan panjang kapsul **`Lunas`** dan **`Belum Lunas`** (serta pasangan status lainnya seperti **`Stok Aman`** dan **`Stok Menipis`**) selalu **identik 100%** baik saat pengguna memilih ukuran teks **Kecil**, **Sedang**, maupun **Besar** di menu pengaturan tampilan.
