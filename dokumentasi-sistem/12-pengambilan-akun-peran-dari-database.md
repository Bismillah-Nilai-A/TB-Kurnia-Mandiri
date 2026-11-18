# 12 - Penggantian Akun Peran Dummy dengan Data Asli Database

Dokumentasi ini mencatat penghapusan data pengguna dummy statis (`ROLE_ACCOUNTS` di `components/layout/layanan-layout.ts` dan fallback statis di `lib/supabase.ts`) agar pengisian profil aktif serta fitur pindah peran pada sidebar selalu mengambil data pengguna asli dari tabel `pengguna` di Supabase.

## Masalah Sebelumnya

1. `components/layout/layanan-layout.ts` sebelumnya menyimpan objek hardcoded `ROLE_ACCOUNTS` berisi nama dummy (`Arif Muhamad (Admin)`, `Budi Santoso (Kasir)`, dan `Hendra Wijaya (Pengirim)`), padahal di database Supabase tabel `pengguna` sudah memiliki data pengguna aktif (`Arif Muhamad (Owner)`, `Cynthia Bella (Kasir)`, `Rafly Romeo (Pengirim)`, atau pembaruan nama melalui `/pengaturan`).
2. `lib/supabase.ts` juga masih memiliki fallback statis `Arif Muhamad (Admin)` pada `getCurrentUser()` ketika sesi lokal dan auth kosong.

## Perubahan yang Diterapkan

1. **Query Akun Aktif dari Supabase (`components/layout/layanan-layout.ts`)**:
   - Menghapus konstanta statis `ROLE_ACCOUNTS`.
   - Menambahkan fungsi `muatDaftarAkunPeranSupabase()` untuk mengambil seluruh baris aktif (`status = "aktif"`) dari tabel `pengguna` dan memetakan perwakilan akun untuk setiap peran (`admin`, `kasir`, `pengirim`).
   - Menambahkan fungsi `cariAkunAktifPeranSupabase(targetRole)` sebagai pengambilan langsung per peran jika dibutuhkan saat pergantian peran.

2. **Sinkronisasi Sesi & Ganti Peran (`components/layout/ProtectedLayoutView.tsx`)**:
   - Saat memuat layout, `muatDaftarAkunPeranSupabase()` dijalankan paralel bersama data header dan langsung menyinkronkan sesi aktif (`nama`, `username`, `role`) dengan baris terbaru di database (otomatis memperbarui sisa cache lokal yang masih menyimpan nama lama).
   - `handleSwitchRole(targetRole)` kini mengambil akun asli dari database lewat `roleAccounts[targetRole]` atau `cariAkunAktifPeranSupabase(targetRole)` dan tidak lagi membuat objek dummy apabila peran tidak memiliki akun aktif di database.

3. **Fallback Sesi Database Asli (`lib/supabase.ts`)**:
   - Langkah ke-3 `getCurrentUser()` kini mengambil akun admin aktif pertama langsung dari tabel `pengguna` Supabase. Jika database belum mengembalikan akun aktif, fungsi mengembalikan `null` sehingga pengguna diarahkan ke `/login`.

## File yang Diperbarui

- [`components/layout/layanan-layout.ts`](../components/layout/layanan-layout.ts)
- [`components/layout/ProtectedLayoutView.tsx`](../components/layout/ProtectedLayoutView.tsx)
- [`lib/supabase.ts`](../lib/supabase.ts)
- [`dokumentasi-sistem/README.md`](./README.md)
