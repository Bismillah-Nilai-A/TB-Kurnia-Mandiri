# 08 - Penyesuaian Wireframe dengan Dokumen SRS v1.0 & SDD v1.0

Dokumen ini mencatat pembaruan pada **Low-Fidelity Grayscale Wireframe & Interactive Prototype** di folder `wireframe/` agar 100% selaras dengan spesifikasi pada dokumen **SRS v1.0** (`PPSI_4KA25_Kelompok5_03._SRS_v1.0.docx`) dan **SDD v1.0** (`PPSI_4KA25_Kelompok5_04_SDD_v1.0.docx`).

---

## 1. Rincian Penyesuaian

1. **Pembatasan Tab `Persetujuan Kasbon` Khusus untuk Pemilik/Admin (`wireframe/js/pages-transaksi-kasbon.js`)**
   - Sesuai SRS **UC-05 (`Mengelola Kasbon & Piutang` - Pemilik/Admin)** dan **UC-19 (`Mengelola Pembayaran & Piutang` - Pegawai Toko/Kasir)**, fitur menyetujui atau menolak pengajuan kasbon pelanggan hanya dimiliki oleh **Pemilik/Admin**.
   - Pada halaman `Kasbon & Pembayaran Piutang`, komponen `ResponsiveTabs` (`Tagihan Piutang` | `Persetujuan Kasbon`) kini hanya ditampilkan saat login sebagai **Pemilik/Admin** (`role === "admin"`). Saat login sebagai **Kasir** (`role === "kasir"`), halaman langsung menampilkan tabel **Daftar Tagihan Piutang Pelanggan** beserta aksi **Terima Pembayaran** tanpa tab `Persetujuan Kasbon`.

2. **Penyeragaman Istilah Status Pengiriman Sesuai SRS Bab 7.1 (`wireframe/data/mock-data.js`, `wireframe/js/components.js`, `wireframe/js/pages-auth-dashboard.js`, `wireframe/js/pages-pengiriman-sistem.js`, `wireframe/js/app.js`, & `wireframe/panduan-gaya.html`)**
   - Mengikuti ketetapan SRS Bab 7.1 (*Tampilan Status*), seluruh status pengiriman di data simulasi, lencana status (`StatusBadge`), kartu ringkasan Dashboard Pengirim, dropdown filter pengiriman, halaman proses pengiriman, dan halaman `panduan-gaya.html` diseragamkan menjadi 4 status resmi:
     - **`Menunggu Dikirim`** (menggantikan `Menunggu Muat`)
     - **`Dalam Perjalanan`**
     - **`Selesai`** (menggantikan `Terkirim`)
     - **`Ada Kendala`** (menggantikan `Berkendala` / `Pengajuan Penukaran` sebagai status pengiriman)

3. **Konsistensi Judul Halaman `Riwayat Pelanggan` (`wireframe/js/pages-master.js`)**
   - Pada `renderDetailPelangganPage()`, judul utama halaman pada `PageHeader` diseragamkan menjadi **`Riwayat Pelanggan`** (dengan nama pelanggan ditampilkan di dalam kartu ringkasan pertama `Pelanggan & Kontak`), sehingga tampilan halaman detail pelanggan pada akun Pemilik/Admin (`UI-07`) dan Kasir (`UI-43`) memiliki penamaan yang konsisten.

4. **Penyeragaman Nama Menu Sidebar dengan Judul Halaman Konten (`<h1>`) dan Breadcrumb**
   - Seluruh halaman menu utama maupun sub-halaman form telah diseragamkan agar label menu di sidebar sama persis dengan teks breadcrumb terakhir dan judul `<h1>` di area konten:
     - `Dashboard` -> **`Dashboard`** (sebelumnya `Ringkasan Hari Ini`)
     - `Transaksi Penjualan (POS)` -> **`Transaksi Penjualan (POS)`** (sebelumnya `Transaksi Kasir` / `Transaksi Kasir (POS)`)
     - `Data Barang & Barcode` -> **`Data Barang & Barcode`** (sebelumnya `Data Barang & Multi-Satuan`)
     - `Stok Minimum & Restok` -> **`Stok Minimum & Restok`** (sebelumnya `Stok Minimum & Perencanaan Restok (...)`)
     - `Utang & Tempo Pemasok` -> **`Utang & Tempo Pemasok`** (sebelumnya `Utang & Pembayaran Tempo Pemasok`)
     - `Penugasan & Proses Kirim` -> **`Penugasan & Proses Kirim`** (sebelumnya `Penugasan & Monitoring Pengiriman`)
     - `Log Aktivitas Sistem` -> **`Log Aktivitas Sistem`** (sebelumnya `Log Aktivitas Pengguna`)
     - Sub-halaman form (`Tambah Barang Baru` / `Ubah Data Barang`, `Cetak Label Barcode`, `Tambah Pelanggan Baru` / `Ubah Data Pelanggan`, `Proses Penukaran Barang`, `Catat Barang Masuk` / `Catat Barang Keluar`, `Tambah Tagihan Tempo Pemasok`, `Proses Pengiriman`, dan `Tambah Pengguna` / `Ubah Pengguna`) memiliki teks breadcrumb terakhir dan judul `<h1>` yang identik sesuai SDD Tabel 18.

5. **Perbaikan Responsif Tinggi Katalog POS saat `Kirim Barang ke Alamat Pelanggan` Dicentang (`wireframe/css/wireframe.css` & `wireframe/js/pages-transaksi-kasbon.js`)**
   - Pada tampilan desktop (`>= 1024px`), pembungkus katalog `.wf-pos-catalog-wrap` (`flex: 1 1 auto; position: relative; min-height: 480px;`) dan `.wf-pos-catalog-scroll` (`position: absolute; inset: 0; max-height: none;`) kini mengikuti tinggi penuh kartu `Keranjang Belanja` di sebelah kanan secara dinamis, sehingga tidak ada lagi ruang kosong putih di bagian bawah kartu `Pilih Barang` ketika kotak centang `Kirim Barang ke Alamat Pelanggan` diaktifkan.
   - Nilai awal kolom `Alamat Tujuan` juga diperbaiki agar tidak terisi otomatis dengan teks `"Pembelian Langsung di Toko"` saat pelanggan yang dipilih adalah `Pelanggan Umum (Tunai Toko)`.

6. **Perbaikan Desain Kotak Unggah & Pratinjau Bukti Foto Pengiriman serta Hak Akses Tab Pengiriman (`wireframe/css/wireframe.css`, `wireframe/js/pages-auth-dashboard.js`, `wireframe/js/pages-pengiriman-sistem.js`, & `wireframe/js/app.js`)**
   - Pada halaman **`Proses Pengiriman`** (`UI-29` & `UI-58`) bagian **`2. Serah Terima di Lokasi Pelanggan`**, komponen **`Bukti Foto Penerimaan & Tanda Terima`** diubah dari input teks biasa menjadi kotak dropzone unggah foto wireframe (`.wf-upload-box`) yang memiliki bingkai pratinjau gambar garis menyilang (`.wf-upload-preview`), ikon kamera/gambar, informasi nama berkas bukti foto, serta tombol **`Pilih / Unggah Foto`**.
   - Pada tabel **`Penugasan & Proses Kirim`** dan **`Dashboard (Pengirim)`**, penugasan yang berstatus **`Selesai`** kini tidak lagi menampilkan tombol `Proses` yang dapat diklik pada kolom Aksi, melainkan indikator teks non-aktif `Selesai`.
   - Sesuai **Activity Diagram Pemilik/Admin (`UC-08: Memonitor Pengiriman Barang`)**, pada akun **Pemilik/Admin** (`role === "admin"`) halaman **`Penugasan & Proses Kirim`** kini berfungsi khusus untuk **monitoring pengiriman**: tombol **`+ Buat Penugasan`** hanya muncul pada akun **Kasir** (`UC-21`), kolom Aksi pada akun Admin menampilkan tombol **`Detail`** (sama seperti Kasir, bukan tombol `Proses`), dan tab **`Laporan Kendala`** pada akun Admin hanya menampilkan tabel **`Riwayat Laporan Kendala`** tanpa form input kendala lapangan.
   - Pada akun **Kasir** (`role === "kasir"`), tab **`Laporan Kendala`** disembunyikan dari halaman **`Penugasan & Proses Kirim`** sesuai SRS (`UC-21` vs `UC-27`), sehingga Kasir hanya melihat tab **`Daftar Penugasan`** dan **`Riwayat & Bukti Penerimaan`**.
   - Pada modal **`Detail Penugasan Pengiriman`** (`UI-51`) ketika Kasir menekan tombol **`Detail`**, ditampilkan kotak pratinjau gambar wireframe **`Bukti Foto Penerimaan & Tanda Terima`** secara *read-only* (tanpa tombol `Pilih / Unggah Foto`), serta perbaikan tata letak header modal (`.wf-modal > .wf-card-header`) agar tombol tutup (`×`) tetap berada di sudut kanan atas sejajar dengan judul modal.

---

## 2. Daftar File yang Diperbarui

1. [`wireframe/css/wireframe.css`](../wireframe/css/wireframe.css)
2. [`wireframe/js/state.js`](../wireframe/js/state.js)
3. [`wireframe/data/mock-data.js`](../wireframe/data/mock-data.js)
4. [`wireframe/js/components.js`](../wireframe/js/components.js)
5. [`wireframe/js/pages-auth-dashboard.js`](../wireframe/js/pages-auth-dashboard.js)
6. [`wireframe/js/pages-master.js`](../wireframe/js/pages-master.js)
7. [`wireframe/js/pages-transaksi-kasbon.js`](../wireframe/js/pages-transaksi-kasbon.js)
8. [`wireframe/js/pages-stok-pemasok.js`](../wireframe/js/pages-stok-pemasok.js)
9. [`wireframe/js/pages-pengiriman-sistem.js`](../wireframe/js/pages-pengiriman-sistem.js)
10. [`wireframe/js/app.js`](../wireframe/js/app.js)
11. [`wireframe/panduan-gaya.html`](../wireframe/panduan-gaya.html)
12. [`dokumentasi-wireframe/08-penyesuaian-wireframe-dengan-srs-dan-sdd.md`](./08-penyesuaian-wireframe-dengan-srs-dan-sdd.md)
