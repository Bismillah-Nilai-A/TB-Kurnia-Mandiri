# 02 - Revisi Desain Low-Fidelity Wireframe & Interactive Prototype

Dokumen ini mencatat pembaruan dan penyederhanaan desain **Low-Fidelity Grayscale Wireframe & Interactive Prototype** di dalam folder `wireframe/` agar selaras penuh dengan karakter visual, proporsi komponen, dan perilaku responsif aplikasi utama **TB Kurnia Mandiri**.

---

## 1. Ringkasan Tujuan Revisi

- Menyederhanakan tampilan wireframe agar bersih, natural, tidak terlalu ramai, dan tidak terkesan seperti *template* dashboard hasil *generate* AI.
- Menyelaraskan struktur layout, proporsi kartu (`.km-card` / `.wf-card`), tipografi, *sidebar*, *header*, *custom select dropdown*, dan *responsive tabs* dengan aplikasi utama TB Kurnia Mandiri dalam palet *low-fidelity grayscale* (hitam, putih, abu-abu).
- Memastikan seluruh perubahan hanya dilakukan di dalam folder `wireframe/` (dan dokumentasi ini) tanpa menyentuh *source code* aplikasi utama, konfigurasi Prisma, maupun database Supabase.

---

## 2. Bagian Wireframe yang Diperbaiki

### A. Penghapusan Informasi Debug & Kontrol yang Tidak Diperlukan
Elemen-elemen teknis dan banner demonstrasi berikut telah dihapus sepenuhnya dari tampilan prototype (`wireframe/js/components.js`, `wireframe/js/app.js`, dan `wireframe/css/wireframe.css`):
- Badge `LOW-FIDELITY WIREFRAME & PROTOTYPE SDD`
- Informasi `Status: Belum Login (Halaman Autentikasi)`
- Informasi `Mode: Frontend Dummy State (Tanpa Koneksi Supabase)`
- Tombol `Reset Data Dummy` di bagian atas layar
- Badge `[WIREFRAME LOGIN]`, `[FOTO TIM - GRAYSCALE WIREFRAME]`, dan kotak `Petunjuk Pengujian Prototype` pada halaman login

### B. Penyederhanaan Halaman Login (`wireframe/js/pages-auth-dashboard.js`)
Mengacu langsung pada halaman login aplikasi utama (`http://localhost:3000/login` / `components/login/LoginPage.tsx`):
- Menghapus gambar `Team5.jpeg` beserta folder `wireframe/assets/` karena wireframe low-fidelity tidak menggunakan foto dekoratif.
- Menyajikan kartu login terpusat (`.wf-login-card`) yang bersih dengan identitas wordmark `Kurnia Mandiri.`, judul `Masuk Akun`, kontrol tab 3 peran (**Pemilik**, **Kasir**, **Pengirim**) dengan ikon SVG proporsional, kolom input manual `Username` dan `Kata Sandi` (dilengkapi tombol lihat/sembunyikan kata sandi), tombol utama `Masuk ke Sistem`, serta footer `© 2026 CV Kurnia Mandiri`.
- Memilih tab **Pemilik**, **Kasir**, atau **Pengirim** hanya mengganti konteks peran login dan **tidak mengisi input secara otomatis** (tetap input manual).

### C. Penyesuaian Layout, Dashboard, & Visual Restraint (`wireframe/css/wireframe.css`)
- **Kartu & Kontainer (`.wf-card`)**: Mengganti garis pinggir tebal (`2px solid #737373`) dan kepala kartu berlatar abu-abu gelap dengan permukaan putih bersih (`#FFFFFF`), border tipis `1px solid #E5E5E5`, sudut `6px`, dan bayangan lembut setara `.km-card` pada aplikasi asli.
- **Menghilangkan Card-di-dalam-Card**: Menghapus kotak-kotak `.wf-wirebox` bergaris putus-putus di dalam kartu form maupun di dalam keranjang POS. Item keranjang POS kini dipisahkan oleh garis pembatas bawah tipis (`1px solid #E5E5E5`) sebagaimana `KeranjangPos.tsx` pada aplikasi utama.
- **Sidebar & Header (`wireframe/js/components.js`)**:
  - Sidebar berukuran `260px` dengan tinggi header `72px`, grup navigasi yang dapat dilipat (*collapsible*) dengan ikon chevron halus, indikator aktif berupa latar abu-abu muda `#F0F0F0` dan garis vertikal kiri `3px solid #171717` (identik dengan `SidebarUtama.tsx`), serta kartu profil pengguna dan tombol `Keluar` di bagian bawah tanpa *role switcher* di sidebar.
  - Header setinggi `72px` dengan tombol *toggle* sidebar berupa ikon SVG menu, input pencarian global dengan ikon kaca pembesar di dalam input, tombol lonceng notifikasi dengan lencana angka (*badge counter*), serta profil pengguna aktif di sisi kanan (identik dengan `HeaderUtama.tsx`).
- **Dashboard 3 Peran (`wireframe/js/pages-auth-dashboard.js`)**:
  - Mengikuti struktur `DashboardPage.tsx` aplikasi utama: `PageHeader` dengan *breadcrumb* `Utama > Dashboard`, judul `Ringkasan Hari Ini`, tombol `Muat Ulang` dan tombol aksi utama, 4 kartu statistik ringkas dengan ikon sudut (`36px x 36px`), serta tabel `Transaksi Terakhir` dan `Barang Hampir Habis` (atau `Penugasan Pengiriman Aktif` untuk peran Pengirim).

### D. Penggantian Simbol Teks ASCII dengan Ikon SVG Konsisten
- Menghapus seluruh simbol pseudo-ikon berbasis teks (`[::]`, `[+]`, `[-]`, `[v]`, `[~]`, `[!]`, `[||]`, `[=]`, `[<-]`, `[->]`) di seluruh halaman.
- Menggantinya dengan helper `window.WFUI.icon(name)` di `wireframe/js/components.js` yang merender ikon SVG bergaya Lucide secara konsisten dan proporsional (`15px` - `18px`).

### E. Komponen Custom Select, Dropdown, & Responsive Tabs (`wireframe/js/components.js` & `wireframe/js/app.js`)
- Mengganti seluruh elemen `<select>` bawaan browser di semua halaman dan modal dengan komponen `window.WFUI.customSelect(...)` yang mengikuti desain `components/ui/custom-select.tsx`:
  - Tinggi pemicu konsisten (`44px` untuk form/filter utama, `36px` untuk ukuran ringkas `sm`), sudut membulat `6px`, ikon chevron yang berputar `180deg` saat dibuka, dan menu *popover* mengambang (`z-index: 70`) dengan tanda centang (`check` SVG) pada opsi terpilih tanpa terpotong oleh *container* tabel atau kartu.
  - Menjaga nilai input form yang sedang diketik pengguna agar tidak hilang saat membuka atau memilih opsi *dropdown* di dalam form maupun modal.
- Menambahkan komponen `window.WFUI.responsiveTabs(...)` yang mengikuti `components/ui/responsive-tabs.tsx`: menampilkan *segmented tab bar* menyatu pada layar desktop (`>= 1024px`) dan otomatis berubah menjadi `customSelect` pada layar mobile/tablet (`< 1024px`).

### F. Perbaikan Responsive Design
- **Desktop (`>= 1024px`)**: Sidebar tampil tetap di kiri (`260px`) dan dapat dilipat penuh; grid statistik 4 kolom dan tata letak POS 2 kolom (`7fr 5fr`) tampil proporsional.
- **Tablet (`640px - 1023px`)**: Sidebar otomatis menjadi *off-canvas drawer* dengan *backdrop* gelap saat dibuka; grid statistik menyesuaikan menjadi 2 kolom; tab bar berubah menjadi *custom dropdown* agar tidak bertumpuk.
- **Mobile (`< 640px`)**: Pencarian header menyembunyikan kolom panjang agar header tetap rapi, form menjadi 1 kolom penuh, dan seluruh tabel dibungkus `.wf-table-wrap` (`overflow-x: auto`) sehingga tidak menimbulkan *horizontal overflow* pada halaman.

---

## 3. Daftar File yang Mengalami Perubahan

1. `wireframe/assets/Team5.jpeg` *(dihapus)*
2. `wireframe/css/wireframe.css` *(diperbarui)*
3. `wireframe/js/state.js` *(diperbarui)*
4. `wireframe/js/components.js` *(diperbarui)*
5. `wireframe/js/pages-auth-dashboard.js` *(diperbarui)*
6. `wireframe/js/pages-master.js` *(diperbarui)*
7. `wireframe/js/pages-transaksi-kasbon.js` *(diperbarui)*
8. `wireframe/js/pages-stok-pemasok.js` *(diperbarui)*
9. `wireframe/js/pages-pengiriman-sistem.js` *(diperbarui)*
10. `wireframe/js/app.js` *(diperbarui)*
11. `wireframe/README.md` *(diperbarui)*
12. `dokumentasi-wireframe/02-revisi-desain-wireframe-low-fidelity.md` *(ditambahkan)*
