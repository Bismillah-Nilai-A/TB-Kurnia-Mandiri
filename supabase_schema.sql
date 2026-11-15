-- ==============================================================================
-- SCHEMA & SEED DATA SUPABASE: CV KURNIA MANDIRI (TOKO BANGUNAN & POS)
-- ==============================================================================
-- Jalankan skrip ini langsung di Supabase Dashboard -> SQL Editor
-- Script ini bersifat idempoten (bisa dijalankan ulang dengan aman)

-- 1. DROP EXISTING TABLES (Reverse Dependency Order)
DROP TABLE IF EXISTS log_aktivitas CASCADE;
DROP TABLE IF EXISTS pengaturan_sistem CASCADE;
DROP TABLE IF EXISTS notifikasi CASCADE;
DROP TABLE IF EXISTS laporan_kendala CASCADE;
DROP TABLE IF EXISTS pengiriman CASCADE;
DROP TABLE IF EXISTS rencana_restok CASCADE;
DROP TABLE IF EXISTS kasbon CASCADE;
DROP TABLE IF EXISTS pembayaran CASCADE;
DROP TABLE IF EXISTS detail_transaksi CASCADE;
DROP TABLE IF EXISTS transaksi CASCADE;
DROP TABLE IF EXISTS detail_mutasi_barang CASCADE;
DROP TABLE IF EXISTS mutasi_barang CASCADE;
DROP TABLE IF EXISTS stok CASCADE;
DROP TABLE IF EXISTS barang CASCADE;
DROP TABLE IF EXISTS pelanggan CASCADE;
DROP TABLE IF EXISTS pengguna CASCADE;

-- 2. CREATE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. CREATE TABLES

-- Tabel Pengguna (Staff & Karyawan Toko)
CREATE TABLE pengguna (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(150) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'kasir' CHECK (role IN ('admin', 'kasir', 'pengelola', 'pengirim', 'pelanggan')),
    status VARCHAR(50) NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Pelanggan (Proyek & Perorangan)
CREATE TABLE pelanggan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(150) NOT NULL,
    jenis VARCHAR(50) NOT NULL DEFAULT 'perorangan' CHECK (jenis IN ('proyek', 'perorangan')),
    kontak VARCHAR(50),
    alamat TEXT,
    batas_kasbon NUMERIC(15,2) DEFAULT 0,
    status_kasbon VARCHAR(50) DEFAULT 'aktif' CHECK (status_kasbon IN ('aktif', 'ditolak', 'menunggu')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Data Barang (Material Bangunan) - Sesuai Class Diagram (Barang)
CREATE TABLE barang (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_barang VARCHAR(50) UNIQUE NOT NULL,
    nama VARCHAR(200) NOT NULL,
    merk VARCHAR(100) DEFAULT '-',
    kategori VARCHAR(100) NOT NULL,
    barcode VARCHAR(100) UNIQUE,
    harga_beli NUMERIC(15,2) NOT NULL DEFAULT 0,
    harga NUMERIC(15,2) NOT NULL DEFAULT 0,
    stok_awal INTEGER NOT NULL DEFAULT 0,
    stok INTEGER NOT NULL DEFAULT 0,
    stok_min INTEGER NOT NULL DEFAULT 5,
    stok_minimum NUMERIC(15,2) NOT NULL DEFAULT 5,
    satuan VARCHAR(50) NOT NULL DEFAULT 'pcs',
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Riwayat Pergerakan Stok
CREATE TABLE stok (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barang_id UUID REFERENCES barang(id) ON DELETE CASCADE,
    stok_awal INTEGER NOT NULL,
    stok_akhir INTEGER NOT NULL,
    tipe VARCHAR(50) NOT NULL CHECK (tipe IN ('masuk', 'keluar', 'penyesuaian')),
    tanggal TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Mutasi Barang (Header)
CREATE TABLE mutasi_barang (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pengguna_id UUID REFERENCES pengguna(id) ON DELETE SET NULL,
    jenis VARCHAR(50) NOT NULL CHECK (jenis IN ('masuk', 'keluar', 'retur')),
    supplier VARCHAR(150),
    no_referensi VARCHAR(100),
    tujuan VARCHAR(150),
    alasan TEXT,
    tanggal TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Detail Mutasi Barang
CREATE TABLE detail_mutasi_barang (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mutasi_id UUID REFERENCES mutasi_barang(id) ON DELETE CASCADE,
    barang_id UUID REFERENCES barang(id) ON DELETE CASCADE,
    jumlah INTEGER NOT NULL CHECK (jumlah > 0),
    stok_sebelum INTEGER NOT NULL DEFAULT 0,
    stok_sesudah INTEGER NOT NULL DEFAULT 0,
    harga_satuan NUMERIC(15,2) NOT NULL DEFAULT 0,
    total_harga NUMERIC(15,2) NOT NULL DEFAULT 0,
    keterangan TEXT
);

-- Tabel Transaksi Penjualan (Header Nota)
CREATE TABLE transaksi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    no_nota VARCHAR(100) UNIQUE NOT NULL,
    pengguna_id UUID REFERENCES pengguna(id) ON DELETE SET NULL,
    pelanggan_id UUID REFERENCES pelanggan(id) ON DELETE SET NULL,
    jenis_pembayaran VARCHAR(50) NOT NULL CHECK (jenis_pembayaran IN ('tunai', 'kasbon', 'qris', 'va')),
    total NUMERIC(15,2) NOT NULL DEFAULT 0,
    jumlah_dibayar NUMERIC(15,2) NOT NULL DEFAULT 0,
    sisa_tagihan NUMERIC(15,2) NOT NULL DEFAULT 0,
    status_bayar VARCHAR(50) NOT NULL DEFAULT 'menunggu' CHECK (status_bayar IN ('lunas', 'menunggu', 'sebagian', 'dibatalkan')),
    perlu_dikirim BOOLEAN DEFAULT false,
    tanggal TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Detail Transaksi (Item Barang yang Dijual) - Sesuai Class Diagram (DetailTransaksi) + Fitur Harga Nego
CREATE TABLE detail_transaksi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaksi_id UUID REFERENCES transaksi(id) ON DELETE CASCADE,
    barang_id UUID REFERENCES barang(id) ON DELETE CASCADE,
    jumlah INTEGER NOT NULL CHECK (jumlah > 0),
    harga_modal NUMERIC(15,2) NOT NULL DEFAULT 0,
    harga_asli NUMERIC(15,2) NOT NULL DEFAULT 0,
    harga_nego NUMERIC(15,2),
    harga_satuan NUMERIC(15,2) NOT NULL DEFAULT 0,
    subtotal NUMERIC(15,2) NOT NULL DEFAULT 0,
    CONSTRAINT chk_harga_nego_diatas_modal CHECK (harga_nego IS NULL OR harga_nego >= harga_modal)
);

-- Tabel Pembayaran (Sesuai Class Diagram: Pembayaran)
CREATE TABLE pembayaran (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaksi_id UUID REFERENCES transaksi(id) ON DELETE CASCADE,
    metode VARCHAR(50) NOT NULL CHECK (metode IN ('tunai', 'qris', 'va', 'transfer')),
    nominal NUMERIC(15,2) NOT NULL DEFAULT 0,
    bukti_transfer_url TEXT,
    referensi_gateway VARCHAR(150),
    status VARCHAR(50) NOT NULL DEFAULT 'berhasil' CHECK (status IN ('berhasil', 'menunggu', 'gagal')),
    tanggal TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Kasbon / Piutang Pelanggan (Sesuai Class Diagram: Kasbon)
CREATE TABLE kasbon (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pelanggan_id UUID REFERENCES pelanggan(id) ON DELETE CASCADE,
    transaksi_id UUID REFERENCES transaksi(id) ON DELETE SET NULL,
    jumlah_kasbon NUMERIC(15,2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'menunggu' CHECK (status IN ('menunggu', 'disetujui', 'ditolak', 'lunas')),
    alasan_penolakan TEXT,
    tanggal_pengajuan TIMESTAMPTZ DEFAULT NOW(),
    tanggal_keputusan TIMESTAMPTZ
);

-- Tabel Rencana Restok (Sesuai Class Diagram: RencanaRestok)
CREATE TABLE rencana_restok (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barang_id UUID REFERENCES barang(id) ON DELETE CASCADE,
    restok INTEGER NOT NULL DEFAULT 0,
    jumlah_restok NUMERIC(15,2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'direncanakan' CHECK (status IN ('direncanakan', 'dipesan', 'selesai', 'batal')),
    target VARCHAR(100),
    tanggal TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Pengiriman (Sesuai Class Diagram: Pengiriman dengan FK transaksi_id & pengirim_id)
CREATE TABLE pengiriman (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaksi_id UUID REFERENCES transaksi(id) ON DELETE SET NULL,
    pengirim_id UUID REFERENCES pengguna(id) ON DELETE SET NULL,
    detail_penerima VARCHAR(150),
    nama_penerima_aktual VARCHAR(150),
    alamat_tujuan TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'belum_dikirim' CHECK (status IN ('belum_dikirim', 'sedang_dikirim', 'dikirim', 'diterima', 'gagal')),
    foto_bukti_url TEXT,
    foto_bukti_nama VARCHAR(255),
    foto_bukti_mime VARCHAR(100),
    alasan_retur TEXT,
    tanggal_penugasan TIMESTAMPTZ DEFAULT NOW(),
    tanggal_terima TIMESTAMPTZ
);

-- Tabel Laporan Kendala Pengiriman (Sesuai Class Diagram Baru: LaporanKendala)
CREATE TABLE laporan_kendala (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pengiriman_id UUID NOT NULL REFERENCES pengiriman(id) ON DELETE CASCADE,
    jenis_kendala VARCHAR(50) NOT NULL,
    deskripsi TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Notifikasi (Sesuai Class Diagram: Notifikasi)
CREATE TABLE notifikasi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jenis VARCHAR(100) NOT NULL,
    penerima VARCHAR(150) NOT NULL,
    saluran VARCHAR(50) NOT NULL DEFAULT 'email' CHECK (saluran IN ('email', 'whatsapp')),
    pesan TEXT NOT NULL,
    status_kirim VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status_kirim IN ('pending', 'terkirim', 'gagal')),
    waktu TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Pengaturan Sistem (Sesuai Class Diagram: PengaturanSistem)
CREATE TABLE pengaturan_sistem (
    id SERIAL PRIMARY KEY,
    notifikasi BOOLEAN DEFAULT true,
    notifikasi_detail TEXT,
    saluran_notifikasi VARCHAR(20) DEFAULT 'email',
    penerima_notifikasi VARCHAR(150) DEFAULT 'muhamadirfan.mi966@gmail.com',
    gateway VARCHAR(100) DEFAULT 'midtrans',
    gateway_detail TEXT,
    penyedia_gateway VARCHAR(50) DEFAULT 'midtrans',
    kunci_api TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Log Aktivitas
CREATE TABLE log_aktivitas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pengguna_id UUID REFERENCES pengguna(id) ON DELETE SET NULL,
    modul VARCHAR(100) NOT NULL,
    aktivitas VARCHAR(255) NOT NULL,
    data_sebelum JSONB,
    data_sesudah JSONB,
    waktu TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Mengaktifkan RLS dan memberikan full akses kepada anon dan authenticated untuk lingkungan operasional POS

ALTER TABLE pengguna ENABLE ROW LEVEL SECURITY;
ALTER TABLE pelanggan ENABLE ROW LEVEL SECURITY;
ALTER TABLE barang ENABLE ROW LEVEL SECURITY;
ALTER TABLE stok ENABLE ROW LEVEL SECURITY;
ALTER TABLE mutasi_barang ENABLE ROW LEVEL SECURITY;
ALTER TABLE detail_mutasi_barang ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE detail_transaksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE pembayaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE kasbon ENABLE ROW LEVEL SECURITY;
ALTER TABLE rencana_restok ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengiriman ENABLE ROW LEVEL SECURITY;
ALTER TABLE laporan_kendala ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifikasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengaturan_sistem ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_aktivitas ENABLE ROW LEVEL SECURITY;

-- Buat policy publik untuk memudahkan aplikasi POS internal membaca & menulis data
CREATE POLICY "Akses Penuh Pengguna" ON pengguna FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Penuh Pelanggan" ON pelanggan FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Penuh Barang" ON barang FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Penuh Stok" ON stok FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Penuh Mutasi" ON mutasi_barang FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Penuh Detail Mutasi" ON detail_mutasi_barang FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Penuh Transaksi" ON transaksi FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Penuh Detail Transaksi" ON detail_transaksi FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Penuh Pembayaran" ON pembayaran FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Penuh Kasbon" ON kasbon FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Penuh Rencana Restok" ON rencana_restok FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Penuh Pengiriman" ON pengiriman FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Penuh Laporan Kendala" ON laporan_kendala FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Penuh Notifikasi" ON notifikasi FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Penuh Pengaturan" ON pengaturan_sistem FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Penuh Log Aktivitas" ON log_aktivitas FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 5. SEED DATA (DATA AWAL TOKO BANGUNAN CV KURNIA MANDIRI)
-- ==============================================================================

-- 5.1 Data Pengguna
INSERT INTO pengguna (id, nama, username, password, role, status) VALUES
('a0000000-0000-0000-0000-000000000001', 'Arif Muhamad (Owner)', 'admin', 'admin123', 'admin', 'aktif'),
('a0000000-0000-0000-0000-000000000002', 'Cynthia Bella (Kasir 1)', 'kasir', 'kasir123', 'kasir', 'aktif'),
('a0000000-0000-0000-0000-000000000003', 'Irfan Maulana (Gudang)', 'pengelola', 'pengelola123', 'pengelola', 'aktif'),
('a0000000-0000-0000-0000-000000000004', 'Rafly Romeo (Driver)', 'pengirim', 'pengirim123', 'pengirim', 'aktif');

-- 5.2 Data Pelanggan
INSERT INTO pelanggan (id, nama, jenis, kontak, alamat, batas_kasbon, status_kasbon) VALUES
('b0000000-0000-0000-0000-000000000001', 'PT Bumi Karya Sejahtera', 'proyek', '081298765432', 'Jl. Raya Margonda No. 120, Depok', 50000000, 'aktif'),
('b0000000-0000-0000-0000-000000000002', 'CV Citra Indah Sentosa', 'proyek', '081387654321', 'Kavling Nuansa Asri Blok C4, Cibubur', 30000000, 'aktif'),
('b0000000-0000-0000-0000-000000000003', 'Bpk. Joko Santoso (Mandor)', 'proyek', '085712345678', 'Proyek Renovasi Ruko Cileungsi', 10000000, 'aktif'),
('b0000000-0000-0000-0000-000000000004', 'Ibu Ratna Dewi (Warga)', 'perorangan', '087812908765', 'Komplek Permata Hijau Blok A2/10', 0, 'aktif'),
('b0000000-0000-0000-0000-000000000005', 'Pak Slamet Riyadi', 'perorangan', '082198761234', 'Jl. H. Asmawi No. 45, Beji', 0, 'aktif');

-- 5.3 Data Material & Barang Bangunan (130 Barang dari Excel CV Kurnia Mandiri)
INSERT INTO barang (id, kode_barang, nama, merk, kategori, barcode, harga_beli, harga, stok_awal, stok, stok_min, satuan, keterangan) VALUES
('c0000000-0000-0000-0000-000000000001', 'A001', 'Hebel Ukuran 7', '-', 'Material Dasar', '899202600001', 480000, 624000, 10, 10, 3, 'Kubik', 'Data asli: 480.000 x 13 / kubik'),
('c0000000-0000-0000-0000-000000000002', 'A002', 'Hebel Ukuran 10', '-', 'Material Dasar', '899202600002', 480000, 624000, 10, 10, 3, 'Kubik', 'Data asli: 480.000 x 10 / kubik'),
('c0000000-0000-0000-0000-000000000003', 'A003', 'Pasir Hitam', '-', 'Material Dasar', '899202600003', 2600000, 3380000, 10, 10, 2, 'Truck', '1 truck = 6,7 kubik'),
('c0000000-0000-0000-0000-000000000004', 'A004', 'Pasir Bangka', '-', 'Material Dasar', '899202600004', 3300000, 4290000, 10, 10, 2, 'Truck', '1 truck = 6,7 kubik'),
('c0000000-0000-0000-0000-000000000005', 'A005', 'Pasir Rangkas', '-', 'Material Dasar', '899202600005', 2000000, 2600000, 10, 10, 2, 'Truck', '1 truck = 6,7 kubik'),
('c0000000-0000-0000-0000-000000000006', 'A006', 'Split', '-', 'Material Dasar', '899202600006', 3200000, 4160000, 10, 10, 2, 'Truck', '1 truck = 6,7 kubik'),
('c0000000-0000-0000-0000-000000000007', 'A007', 'Bata Merah', '-', 'Material Dasar', '899202600007', 600, 780, 5000, 5000, 1000, 'Pcs', NULL),
('c0000000-0000-0000-0000-000000000008', 'A008', 'Konblok Beton', '-', 'Material Dasar', '899202600008', 60000, 78000, 50, 50, 10, 'Meter', NULL),
('c0000000-0000-0000-0000-000000000009', 'A009', 'Semen Rajawali', 'Rajawali', 'Semen', '899202600009', 49800, 64740, 10, 10, 10, 'Sak', NULL),
('c0000000-0000-0000-0000-000000000010', 'A010', 'Semen Jempolan', 'Jempolan', 'Semen', '899202600010', 42000, 54600, 10, 10, 10, 'Sak', NULL),
('c0000000-0000-0000-0000-000000000011', 'A011', 'Semen Tigaroda 40 kg', 'Tigaroda', 'Semen', '899202600011', 59600, 77480, 100, 95, 20, 'Sak', 'Laporan Stok: Stok Awal 100, Masuk 10, Keluar 15, Stok Akhir 95'),
('c0000000-0000-0000-0000-000000000012', 'A012', 'Semen Tigaroda 50 kg', 'Tigaroda', 'Semen', '899202600012', 72600, 94380, 50, 50, 15, 'Sak', NULL),
('c0000000-0000-0000-0000-000000000013', 'A013', 'Ceker Ayam 50x50 (Besi 8)', '-', 'Besi & Baja', '899202600013', 50000, 65000, 30, 30, 5, 'Pcs', NULL),
('c0000000-0000-0000-0000-000000000014', 'A014', 'Ceker Ayam 50x50 (Besi 10)', '-', 'Besi & Baja', '899202600014', 65000, 84500, 30, 30, 5, 'Pcs', NULL),
('c0000000-0000-0000-0000-000000000015', 'A015', 'Ceker Ayam 40x40 (Besi 8)', '-', 'Besi & Baja', '899202600015', 42000, 54600, 30, 30, 5, 'Pcs', NULL),
('c0000000-0000-0000-0000-000000000016', 'A016', 'Ceker Ayam 40x40 (Besi 10)', '-', 'Besi & Baja', '899202600016', 50000, 65000, 30, 30, 5, 'Pcs', NULL),
('c0000000-0000-0000-0000-000000000017', 'A017', 'Besi Jadi (Besi 8)', '-', 'Besi & Baja', '899202600017', 39000, 50700, 40, 40, 10, 'Pcs', NULL),
('c0000000-0000-0000-0000-000000000018', 'A018', 'Besi Jadi (Besi 10)', '-', 'Besi & Baja', '899202600018', 48000, 62400, 40, 40, 10, 'Pcs', NULL),
('c0000000-0000-0000-0000-000000000019', 'A019', 'Wermes 2,5 x 5,2 (Besi 8)', '-', 'Besi & Baja', '899202600019', 475000, 617500, 15, 15, 3, 'Lembar', NULL),
('c0000000-0000-0000-0000-000000000020', 'A020', 'Wermes 2,5 x 5,2 (Besi 10)', '-', 'Besi & Baja', '899202600020', 625000, 812500, 15, 15, 3, 'Lembar', NULL),
('c0000000-0000-0000-0000-000000000021', 'A021', 'Besi 6', '-', 'Besi & Baja', '899202600021', 26000, 33800, 100, 100, 20, 'Batang', NULL),
('c0000000-0000-0000-0000-000000000022', 'A022', 'Besi 8', '-', 'Besi & Baja', '899202600022', 37000, 48100, 120, 120, 20, 'Batang', NULL),
('c0000000-0000-0000-0000-000000000023', 'A023', 'Besi 10', '-', 'Besi & Baja', '899202600023', 58000, 75400, 100, 100, 20, 'Batang', NULL),
('c0000000-0000-0000-0000-000000000024', 'A024', 'Besi 12', '-', 'Besi & Baja', '899202600024', 76000, 98800, 80, 80, 15, 'Batang', NULL),
('c0000000-0000-0000-0000-000000000025', 'A025', 'Bondek', '-', 'Besi & Baja', '899202600025', 95000, 123500, 60, 60, 10, 'Meter', NULL),
('c0000000-0000-0000-0000-000000000026', 'A026', 'Genteng Metal', '-', 'Atap & Rangka Atap', '899202600026', 33000, 42900, 100, 100, 20, 'Pcs', NULL),
('c0000000-0000-0000-0000-000000000027', 'A027', 'Genteng Alderon Transparan', 'Alderon', 'Atap & Rangka Atap', '899202600027', 85000, 110500, 40, 40, 10, 'Meter', NULL),
('c0000000-0000-0000-0000-000000000028', 'A028', 'Genteng Alderon Single', 'Alderon', 'Atap & Rangka Atap', '899202600028', 75000, 97500, 50, 50, 10, 'Meter', NULL),
('c0000000-0000-0000-0000-000000000029', 'A029', 'Genteng Alderon Double', 'Alderon', 'Atap & Rangka Atap', '899202600029', 90000, 117000, 40, 40, 10, 'Meter', NULL),
('c0000000-0000-0000-0000-000000000030', 'A030', 'Spandek Pasir', '-', 'Atap & Rangka Atap', '899202600030', 48000, 62400, 80, 80, 15, 'Meter', NULL),
('c0000000-0000-0000-0000-000000000031', 'A031', 'Spandek Polos', '-', 'Atap & Rangka Atap', '899202600031', 46000, 59800, 80, 80, 15, 'Meter', NULL),
('c0000000-0000-0000-0000-000000000032', 'A032', 'Reng Baja 0,35', '-', 'Atap & Rangka Atap', '899202600032', 33000, 42900, 100, 100, 20, 'Batang', NULL),
('c0000000-0000-0000-0000-000000000033', 'A033', 'Baja Ringan 0,70', '-', 'Atap & Rangka Atap', '899202600033', 64000, 83200, 100, 100, 20, 'Batang', NULL),
('c0000000-0000-0000-0000-000000000034', 'A034', 'Baja Ringan 0,75', '-', 'Atap & Rangka Atap', '899202600034', 82000, 106600, 100, 100, 20, 'Batang', NULL),
('c0000000-0000-0000-0000-000000000035', 'A035', 'Asbes 1 1/2 Jabesmen', 'Jabesmen', 'Atap & Rangka Atap', '899202600035', 45000, 58500, 50, 50, 10, 'Lembar', NULL),
('c0000000-0000-0000-0000-000000000036', 'A036', 'Asbes 1,8 m', '-', 'Atap & Rangka Atap', '899202600036', 54000, 70200, 50, 50, 10, 'Lembar', NULL),
('c0000000-0000-0000-0000-000000000037', 'A037', 'Asbes 2,1 m', '-', 'Atap & Rangka Atap', '899202600037', 62000, 80600, 50, 50, 10, 'Lembar', NULL),
('c0000000-0000-0000-0000-000000000038', 'A038', 'Asbes 2,4 m', '-', 'Atap & Rangka Atap', '899202600038', 70000, 91000, 50, 50, 10, 'Lembar', NULL),
('c0000000-0000-0000-0000-000000000039', 'A039', 'Asbes 2,7 m', '-', 'Atap & Rangka Atap', '899202600039', 80000, 104000, 40, 40, 10, 'Lembar', NULL),
('c0000000-0000-0000-0000-000000000040', 'A040', 'Asbes 3 m', '-', 'Atap & Rangka Atap', '899202600040', 95000, 123500, 40, 40, 10, 'Lembar', NULL),
('c0000000-0000-0000-0000-000000000041', 'A041', 'Besi Holo Plafon 4x4', '-', 'Plafon & Lisplang', '899202600041', 25000, 32500, 80, 80, 15, 'Batang', NULL),
('c0000000-0000-0000-0000-000000000042', 'A042', 'Besi Holo Plafon 2x4', '-', 'Plafon & Lisplang', '899202600042', 20000, 26000, 80, 80, 15, 'Batang', NULL),
('c0000000-0000-0000-0000-000000000043', 'A043', 'Gipsum', '-', 'Plafon & Lisplang', '899202600043', 52000, 67600, 50, 50, 10, 'Lembar', NULL),
('c0000000-0000-0000-0000-000000000044', 'A044', 'GRC 63', '-', 'Plafon & Lisplang', '899202600044', 63000, 81900, 40, 40, 10, 'Lembar', NULL),
('c0000000-0000-0000-0000-000000000045', 'A045', 'Lisplang GRC 10', '-', 'Plafon & Lisplang', '899202600045', 27000, 35100, 40, 40, 10, 'Pcs', NULL),
('c0000000-0000-0000-0000-000000000046', 'A046', 'Lisplang GRC 20', '-', 'Plafon & Lisplang', '899202600046', 41000, 53300, 40, 40, 10, 'Pcs', NULL),
('c0000000-0000-0000-0000-000000000047', 'A047', 'Lisplang GRC 30', '-', 'Plafon & Lisplang', '899202600047', 60000, 78000, 30, 30, 8, 'Pcs', NULL),
('c0000000-0000-0000-0000-000000000048', 'A048', 'Bambu', '-', 'Kayu & Bekisting', '899202600048', 9000, 11700, 100, 100, 20, 'Batang', NULL),
('c0000000-0000-0000-0000-000000000049', 'A049', 'Papan Cor 18 x 2,5 cm', '-', 'Kayu & Bekisting', '899202600049', 10000, 13000, 100, 100, 20, 'Pcs', NULL),
('c0000000-0000-0000-0000-000000000050', 'A050', 'Papan Cor 2 x 20 cm', '-', 'Kayu & Bekisting', '899202600050', 25000, 32500, 80, 80, 15, 'Pcs', NULL),
('c0000000-0000-0000-0000-000000000051', 'A051', 'Kaso 4x6', '-', 'Kayu & Bekisting', '899202600051', 25000, 32500, 80, 80, 15, 'Batang', NULL),
('c0000000-0000-0000-0000-000000000052', 'A052', 'Kaso 5x7', '-', 'Kayu & Bekisting', '899202600052', 35000, 45500, 60, 60, 15, 'Batang', NULL),
('c0000000-0000-0000-0000-000000000053', 'A053', 'Triplek 4 mm', '-', 'Kayu & Bekisting', '899202600053', 59000, 76700, 40, 40, 10, 'Lembar', NULL),
('c0000000-0000-0000-0000-000000000054', 'A054', 'Triplek 6 mm', '-', 'Kayu & Bekisting', '899202600054', 69000, 89700, 40, 40, 10, 'Lembar', NULL),
('c0000000-0000-0000-0000-000000000055', 'A055', 'Triplek 8 mm', '-', 'Kayu & Bekisting', '899202600055', 76000, 98800, 30, 30, 8, 'Lembar', NULL),
('c0000000-0000-0000-0000-000000000056', 'A056', 'Triplek 9 mm', '-', 'Kayu & Bekisting', '899202600056', 89000, 115700, 30, 30, 8, 'Lembar', NULL),
('c0000000-0000-0000-0000-000000000057', 'A057', 'Triplek 12 mm', '-', 'Kayu & Bekisting', '899202600057', 125000, 162500, 25, 25, 5, 'Lembar', NULL),
('c0000000-0000-0000-0000-000000000058', 'A058', 'Triplek 15 mm', '-', 'Kayu & Bekisting', '899202600058', 155000, 201500, 20, 20, 5, 'Lembar', NULL),
('c0000000-0000-0000-0000-000000000059', 'A059', 'Paralon AW 1/2 Inch', 'Rucika', 'Pipa PVC', '899202600059', 23000, 29900, 0, 25, 10, 'Batang', 'Laporan Stok: Masuk 25 BTG'),
('c0000000-0000-0000-0000-000000000060', 'A060', 'Paralon AW 3/4 Inch', 'Rucika', 'Pipa PVC', '899202600060', 28000, 36400, 20, 20, 10, 'Batang', NULL),
('c0000000-0000-0000-0000-000000000061', 'A061', 'Paralon AW 1 Inch', 'Rucika', 'Pipa PVC', '899202600061', 39000, 50700, 0, 20, 10, 'Batang', 'Laporan Stok: Masuk 20 BTG'),
('c0000000-0000-0000-0000-000000000062', 'A062', 'Paralon AW 1 1/4 Inch', 'Rucika', 'Pipa PVC', '899202600062', 60000, 78000, 15, 15, 5, 'Batang', 'Data asli tertulis 1/4 (dikoreksi)'),
('c0000000-0000-0000-0000-000000000063', 'A063', 'Paralon AW 1 1/2 Inch', 'Rucika', 'Pipa PVC', '899202600063', 70000, 91000, 15, 15, 5, 'Batang', NULL),
('c0000000-0000-0000-0000-000000000064', 'A064', 'Paralon AW 2 Inch', 'Rucika', 'Pipa PVC', '899202600064', 89000, 115700, 15, 15, 5, 'Batang', NULL),
('c0000000-0000-0000-0000-000000000065', 'A065', 'Paralon AW 2 1/2 Inch', 'Rucika', 'Pipa PVC', '899202600065', 130000, 169000, 10, 10, 5, 'Batang', NULL),
('c0000000-0000-0000-0000-000000000066', 'A066', 'Paralon AW 3 Inch', 'Rucika', 'Pipa PVC', '899202600066', 183000, 237900, 0, 5, 5, 'Batang', 'Laporan Stok: Masuk 5 BTG'),
('c0000000-0000-0000-0000-000000000067', 'A067', 'Paralon AW 4 Inch', 'Rucika', 'Pipa PVC', '899202600067', 320000, 416000, 0, 5, 5, 'Batang', 'Laporan Stok: Masuk 5 BTG'),
('c0000000-0000-0000-0000-000000000068', 'A068', 'Paralon D 1 1/4 Inch', 'Rucika', 'Pipa PVC', '899202600068', 38000, 49400, 15, 15, 5, 'Batang', NULL),
('c0000000-0000-0000-0000-000000000069', 'A069', 'Paralon D 1 1/2 Inch', 'Rucika', 'Pipa PVC', '899202600069', 43000, 55900, 15, 15, 5, 'Batang', NULL),
('c0000000-0000-0000-0000-000000000070', 'A070', 'Paralon D 2 Inch', 'Rucika', 'Pipa PVC', '899202600070', 57000, 74100, 0, 10, 5, 'Batang', 'Laporan Stok: Masuk 10 BTG'),
('c0000000-0000-0000-0000-000000000071', 'A071', 'Paralon D 2 1/2 Inch', 'Rucika', 'Pipa PVC', '899202600071', 75000, 97500, 0, 10, 5, 'Batang', 'Laporan Stok: Masuk 10 BTG'),
('c0000000-0000-0000-0000-000000000072', 'A072', 'Paralon D 3 Inch', 'Rucika', 'Pipa PVC', '899202600072', 99000, 128700, 0, 15, 5, 'Batang', 'Laporan Stok: Masuk 15 BTG'),
('c0000000-0000-0000-0000-000000000073', 'A073', 'Paralon D 4 Inch', 'Rucika', 'Pipa PVC', '899202600073', 156000, 202800, 0, 5, 5, 'Batang', 'Laporan Stok: Masuk 5 BTG'),
('c0000000-0000-0000-0000-000000000074', 'A074', 'Closet Jongkok', '-', 'Sanitair & Tandon', '899202600074', 115000, 149500, 0, 5, 3, 'Pcs', 'Laporan Stok: Masuk 5 pcs'),
('c0000000-0000-0000-0000-000000000075', 'A075', 'Pintu Kamar Mandi Standar PVC', '-', 'Sanitair & Tandon', '899202600075', 215000, 279500, 8, 8, 2, 'Pcs', NULL),
('c0000000-0000-0000-0000-000000000076', 'A076', 'Toren 300', '-', 'Sanitair & Tandon', '899202600076', 775000, 1007500, 4, 4, 2, 'Pcs', NULL),
('c0000000-0000-0000-0000-000000000077', 'A077', 'Toren 500', '-', 'Sanitair & Tandon', '899202600077', 1230000, 1599000, 4, 4, 2, 'Pcs', NULL),
('c0000000-0000-0000-0000-000000000078', 'A078', 'Toren 650', '-', 'Sanitair & Tandon', '899202600078', 1400000, 1820000, 3, 3, 1, 'Pcs', NULL),
('c0000000-0000-0000-0000-000000000079', 'A079', 'Toren 1050', '-', 'Sanitair & Tandon', '899202600079', 2570000, 3341000, 2, 2, 1, 'Pcs', NULL),
('c0000000-0000-0000-0000-000000000080', 'A080', 'Paku Biasa', '-', 'Paku & Perlengkapan', '899202600080', 15000, 19500, 0, 60, 15, 'Kg', 'Ukuran 3, 4, 5, 7, 10, 12'),
('c0000000-0000-0000-0000-000000000081', 'A081', 'Paku Beton', '-', 'Paku & Perlengkapan', '899202600081', 35000, 45500, 25, 25, 5, 'Pack', 'Ukuran 3, 4, 5, 7, 10, 12'),
('c0000000-0000-0000-0000-000000000082', 'A082', 'Cat Avian 5 kg', 'Avian', 'Cat', '899202600082', 163000, 211900, 15, 15, 5, 'Pail', NULL),
('c0000000-0000-0000-0000-000000000083', 'A083', 'Cat Avian 20 kg', 'Avian', 'Cat', '899202600083', 790000, 1027000, 8, 8, 3, 'Pail', NULL),
('c0000000-0000-0000-0000-000000000084', 'A084', 'Cat Vinilex 5 kg', 'Vinilex', 'Cat', '899202600084', 163000, 211900, 15, 15, 5, 'Pail', NULL),
('c0000000-0000-0000-0000-000000000085', 'A085', 'Cat Vinilex 20 kg', 'Vinilex', 'Cat', '899202600085', 790000, 1027000, 8, 8, 3, 'Pail', NULL),
('c0000000-0000-0000-0000-000000000086', 'A086', 'Cat Aquaprof 1 kg', 'Aquaprof', 'Cat', '899202600086', 61000, 79300, 20, 20, 5, 'Pail', NULL),
('c0000000-0000-0000-0000-000000000087', 'A087', 'Cat Aquaprof 4 kg', 'Aquaprof', 'Cat', '899202600087', 235000, 305500, 12, 12, 4, 'Pail', NULL),
('c0000000-0000-0000-0000-000000000088', 'A088', 'Cat Aquaprof 20 kg', 'Aquaprof', 'Cat', '899202600088', 980000, 1274000, 6, 6, 2, 'Pail', NULL),
('c0000000-0000-0000-0000-000000000089', 'B001', 'Semen Gresik', 'Gresik', 'Semen', '899202600089', 53000, 68900, 10, 10, 10, 'Sak', 'Laporan Stok 23/01/2026'),
('c0000000-0000-0000-0000-000000000090', 'B002', 'Semen Putih', '-', 'Semen', '899202600090', 110000, 143000, 0, 1, 3, 'Sak', 'Laporan Stok 22/01/2026: Masuk 1 Zak'),
('c0000000-0000-0000-0000-000000000091', 'B003', 'Paralon Bstln STD P D 2"', 'Bestlon', 'Pipa PVC', '899202600091', 41838, 54390, 0, 10, 5, 'Batang', 'Laporan Stok 23/01/2026: Masuk 10 BTG'),
('c0000000-0000-0000-0000-000000000092', 'B004', 'Paralon Bstln STD P D 2 1/2"', 'Bestlon', 'Pipa PVC', '899202600092', 55135, 71675, 0, 10, 5, 'Batang', 'Laporan Stok 23/01/2026: Masuk 10 BTG'),
('c0000000-0000-0000-0000-000000000093', 'B005', 'Paralon Bstln STD P D 3"', 'Bestlon', 'Pipa PVC', '899202600093', 76099, 98930, 0, 8, 5, 'Batang', 'Laporan Stok 23/01/2026: Masuk 8 BTG'),
('c0000000-0000-0000-0000-000000000094', 'B006', 'Paralon Bstln STD P D 4"', 'Bestlon', 'Pipa PVC', '899202600094', 119730, 155650, 0, 15, 5, 'Batang', 'Laporan Stok 23/01/2026: Masuk 15 BTG'),
('c0000000-0000-0000-0000-000000000095', 'B007', 'Knie Trilliun Bc D Abu 3"/30', 'Trilliun', 'Pipa PVC', '899202600095', 7117, 9250, 0, 30, 10, 'Pcs', 'Laporan Stok 22/01/2026: Masuk 30 pcs'),
('c0000000-0000-0000-0000-000000000096', 'B008', 'Kran ONDA BC Atap 1/2"/12', 'ONDA', 'Sanitair & Tandon', '899202600096', 32883, 42750, 0, 12, 5, 'Pcs', 'Laporan Stok 22/01/2026: Masuk 12 pcs'),
('c0000000-0000-0000-0000-000000000097', 'B009', 'Seal Tape ONDA 10m 12mm/72', 'ONDA', 'Pipa PVC', '899202600097', 4459, 5800, 0, 72, 20, 'Pcs', 'Laporan Stok 22/01/2026: Masuk 72 pcs'),
('c0000000-0000-0000-0000-000000000098', 'B010', 'Lem FOX Isarplas Lem VPC 40gr', 'FOX', 'Pipa PVC', '899202600098', 6081, 7900, 0, 60, 15, 'Pcs', 'Laporan Stok 22/01/2026: Masuk 60 pcs'),
('c0000000-0000-0000-0000-000000000099', 'B011', 'Kape PVC 5"', '-', 'Paku & Perlengkapan', '899202600099', 1500, 1950, 0, 12, 5, 'Pcs', 'Laporan Stok 22/01/2026: Masuk 12 pcs'),
('c0000000-0000-0000-0000-000000000100', 'B012', 'Kape PVC 7"', '-', 'Paku & Perlengkapan', '899202600100', 2500, 3250, 0, 12, 5, 'Pcs', 'Laporan Stok 22/01/2026: Masuk 12 pcs'),
('c0000000-0000-0000-0000-000000000101', 'B013', 'Lakban Kertas 1"', '-', 'Paku & Perlengkapan', '899202600101', 3250, 4225, 0, 12, 5, 'Pcs', 'Laporan Stok 22/01/2026: Masuk 12 pcs'),
('c0000000-0000-0000-0000-000000000102', 'B014', 'Meteran 5m Shisuka', 'Shisuka', 'Paku & Perlengkapan', '899202600102', 10000, 13000, 0, 12, 5, 'Pcs', 'Laporan Stok 22/01/2026: Masuk 12 pcs'),
('c0000000-0000-0000-0000-000000000103', 'B015', 'Bulu Roll Copot Daesung', 'Daesung', 'Cat', '899202600103', 10417, 13550, 0, 24, 6, 'Pcs', 'Laporan Stok 22/01/2026: Masuk 24 pcs'),
('c0000000-0000-0000-0000-000000000104', 'B016', 'Palu Karet Kodai', 'Kodai', 'Paku & Perlengkapan', '899202600104', 26000, 33800, 0, 6, 3, 'Pcs', 'Laporan Stok 22/01/2026: Masuk 6 pcs'),
('c0000000-0000-0000-0000-000000000105', 'B017', 'Kuas Roll Kapal Merah', 'Kapal Merah', 'Cat', '899202600105', 9584, 12460, 0, 12, 5, 'Pcs', 'Laporan Stok 22/01/2026: Masuk 12 pcs'),
('c0000000-0000-0000-0000-000000000106', 'B018', 'Kuas Roll Kapal Stamvick', 'Stamvick', 'Cat', '899202600106', 22084, 28710, 0, 12, 5, 'Pcs', 'Laporan Stok 22/01/2026: Masuk 12 pcs'),
('c0000000-0000-0000-0000-000000000107', 'B019', 'Lem G', '-', 'Paku & Perlengkapan', '899202600107', 4600, 5980, 0, 50, 10, 'Pcs', 'Laporan Stok 22/01/2026: Masuk 50 pcs'),
('c0000000-0000-0000-0000-000000000108', 'B020', 'Bulu Roll Copot Eterna', 'Eterna', 'Cat', '899202600108', 14167, 18420, 0, 12, 5, 'Pcs', 'Laporan Stok 22/01/2026: Masuk 12 pcs'),
('c0000000-0000-0000-0000-000000000109', 'B021', 'Kuas Roll Copot Daesung', 'Daesung', 'Cat', '899202600109', 15417, 20050, 0, 12, 5, 'Pcs', 'Laporan Stok 22/01/2026: Masuk 12 pcs'),
('c0000000-0000-0000-0000-000000000110', 'B022', 'Kuas Roll Copot Eterna', 'Eterna', 'Cat', '899202600110', 20000, 26000, 0, 24, 6, 'Pcs', 'Laporan Stok 22/01/2026: Masuk 24 pcs'),
('c0000000-0000-0000-0000-000000000111', 'B023', 'Selang Timbang', '-', 'Paku & Perlengkapan', '899202600111', 2000, 2600, 0, 100, 20, 'Meter', 'Laporan Stok 22/01/2026: Masuk 100 m'),
('c0000000-0000-0000-0000-000000000112', 'B024', 'Kuas 633 2"', '633', 'Cat', '899202600112', 2750, 3575, 0, 24, 6, 'Pcs', 'Laporan Stok 22/01/2026: Masuk 24 pcs'),
('c0000000-0000-0000-0000-000000000113', 'B025', 'Kuas 633 2,5"', '633', 'Cat', '899202600113', 3438, 4470, 0, 24, 6, 'Pcs', 'Laporan Stok 22/01/2026: Masuk 24 pcs'),
('c0000000-0000-0000-0000-000000000114', 'B026', 'Kuas 633 3"', '633', 'Cat', '899202600114', 4125, 5365, 0, 24, 6, 'Pcs', 'Laporan Stok 22/01/2026: Masuk 24 pcs'),
('c0000000-0000-0000-0000-000000000115', 'B027', 'Kuas 633 4"', '633', 'Cat', '899202600115', 5417, 7045, 0, 12, 5, 'Pcs', 'Laporan Stok 22/01/2026: Masuk 12 pcs'),
('c0000000-0000-0000-0000-000000000116', 'B028', 'Kuas Eterna 1,5"', 'Eterna', 'Cat', '899202600116', 5313, 6910, 0, 12, 5, 'Pcs', 'Laporan Stok 22/01/2026: Masuk 12 pcs'),
('c0000000-0000-0000-0000-000000000117', 'B029', 'Kuas Eterna 2"', 'Eterna', 'Cat', '899202600117', 7084, 9210, 0, 12, 5, 'Pcs', 'Laporan Stok 22/01/2026: Masuk 12 pcs'),
('c0000000-0000-0000-0000-000000000118', 'B030', 'Kuas Eterna 2,5"', 'Eterna', 'Cat', '899202600118', 8855, 11510, 0, 12, 5, 'Pcs', 'Laporan Stok 22/01/2026: Masuk 12 pcs'),
('c0000000-0000-0000-0000-000000000119', 'B031', 'Kuas Eterna 4"', 'Eterna', 'Cat', '899202600119', 18084, 23510, 0, 12, 5, 'Pcs', 'Laporan Stok 22/01/2026: Masuk 12 pcs'),
('c0000000-0000-0000-0000-000000000120', 'B032', 'Kawat Loket Hijau K', '-', 'Besi & Baja', '899202600120', 10000, 13000, 0, 20, 5, 'Meter', 'Laporan Stok 22/01/2026: Masuk 20 m'),
('c0000000-0000-0000-0000-000000000121', 'B033', 'Kawat Loket Hijau B', '-', 'Besi & Baja', '899202600121', 7500, 9750, 0, 20, 5, 'Meter', 'Laporan Stok 22/01/2026: Masuk 20 m'),
('c0000000-0000-0000-0000-000000000122', 'B034', 'Plastik Cor', '-', 'Kayu & Bekisting', '899202600122', 12500, 16250, 0, 13, 5, 'Kg', 'Laporan Stok 22/01/2026: Masuk 13 Kg'),
('c0000000-0000-0000-0000-000000000123', 'B035', 'Karpet 90cm', '-', 'Atap & Rangka Atap', '899202600123', 8500, 11050, 0, 50, 10, 'Meter', 'Laporan Stok 22/01/2026: Masuk 50 m'),
('c0000000-0000-0000-0000-000000000124', 'B036', 'Kawat Benrat', '-', 'Besi & Baja', '899202600124', 13500, 17550, 0, 50, 10, 'Kg', 'Laporan Stok 22/01/2026: Masuk 50 Kg'),
('c0000000-0000-0000-0000-000000000125', 'B037', 'Pengki Orange', '-', 'Paku & Perlengkapan', '899202600125', 12500, 16250, 0, 24, 5, 'Pcs', 'Laporan Stok 22/01/2026: Masuk 24 pcs'),
('c0000000-0000-0000-0000-000000000126', 'B038', 'Bak Cat 89', '-', 'Cat', '899202600126', 6250, 8125, 0, 24, 5, 'Pcs', 'Laporan Stok 22/01/2026: Masuk 24 pcs'),
('c0000000-0000-0000-0000-000000000127', 'B039', 'Skrup Gypsum 6x1"', '-', 'Paku & Perlengkapan', '899202600127', 35000, 45500, 0, 10, 3, 'Box', 'Laporan Stok 22/01/2026: Masuk 10 Box'),
('c0000000-0000-0000-0000-000000000128', 'B040', 'Roofing 5cm 350pcs/box', '-', 'Paku & Perlengkapan', '899202600128', 150500, 195650, 0, 5, 2, 'Box', 'Laporan Stok 22/01/2026: Masuk 5 box'),
('c0000000-0000-0000-0000-000000000129', 'B041', 'Roofing 7cm 250pcs/box', '-', 'Paku & Perlengkapan', '899202600129', 137500, 178750, 0, 5, 2, 'Box', 'Laporan Stok 22/01/2026: Masuk 5 box'),
('c0000000-0000-0000-0000-000000000130', 'B042', 'Glas Blok', '-', 'Material Dasar', '899202600130', 23000, 29900, 0, 54, 10, 'Dus', 'Laporan Stok 22/01/2026: Masuk 54 Dus');

-- 5.4 Data Mutasi Stok Awal & Barang Masuk/Keluar (Dari Sheet Laporan Stok Barang 21-23 Jan 2026)
INSERT INTO stok (barang_id, stok_awal, stok_akhir, tipe, tanggal) VALUES
('c0000000-0000-0000-0000-000000000011', 100, 110, 'masuk', '2026-01-21T08:30:00+07:00'),
('c0000000-0000-0000-0000-000000000011', 110, 95, 'keluar', '2026-01-21T14:00:00+07:00'),
('c0000000-0000-0000-0000-000000000059', 0, 25, 'masuk', '2026-01-23T08:00:00+07:00'),
('c0000000-0000-0000-0000-000000000061', 0, 20, 'masuk', '2026-01-23T08:00:00+07:00'),
('c0000000-0000-0000-0000-000000000066', 0, 5, 'masuk', '2026-01-23T08:00:00+07:00'),
('c0000000-0000-0000-0000-000000000072', 0, 15, 'masuk', '2026-01-23T08:00:00+07:00');

INSERT INTO mutasi_barang (id, pengguna_id, jenis, supplier, no_referensi, tujuan, alasan, tanggal) VALUES
('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'masuk', 'Distributor Rucika & Bestlon', 'SJ-20260123-01', 'Gudang Utama', 'Stok Masuk Pipa Paralon 23/01/2026', '2026-01-23T08:00:00+07:00'),
('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'masuk', 'Grosir Alat Teknik & Pertukangan', 'SJ-20260122-01', 'Gudang Utama', 'Stok Masuk Alat & Perlengkapan 22/01/2026', '2026-01-22T09:00:00+07:00'),
('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'masuk', 'Distributor Semen Tiga Roda', 'SJ-20260121-01', 'Gudang Utama', 'Barang Masuk Semen 3 Roda 21/01/2026', '2026-01-21T08:30:00+07:00'),
('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'keluar', NULL, 'OUT-20260121-01', 'Penjualan Toko', 'Barang Keluar Semen 3 Roda 15 sak (21/01/2026)', '2026-01-21T14:00:00+07:00');

INSERT INTO detail_mutasi_barang (id, mutasi_id, barang_id, jumlah, stok_sebelum, stok_sesudah, harga_satuan, total_harga, keterangan) VALUES
('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000011', 10, 100, 110, 57000, 570000, 'Barang Masuk Semen 3 Roda 21/01/2026'),
('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000011', 15, 110, 95, 63000, 945000, 'Barang Keluar Semen 3 Roda 21/01/2026'),
('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000059', 25, 0, 25, 24144, 603600, 'Paralon Rck STD P AW 1/2"'),
('f0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000061', 20, 0, 20, 44775, 895500, 'Paralon Rck STD P AW 1"'),
('f0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000066', 5, 0, 5, 201351, 1006755, 'Paralon Rck STD P AW 3"'),
('f0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000067', 5, 0, 5, 333604, 1668020, 'Paralon Rck STD P AW 4"'),
('f0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000070', 10, 0, 10, 60811, 608110, 'Paralon Rck STD P D 2"'),
('f0000000-0000-0000-0000-000000000008', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000071', 10, 0, 10, 82162, 821620, 'Paralon Rck STD P D 2 1/2"'),
('f0000000-0000-0000-0000-000000000009', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000072', 15, 0, 15, 109009, 1635135, 'Paralon Rck STD P D 3"'),
('f0000000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000073', 5, 0, 5, 171441, 857205, 'Paralon Rck STD P D 4"');

-- 5.5 Data Transaksi Penjualan
INSERT INTO transaksi (id, no_nota, pengguna_id, pelanggan_id, jenis_pembayaran, total, jumlah_dibayar, sisa_tagihan, status_bayar, perlu_dikirim, tanggal) VALUES
('d0000000-0000-0000-0000-000000000001', 'INV-202610-0001', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'qris', 12500000, 12500000, 0, 'lunas', true, NOW() - INTERVAL '2 days'),
('d0000000-0000-0000-0000-000000000002', 'INV-202610-0002', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000004', 'tunai', 3500000, 3500000, 0, 'lunas', false, NOW() - INTERVAL '1 days'),
('d0000000-0000-0000-0000-000000000003', 'INV-202610-0003', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'kasbon', 8500000, 2000000, 6500000, 'sebagian', true, NOW() - INTERVAL '4 hours');

-- 5.6 Data Detail Transaksi
INSERT INTO detail_transaksi (transaksi_id, barang_id, jumlah, harga_satuan, subtotal) VALUES
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 100, 72000, 7200000),
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000007', 50, 84000, 4200000),
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003', 5, 450000, 2250000),
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 15, 72000, 1080000),
('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000006', 10, 620000, 6200000),
('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000009', 15, 145000, 2175000);

-- 5.7 Data Pembayaran
INSERT INTO pembayaran (transaksi_id, metode, nominal, referensi_gateway, status, tanggal) VALUES
('d0000000-0000-0000-0000-000000000001', 'qris', 12500000, 'MID-QRIS-992831', 'berhasil', NOW() - INTERVAL '2 days'),
('d0000000-0000-0000-0000-000000000002', 'tunai', 3500000, 'CASH-REC-1029', 'berhasil', NOW() - INTERVAL '1 days'),
('d0000000-0000-0000-0000-000000000003', 'va', 2000000, 'MID-VA-BCA-102948', 'berhasil', NOW() - INTERVAL '4 hours');

-- 5.8 Data Kasbon / Piutang
INSERT INTO kasbon (pelanggan_id, transaksi_id, jumlah_kasbon, status, tanggal_pengajuan, tanggal_keputusan) VALUES
('b0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000003', 6500000, 'disetujui', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours'),
('b0000000-0000-0000-0000-000000000003', NULL, 3150000, 'menunggu', NOW() - INTERVAL '1 days', NULL);

-- 5.9 Data Pengaturan Sistem
INSERT INTO pengaturan_sistem (id, notifikasi, notifikasi_detail, saluran_notifikasi, penerima_notifikasi, gateway, gateway_detail, penyedia_gateway, kunci_api, updated_at) VALUES
(1, true, 'Email & WhatsApp Aktif', 'email', 'muhamadirfan.mi966@gmail.com', 'midtrans', 'Midtrans Sandbox Integration Active', 'midtrans', 'SB-Mid-server-***', NOW());

-- 5.10 Data Log Aktivitas Awal
INSERT INTO log_aktivitas (pengguna_id, modul, aktivitas, data_sebelum, data_sesudah) VALUES
('a0000000-0000-0000-0000-000000000001', 'Sistem', 'Inisialisasi Database CV Kurnia Mandiri', NULL, '{"status": "berhasil", "modul": "all"}'::jsonb);

