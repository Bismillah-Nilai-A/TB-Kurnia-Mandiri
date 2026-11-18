# 03 - Arsitektur Layout, Sidebar & Header

File utama:
- Entry route Next.js: [`app/(dashboard)/(protected)/layout.tsx`](../app/(dashboard)/(protected)/layout.tsx)
- Komponen tata letak utama: [`components/layout/ProtectedLayoutView.tsx`](../components/layout/ProtectedLayoutView.tsx)
- Komponen sidebar: [`components/layout/SidebarUtama.tsx`](../components/layout/SidebarUtama.tsx)
- Komponen header: [`components/layout/HeaderUtama.tsx`](../components/layout/HeaderUtama.tsx)
- Layanan data & navigasi layout: [`components/layout/layanan-layout.ts`](../components/layout/layanan-layout.ts)

Tata letak utama aplikasi diadaptasi langsung dari template **Dashbyte** pada repositori [`boiler-plate-laravel-pustekinfo`](https://github.com/muchamadhatta/boiler-plate-laravel-pustekinfo) (`sidebar.blade.php`, `header.blade.php`, dan `script.js`).

---

## 1. Sidebar Buka-Tutup & Dropdown Bertingkat

1. **Tombol Buka-Tutup Sidebar (`#menuSidebar`)**:
   - Menggunakan ikon SVG `ri-menu-2-fill` (3 garis bertingkat).
   - Tampil di **semua ukuran layar** (desktop maupun mobile).
   - **Pada Desktop (`>= 1024px`)**: Mengubah state `sidebarCollapsed` yang menggeser sidebar keluar (`lg:-translate-x-full`) dan melebarkan area konten utama (`lg:pl-0`) dengan transisi `duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]`.
   - **Pada Mobile & Tablet (`< 1024px`)**: Mengubah state `sidebarOpen` yang membuka *drawer* sidebar di atas layar dengan latar belakang gelap (*backdrop*) dan dapat ditutup dengan tombol `Escape`.

2. **Grup Navigasi (`.nav-group`) & Sub-Menu Dropdown (`.has-sub`)**:
   - Struktur menu dikelompokkan dalam `NAV_GROUPS`:
     - **Utama**: `Dashboard` (`/dashboard`)
     - **Menu Operasional**:
       - Dropdown **Penjualan**: `Transaksi Kasir` (`/transaksi`), `Piutang & Pelanggan` (`/piutang`), `Pengiriman` (`/pengiriman`)
       - Dropdown **Persediaan**: `Barang & Stok` (`/barang`)
       - Dropdown **Laporan & Sistem**: `Laporan` (`/laporan`), `Pengaturan` (`/pengaturan`)
   - Animasi buka-tutup grup maupun sub-menu menggunakan transisi CSS Grid (`grid-rows-[1fr] opacity-100` ke `grid-rows-[0fr] opacity-0` dengan `duration-300 ease-in-out`) sehingga membuka dan menutup secara halus seperti `slideToggle` di Dashbyte.
   - Setiap item sub-menu memiliki garis indikator horizontal di sebelah kiri yang memanjang dan berwarna biru saat aktif atau disentuh kursor.
   - Menu disaring otomatis berdasarkan hak akses peran pengguna (`ROLE_PERMISSIONS[user.role]`).

3. **Footer Profil Sidebar (`.sidebar-footer`)**:
   - Bagian bawah sidebar menampilkan inisial pengguna, titik hijau status aktif, nama, dan peran (`Pemilik`, `Kasir`, `Pengirim`).
   - Saat diklik, membuka panel tersembunyi untuk mengganti *Peran Aktif* (pengujian RBAC) dan tombol *Keluar*.

---

## 2. Header Atas (`.header-main`)

Header memiliki tinggi tetap `72px` dan memuat 4 fitur fungsional sesuai `header.blade.php`:

1. **Kolom Pencarian Cepat (`.form-search`)**:
   - Terletak di sebelah kanan tombol `#menuSidebar`.
   - Mencari secara langsung ke **Pintasan Halaman**, **Data Barang & Stok** (kode barang, nama, sisa stok, harga dari tabel `barang`), dan **Data Nota Transaksi** (nomor nota dan nilai transaksi dari tabel `transaksi`).
   - Menekan `Enter` atau mengeklik hasil pencarian langsung mengarahkan pengguna ke halaman terkait.

2. **Menu Pengaturan Tampilan (`.dropdown-skin` - Ikon Gerigi)**:
   - Menyediakan 3 pengaturan tampilan berbahasa Indonesia dengan grup tombol yang rata:
     - **Mode Tampilan**: `Terang` | `Gelap` (mengatur atribut `html[data-skin]` dan menyimpan ke `localStorage` `skin-mode`).
     - **Warna Sidebar**: `Standar` | `Biru` | `Gelap` (mengatur tema warna sidebar dan menyimpan ke `localStorage` `sidebar-skin`).
     - **Ukuran Teks**: `Kecil` | `Sedang` | `Besar` (mengatur atribut `html[data-size]` dan menyimpan ke `localStorage` `km-text-size`).

3. **Menu Notifikasi Database (`.dropdown-notification` - Ikon Lonceng)**:
   - Hanya mengambil data nyata dari tabel `notifikasi` di Supabase (tanpa data *dummy*).
   - Menampilkan jumlah pesan yang belum dibaca pada lencana merah di atas ikon lonceng.
   - Setiap item notifikasi memiliki **tombol ceklis (`Check`)** di sebelah kanan untuk menandai notifikasi tersebut sudah dibaca, serta tombol **Baca Semua (`CheckCheck`)** di bagian atas *dropdown*. Status baca disimpan di `localStorage` (`km-read-notifs`).

4. **Menu Profil Pengguna (`.dropdown-profile` - Avatar Kanan Atas)**:
   - Menampilkan nama lengkap, peran, tautan cepat ke `Pengaturan Akun` (`/pengaturan`), dan tombol `Keluar`.
