# 01 - Panduan Gaya, Warna, Tipografi & Tema

Dokumen ini menjelaskan fondasi visual yang diterapkan pada [`app/globals.css`](../app/globals.css) dan [`app/layout.tsx`](../app/layout.tsx).

---

## 1. Sistem Warna

Seluruh warna didefinisikan menggunakan variabel CSS pada `:root` di [`app/globals.css`](../app/globals.css) agar mudah digunakan ulang dan mendukung pergantian **Mode Terang** dan **Mode Gelap**.

### Mode Terang (Default)

| Nama Variabel | Kode Hex | Peruntukan |
|---|---|---|
| `--km-primary` | `#2563EB` | Tombol utama (CTA), menu aktif, sorotan fokus |
| `--km-primary-dark` | `#1D4ED8` | Teks di atas latar biru muda (`#EFF6FF`), keadaan *hover* tombol utama |
| `--km-accent` | `#F59E0B` | Ikon peringatan (*stok menipis*, *menunggu*) |
| `--km-accent-text` | `#92400E` | Teks di atas latar oranye muda (`#FEF3C7`) agar memenuhi kontras keterbacaan |
| `--km-page` | `#F8FAFC` | Latar belakang utama halaman |
| `--km-card` | `#FFFFFF` | Latar belakang kartu, tabel, dan panel |
| `--km-text` | `#1E293B` | Teks utama dan judul |
| `--km-text-muted` | `#64748B` | Teks keterangan sekunder dan label tabel |
| `--km-success` | `#16A34A` | Status berhasil, lunas, stok aman |
| `--km-danger` | `#DC2626` | Status gagal, stok habis, tombol hapus/keluar |
| `--km-line` | `#CBD5E1` | Garis tepi input, dropdown, dan grup tab |
| `--km-line-soft` | `#E2E8F0` | Garis pemisah di dalam kartu dan baris tabel |

### Mode Gelap (`html[data-skin="dark"]`)

Ketika pengguna memilih **Mode Tampilan: Gelap** pada menu pengaturan di header, atribut `data-skin="dark"` dipasang pada elemen `<html>` dan disimpan di `localStorage` (`skin-mode`).

| Elemen | Nilai pada Mode Gelap |
|---|---|
| Latar Halaman (`--km-page`) | `#0F172A` |
| Latar Kartu (`--km-card`) | `#1E293B` |
| Teks Utama (`--km-text`) | `#F8FAFC` |
| Teks Sekunder (`--km-text-muted`) | `#94A3B8` |
| Garis Pemisah (`--km-line` / `--km-line-soft`) | `#334155` / `#283548` |
| Input, Select & Textarea | Latar `#0F172A`, teks `#F8FAFC`, garis `#334155` |

---

## 2. Tipografi & Ukuran Teks

1. **Jenis Huruf**: Menggunakan **Plus Jakarta Sans** yang dimuat melalui `next/font/google` di [`app/layout.tsx`](../app/layout.tsx) ke variabel `--font-jakarta`.
2. **Hierarki Ukuran Teks**:
   - **Judul Halaman (`.page-title`)**: Responsif menggunakan `clamp(1.5rem, 2.5vw, 2rem)` (24px di layar ponsel hingga 32px tebal di layar desktop).
   - **Judul Kartu (`CardTitle`)**: `1.375rem` (22px tebal).
   - **Angka Utama / Total Tagihan**: `1.875rem` - `2rem` (30px - 32px tebal).
   - **Isi Teks Utama & Nama Barang**: `1rem` - `1.125rem` (16px - 18px).
3. **Fitur Pengubah Ukuran Teks (`data-size`)**:
   Pengguna dapat mengubah ukuran teks seluruh aplikasi melalui menu pengaturan di header. Pilihan disimpan di `localStorage` (`km-text-size`) dan diterapkan pada atribut `html[data-size]`:
   - `html[data-size="kecil"]` -> ukuran dasar `14px`
   - `html[data-size="sedang"]` -> ukuran dasar `16px` (standar)
   - `html[data-size="besar"]` -> ukuran dasar `17.5px`

---

## 3. Enam Prinsip Desain Wajib

Saat menambahkan halaman atau komponen baru, patuhi 6 prinsip berikut:

1. **Kontras Tinggi & Keterbacaan**: Jangan gunakan teks abu-abu terang di atas latar putih/abu-abu muda. Untuk status peringatan oranye, gunakan teks `#92400E` di atas latar `#FEF3C7`.
2. **Ikon Selalu Disertai Label**: Setiap tombol aksi harus memiliki teks label yang jelas. Jika ada tombol khusus ikon (seperti di kolom aksi tabel atau header), wajib menyertakan `aria-label` dan `title`.
3. **Status = Warna + Ikon + Tulisan**: Jangan pernah menampilkan status hanya dengan titik warna atau teks polos. Gunakan komponen `<StatusBadge />`.
4. **Satu Tombol Utama Biru per Layar**: Hanya tindakan utama di layar tersebut yang menggunakan `<Button>` biru primer (`#2563EB`). Tombol pendamping menggunakan `variant="secondary"` atau `variant="outline"`.
5. **Bahasa Sehari-hari yang Jelas**: Gunakan istilah operasional toko yang ringkas dalam Bahasa Indonesia (contoh: *Mulai Transaksi Baru*, *Cetak Struk*, *Riwayat Notifikasi*), jangan menampilkan kode spesifikasi teknis seperti `(SET-02)` atau nama kolom database `(transaksi_id)` di layar pengguna.
6. **Tanpa Karakter *Em-Dash***: Sesuai aturan `antislop` R-02, gunakan tanda hubung biasa (`-`), titik dua (`:`), atau tanda kurung `()`.
