# 03 - Perbaikan Sidebar, Header Setting & Dropdown Profil, Wireframe Gambar Login, serta Responsivitas Grid Form

Dokumen ini mencatat perbaikan lanjutan pada **Low-Fidelity Grayscale Wireframe & Interactive Prototype** di dalam folder `wireframe/` agar identik dengan tata letak aplikasi asli **TB Kurnia Mandiri** serta memperbaiki kesejajaran dan responsivitas komponen form pada seluruh ukuran layar.

---

## 1. Rincian Perbaikan yang Dilakukan

### A. Penghapusan Tombol `X` dan Info Akun pada Sidebar (`wireframe/js/components.js`)
- Menghapus tombol `X` dari bagian kanan header sidebar (`.wf-sidebar-header`) sehingga header sidebar hanya menampilkan identitas merek `Kurnia Mandiri.`.
- Menghapus bagian footer akun dan tombol keluar dari bawah sidebar (`.wf-sidebar-footer`) karena informasi pengguna dan tombol **Keluar** dipusatkan pada dropdown profil di bagian kanan Header seperti pada aplikasi asli (`HeaderUtama.tsx`).

### B. Penambahan Tombol Setting (`Pengaturan Tampilan`) & Dropdown Profil di Header (`wireframe/js/components.js` & `wireframe/js/app.js`)
- Menambahkan tombol ikon **Setting** (`Pengaturan Tampilan`) di sebelah kiri tombol lonceng **Notifikasi** pada Header, sama seperti `HeaderUtama.tsx` pada proyek utama:
  - **Mode Tampilan**: `Terang` | `Gelap` (mengubah variabel grayscale terang/gelap pada `html[data-skin]`).
  - **Warna Sidebar**: `Standar` | `Biru` (abu medium pada grayscale) | `Gelap`.
  - **Ukuran Teks**: `Kecil` | `Sedang` | `Besar` (mengubah skala `html[data-size]`).
- Mengubah blok profil pengguna di sudut kanan Header menjadi tombol pemicu dropdown (`.wf-profile-trigger`) yang saat diklik memunculkan menu popover berisi:
  - Avatar inisial, nama lengkap pengguna, serta peran dan `@username`.
  - Pintasan **Pengaturan Akun** (khusus Pemilik/Admin).
  - Tombol **Keluar** (`Logout`) untuk kembali ke halaman Login.

### C. Penyesuaian Halaman Login Split-Screen dengan Placeholder Gambar Wireframe (`wireframe/js/pages-auth-dashboard.js`)
- Mengembalikan tata letak *split-screen* 2 kolom (`5fr : 7fr` pada layar desktop `>= 1024px`) agar menyerupai `http://localhost:3000/login` (`LoginPage.tsx`):
  - **Panel Kiri**: Wordmark `Kurnia Mandiri.`, judul `Masuk Akun`, 3 tab peran (`Pemilik`, `Kasir`, `Pengirim`) yang tidak mengisi otomatis input saat diklik, input manual `Username` dan `Kata Sandi` dengan tombol mata lihat/sembunyikan sandi, tombol `Masuk ke Sistem`, serta footer `© 2026 CV Kurnia Mandiri` dilengkapi tombol pengalih mode tampilan di kanan bawah.
  - **Panel Kanan**: Mengganti foto asli dengan kotak placeholder gambar wireframe (`.wf-login-image-wireframe`) yang memiliki **garis menyilang (`X`)** dari sudut ke sudut serta **ikon gambar (`image` / `picture`)** di tengah, dilengkapi caption `CV Kurnia Mandiri` / `Toko Bahan Bangunan` di bagian bawah.

### D. Perbaikan Responsivitas & Kesejajaran Kolom Form (`wireframe/css/wireframe.css`)
- **Penyebab ketidaksejajaran dan *overflow* sebelumnya**:
  - Pada CSS Grid, definisi `grid-template-columns: repeat(2, 1fr)` memiliki batas minimum implisit `auto`. Ketika komponen `CustomSelect` memiliki teks opsi yang panjang dengan `white-space: nowrap`, elemen `<button>` pemicu menolak menyusut di bawah panjang teksnya sehingga mendorong kolom pertama melebar melebihi `50%` dan membuat kolom kedua keluar melewati batas kanan kartu (`.wf-card`).
  - Selain itu, beberapa kartu form menggunakan `style="max-width: 860px"` / `760px` sehingga tepi kanan kartu form tidak sejajar dengan tombol `Kembali` pada `PageHeader` di atasnya.
- **Solusi yang diterapkan**:
  1. Mengubah seluruh track CSS Grid (`.wf-grid-2`, `.wf-grid-stats`, `.wf-grid-pos`, `.wf-login-card`) menjadi `minmax(0, 1fr)` (misal: `grid-template-columns: repeat(2, minmax(0, 1fr))`), sehingga setiap kolom form selalu presisi `50% : 50%` dan sejajar vertikal dari baris pertama hingga baris terakhir.
  2. Menambahkan `min-width: 0; max-width: 100%; overflow: hidden;` pada `.wf-field`, `.wf-custom-select`, dan `.wf-custom-select-trigger` agar teks panjang di dalam dropdown otomatis dipotong dengan elipsis (`...`) tanpa pernah merusak lebar kolom.
  3. Mengatur menu popover `.wf-custom-select-menu` dengan `left: 0; right: 0; width: 100%; max-width: 100%;` dan membungkus teks opsi panjang (`word-break: break-word`) agar menu dropdown tidak melewati tepi kanan kartu.
  4. Menghapus pembatas `max-width` sempit pada kartu form (`.wf-card`) sehingga lebar kartu form sejajar penuh dengan `PageHeader` di atasnya.
  5. Menambahkan kelas `.wf-filter-bar` pada kepala kartu tabel agar input pencarian dan dropdown filter tersusun rata penuh (`100%`) di layar mobile dan sejajar horizontal di layar tablet/desktop.

---

## 2. Daftar File yang Diperbarui

1. `wireframe/css/wireframe.css`
2. `wireframe/js/state.js`
3. `wireframe/js/components.js`
4. `wireframe/js/pages-auth-dashboard.js`
5. `wireframe/js/pages-master.js`
6. `wireframe/js/pages-transaksi-kasbon.js`
7. `wireframe/js/pages-stok-pemasok.js`
8. `wireframe/js/pages-pengiriman-sistem.js`
9. `wireframe/js/app.js`
10. `dokumentasi-wireframe/03-perbaikan-header-login-dan-responsif-wireframe.md`
