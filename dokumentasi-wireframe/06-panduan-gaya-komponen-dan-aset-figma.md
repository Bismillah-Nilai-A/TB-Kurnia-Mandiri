# 06 - Halaman Panduan Gaya (`wireframe/panduan-gaya.html`) & Katalog Komponen Terbuka untuk Figma

Dokumen ini mencatat pembuatan halaman panduan gaya mandiri di [`wireframe/panduan-gaya.html`](../wireframe/panduan-gaya.html) yang merangkum sistem warna projek real (`DESIGN.md` dan `dokumentasi-sistem`), tipografi `Plus Jakarta Sans` & `JetBrains Mono`, lencana status (`StatusBadge`), katalog tombol operasional, serta seluruh komponen *dropdown* (`CustomSelect`, `CustomDatePicker`, `ResponsiveTabs`, `TablePagination`, dan popup Header/Sidebar) yang dirender dalam kondisi terbuka statis agar terbaca 100% saat disalin dari web browser ke Figma menggunakan ekstensi.

---

## 1. Tujuan Pembuatan `wireframe/panduan-gaya.html`

Saat halaman web disalin ke Figma melalui ekstensi browser:
- Elemen `<select>` bawaan sistem operasi maupun menu popup *dropdown* yang tersembunyi (`display: none`) atau mengambang (`position: absolute`) sering tidak ikut terbaca sebagai *layer* di Figma.
- Di dalam [`wireframe/panduan-gaya.html`](../wireframe/panduan-gaya.html), seluruh komponen *dropdown* dirender secara **statis di dalam alur dokumen (`position: relative; display: flex;`)** lengkap dengan tombol pemicu (*trigger*) dan panel daftar opsi (`role="listbox"`) yang sedang terbuka beserta tanda ceklis pada opsi aktif.

---

## 2. Struktur Isi Halaman `panduan-gaya.html`

1. **Baris Lencana Status Cepat (Bagian Atas Halaman)**
   - Menampilkan 10 kapsul status utama (`Stok Aman`, `Stok Menipis`, `Stok Habis`, `Lunas`, `Belum Lunas`, `Gagal`, `Menunggu Dikirim`, `Dalam Perjalanan`, `Selesai`, `Ada Kendala`) dalam grid 5 kolom agar mudah diambil sebagai komponen di Figma.

2. **Sistem Warna (`#warna`)**
   - **10 Warna Inti Projek Real (`DESIGN.md`)**:
     - Primer Utama `#2563EB`, Primer Tua `#1D4ED8`, Aksen Utama `#F59E0B`, Latar Halaman `#F8FAFC`, Latar Kartu `#FFFFFF`, Teks Utama `#1E293B`, Teks Sekunder `#64748B`, Sukses Utama `#16A34A`, Bahaya Utama `#DC2626`, dan Garis Utama `#CBD5E1` (serta Garis Halus `#E2E8F0`).
   - **Warna Turunan Lencana Status (Latar Muda + Teks Kontras Tinggi WCAG AA)**:
     - Sukses (`#DCFCE7` + `#15803D`), Peringatan (`#FEF3C7` + `#92400E`), Bahaya (`#FEE2E2` + `#B91C1C`), Info (`#DBEAFE` + `#1D4ED8`), dan Sorotan Biru (`#EFF6FF` + `#1D4ED8`).
   - **Palet Mode Gelap (`html[data-skin="dark"]`) & Tema Sidebar**:
     - Latar Gelap `#0F172A`, Kartu Gelap `#1E293B`, Hover Gelap `#283548`, Garis Gelap `#334155`, dan Sidebar Biru `#1E3A8A`.
   - **Palet Wireframe Low-Fidelity (Grayscale Monokrom)**:
     - Hitam Utama `#0F172A`, Abu Sekunder `#475569`, Garis `#CBD5E1`, Latar Subtil `#F1F5F9`, dan Kanvas Kartu `#FFFFFF`.

3. **Jenis Font & Ukuran Teks (`#tipografi`)**
   - Menampilkan spesimen langsung untuk **Plus Jakarta Sans** (`Judul Halaman - 32`, `Judul Kartu - 22`, `12.450.000 - 32`, `Isi dan nama barang - 18 tebal`, `Isi teks utama - 18`, `Label dan status - 16 tebal`, `Keterangan pendukung - 16`, label `14 tebal`, dan lencana status `12 tebal`) serta **JetBrains Mono** (`13px SemiBold` untuk kode barang `A001` dan nomor nota `INV-20260123-001`).
   - Menyertakan tabel spesifikasi ukuran dan kartu perbandingan skala `html[data-size="kecil" | "sedang" | "besar"]` (`14px`, `16px`, `17.5px`).

4. **Lencana Status (`#status-badge`)**
   - Menampilkan perbandingan seluruh kapsul `<StatusBadge />` versi **Projek Real (Berwarna)** dan versi **Wireframe Low-Fidelity (Grayscale: Solid, Dashed, Outline)** dengan lebar seragam `min-width: 9.25rem` (`148px`).

5. **Katalog Tombol / Button (`#katalog-tombol`)**
   - Menampilkan seluruh varian tombol operasional baik dalam gaya **Projek Real (Berwarna)** maupun **Wireframe (Grayscale)**:
     - Tombol utama: `+ Tambah Barang Baru`, `+ Tambah Pelanggan`, `+ Tambah Pengguna`, `Simpan Data`, `Proses Pembayaran & Cetak Struk`, `+ Tambah`, `Simpan & Cetak Struk`, `+ Simpan Rencana Restok`.
     - Tombol aksi baris tabel: `Ubah`, `Detail`, `Hapus` (Solid & Outline), `Setujui`, `Tolak`, `Tolak Penukaran`, `Proses Kirim`, `Catat Bayar`, `Simpan`.
     - Tombol sekunder & utilitas: `Batal`, `Kembali`, `Cetak Barcode`, `Unduh CSV`, `Keluar`, kontrol kuantitas POS (`-`, `2`, `+`), dan tombol metode bayar (`Tunai`, `QRIS`, `Virtual Account`, `Kasbon`).

6. **Katalog 18 Dropdown Select Terbuka Statis (`#dropdown-terbuka`)**
   - Menampilkan perbandingan `CustomSelect` tertutup vs terbuka (Projek Real & Wireframe) serta 18 dropdown operasional lengkap dari seluruh halaman:
     1. Filter Kategori Barang
     2. Satuan Jual Barang Multi-Satuan (Keranjang POS)
     3. Pilih Pelanggan & Limit Kasbon (Kasir POS)
     4. Petugas Pengirim Lapangan
     5. Filter Status Pembayaran (Riwayat Penjualan)
     6. Nomor Nota Transaksi Asal (Penukaran Barang)
     7. Kondisi Barang yang Dikembalikan (Penukaran Barang)
     8. Pilih Barang Pengganti (Penukaran Barang)
     9. Filter & Input Jenis Pelanggan
     10. Jenis Mutasi Stok (Barang Masuk & Keluar)
     11. Pilih Barang untuk Rencana Restok
     12. Pemasok Tujuan / Distributor
     13. Filter Status Pengiriman
     14. Hasil Pengiriman di Lokasi
     15. Jenis Kendala Lapangan
     16. Peran (Role) & Hak Akses Akun
     17. Status Keaktifan Akun
     18. Filter Modul Log Aktivitas

7. **CustomDatePicker, ResponsiveTabs, Paginasi Tabel (`#datepicker-paginasi`), & Popup Header/Sidebar (`#popup-header-sidebar`)**
   - Menampilkan kalender `CustomDatePicker` terbuka penuh (Projek Real & Wireframe), `ResponsiveTabs` (mode desktop vs mode dropdown mobile), `TablePagination` dengan dropdown `5 / hal` yang membuka ke arah atas (`placement="top"`), serta 6 popup Header & akordeon sub-menu Sidebar.

---

## 3. File yang Ditambahkan

- [`wireframe/panduan-gaya.html`](../wireframe/panduan-gaya.html)
- [`dokumentasi-wireframe/06-panduan-gaya-komponen-dan-aset-figma.md`](./06-panduan-gaya-komponen-dan-aset-figma.md)
