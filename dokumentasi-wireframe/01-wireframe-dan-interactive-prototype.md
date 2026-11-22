# 01 - Dokumentasi Wireframe & Interactive Prototype Sistem Inventaris dan POS TB Kurnia Mandiri

Dokumen ini menjelaskan analisis diagram terbaru, daftar halaman wireframe low-fidelity (grayscale), pemetaan entitas mock data, alur interaksi prototype, struktur folder, serta cara menjalankan prototype yang terisolasi di dalam folder `wireframe/`.

## 1. Tujuan dan Batasan Pekerjaan

1. Menyediakan **Low-Fidelity Grayscale Wireframe** sekaligus **Interactive Prototype** untuk kebutuhan Software Design Document (SDD) Sistem Inventaris dan Penjualan Toko Bangunan Kurnia Mandiri.
2. Seluruh desain menggunakan palet hitam, putih, dan abu-abu (`#171717`, `#262626`, `#4A4A4A`, `#737373`, `#CCCCCC`, `#EBEBEB`, `#F4F4F4`, `#FFFFFF`) tanpa warna aksen biru, hijau, merah, atau kuning.
3. Seluruh file prototype ditempatkan di dalam folder `wireframe/` dan tidak mengubah source code aplikasi utama, konfigurasi `.env`, maupun database Supabase.

## 2. Hasil Analisis Diagram Terbaru (Acuan Utama)

Berdasarkan analisis terhadap 8 diagram terbaru di `wireframe/diagram/`:
- **Use Case Diagram** (`Pemilik / Admin`, `Pegawai Toko (Kasir)`, `Karyawan Lapangan / Pengirim`)
- **Activity Diagram To-Be** (`Pemilik / Admin`, `Pegawai Toko (Kasir)`, `Karyawan Lapangan / Pengirim`)
- **Class Diagram** dan **ERD Keseluruhan** (19 entitas/kelas data)

Diperoleh pembagian aktor, hak akses, dan daftar halaman utama beserta halaman form/detail tersendiri sebagai berikut:

### A. Pembagian Aktor & Hak Akses
1. **Pemilik / Admin (`admin`)**: Dapat mengakses seluruh fitur sistem (fitur Pemilik, Kasir, dan Pengirim) tanpa perlu tombol pengalih role di sidebar.
2. **Pegawai Toko / Kasir (`kasir`)**: Hanya dapat mengakses Dashboard Kasir, Transaksi Penjualan (POS), Penukaran Barang, Barang Masuk & Keluar, Data Pelanggan, Pembayaran & Piutang, Riwayat Transaksi, serta Penugasan Pengiriman.
3. **Karyawan Lapangan / Pengirim (`pengirim`)**: Hanya dapat mengakses Dashboard Pengirim, Daftar Penugasan Pengiriman, Proses Pengiriman Barang, Laporan Kendala Pengiriman, dan Riwayat Pengiriman.

### B. Daftar Halaman Wireframe yang Dibuat (21 Tampilan / Halaman)

Proses form yang kompleks atau memiliki banyak field dipisahkan menjadi **halaman tersendiri** (bukan modal), sedangkan modal hanya digunakan untuk aksi ringkas seperti konfirmasi penghapusan, input alasan penolakan kasbon, input pembayaran cicilan, dan tampilan struk printer thermal.

| No | ID Rute Halaman | Nama Halaman Wireframe | Aktor yang Mengakses | Alasan & Acuan Diagram |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `login` | **Halaman Login Sistem** | Semua Aktor | Mempertahankan desain split-screen aplikasi utama dalam versi grayscale dengan tab `Pemilik`, `Kasir`, `Pengirim`. Klik tab tidak mengisi input otomatis (wajib ketik manual). |
| 2 | `dashboard` | **Halaman Dashboard (Menyesuaikan Role)** | Semua Aktor | Mengacu struktur `DashboardPage` aplikasi utama, dengan isi kartu & tabel menyesuaikan Activity Diagram Pemilik (Penjualan, Stok, Piutang, Utang Pemasok), Kasir (Transaksi Hari Ini & Stok Menipis), dan Pengirim (Penugasan Hari Ini). |
| 3 | `transaksi-penjualan` | **Halaman Transaksi Penjualan (Kasir POS)** | Pemilik, Kasir | Mewakili alur kasir 2 panel: katalog produk, simulasi pindai barcode produk/meja kasir, pilihan multi-satuan (`SatuanBarang`), validasi harga nego (`Harga Modal < Penawaran < Harga Jual Awal +30%`), pembayaran Tunai/QRIS/VA/Kasbon, dan opsi kirim barang. |
| 4 | `riwayat-transaksi` | **Halaman Riwayat & Rekap Penjualan** | Pemilik, Kasir | Filter periode, pelanggan, dan status bayar; rekap omzet, piutang, harga nego, dan penukaran; cetak ulang struk/nota pelanggan; unduh rekap Excel/PDF. |
| 5 | `penukaran-barang` | **Halaman Daftar Penukaran Barang** | Pemilik, Kasir | Menampilkan daftar riwayat dan pengajuan penukaran barang pelanggan (`Penukaran` & `DetailPenukaran`). |
| 6 | `form-penukaran-barang` | **Halaman Form Proses Penukaran Barang** *(Halaman Tersendiri)* | Pemilik, Kasir | Form multi-tahap sesuai Activity Diagram Kasir Bagian 3: cari nota asal, periksa ketentuan toko (atau tolak penukaran), pilih kondisi barang kembali (`Layak Jual` / `Rusak`), pilih barang pengganti, hitung selisih harga, dan cetak struk penukaran. |
| 7 | `data-barang` | **Halaman Data Barang & Barcode** | Pemilik | Tabel master barang lengkap dengan harga beli pemasok, harga modal dasar, daftar multi-satuan jual (`SatuanBarang`), stok, batas minimum, dan tipe barcode. |
| 8 | `form-barang` | **Halaman Form Tambah / Ubah Barang** *(Halaman Tersendiri)* | Pemilik | Form kompleks pengaturan identitas barang, konversi satuan beli pemasok ke satuan dasar, perhitungan otomatis `Harga Jual Awal = Harga Modal + Margin 30%`, dan pengaturan multi-satuan jual. |
| 9 | `cetak-barcode` | **Halaman Cetak Label Barcode (Produk & Meja Kasir)** *(Halaman Tersendiri)* | Pemilik | Pratinjau cetak stiker barcode kemasan produk dan lembar katalog barcode meja kasir untuk material curah tanpa kemasan (Hebel, Pasir). |
| 10 | `barang-masuk-keluar` | **Halaman Barang Masuk & Keluar (Mutasi Stok)** | Pemilik, Kasir | Menampilkan daftar stok terkini dan tabel riwayat `MutasiBarang` masuk maupun keluar. |
| 11 | `form-mutasi-barang` | **Halaman Form Catat Barang Masuk / Keluar** *(Halaman Tersendiri)* | Pemilik, Kasir | Form penerimaan barang dari pemasok (No. Surat Jalan, Harga Beli, Pembayaran `Lunas` atau `Tempo` dengan Tanggal Jatuh Tempo yang otomatis membuat `TagihanPemasok`) serta form pengeluaran barang. |
| 12 | `stok-dan-restok` | **Halaman Stok Minimum & Perencanaan Restok** | Pemilik | Pengaturan batas stok minimum per barang dan pembuatan rencana restok (`RencanaRestok`). |
| 13 | `utang-pemasok` | **Halaman Utang & Pembayaran Tempo Pemasok** | Pemilik | Pemantauan daftar `TagihanPemasok`, status jatuh tempo, dan pencatatan `PembayaranPemasok` dengan validasi nominal tidak melebihi sisa tagihan. |
| 14 | `form-tagihan-pemasok` | **Halaman Form Tambah Tagihan Tempo Pemasok** *(Halaman Tersendiri)* | Pemilik | Form input tagihan tempo pemasok baru (pemasok, nomor surat jalan, jumlah tagihan, tanggal jatuh tempo). |
| 15 | `data-pelanggan` | **Halaman Data Pelanggan** | Pemilik, Kasir | Tabel pelanggan Proyek dan Perorangan beserta batas kasbon, sisa piutang, dan status kasbon. |
| 16 | `form-pelanggan` | **Halaman Form Tambah / Ubah Pelanggan** *(Halaman Tersendiri)* | Pemilik, Kasir | Halaman form tersendiri untuk mengisi identitas pelanggan, jenis (`Proyek` / `Perorangan`), kontak, alamat proyek/rumah, batas maksimal kasbon, dan status fasilitas kasbon. |
| 17 | `detail-pelanggan` | **Halaman Detail Riwayat Transaksi & Piutang Pelanggan** *(Halaman Tersendiri)* | Pemilik, Kasir | Menampilkan ringkasan kuota kasbon pelanggan beserta tabel riwayat nota transaksi pelanggan terkait. |
| 18 | `kasbon-dan-piutang` | **Halaman Kasbon & Pembayaran Piutang** | Pemilik, Kasir | Memiliki 2 tab: (1) Penerimaan pembayaran piutang pelanggan (Tunai / Transfer Bank + cetak bukti pembayaran), dan (2) Persetujuan / Penolakan permintaan kasbon oleh Pemilik (dengan input alasan penolakan wajib diisi). |
| 19 | `pengiriman-barang` | **Halaman Penugasan, Kendala, & Riwayat Pengiriman** | Semua Aktor | Memiliki 3 tab: (1) Daftar Penugasan Pengiriman & buat penugasan baru, (2) Form & tabel Laporan Kendala Pengiriman (`LaporanKendala`), dan (3) Riwayat Pengiriman & Bukti Penerimaan. |
| 20 | `form-proses-pengiriman` | **Halaman Proses Pengiriman Barang Lapangan** *(Halaman Tersendiri)* | Pemilik, Pengirim | Alur kerja lapangan step-by-step sesuai Activity Diagram Pengirim Bagian 2: cek kelengkapan barang di gudang (muat ke kendaraan atau lapor tidak lengkap), serah terima di lokasi pelanggan (unggah foto bukti penerimaan `Terkirim` atau catat pengajuan penukaran barang). |
| 21 | `pengguna-dan-hak-akses`, `form-pengguna`, & `log-aktivitas` | **Halaman Pengguna & Hak Akses, Form Akun, & Halaman Log Aktivitas Sistem** | Pemilik | Pengelolaan akun pegawai (tambah akun di halaman form tersendiri, ubah hak akses, reset password sementara, nonaktifkan akun) serta audit trail `LogAktivitas` (filter peran, lihat detail data sebelum & sesudah, unduh Excel/PDF). |

## 3. Struktur File yang Ditambahkan di Folder `wireframe/`

| Path File | Tujuan dan Fungsi |
| :--- | :--- |
| `wireframe/index.html` | Entry point HTML prototype interaktif yang memuat stylesheet grayscale dan seluruh modul JavaScript. |
| `wireframe/README.md` | Petunjuk ringkas struktur folder, cara menjalankan prototype, dan daftar akun simulasi login. |
| `wireframe/assets/Team5.jpeg` | Salinan lokal foto tim untuk panel visual halaman login (ditampilkan dengan filter grayscale). |
| `wireframe/css/wireframe.css` | Stylesheet low-fidelity grayscale (hitam, putih, abu-abu) untuk layout sidebar, header, kartu, tabel, form, badge, dan modal. |
| `wireframe/data/mock-data.js` | Data dummy awal yang merepresentasikan 19 entitas pada Class Diagram dan ERD terbaru. |
| `wireframe/js/state.js` | Penyimpanan state di memori browser (`sessionStorage`), aturan hak akses per role, kalkulasi harga/konversi, serta pencatatan log aktivitas dan notifikasi otomatis. |
| `wireframe/js/components.js` | Komponen UI konsisten: Sidebar (tanpa tombol ganti role aktif), Header (pencarian & dropdown notifikasi), Breadcrumb `PageHeader`, `StatusBadge` grayscale, Modal dialog, dan Modal Struk Thermal. |
| `wireframe/js/pages-auth-dashboard.js` | Render halaman Login split-screen grayscale dan halaman Dashboard untuk 3 aktor. |
| `wireframe/js/pages-master.js` | Render halaman Data Barang, Form Tambah/Ubah Barang, Cetak Barcode, Data Pelanggan, Form Tambah/Ubah Pelanggan, dan Detail Pelanggan. |
| `wireframe/js/pages-transaksi-kasbon.js` | Render halaman Transaksi Penjualan (POS), Riwayat & Rekap Penjualan, Penukaran Barang + Form Penukaran, serta Kasbon & Pembayaran Piutang. |
| `wireframe/js/pages-stok-pemasok.js` | Render halaman Barang Masuk & Keluar, Form Mutasi Barang, Stok Minimum & Perencanaan Restok, serta Utang & Pembayaran Tempo Pemasok + Form Tagihan. |
| `wireframe/js/pages-pengiriman-sistem.js` | Render halaman Pengiriman Barang, Form Proses Pengiriman Lapangan, Laporan Kendala, Pengguna & Hak Akses + Form Akun, serta Log Aktivitas Sistem. |
| `wireframe/js/app.js` | Controller utama untuk navigasi antarhalaman, validasi form, simulasi CRUD state lokal, dan event delegation. |

## 4. Cara Menjalankan Prototype

1. **Membuka Langsung di Browser**:
   Buka file `wireframe/index.html` menggunakan browser (Chrome, Edge, atau Firefox).
2. **Melalui Server Statis Lokal (Opsional)**:
   Jalankan `npx serve wireframe -l 4000` dari terminal, kemudian buka `http://localhost:4000`.
3. **Reset Data Simulasi**:
   Selama mencoba prototype, seluruh penambahan/perubahan data tersimpan sementara di sesi browser. Klik tombol **"Reset Data Dummy"** pada bar hitam di bagian paling atas layar kapan saja untuk mengembalikan data ke kondisi awal.
