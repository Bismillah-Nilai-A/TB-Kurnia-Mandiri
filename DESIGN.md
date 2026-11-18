# DESIGN.md - POS & Persediaan CV Kurnia Mandiri

Dokumen ini menjadi sumber arah desain utama bagi pengembang dan *AI coding agent* (dibaca bersama `AGENTS.md`, `.agents/skills/antislop*`, dan `stop-slop/SKILL.md`). Dokumentasi teknis lengkap dan riwayat perubahan tersedia di folder [`dokumentasi-sistem/`](./dokumentasi-sistem/README.md).

## 1. Identitas & Karakter Produk

- **Produk**: Sistem Kasir Point of Sale (POS), Piutang, Pengiriman, dan Persediaan Gudang untuk **CV Kurnia Mandiri** (Toko Bahan & Material Bangunan).
- **Pengguna**: Pemilik Toko (`admin`), Kasir (`kasir`), dan Petugas Pengirim (`pengirim`).
- **Acuan Tata Letak**: Template **Dashbyte** ([`boiler-plate-laravel-pustekinfo`](https://github.com/muchamadhatta/boiler-plate-laravel-pustekinfo)).
- **Liveliness Dials**: `Dial: ENERGY 1 / RHYTHM 2 / MOTION 1` (tenang, kontras tinggi, transisi buka-tutup halus, fokus penuh pada kecepatan kerja operasional toko).

## 2. Palet Warna

- **Primer Utama**: `#2563EB` (Tombol utama, menu aktif, fokus input)
- **Primer Tua**: `#1D4ED8` (Teks di atas latar biru muda `#EFF6FF`)
- **Aksen Peringatan**: `#F59E0B` (Ikon perhatian), teks peringatan wajib `#92400E` di atas `#FEF3C7`
- **Sukses Utama**: `#16A34A` (Berhasil, lunas, stok aman)
- **Bahaya Utama**: `#DC2626` (Gagal, stok habis, hapus, keluar)
- **Mode Terang**: Latar halaman `#F8FAFC`, latar kartu `#FFFFFF`, teks utama `#1E293B`, teks sekunder `#64748B`, garis `#CBD5E1` / `#E2E8F0`
- **Mode Gelap (`html[data-skin="dark"]`)**: Latar halaman `#0F172A`, latar kartu `#1E293B`, teks utama `#F8FAFC`, teks sekunder `#94A3B8`, garis `#334155`

## 3. Tipografi

- **Font**: `Plus Jakarta Sans` (`--font-jakarta`)
- **Skala Ukuran**:
  - Judul Halaman (`.page-title`): `clamp(1.5rem, 2.5vw, 2rem)` (maks 32px tebal)
  - Judul Kartu (`CardTitle`): `22px` (`1.375rem`) tebal
  - Isi Utama: `16px - 18px`, mendukung pengubah ukuran teks global `html[data-size="kecil" | "sedang" | "besar"]`

## 4. Aturan Komponen Wajib

1. **Kepala Halaman**: Selalu gunakan `<PageHeader crumbs={[...]} title="..." />` dengan *breadcrumb* berjenjang (contoh: `Penjualan > Transaksi Kasir`).
2. **Dropdown Select**: Selalu gunakan `<CustomSelect>` (atau `<Select>` dari `@/components/ui`). Dilarang memakai `<select>` bawaan browser yang terbuka kotak.
3. **Tab & Filter Bar**: Selalu gunakan `<ResponsiveTabs>` agar menyatu di layar desktop (`>= 1024px`) dan otomatis menjadi *dropdown* `CustomSelect` di layar kecil (`< 1024px`).
4. **Status Badge**: Selalu gunakan `<StatusBadge>` (warna + ikon + tulisan).
5. **Anti-Slop**: Satu tombol biru utama per layar, tanpa karakter *em-dash*, tanpa teks deskripsi berulang di bawah judul, tanpa catatan spesifikasi teknis di UI, dan tanpa data *dummy* pada notifikasi.
