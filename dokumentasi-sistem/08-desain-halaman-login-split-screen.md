# 08 - Desain Halaman Login Split-Screen dengan Foto Tim 5

Dokumen ini mencatat pembaruan desain halaman `/login` menggunakan tata letak dua panel (*split-screen*) yang menampilkan foto lapangan `/HalamanLogin/Team5.jpeg` serta mengikuti panduan gaya [`DESIGN.md`](../DESIGN.md), aturan `.agents/skills/antislop*`, dan `stop-slop/SKILL.md`.

---

## 1. Struktur Tata Letak Dua Panel (`components/login/LoginPage.tsx`)

File yang diperbarui:
- [`components/login/LoginPage.tsx`](../components/login/LoginPage.tsx)

Rincian desain:
1. **Panel Visual Kiri (Layar Desktop `>= 1024px`)**:
   - Menampilkan foto [`public/HalamanLogin/Team5.jpeg`](../public/HalamanLogin/Team5.jpeg) secara penuh (`object-cover object-center`).
   - Berbeda dari gambar referensi yang menaruh teks tepat di tengah foto (yang akan menutupi wajah anggota tim pada foto `Team5.jpeg`), informasi dibagi ke bagian **atas** dan **bawah** panel dengan lapisan gradasi gelap bertingkat (`from-[#0F172A]/95 via-[#0F172A]/30 to-[#0F172A]/75`) agar keempat anggota tim di tengah foto tetap terlihat jelas dan teks memiliki rasio kontras di atas `7:1` (WCAG AA).
   - **Bagian Atas**: Kartu identitas berlogo **`KM`** (`#2563EB`), nama **`CV Kurnia Mandiri`**, dan sub-judul **`Toko Bahan & Material Bangunan`**.
   - **Bagian Bawah**: Lencana status berindikator hijau (`#16A34A`) **`Rapi • Cepat • Terkendali`**, judul utama **`Satu Sistem untuk Kasir, Stok Gudang, dan Pengiriman`**, ringkasan operasional tanpa *em-dash*, serta 4 kapsul fitur utama (`Kasir POS`, `Stok & Barcode`, `Piutang Kasbon`, `Pengiriman Kurir`).
2. **Banner Visual Ringkas (Layar Mobile & Tablet `< 1024px`)**:
   - Pada layar ponsel dan tablet, foto `Team5.jpeg` tetap ditampilkan sebagai kartu *banner* di bagian atas form (`h-44 sm:h-52 rounded-2xl`) lengkap dengan logo **`KM`** dan nama **`CV Kurnia Mandiri`**.
3. **Panel Form Kanan**:
   - **Judul & Sub-teks**: `Selamat Datang` dengan petunjuk singkat memilih peran atau memasukkan akun staf.
   - **Bar Pemilih Peran Menyatu (*Segmented Control*)**: Mengadaptasi tab peran pada referensi menjadi 3 peran nyata sistem (`Login Pemilik`, `Login Kasir`, `Login Pengirim`). Mengeklik salah satu tab langsung memilih peran dan mengisi *username* serta *password* uji coba.
   - **Input Berikon & Tombol Lihat Password**:
     - Kolom *Username* dilengkapi ikon `User` di sebelah kiri.
     - Kolom *Password* dilengkapi ikon `Lock` di sebelah kiri dan tombol mata (`Eye` / `EyeOff`) di sebelah kanan untuk menampilkan atau menyembunyikan *password*.
   - **Satu Tombol Utama Biru (`#2563EB`)**: Tombol **`Login`** setinggi `44px` (`h-11 rounded-xl`).
   - **Footer Hak Cipta & Pengubah Tema**: Menampilkan `© 2026 CV Kurnia Mandiri. Hak Cipta Dilindungi.` di sisi kiri dan tombol ikon `Moon` / `Sun` di sisi kanan untuk mengganti **Mode Terang / Mode Gelap** (`html[data-skin]`).
