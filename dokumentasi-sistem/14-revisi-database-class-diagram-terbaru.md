# 14 - Revisi Skema Database Sesuai Class Diagram, Use Case & Activity Diagram Terbaru (Penghapusan Field Double)

Dokumentasi ini mencatat perombakan dan pembersihan skema database PostgreSQL (Supabase), model Prisma (`prisma/schema.prisma`), definisi tipe TypeScript (`lib/types.ts`, `lib/db.ts`), serta layanan query modul (`components/*/layanan-*.ts`) agar **100% selaras dengan diagram terbaru** pada `Revisi_CV_Kurnia_mandiri.drawio` tanpa mengubah desain antarmuka (UI).

---

## 1. Ringkasan Permasalahan Sebelumnya (Field Double & Tabel Usang)

Pada skema database versi sebelumnya, terdapat sejumlah kolom ganda (*duplicate fields*) dan tabel yang tidak sesuai dengan Class Diagram terbaru:

1. **Tabel `barang` memiliki field ganda & atribut yang seharusnya berada di `satuan_barang`**:
   - `stok_min` (integer) dan `stok_minimum` (numeric) tercatat bersamaan.
   - `stok_awal` dan `stok` tercatat bersamaan.
   - `harga_beli` dan `harga` digabung di satu tabel tanpa pemisahan `harga_modal` dan tabel `satuan_barang`.
   - `merk` dan `keterangan` tidak ada pada Class Diagram `Barang` terbaru.
2. **Tabel `rencana_restok` memiliki field jumlah ganda**:
   - `restok` (integer) dan `jumlah_restok` (numeric) tercatat bersamaan, ditambah kolom `target` yang tidak ada di Class Diagram `RencanaRestok`.
3. **Tabel `pengaturan_sistem` menyimpan pengaturan ganda & tidak ada di Class Diagram**:
   - Menyimpan `notifikasi` + `notifikasi_detail` + `saluran_notifikasi` + `penerima_notifikasi` serta `gateway` + `gateway_detail` + `penyedia_gateway`.
   - Pada Class Diagram terbaru, `PengaturanSistem` tidak termasuk dalam 16 entitas database.
4. **Tabel `stok` duplikat dengan `detail_mutasi_barang`**:
   - Pergerakan `stok_sebelum` dan `stok_sesudah` sudah dicatat di `detail_mutasi_barang`, sehingga tabel `stok` tidak lagi ada di Class Diagram terbaru.
5. **Tabel `detail_transaksi` memiliki field harga ganda**:
   - Sebelumnya menyimpan `barang_id`, `harga_modal`, `harga_asli`, `harga_nego`, dan `harga_satuan` sekaligus.
   - Pada Class Diagram terbaru, `DetailTransaksi` berelasi ke `satuan_barang_id` (`SatuanBarang`) dan hanya menyimpan `jumlah`, `harga_awal`, `harga_nego`, `harga_satuan`, serta `subtotal`.
6. **Tabel `pengiriman` memiliki field penerima & metadata foto ganda**:
   - Sebelumnya menyimpan `detail_penerima`, `nama_penerima_aktual`, `foto_bukti_nama`, `foto_bukti_mime`, dan `alasan_retur` yang tidak ada di Class Diagram `Pengiriman` terbaru (data penerima diambil langsung melalui relasi `transaksi_id -> pelanggan`).

---

## 2. Daftar 20 Tabel Database Sesuai Class Diagram & ERD Terbaru

Seluruh tabel di database Supabase kini telah diselaraskan tepat menjadi **20 tabel** sesuai Class Diagram dan ERD terbaru (termasuk penamaan Primary Key `id_<tabel>`):

| No | Nama Tabel Database | Nama Class Diagram | Kolom Utama Sesuai Class Diagram & ERD |
|---:|---|---|---|
| 1 | `pengguna` | `Pengguna` | `id_pengguna` (PK), `nama`, `username`, `password`, `role` (`admin`, `kasir`, `pengirim`), `status`, `created_at` |
| 2 | `log_aktivitas` | `LogAktivitas` | `id_log` (PK), `pengguna_id` (FK), `modul`, `aktivitas`, `data_sebelum`, `data_sesudah`, `waktu` |
| 3 | `notifikasi` | `Notifikasi` | `id_notifikasi` (PK), `jenis`, `penerima`, `saluran`, `pesan`, `status_kirim`, `waktu` |
| 4 | `pelanggan` | `Pelanggan` | `id_pelanggan` (PK), `nama`, `jenis`, `kontak`, `alamat`, `batas_kasbon`, `status_kasbon`, `created_at` |
| 5 | `kasbon` | `Kasbon` | `id_kasbon` (PK), `pelanggan_id` (FK), `transaksi_id` (FK), `jumlah_kasbon`, `status`, `alasan_penolakan`, `tanggal_pengajuan`, `tanggal_keputusan` |
| 6 | `transaksi` | `Transaksi` | `id_transaksi` (PK), `no_nota`, `pengguna_id` (FK), `pelanggan_id` (FK), `jenis_pembayaran`, `total`, `jumlah_dibayar`, `sisa_tagihan`, `status_bayar`, `perlu_dikirim`, `tanggal` |
| 7 | `detail_transaksi` | `DetailTransaksi` | `id_detail_transaksi` (PK), `transaksi_id` (FK), `satuan_barang_id` (FK), `jumlah`, `harga_awal`, `harga_nego`, `harga_satuan`, `subtotal` |
| 8 | `pembayaran` | `Pembayaran` | `id_pembayaran` (PK), `transaksi_id` (FK), `metode`, `nominal`, `bukti_transfer_url`, `referensi_gateway`, `status`, `tanggal` |
| 9 | `barang` | `Barang` | `id_barang` (PK), `kode_barang`, `nama`, `kategori`, `barcode`, `barcode_fisik`, `satuan_dasar`, `stok`, `stok_minimum`, `satuan_pembelian`, `isi_per_satuan_beli`, `harga_beli`, `harga_modal`, `created_at` |
| 10 | `satuan_barang` | `SatuanBarang` | `id_satuan_barang` (PK), `barang_id` (FK), `nama_satuan`, `jumlah_konversi`, `harga_modal`, `margin_persen`, `harga_jual_awal` |
| 11 | `rencana_restok` | `RencanaRestok` | `id_restok` (PK), `barang_id` (FK), `jumlah_restok`, `status`, `tanggal` |
| 12 | `pemasok` | `Pemasok` | `id_pemasok` (PK), `nama`, `kontak`, `alamat`, `created_at` |
| 13 | `mutasi_barang` | `MutasiBarang` | `id_mutasi` (PK), `pengguna_id` (FK), `pemasok_id` (FK), `jenis`, `no_surat_jalan`, `jenis_bayar`, `tujuan`, `alasan`, `tanggal` |
| 14 | `detail_mutasi_barang` | `DetailMutasiBarang` | `id_detail_mutasi` (PK), `mutasi_id` (FK), `barang_id` (FK), `satuan_pembelian`, `jumlah`, `harga_beli`, `subtotal`, `stok_sebelum`, `stok_sesudah` |
| 15 | `tagihan_pemasok` | `TagihanPemasok` | `id_tagihan` (PK), `pemasok_id` (FK), `mutasi_id` (FK), `jumlah_tagihan`, `sisa_tagihan`, `tanggal_jatuh_tempo`, `status`, `created_at` |
| 16 | `pembayaran_pemasok` | `PembayaranPemasok` | `id_pembayaran_pemasok` (PK), `tagihan_id` (FK), `nominal`, `tanggal_bayar`, `keterangan` |
| 17 | `pengiriman` | `Pengiriman` | `id_pengiriman` (PK), `transaksi_id` (FK), `pengirim_id` (FK), `alamat_tujuan`, `status`, `foto_bukti_url`, `alasan_penukaran`, `tanggal_penugasan`, `tanggal_terima` |
| 18 | `laporan_kendala` | `LaporanKendala` | `id_laporan` (PK), `pengiriman_id` (FK), `jenis_kendala`, `deskripsi`, `created_at` |
| 19 | `penukaran` | `Penukaran` | `id_penukaran` (PK), `transaksi_id` (FK), `status`, `alasan_penukaran`, `alasan_penolakan`, `selisih_harga`, `tanggal_pengajuan`, `tanggal_selesai` |
| 20 | `detail_penukaran` | `DetailPenukaran` | `id_detail_penukaran` (PK), `penukaran_id` (FK), `satuan_asal_id` (FK), `satuan_pengganti_id` (FK), `jumlah_kembali`, `kondisi_barang`, `jumlah_pengganti`, `harga_pengganti` |

*(Catatan: Total 20 entitas pada Class Diagram telah diterapkan seluruhnya dan tabel `stok` serta `pengaturan_sistem` yang tidak ada di diagram telah dihapus).*

---

## 3.Rincian Pembersihan Field Double per Tabel

1. **Tabel `barang` & `satuan_barang`**:
   - Menghapus `stok_min`, `stok_awal`, `harga`, `satuan`, `merk`, dan `keterangan` dari tabel `barang`.
   - Menyimpan `satuan_dasar`, `stok`, `stok_minimum`, `satuan_pembelian`, `isi_per_satuan_beli`, `harga_beli`, dan `harga_modal` di tabel `barang`.
   - Memindahkan informasi satuan jual dan harga jual awal (`nama_satuan`, `jumlah_konversi`, `harga_modal`, `margin_persen` = 30%, `harga_jual_awal`) ke tabel `satuan_barang`.
2. **Tabel `rencana_restok`**:
   - Menghapus kolom duplikat `restok` dan `target`, menyisakan `barang_id`, `jumlah_restok`, `status`, dan `tanggal`.
3. **Tabel `mutasi_barang` & `detail_mutasi_barang`**:
   - Mengganti kolom teks bebas `supplier` dan `no_referensi` pada `mutasi_barang` menjadi relasi `pemasok_id` (ke tabel `pemasok`), `no_surat_jalan`, dan `jenis_bayar` (`tunai` / `tempo`).
   - Mengganti `harga_satuan`, `total_harga`, dan `keterangan` pada `detail_mutasi_barang` menjadi `satuan_pembelian`, `harga_beli`, dan `subtotal`.
   - Ketika kasir mencatat Barang Masuk dengan pembayaran `tempo`, sistem otomatis membuat catatan utang baru di tabel `tagihan_pemasok`.
4. **Tabel `detail_transaksi`**:
   - Menghapus `barang_id`, `harga_modal`, dan `harga_asli`, serta menghubungkan setiap baris transaksi langsung ke `satuan_barang_id` dengan kolom `jumlah`, `harga_awal`, `harga_nego`, `harga_satuan`, dan `subtotal`.
5. **Tabel `pengiriman`**:
   - Menghapus `detail_penerima`, `nama_penerima_aktual`, `foto_bukti_nama`, `foto_bukti_mime`, `alasan_retur`, dan `foto_barang_url` (kolom foto ganda).
   - Menyisakan tepat `foto_bukti_url` (`text`) dan `alasan_penukaran` (`text`) sesuai ERD & Class Diagram `Pengiriman`, serta menghubungkan pengajuan penukaran ke tabel `penukaran`.
6. **Perbaikan Peringatan Supabase Security Advisor (`0024`, `0028`, `0029`) & Performance Advisor (`0001_unindexed_foreign_keys`, `0006_multiple_permissive_policies`)**:
   - Menghapus policy `FOR ALL USING (true) WITH CHECK (true)` dan menggantinya dengan **satu** policy `Kelola data ...` per tabel yang memiliki predikat validasi data eksplisit pada peran `TO anon, authenticated` (mengatasi peringatan `0024_permissive_rls_policy` sekaligus mencegah `0006_multiple_permissive_policies`).
   - Mencabut izin `EXECUTE` publik (`PUBLIC`, `anon`, `authenticated`) pada fungsi event trigger `public.rls_auto_enable()` agar tidak dapat dipanggil melalui `/rest/v1/rpc/rls_auto_enable` (mengatasi peringatan `0028_anon_security_definer_function_executable` dan `0029_authenticated_security_definer_function_executable`).
   - Menambahkan **24 covering indexes** (`idx_<table>_<fk_column>`) untuk seluruh kolom *foreign key* pada `supabase_schema.sql` dan `prisma/schema.prisma` (mengatasi 24 informasi `0001_unindexed_foreign_keys`).

---

## 4. Daftar File yang Diperbarui

- [`supabase_schema.sql`](../supabase_schema.sql): Pembaruan DDL 20 tabel Class Diagram, kebijakan RLS, serta data *seed* 130 barang beserta `satuan_barang`, `pemasok`, `tagihan_pemasok`, dan `pembayaran_pemasok`.
- [`prisma/schema.prisma`](../prisma/schema.prisma): Penyelarasan model Prisma ORM dengan 20 tabel Class Diagram terbaru.
- [`lib/types.ts`](../lib/types.ts) & [`lib/db.ts`](../lib/db.ts): Pembaruan tipe tabel Supabase dan penyederhanaan tipe `Role` menjadi 3 aktor (`admin`, `kasir`, `pengirim`).
- [`lib/supabase.ts`](../lib/supabase.ts) & [`app/api/webhook/gateway/route.ts`](../app/api/webhook/gateway/route.ts): Pembatasan panjang string `modul` (`varchar(30)`) dan `aktivitas` (`varchar(50)`) saat menyimpan ke `log_aktivitas`.
- [`components/barang/layanan-barang.ts`](../components/barang/layanan-barang.ts), [`components/barang/use-barang.ts`](../components/barang/use-barang.ts), [`components/barang/BarangPage.tsx`](../components/barang/BarangPage.tsx), [`components/barang/komponen/ModalBarang.tsx`](../components/barang/komponen/ModalBarang.tsx), [`components/barang/komponen/PanelRestokBarang.tsx`](../components/barang/komponen/PanelRestokBarang.tsx), [`components/barang/komponen/TabelKatalogBarang.tsx`](../components/barang/komponen/TabelKatalogBarang.tsx), [`components/barang/komponen/TabelMutasiBarang.tsx`](../components/barang/komponen/TabelMutasiBarang.tsx): Penyesuaian query & mutasi barang, satuan barang, rencana restok, pemasok, dan tagihan tempo pemasok tanpa mengubah desain halaman.
- [`components/transaksi/layanan-transaksi.ts`](../components/transaksi/layanan-transaksi.ts) & [`components/transaksi/use-transaksi.ts`](../components/transaksi/use-transaksi.ts): Penyesuaian query transaksi & penyimpanan `detail_transaksi` melalui `satuan_barang_id`.
- [`components/pengiriman/layanan-pengiriman.ts`](../components/pengiriman/layanan-pengiriman.ts): Penyesuaian query `pengiriman` dengan join `transaksi -> pelanggan`, penyimpanan `alasan_penukaran` & `foto_barang_url`, serta pencatatan ke tabel `penukaran`.
- [`components/laporan/layanan-laporan.ts`](../components/laporan/layanan-laporan.ts), [`components/laporan/use-laporan.ts`](../components/laporan/use-laporan.ts), [`components/laporan/komponen/TabelPratinjauLaporan.tsx`](../components/laporan/komponen/TabelPratinjauLaporan.tsx): Penyesuaian rekap laporan dengan skema `barang`, `satuan_barang`, dan `detail_mutasi_barang` terbaru.
- [`components/dashboard/layanan-dashboard.ts`](../components/dashboard/layanan-dashboard.ts), [`components/layout/layanan-layout.ts`](../components/layout/layanan-layout.ts), [`components/pengaturan/layanan-pengaturan.ts`](../components/pengaturan/layanan-pengaturan.ts): Penyesuaian query ringkasan stok minimum (`stok_minimum`), pencarian cepat header, dan penghapusan ketergantungan pada tabel `pengaturan_sistem`.
