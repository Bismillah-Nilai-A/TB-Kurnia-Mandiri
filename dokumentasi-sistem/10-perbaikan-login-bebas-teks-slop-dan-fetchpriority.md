# 10 - Pemangkasan Teks Slop Halaman Login dan Perbaikan `fetchPriority`

Dokumentasi ini mencatat perbaikan galat konsol React DOM pada gambar `/HalamanLogin/Team5.jpeg` sekaligus pemangkasan teks penjelasan berlebih pada halaman `/login` agar tampilan tetap ringkas, fokus pada autentikasi, serta bebas pola teks AI (*antislop* dan *stop-slop*).

## Perubahan yang Dilakukan

1. **Perbaikan Error Konsol `Invalid DOM property 'fetchpriority'`**:
   - Pada `components/login/LoginPage.tsx`, atribut `<img />` sebelumnya disebar dengan huruf kecil `fetchpriority="high"` yang memicu pesan galat React 18 / Next.js 15.5.28:
     `Invalid DOM property 'fetchpriority'. Did you mean 'fetchPriority'?`
   - Properti diubah langsung menjadi `fetchPriority="high"` sesuai standar React JSX agar konsol bersih tanpa peringatan maupun galat.

2. **Pemangkasan Teks Berlebih (*Text Slop*)**:
   - **Panel Kiri (Form Login)**:
     - Menghapus label tambahan `POS & Stok` di samping logo `Kurnia Mandiri.`.
     - Menyederhanakan judul menjadi `Masuk Akun` dan menghapus kalimat pengantar di bawah judul serta label `Akses Cepat Peran` di atas kontrol segmen peran (`aria-label="Pilih peran cepat"` tetap dijaga untuk pembaca layar).
   - **Panel Kanan (Foto Tim)**:
     - Menghapus paragraf deskripsi operasional panjang serta blok 2 kolom penjelasan fitur (`Kasir & Piutang` dan `Gudang & Pengantaran`) di bawah foto `Team5.jpeg`.
     - Menyisakan ruang foto `Team5.jpeg` lebih dominan (`flex-1 aspect-video`) disertai satu blok identitas singkat di bagian bawah: `CV Kurnia Mandiri` dan `Toko Bahan Bangunan`.

## File yang Diperbarui

- [`components/login/LoginPage.tsx`](../components/login/LoginPage.tsx)
- [`dokumentasi-sistem/README.md`](./README.md)

## Keamanan Kontras, Aksesibilitas, dan Logika Bisnis

- Seluruh target sentuh tombol tetap minimum `44px` (`h-11` / `min-h-11`), lengkap dengan `aria-label`, `aria-pressed`, fokus papan ketik eksplisit, dan dukungan Mode Terang/Gelap (`data-skin`).
- Logika autentikasi `prosesLoginPengguna` dan opsi peran cepat `QUICK_ROLES` di `components/login/layanan-login.ts` tidak berubah.
