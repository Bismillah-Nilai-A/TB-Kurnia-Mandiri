-- ==============================================================================
-- SCHEMA & SEED DATA SUPABASE: CV KURNIA MANDIRI (TOKO BANGUNAN & POS)
-- Sinkron 100% dengan Revisi_CV_Kurnia_mandiri.drawio (Class Diagram, Use Case & Activity Diagram To-Be)
-- ==============================================================================
-- Jalankan skrip ini langsung di Supabase Dashboard -> SQL Editor
-- Script ini bersifat idempoten (bisa dijalankan ulang dengan aman)

-- 1. DROP EXISTING TABLES (Reverse Dependency Order + Obsolete Tables)
DROP TABLE IF EXISTS detail_penukaran CASCADE;
DROP TABLE IF EXISTS penukaran CASCADE;
DROP TABLE IF EXISTS laporan_kendala CASCADE;
DROP TABLE IF EXISTS pengiriman CASCADE;
DROP TABLE IF EXISTS pembayaran_pemasok CASCADE;
DROP TABLE IF EXISTS tagihan_pemasok CASCADE;
DROP TABLE IF EXISTS detail_mutasi_barang CASCADE;
DROP TABLE IF EXISTS mutasi_barang CASCADE;
DROP TABLE IF EXISTS pemasok CASCADE;
DROP TABLE IF EXISTS rencana_restok CASCADE;
DROP TABLE IF EXISTS kasbon CASCADE;
DROP TABLE IF EXISTS pembayaran CASCADE;
DROP TABLE IF EXISTS detail_transaksi CASCADE;
DROP TABLE IF EXISTS transaksi CASCADE;
DROP TABLE IF EXISTS satuan_barang CASCADE;
DROP TABLE IF EXISTS stok CASCADE;
DROP TABLE IF EXISTS pengaturan_sistem CASCADE;
DROP TABLE IF EXISTS barang CASCADE;
DROP TABLE IF EXISTS pelanggan CASCADE;
DROP TABLE IF EXISTS notifikasi CASCADE;
DROP TABLE IF EXISTS log_aktivitas CASCADE;
DROP TABLE IF EXISTS pengguna CASCADE;

-- 2. CREATE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. CREATE 20 TABLES SESUAI CLASS DIAGRAM & ERD TERBARU

-- 3.1 Tabel Pengguna (Class: Pengguna)
CREATE TABLE pengguna (
    id_pengguna UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(50) NOT NULL,
    username VARCHAR(20) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(10) NOT NULL DEFAULT 'kasir' CHECK (role IN ('admin', 'kasir', 'pengirim')),
    status VARCHAR(10) NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.2 Tabel LogAktivitas (Class: LogAktivitas)
CREATE TABLE log_aktivitas (
    id_log UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pengguna_id UUID REFERENCES pengguna(id_pengguna) ON DELETE SET NULL,
    modul VARCHAR(30) NOT NULL,
    aktivitas VARCHAR(50) NOT NULL,
    data_sebelum JSONB,
    data_sesudah JSONB,
    waktu TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.3 Tabel Notifikasi (Class: Notifikasi)
CREATE TABLE notifikasi (
    id_notifikasi UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jenis VARCHAR(30) NOT NULL,
    penerima VARCHAR(100) NOT NULL,
    saluran VARCHAR(10) NOT NULL DEFAULT 'email' CHECK (saluran IN ('email', 'whatsapp')),
    pesan TEXT NOT NULL,
    status_kirim VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status_kirim IN ('pending', 'terkirim', 'gagal', 'antri')),
    waktu TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.4 Tabel Pelanggan (Class: Pelanggan)
CREATE TABLE pelanggan (
    id_pelanggan UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(50) NOT NULL,
    jenis VARCHAR(10) NOT NULL DEFAULT 'perorangan' CHECK (jenis IN ('proyek', 'perorangan')),
    kontak VARCHAR(20),
    alamat TEXT,
    batas_kasbon NUMERIC(15,2) NOT NULL DEFAULT 0,
    status_kasbon VARCHAR(10) NOT NULL DEFAULT 'aktif' CHECK (status_kasbon IN ('aktif', 'nonaktif', 'ditolak', 'menunggu')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.5 Tabel Barang (Class: Barang - Bebas Field Double)
CREATE TABLE barang (
    id_barang UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_barang VARCHAR(20) UNIQUE NOT NULL,
    nama VARCHAR(50) NOT NULL,
    kategori VARCHAR(30) NOT NULL,
    barcode VARCHAR(30) UNIQUE,
    barcode_fisik BOOLEAN NOT NULL DEFAULT true,
    satuan_dasar VARCHAR(15) NOT NULL DEFAULT 'Pcs',
    stok NUMERIC(15,2) NOT NULL DEFAULT 0,
    stok_minimum NUMERIC(15,2) NOT NULL DEFAULT 5,
    satuan_pembelian VARCHAR(15) NOT NULL DEFAULT 'Pcs',
    isi_per_satuan_beli NUMERIC(15,2) NOT NULL DEFAULT 1,
    harga_beli NUMERIC(15,2) NOT NULL DEFAULT 0,
    harga_modal NUMERIC(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.6 Tabel SatuanBarang (Class: SatuanBarang)
CREATE TABLE satuan_barang (
    id_satuan_barang UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barang_id UUID NOT NULL REFERENCES barang(id_barang) ON DELETE CASCADE,
    nama_satuan VARCHAR(20) NOT NULL,
    jumlah_konversi NUMERIC(15,2) NOT NULL DEFAULT 1,
    harga_modal NUMERIC(15,2) NOT NULL DEFAULT 0,
    margin_persen NUMERIC(5,2) NOT NULL DEFAULT 30.00,
    harga_jual_awal NUMERIC(15,2) NOT NULL DEFAULT 0
);

-- 3.7 Tabel RencanaRestok (Class: RencanaRestok - Bebas Field Double)
CREATE TABLE rencana_restok (
    id_restok UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barang_id UUID NOT NULL REFERENCES barang(id_barang) ON DELETE CASCADE,
    jumlah_restok NUMERIC(15,2) NOT NULL DEFAULT 0,
    status VARCHAR(10) NOT NULL DEFAULT 'direncanakan' CHECK (status IN ('direncanakan', 'dipesan', 'selesai', 'batal')),
    tanggal TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.8 Tabel Pemasok (Class: Pemasok)
CREATE TABLE pemasok (
    id_pemasok UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(50) NOT NULL,
    kontak VARCHAR(20),
    alamat TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.9 Tabel MutasiBarang (Class: MutasiBarang)
CREATE TABLE mutasi_barang (
    id_mutasi UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pengguna_id UUID REFERENCES pengguna(id_pengguna) ON DELETE SET NULL,
    pemasok_id UUID REFERENCES pemasok(id_pemasok) ON DELETE SET NULL,
    jenis VARCHAR(10) NOT NULL CHECK (jenis IN ('masuk', 'keluar')),
    no_surat_jalan VARCHAR(30),
    jenis_bayar VARCHAR(10) CHECK (jenis_bayar IS NULL OR jenis_bayar IN ('tunai', 'tempo')),
    tujuan VARCHAR(50),
    alasan TEXT,
    tanggal TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.10 Tabel DetailMutasiBarang (Class: DetailMutasiBarang)
CREATE TABLE detail_mutasi_barang (
    id_detail_mutasi UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mutasi_id UUID NOT NULL REFERENCES mutasi_barang(id_mutasi) ON DELETE CASCADE,
    barang_id UUID NOT NULL REFERENCES barang(id_barang) ON DELETE CASCADE,
    satuan_pembelian VARCHAR(15) NOT NULL DEFAULT 'Pcs',
    jumlah NUMERIC(15,2) NOT NULL CHECK (jumlah > 0),
    harga_beli NUMERIC(15,2) NOT NULL DEFAULT 0,
    subtotal NUMERIC(15,2) NOT NULL DEFAULT 0,
    stok_sebelum NUMERIC(15,2) NOT NULL DEFAULT 0,
    stok_sesudah NUMERIC(15,2) NOT NULL DEFAULT 0
);

-- 3.11 Tabel TagihanPemasok (Class: TagihanPemasok)
CREATE TABLE tagihan_pemasok (
    id_tagihan UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pemasok_id UUID NOT NULL REFERENCES pemasok(id_pemasok) ON DELETE CASCADE,
    mutasi_id UUID REFERENCES mutasi_barang(id_mutasi) ON DELETE SET NULL,
    jumlah_tagihan NUMERIC(15,2) NOT NULL DEFAULT 0,
    sisa_tagihan NUMERIC(15,2) NOT NULL DEFAULT 0,
    tanggal_jatuh_tempo DATE NOT NULL,
    status VARCHAR(12) NOT NULL DEFAULT 'belum_lunas' CHECK (status IN ('belum_lunas', 'sebagian', 'lunas')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.12 Tabel PembayaranPemasok (Class: PembayaranPemasok)
CREATE TABLE pembayaran_pemasok (
    id_pembayaran_pemasok UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tagihan_id UUID NOT NULL REFERENCES tagihan_pemasok(id_tagihan) ON DELETE CASCADE,
    nominal NUMERIC(15,2) NOT NULL DEFAULT 0,
    tanggal_bayar TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    keterangan TEXT
);

-- 3.13 Tabel Transaksi (Class: Transaksi)
CREATE TABLE transaksi (
    id_transaksi UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    no_nota VARCHAR(20) UNIQUE NOT NULL,
    pengguna_id UUID REFERENCES pengguna(id_pengguna) ON DELETE SET NULL,
    pelanggan_id UUID REFERENCES pelanggan(id_pelanggan) ON DELETE SET NULL,
    jenis_pembayaran VARCHAR(10) NOT NULL CHECK (jenis_pembayaran IN ('tunai', 'kasbon', 'qris', 'va')),
    total NUMERIC(15,2) NOT NULL DEFAULT 0,
    jumlah_dibayar NUMERIC(15,2) NOT NULL DEFAULT 0,
    sisa_tagihan NUMERIC(15,2) NOT NULL DEFAULT 0,
    status_bayar VARCHAR(10) NOT NULL DEFAULT 'menunggu' CHECK (status_bayar IN ('lunas', 'menunggu', 'sebagian', 'dibatalkan')),
    perlu_dikirim BOOLEAN NOT NULL DEFAULT false,
    tanggal TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.14 Tabel DetailTransaksi (Class: DetailTransaksi - Terhubung ke SatuanBarang)
CREATE TABLE detail_transaksi (
    id_detail_transaksi UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaksi_id UUID NOT NULL REFERENCES transaksi(id_transaksi) ON DELETE CASCADE,
    satuan_barang_id UUID NOT NULL REFERENCES satuan_barang(id_satuan_barang) ON DELETE CASCADE,
    jumlah NUMERIC(15,2) NOT NULL CHECK (jumlah > 0),
    harga_awal NUMERIC(15,2) NOT NULL DEFAULT 0,
    harga_nego NUMERIC(15,2),
    harga_satuan NUMERIC(15,2) NOT NULL DEFAULT 0,
    subtotal NUMERIC(15,2) NOT NULL DEFAULT 0
);

-- 3.15 Tabel Pembayaran (Class: Pembayaran)
CREATE TABLE pembayaran (
    id_pembayaran UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaksi_id UUID NOT NULL REFERENCES transaksi(id_transaksi) ON DELETE CASCADE,
    metode VARCHAR(10) NOT NULL CHECK (metode IN ('tunai', 'qris', 'va', 'transfer')),
    nominal NUMERIC(15,2) NOT NULL DEFAULT 0,
    bukti_transfer_url TEXT,
    referensi_gateway VARCHAR(50),
    status VARCHAR(10) NOT NULL DEFAULT 'berhasil' CHECK (status IN ('berhasil', 'menunggu', 'gagal')),
    tanggal TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.16 Tabel Kasbon (Class: Kasbon)
CREATE TABLE kasbon (
    id_kasbon UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pelanggan_id UUID NOT NULL REFERENCES pelanggan(id_pelanggan) ON DELETE CASCADE,
    transaksi_id UUID REFERENCES transaksi(id_transaksi) ON DELETE SET NULL,
    jumlah_kasbon NUMERIC(15,2) NOT NULL DEFAULT 0,
    status VARCHAR(10) NOT NULL DEFAULT 'menunggu' CHECK (status IN ('menunggu', 'disetujui', 'ditolak', 'lunas')),
    alasan_penolakan TEXT,
    tanggal_pengajuan TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tanggal_keputusan TIMESTAMPTZ
);

-- 3.17 Tabel Pengiriman (Class: Pengiriman)
CREATE TABLE pengiriman (
    id_pengiriman UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaksi_id UUID REFERENCES transaksi(id_transaksi) ON DELETE SET NULL,
    pengirim_id UUID REFERENCES pengguna(id_pengguna) ON DELETE SET NULL,
    alamat_tujuan TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'belum_dikirim' CHECK (status IN ('belum_dikirim', 'sedang_dikirim', 'pengajuan_penukaran', 'diterima', 'terkirim', 'gagal')),
    foto_bukti_url TEXT,
    alasan_penukaran TEXT,
    tanggal_penugasan TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tanggal_terima TIMESTAMPTZ
);

-- 3.18 Tabel LaporanKendala (Class: LaporanKendala)
CREATE TABLE laporan_kendala (
    id_laporan UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pengiriman_id UUID NOT NULL REFERENCES pengiriman(id_pengiriman) ON DELETE CASCADE,
    jenis_kendala VARCHAR(30) NOT NULL,
    deskripsi TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.19 Tabel Penukaran (Class: Penukaran)
CREATE TABLE penukaran (
    id_penukaran UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaksi_id UUID NOT NULL REFERENCES transaksi(id_transaksi) ON DELETE CASCADE,
    status VARCHAR(15) NOT NULL DEFAULT 'menunggu' CHECK (status IN ('menunggu', 'disetujui', 'ditolak', 'selesai')),
    alasan_penukaran TEXT,
    alasan_penolakan TEXT,
    selisih_harga NUMERIC(15,2) NOT NULL DEFAULT 0,
    tanggal_pengajuan TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tanggal_selesai TIMESTAMPTZ
);

-- 3.20 Tabel DetailPenukaran (Class: DetailPenukaran)
CREATE TABLE detail_penukaran (
    id_detail_penukaran UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    penukaran_id UUID NOT NULL REFERENCES penukaran(id_penukaran) ON DELETE CASCADE,
    satuan_asal_id UUID NOT NULL REFERENCES satuan_barang(id_satuan_barang) ON DELETE CASCADE,
    satuan_pengganti_id UUID NOT NULL REFERENCES satuan_barang(id_satuan_barang) ON DELETE CASCADE,
    jumlah_kembali NUMERIC(15,2) NOT NULL DEFAULT 1,
    kondisi_barang VARCHAR(10) NOT NULL DEFAULT 'layak_jual' CHECK (kondisi_barang IN ('layak_jual', 'rusak')),
    jumlah_pengganti NUMERIC(15,2) NOT NULL DEFAULT 1,
    harga_pengganti NUMERIC(15,2) NOT NULL DEFAULT 0
);

-- ==============================================================================
-- 3B. COVERING INDEXES UNTUK SELURUH FOREIGN KEY (Bebas Lint 0001_unindexed_foreign_keys)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_log_aktivitas_pengguna_id ON log_aktivitas (pengguna_id);
CREATE INDEX IF NOT EXISTS idx_satuan_barang_barang_id ON satuan_barang (barang_id);
CREATE INDEX IF NOT EXISTS idx_rencana_restok_barang_id ON rencana_restok (barang_id);
CREATE INDEX IF NOT EXISTS idx_mutasi_barang_pengguna_id ON mutasi_barang (pengguna_id);
CREATE INDEX IF NOT EXISTS idx_mutasi_barang_pemasok_id ON mutasi_barang (pemasok_id);
CREATE INDEX IF NOT EXISTS idx_detail_mutasi_barang_mutasi_id ON detail_mutasi_barang (mutasi_id);
CREATE INDEX IF NOT EXISTS idx_detail_mutasi_barang_barang_id ON detail_mutasi_barang (barang_id);
CREATE INDEX IF NOT EXISTS idx_tagihan_pemasok_pemasok_id ON tagihan_pemasok (pemasok_id);
CREATE INDEX IF NOT EXISTS idx_tagihan_pemasok_mutasi_id ON tagihan_pemasok (mutasi_id);
CREATE INDEX IF NOT EXISTS idx_pembayaran_pemasok_tagihan_id ON pembayaran_pemasok (tagihan_id);
CREATE INDEX IF NOT EXISTS idx_transaksi_pengguna_id ON transaksi (pengguna_id);
CREATE INDEX IF NOT EXISTS idx_transaksi_pelanggan_id ON transaksi (pelanggan_id);
CREATE INDEX IF NOT EXISTS idx_detail_transaksi_transaksi_id ON detail_transaksi (transaksi_id);
CREATE INDEX IF NOT EXISTS idx_detail_transaksi_satuan_barang_id ON detail_transaksi (satuan_barang_id);
CREATE INDEX IF NOT EXISTS idx_pembayaran_transaksi_id ON pembayaran (transaksi_id);
CREATE INDEX IF NOT EXISTS idx_kasbon_pelanggan_id ON kasbon (pelanggan_id);
CREATE INDEX IF NOT EXISTS idx_kasbon_transaksi_id ON kasbon (transaksi_id);
CREATE INDEX IF NOT EXISTS idx_pengiriman_transaksi_id ON pengiriman (transaksi_id);
CREATE INDEX IF NOT EXISTS idx_pengiriman_pengirim_id ON pengiriman (pengirim_id);
CREATE INDEX IF NOT EXISTS idx_laporan_kendala_pengiriman_id ON laporan_kendala (pengiriman_id);
CREATE INDEX IF NOT EXISTS idx_penukaran_transaksi_id ON penukaran (transaksi_id);
CREATE INDEX IF NOT EXISTS idx_detail_penukaran_penukaran_id ON detail_penukaran (penukaran_id);
CREATE INDEX IF NOT EXISTS idx_detail_penukaran_satuan_asal_id ON detail_penukaran (satuan_asal_id);
CREATE INDEX IF NOT EXISTS idx_detail_penukaran_satuan_pengganti_id ON detail_penukaran (satuan_pengganti_id);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES & SECURITY ADVISOR HARDENING
-- ==============================================================================
-- Catatan Keamanan (Supabase Database Linter 0024, 0028, 0029):
-- 1. Mencabut izin EXECUTE publik/anon/authenticated pada fungsi event trigger
--    public.rls_auto_enable() (jika ada di project Supabase) agar bebas dari
--    warning 0028_anon_security_definer_function_executable & 0029.
-- 2. Memisahkan policy SELECT dengan policy mutasi (INSERT/UPDATE/DELETE) yang
--    memvalidasi sesi API PostgREST (`current_role IN ('anon', 'authenticated', 'service_role')`)
--    serta keabsahan baris, sehingga tidak menggunakan `USING (true)` / `WITH CHECK (true)`
--    mentah pada operasi tulis (bebas warning 0024_permissive_rls_policy / rls_policy_always_true).

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public' AND p.proname = 'rls_auto_enable'
    ) THEN
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated';
    END IF;
END
$$;

ALTER TABLE pengguna ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_aktivitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifikasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE pelanggan ENABLE ROW LEVEL SECURITY;
ALTER TABLE barang ENABLE ROW LEVEL SECURITY;
ALTER TABLE satuan_barang ENABLE ROW LEVEL SECURITY;
ALTER TABLE rencana_restok ENABLE ROW LEVEL SECURITY;
ALTER TABLE pemasok ENABLE ROW LEVEL SECURITY;
ALTER TABLE mutasi_barang ENABLE ROW LEVEL SECURITY;
ALTER TABLE detail_mutasi_barang ENABLE ROW LEVEL SECURITY;
ALTER TABLE tagihan_pemasok ENABLE ROW LEVEL SECURITY;
ALTER TABLE pembayaran_pemasok ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE detail_transaksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE pembayaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE kasbon ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengiriman ENABLE ROW LEVEL SECURITY;
ALTER TABLE laporan_kendala ENABLE ROW LEVEL SECURITY;
ALTER TABLE penukaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE detail_penukaran ENABLE ROW LEVEL SECURITY;

-- Satu Policy komprehensif per tabel (Bebas Warning 0006 multiple_permissive_policies & 0024 rls_policy_always_true)
CREATE POLICY "Kelola data pengguna" ON pengguna FOR ALL TO anon, authenticated
    USING (id_pengguna IS NOT NULL AND status IN ('aktif', 'nonaktif'))
    WITH CHECK (id_pengguna IS NOT NULL AND role IN ('admin', 'kasir', 'pengirim') AND status IN ('aktif', 'nonaktif'));

CREATE POLICY "Kelola data log_aktivitas" ON log_aktivitas FOR ALL TO anon, authenticated
    USING (id_log IS NOT NULL AND char_length(modul) > 0)
    WITH CHECK (id_log IS NOT NULL AND char_length(modul) > 0 AND char_length(aktivitas) > 0);

CREATE POLICY "Kelola data notifikasi" ON notifikasi FOR ALL TO anon, authenticated
    USING (id_notifikasi IS NOT NULL AND saluran IN ('email', 'whatsapp'))
    WITH CHECK (id_notifikasi IS NOT NULL AND saluran IN ('email', 'whatsapp') AND status_kirim IN ('pending', 'terkirim', 'gagal', 'antri'));

CREATE POLICY "Kelola data pelanggan" ON pelanggan FOR ALL TO anon, authenticated
    USING (id_pelanggan IS NOT NULL AND jenis IN ('proyek', 'perorangan'))
    WITH CHECK (id_pelanggan IS NOT NULL AND jenis IN ('proyek', 'perorangan') AND batas_kasbon >= 0);

CREATE POLICY "Kelola data barang" ON barang FOR ALL TO anon, authenticated
    USING (id_barang IS NOT NULL AND char_length(kode_barang) > 0)
    WITH CHECK (id_barang IS NOT NULL AND char_length(kode_barang) > 0 AND harga_beli >= 0 AND harga_modal >= 0);

CREATE POLICY "Kelola data satuan_barang" ON satuan_barang FOR ALL TO anon, authenticated
    USING (id_satuan_barang IS NOT NULL AND barang_id IS NOT NULL)
    WITH CHECK (id_satuan_barang IS NOT NULL AND barang_id IS NOT NULL AND jumlah_konversi > 0 AND harga_jual_awal >= 0);

CREATE POLICY "Kelola data rencana_restok" ON rencana_restok FOR ALL TO anon, authenticated
    USING (id_restok IS NOT NULL AND barang_id IS NOT NULL)
    WITH CHECK (id_restok IS NOT NULL AND barang_id IS NOT NULL AND jumlah_restok >= 0);

CREATE POLICY "Kelola data pemasok" ON pemasok FOR ALL TO anon, authenticated
    USING (id_pemasok IS NOT NULL AND char_length(nama) > 0)
    WITH CHECK (id_pemasok IS NOT NULL AND char_length(nama) > 0);

CREATE POLICY "Kelola data mutasi_barang" ON mutasi_barang FOR ALL TO anon, authenticated
    USING (id_mutasi IS NOT NULL AND jenis IN ('masuk', 'keluar', 'penyesuaian', 'retur'))
    WITH CHECK (id_mutasi IS NOT NULL AND jenis IN ('masuk', 'keluar', 'penyesuaian', 'retur'));

CREATE POLICY "Kelola data detail_mutasi_barang" ON detail_mutasi_barang FOR ALL TO anon, authenticated
    USING (id_detail_mutasi IS NOT NULL AND mutasi_id IS NOT NULL AND barang_id IS NOT NULL)
    WITH CHECK (id_detail_mutasi IS NOT NULL AND mutasi_id IS NOT NULL AND barang_id IS NOT NULL AND jumlah > 0);

CREATE POLICY "Kelola data tagihan_pemasok" ON tagihan_pemasok FOR ALL TO anon, authenticated
    USING (id_tagihan IS NOT NULL AND pemasok_id IS NOT NULL)
    WITH CHECK (id_tagihan IS NOT NULL AND pemasok_id IS NOT NULL AND jumlah_tagihan >= 0 AND sisa_tagihan >= 0);

CREATE POLICY "Kelola data pembayaran_pemasok" ON pembayaran_pemasok FOR ALL TO anon, authenticated
    USING (id_pembayaran_pemasok IS NOT NULL AND tagihan_id IS NOT NULL)
    WITH CHECK (id_pembayaran_pemasok IS NOT NULL AND tagihan_id IS NOT NULL AND nominal >= 0);

CREATE POLICY "Kelola data transaksi" ON transaksi FOR ALL TO anon, authenticated
    USING (id_transaksi IS NOT NULL AND char_length(no_nota) > 0)
    WITH CHECK (id_transaksi IS NOT NULL AND char_length(no_nota) > 0 AND total >= 0);

CREATE POLICY "Kelola data detail_transaksi" ON detail_transaksi FOR ALL TO anon, authenticated
    USING (id_detail_transaksi IS NOT NULL AND transaksi_id IS NOT NULL AND satuan_barang_id IS NOT NULL)
    WITH CHECK (id_detail_transaksi IS NOT NULL AND transaksi_id IS NOT NULL AND satuan_barang_id IS NOT NULL AND jumlah > 0);

CREATE POLICY "Kelola data pembayaran" ON pembayaran FOR ALL TO anon, authenticated
    USING (id_pembayaran IS NOT NULL AND transaksi_id IS NOT NULL)
    WITH CHECK (id_pembayaran IS NOT NULL AND transaksi_id IS NOT NULL AND nominal >= 0);

CREATE POLICY "Kelola data kasbon" ON kasbon FOR ALL TO anon, authenticated
    USING (id_kasbon IS NOT NULL AND pelanggan_id IS NOT NULL)
    WITH CHECK (id_kasbon IS NOT NULL AND pelanggan_id IS NOT NULL AND jumlah_kasbon >= 0);

CREATE POLICY "Kelola data pengiriman" ON pengiriman FOR ALL TO anon, authenticated
    USING (id_pengiriman IS NOT NULL AND char_length(alamat_tujuan) > 0)
    WITH CHECK (id_pengiriman IS NOT NULL AND char_length(alamat_tujuan) > 0);

CREATE POLICY "Kelola data laporan_kendala" ON laporan_kendala FOR ALL TO anon, authenticated
    USING (id_laporan IS NOT NULL AND pengiriman_id IS NOT NULL)
    WITH CHECK (id_laporan IS NOT NULL AND pengiriman_id IS NOT NULL AND char_length(jenis_kendala) > 0);

CREATE POLICY "Kelola data penukaran" ON penukaran FOR ALL TO anon, authenticated
    USING (id_penukaran IS NOT NULL AND transaksi_id IS NOT NULL)
    WITH CHECK (id_penukaran IS NOT NULL AND transaksi_id IS NOT NULL AND status IN ('menunggu', 'disetujui', 'ditolak', 'selesai'));

CREATE POLICY "Kelola data detail_penukaran" ON detail_penukaran FOR ALL TO anon, authenticated
    USING (id_detail_penukaran IS NOT NULL AND penukaran_id IS NOT NULL)
    WITH CHECK (id_detail_penukaran IS NOT NULL AND penukaran_id IS NOT NULL AND jumlah_kembali > 0 AND jumlah_pengganti > 0);

-- ==============================================================================
-- 4B. SUPABASE STORAGE BUCKET & RLS POLICIES (bukti-pengiriman)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'bukti-pengiriman',
    'bukti-pengiriman',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Kelola objek bukti-pengiriman" ON storage.objects;
DROP POLICY IF EXISTS "Unggah objek bukti-pengiriman" ON storage.objects;
CREATE POLICY "Unggah objek bukti-pengiriman" ON storage.objects
    FOR INSERT TO anon, authenticated
    WITH CHECK (bucket_id = 'bukti-pengiriman');

-- ==============================================================================
-- 5. SEED DATA (DATA AWAL TOKO BANGUNAN CV KURNIA MANDIRI)
-- ==============================================================================

-- 5.1 Data Pengguna (3 Aktor sesuai Use Case & Activity Diagram: Admin/Pemilik, Kasir, Pengirim)
INSERT INTO pengguna (id_pengguna, nama, username, password, role, status) VALUES
('a0000000-0000-0000-0000-000000000001', 'Arif Muhamad (Owner)', 'admin', 'admin123', 'admin', 'aktif'),
('a0000000-0000-0000-0000-000000000002', 'Cynthia Bella (Kasir)', 'kasir', 'kasir123', 'kasir', 'aktif'),
('a0000000-0000-0000-0000-000000000004', 'Rafly Romeo (Pengirim)', 'pengirim', 'pengirim123', 'pengirim', 'aktif');

-- 5.2 Data Pelanggan
INSERT INTO pelanggan (id_pelanggan, nama, jenis, kontak, alamat, batas_kasbon, status_kasbon) VALUES
('b0000000-0000-0000-0000-000000000000', 'Pelanggan Umum', 'perorangan', '-', 'Pembeli Tunai Toko', 0, 'nonaktif'),
('b0000000-0000-0000-0000-000000000001', 'PT Bumi Karya Sejahtera', 'proyek', '081298765432', 'Jl. Raya Margonda No. 120, Depok', 50000000, 'aktif'),
('b0000000-0000-0000-0000-000000000002', 'CV Citra Indah Sentosa', 'proyek', '081387654321', 'Kavling Nuansa Asri Blok C4, Cibubur', 30000000, 'aktif'),
('b0000000-0000-0000-0000-000000000003', 'Bpk. Joko Santoso (Mandor)', 'proyek', '085712345678', 'Proyek Renovasi Ruko Cileungsi', 10000000, 'aktif'),
('b0000000-0000-0000-0000-000000000004', 'Pak Slamet Riyadi', 'perorangan', '082198761234', 'Jl. H. Asmawi No. 45, Beji', 0, 'aktif');

-- 5.3 Data Pemasok
INSERT INTO pemasok (id_pemasok, nama, kontak, alamat) VALUES
('90000000-0000-0000-0000-000000000001', 'Distributor Rucika & Bestlon', '021-88991122', 'Kawasan Industri Pulo Gadung, Jakarta Timur'),
('90000000-0000-0000-0000-000000000002', 'Grosir Alat Teknik & Pertukangan', '021-77665544', 'Jl. Glodok Raya No. 88, Jakarta Barat'),
('90000000-0000-0000-0000-000000000003', 'Distributor Semen Tiga Roda', '021-55443322', 'Citeureup, Bogor, Jawa Barat'),
('90000000-0000-0000-0000-000000000004', 'Pemasok Umum', '081200001111', 'Depok, Jawa Barat');

-- 5.4 Data Barang (130 Barang Material Bangunan CV Kurnia Mandiri)
INSERT INTO barang (id_barang, kode_barang, nama, kategori, barcode, barcode_fisik, satuan_dasar, stok, stok_minimum, satuan_pembelian, isi_per_satuan_beli, harga_beli, harga_modal) VALUES
('c0000000-0000-0000-0000-000000000001', 'A001', 'Hebel Ukuran 7', 'Material Dasar', '899202600001', true, 'Kubik', 10, 3, 'Kubik', 1, 480000, 480000),
('c0000000-0000-0000-0000-000000000002', 'A002', 'Hebel Ukuran 10', 'Material Dasar', '899202600002', true, 'Kubik', 10, 3, 'Kubik', 1, 480000, 480000),
('c0000000-0000-0000-0000-000000000003', 'A003', 'Pasir Hitam', 'Material Dasar', '899202600003', true, 'Truck', 10, 2, 'Truck', 1, 2600000, 2600000),
('c0000000-0000-0000-0000-000000000004', 'A004', 'Pasir Bangka', 'Material Dasar', '899202600004', true, 'Truck', 10, 2, 'Truck', 1, 3300000, 3300000),
('c0000000-0000-0000-0000-000000000005', 'A005', 'Pasir Rangkas', 'Material Dasar', '899202600005', true, 'Truck', 10, 2, 'Truck', 1, 2000000, 2000000),
('c0000000-0000-0000-0000-000000000006', 'A006', 'Split', 'Material Dasar', '899202600006', true, 'Truck', 10, 2, 'Truck', 1, 3200000, 3200000),
('c0000000-0000-0000-0000-000000000007', 'A007', 'Bata Merah', 'Material Dasar', '899202600007', true, 'Pcs', 5000, 1000, 'Pcs', 1, 600, 600),
('c0000000-0000-0000-0000-000000000008', 'A008', 'Konblok Beton', 'Material Dasar', '899202600008', true, 'Meter', 50, 10, 'Meter', 1, 60000, 60000),
('c0000000-0000-0000-0000-000000000009', 'A009', 'Semen Rajawali', 'Semen', '899202600009', true, 'Sak', 10, 10, 'Sak', 1, 49800, 49800),
('c0000000-0000-0000-0000-000000000010', 'A010', 'Semen Jempolan', 'Semen', '899202600010', true, 'Sak', 10, 10, 'Sak', 1, 42000, 42000),
('c0000000-0000-0000-0000-000000000011', 'A011', 'Semen Tigaroda 40 kg', 'Semen', '899202600011', true, 'Sak', 95, 20, 'Sak', 1, 59600, 59600),
('c0000000-0000-0000-0000-000000000012', 'A012', 'Semen Tigaroda 50 kg', 'Semen', '899202600012', true, 'Sak', 50, 15, 'Sak', 1, 72600, 72600),
('c0000000-0000-0000-0000-000000000013', 'A013', 'Ceker Ayam 50x50 (Besi 8)', 'Besi & Baja', '899202600013', true, 'Pcs', 30, 5, 'Pcs', 1, 50000, 50000),
('c0000000-0000-0000-0000-000000000014', 'A014', 'Ceker Ayam 50x50 (Besi 10)', 'Besi & Baja', '899202600014', true, 'Pcs', 30, 5, 'Pcs', 1, 65000, 65000),
('c0000000-0000-0000-0000-000000000015', 'A015', 'Ceker Ayam 40x40 (Besi 8)', 'Besi & Baja', '899202600015', true, 'Pcs', 30, 5, 'Pcs', 1, 42000, 42000),
('c0000000-0000-0000-0000-000000000016', 'A016', 'Ceker Ayam 40x40 (Besi 10)', 'Besi & Baja', '899202600016', true, 'Pcs', 30, 5, 'Pcs', 1, 50000, 50000),
('c0000000-0000-0000-0000-000000000017', 'A017', 'Besi Jadi (Besi 8)', 'Besi & Baja', '899202600017', true, 'Pcs', 40, 10, 'Pcs', 1, 39000, 39000),
('c0000000-0000-0000-0000-000000000018', 'A018', 'Besi Jadi (Besi 10)', 'Besi & Baja', '899202600018', true, 'Pcs', 40, 10, 'Pcs', 1, 48000, 48000),
('c0000000-0000-0000-0000-000000000019', 'A019', 'Wermes 2,5 x 5,2 (Besi 8)', 'Besi & Baja', '899202600019', true, 'Lembar', 15, 3, 'Lembar', 1, 475000, 475000),
('c0000000-0000-0000-0000-000000000020', 'A020', 'Wermes 2,5 x 5,2 (Besi 10)', 'Besi & Baja', '899202600020', true, 'Lembar', 15, 3, 'Lembar', 1, 625000, 625000),
('c0000000-0000-0000-0000-000000000021', 'A021', 'Besi 6', 'Besi & Baja', '899202600021', true, 'Batang', 100, 20, 'Batang', 1, 26000, 26000),
('c0000000-0000-0000-0000-000000000022', 'A022', 'Besi 8', 'Besi & Baja', '899202600022', true, 'Batang', 120, 20, 'Batang', 1, 37000, 37000),
('c0000000-0000-0000-0000-000000000023', 'A023', 'Besi 10', 'Besi & Baja', '899202600023', true, 'Batang', 100, 20, 'Batang', 1, 58000, 58000),
('c0000000-0000-0000-0000-000000000024', 'A024', 'Besi 12', 'Besi & Baja', '899202600024', true, 'Batang', 80, 15, 'Batang', 1, 76000, 76000),
('c0000000-0000-0000-0000-000000000025', 'A025', 'Bondek', 'Besi & Baja', '899202600025', true, 'Meter', 60, 10, 'Meter', 1, 95000, 95000),
('c0000000-0000-0000-0000-000000000026', 'A026', 'Genteng Metal', 'Atap & Rangka Atap', '899202600026', true, 'Pcs', 100, 20, 'Pcs', 1, 33000, 33000),
('c0000000-0000-0000-0000-000000000027', 'A027', 'Genteng Alderon Transparan', 'Atap & Rangka Atap', '899202600027', true, 'Meter', 40, 10, 'Meter', 1, 85000, 85000),
('c0000000-0000-0000-0000-000000000028', 'A028', 'Genteng Alderon Single', 'Atap & Rangka Atap', '899202600028', true, 'Meter', 50, 10, 'Meter', 1, 75000, 75000),
('c0000000-0000-0000-0000-000000000029', 'A029', 'Genteng Alderon Double', 'Atap & Rangka Atap', '899202600029', true, 'Meter', 40, 10, 'Meter', 1, 90000, 90000),
('c0000000-0000-0000-0000-000000000030', 'A030', 'Spandek Pasir', 'Atap & Rangka Atap', '899202600030', true, 'Meter', 80, 15, 'Meter', 1, 48000, 48000),
('c0000000-0000-0000-0000-000000000031', 'A031', 'Spandek Polos', 'Atap & Rangka Atap', '899202600031', true, 'Meter', 80, 15, 'Meter', 1, 46000, 46000),
('c0000000-0000-0000-0000-000000000032', 'A032', 'Reng Baja 0,35', 'Atap & Rangka Atap', '899202600032', true, 'Batang', 100, 20, 'Batang', 1, 33000, 33000),
('c0000000-0000-0000-0000-000000000033', 'A033', 'Baja Ringan 0,70', 'Atap & Rangka Atap', '899202600033', true, 'Batang', 100, 20, 'Batang', 1, 64000, 64000),
('c0000000-0000-0000-0000-000000000034', 'A034', 'Baja Ringan 0,75', 'Atap & Rangka Atap', '899202600034', true, 'Batang', 100, 20, 'Batang', 1, 82000, 82000),
('c0000000-0000-0000-0000-000000000035', 'A035', 'Asbes 1 1/2 Jabesmen', 'Atap & Rangka Atap', '899202600035', true, 'Lembar', 50, 10, 'Lembar', 1, 45000, 45000),
('c0000000-0000-0000-0000-000000000036', 'A036', 'Asbes 1,8 m', 'Atap & Rangka Atap', '899202600036', true, 'Lembar', 50, 10, 'Lembar', 1, 54000, 54000),
('c0000000-0000-0000-0000-000000000037', 'A037', 'Asbes 2,1 m', 'Atap & Rangka Atap', '899202600037', true, 'Lembar', 50, 10, 'Lembar', 1, 62000, 62000),
('c0000000-0000-0000-0000-000000000038', 'A038', 'Asbes 2,4 m', 'Atap & Rangka Atap', '899202600038', true, 'Lembar', 50, 10, 'Lembar', 1, 70000, 70000),
('c0000000-0000-0000-0000-000000000039', 'A039', 'Asbes 2,7 m', 'Atap & Rangka Atap', '899202600039', true, 'Lembar', 40, 10, 'Lembar', 1, 80000, 80000),
('c0000000-0000-0000-0000-000000000040', 'A040', 'Asbes 3 m', 'Atap & Rangka Atap', '899202600040', true, 'Lembar', 40, 10, 'Lembar', 1, 95000, 95000),
('c0000000-0000-0000-0000-000000000041', 'A041', 'Besi Holo Plafon 4x4', 'Plafon & Lisplang', '899202600041', true, 'Batang', 80, 15, 'Batang', 1, 25000, 25000),
('c0000000-0000-0000-0000-000000000042', 'A042', 'Besi Holo Plafon 2x4', 'Plafon & Lisplang', '899202600042', true, 'Batang', 80, 15, 'Batang', 1, 20000, 20000),
('c0000000-0000-0000-0000-000000000043', 'A043', 'Gipsum', 'Plafon & Lisplang', '899202600043', true, 'Lembar', 50, 10, 'Lembar', 1, 52000, 52000),
('c0000000-0000-0000-0000-000000000044', 'A044', 'GRC 63', 'Plafon & Lisplang', '899202600044', true, 'Lembar', 40, 10, 'Lembar', 1, 63000, 63000),
('c0000000-0000-0000-0000-000000000045', 'A045', 'Lisplang GRC 10', 'Plafon & Lisplang', '899202600045', true, 'Pcs', 40, 10, 'Pcs', 1, 27000, 27000),
('c0000000-0000-0000-0000-000000000046', 'A046', 'Lisplang GRC 20', 'Plafon & Lisplang', '899202600046', true, 'Pcs', 40, 10, 'Pcs', 1, 41000, 41000),
('c0000000-0000-0000-0000-000000000047', 'A047', 'Lisplang GRC 30', 'Plafon & Lisplang', '899202600047', true, 'Pcs', 30, 8, 'Pcs', 1, 60000, 60000),
('c0000000-0000-0000-0000-000000000048', 'A048', 'Bambu', 'Kayu & Bekisting', '899202600048', true, 'Batang', 100, 20, 'Batang', 1, 9000, 9000),
('c0000000-0000-0000-0000-000000000049', 'A049', 'Papan Cor 18 x 2,5 cm', 'Kayu & Bekisting', '899202600049', true, 'Pcs', 100, 20, 'Pcs', 1, 10000, 10000),
('c0000000-0000-0000-0000-000000000050', 'A050', 'Papan Cor 2 x 20 cm', 'Kayu & Bekisting', '899202600050', true, 'Pcs', 80, 15, 'Pcs', 1, 25000, 25000),
('c0000000-0000-0000-0000-000000000051', 'A051', 'Kaso 4x6', 'Kayu & Bekisting', '899202600051', true, 'Batang', 80, 15, 'Batang', 1, 25000, 25000),
('c0000000-0000-0000-0000-000000000052', 'A052', 'Kaso 5x7', 'Kayu & Bekisting', '899202600052', true, 'Batang', 60, 15, 'Batang', 1, 35000, 35000),
('c0000000-0000-0000-0000-000000000053', 'A053', 'Triplek 4 mm', 'Kayu & Bekisting', '899202600053', true, 'Lembar', 40, 10, 'Lembar', 1, 59000, 59000),
('c0000000-0000-0000-0000-000000000054', 'A054', 'Triplek 6 mm', 'Kayu & Bekisting', '899202600054', true, 'Lembar', 40, 10, 'Lembar', 1, 69000, 69000),
('c0000000-0000-0000-0000-000000000055', 'A055', 'Triplek 8 mm', 'Kayu & Bekisting', '899202600055', true, 'Lembar', 30, 8, 'Lembar', 1, 76000, 76000),
('c0000000-0000-0000-0000-000000000056', 'A056', 'Triplek 9 mm', 'Kayu & Bekisting', '899202600056', true, 'Lembar', 30, 8, 'Lembar', 1, 89000, 89000),
('c0000000-0000-0000-0000-000000000057', 'A057', 'Triplek 12 mm', 'Kayu & Bekisting', '899202600057', true, 'Lembar', 25, 5, 'Lembar', 1, 125000, 125000),
('c0000000-0000-0000-0000-000000000058', 'A058', 'Triplek 15 mm', 'Kayu & Bekisting', '899202600058', true, 'Lembar', 20, 5, 'Lembar', 1, 155000, 155000),
('c0000000-0000-0000-0000-000000000059', 'A059', 'Paralon AW 1/2 Inch', 'Pipa PVC', '899202600059', true, 'Batang', 25, 10, 'Batang', 1, 23000, 23000),
('c0000000-0000-0000-0000-000000000060', 'A060', 'Paralon AW 3/4 Inch', 'Pipa PVC', '899202600060', true, 'Batang', 20, 10, 'Batang', 1, 28000, 28000),
('c0000000-0000-0000-0000-000000000061', 'A061', 'Paralon AW 1 Inch', 'Pipa PVC', '899202600061', true, 'Batang', 20, 10, 'Batang', 1, 39000, 39000),
('c0000000-0000-0000-0000-000000000062', 'A062', 'Paralon AW 1 1/4 Inch', 'Pipa PVC', '899202600062', true, 'Batang', 15, 5, 'Batang', 1, 60000, 60000),
('c0000000-0000-0000-0000-000000000063', 'A063', 'Paralon AW 1 1/2 Inch', 'Pipa PVC', '899202600063', true, 'Batang', 15, 5, 'Batang', 1, 70000, 70000),
('c0000000-0000-0000-0000-000000000064', 'A064', 'Paralon AW 2 Inch', 'Pipa PVC', '899202600064', true, 'Batang', 15, 5, 'Batang', 1, 89000, 89000),
('c0000000-0000-0000-0000-000000000065', 'A065', 'Paralon AW 2 1/2 Inch', 'Pipa PVC', '899202600065', true, 'Batang', 10, 5, 'Batang', 1, 130000, 130000),
('c0000000-0000-0000-0000-000000000066', 'A066', 'Paralon AW 3 Inch', 'Pipa PVC', '899202600066', true, 'Batang', 5, 5, 'Batang', 1, 183000, 183000),
('c0000000-0000-0000-0000-000000000067', 'A067', 'Paralon AW 4 Inch', 'Pipa PVC', '899202600067', true, 'Batang', 5, 5, 'Batang', 1, 320000, 320000),
('c0000000-0000-0000-0000-000000000068', 'A068', 'Paralon D 1 1/4 Inch', 'Pipa PVC', '899202600068', true, 'Batang', 15, 5, 'Batang', 1, 38000, 38000),
('c0000000-0000-0000-0000-000000000069', 'A069', 'Paralon D 1 1/2 Inch', 'Pipa PVC', '899202600069', true, 'Batang', 15, 5, 'Batang', 1, 43000, 43000),
('c0000000-0000-0000-0000-000000000070', 'A070', 'Paralon D 2 Inch', 'Pipa PVC', '899202600070', true, 'Batang', 10, 5, 'Batang', 1, 57000, 57000),
('c0000000-0000-0000-0000-000000000071', 'A071', 'Paralon D 2 1/2 Inch', 'Pipa PVC', '899202600071', true, 'Batang', 10, 5, 'Batang', 1, 75000, 75000),
('c0000000-0000-0000-0000-000000000072', 'A072', 'Paralon D 3 Inch', 'Pipa PVC', '899202600072', true, 'Batang', 15, 5, 'Batang', 1, 99000, 99000),
('c0000000-0000-0000-0000-000000000073', 'A073', 'Paralon D 4 Inch', 'Pipa PVC', '899202600073', true, 'Batang', 5, 5, 'Batang', 1, 156000, 156000),
('c0000000-0000-0000-0000-000000000074', 'A074', 'Closet Jongkok', 'Sanitair & Tandon', '899202600074', true, 'Pcs', 5, 3, 'Pcs', 1, 115000, 115000),
('c0000000-0000-0000-0000-000000000075', 'A075', 'Pintu Kamar Mandi Standar PVC', 'Sanitair & Tandon', '899202600075', true, 'Pcs', 8, 2, 'Pcs', 1, 215000, 215000),
('c0000000-0000-0000-0000-000000000076', 'A076', 'Toren 300', 'Sanitair & Tandon', '899202600076', true, 'Pcs', 4, 2, 'Pcs', 1, 775000, 775000),
('c0000000-0000-0000-0000-000000000077', 'A077', 'Toren 500', 'Sanitair & Tandon', '899202600077', true, 'Pcs', 4, 2, 'Pcs', 1, 1230000, 1230000),
('c0000000-0000-0000-0000-000000000078', 'A078', 'Toren 650', 'Sanitair & Tandon', '899202600078', true, 'Pcs', 3, 1, 'Pcs', 1, 1400000, 1400000),
('c0000000-0000-0000-0000-000000000079', 'A079', 'Toren 1050', 'Sanitair & Tandon', '899202600079', true, 'Pcs', 2, 1, 'Pcs', 1, 2570000, 2570000),
('c0000000-0000-0000-0000-000000000080', 'A080', 'Paku Biasa', 'Paku & Perlengkapan', '899202600080', true, 'Kg', 60, 15, 'Kg', 1, 15000, 15000),
('c0000000-0000-0000-0000-000000000081', 'A081', 'Paku Beton', 'Paku & Perlengkapan', '899202600081', true, 'Pack', 25, 5, 'Pack', 1, 35000, 35000),
('c0000000-0000-0000-0000-000000000082', 'A082', 'Cat Avian 5 kg', 'Cat', '899202600082', true, 'Pail', 15, 5, 'Pail', 1, 163000, 163000),
('c0000000-0000-0000-0000-000000000083', 'A083', 'Cat Avian 20 kg', 'Cat', '899202600083', true, 'Pail', 8, 3, 'Pail', 1, 790000, 790000),
('c0000000-0000-0000-0000-000000000084', 'A084', 'Cat Vinilex 5 kg', 'Cat', '899202600084', true, 'Pail', 15, 5, 'Pail', 1, 163000, 163000),
('c0000000-0000-0000-0000-000000000085', 'A085', 'Cat Vinilex 20 kg', 'Cat', '899202600085', true, 'Pail', 8, 3, 'Pail', 1, 790000, 790000),
('c0000000-0000-0000-0000-000000000086', 'A086', 'Cat Aquaprof 1 kg', 'Cat', '899202600086', true, 'Pail', 20, 5, 'Pail', 1, 61000, 61000),
('c0000000-0000-0000-0000-000000000087', 'A087', 'Cat Aquaprof 4 kg', 'Cat', '899202600087', true, 'Pail', 12, 4, 'Pail', 1, 235000, 235000),
('c0000000-0000-0000-0000-000000000088', 'A088', 'Cat Aquaprof 20 kg', 'Cat', '899202600088', true, 'Pail', 6, 2, 'Pail', 1, 980000, 980000),
('c0000000-0000-0000-0000-000000000089', 'B001', 'Semen Gresik', 'Semen', '899202600089', true, 'Sak', 10, 10, 'Sak', 1, 53000, 53000),
('c0000000-0000-0000-0000-000000000090', 'B002', 'Semen Putih', 'Semen', '899202600090', true, 'Sak', 1, 3, 'Sak', 1, 110000, 110000),
('c0000000-0000-0000-0000-000000000091', 'B003', 'Paralon Bstln STD P D 2"', 'Pipa PVC', '899202600091', true, 'Batang', 10, 5, 'Batang', 1, 41838, 41838),
('c0000000-0000-0000-0000-000000000092', 'B004', 'Paralon Bstln STD P D 2 1/2"', 'Pipa PVC', '899202600092', true, 'Batang', 10, 5, 'Batang', 1, 55135, 55135),
('c0000000-0000-0000-0000-000000000093', 'B005', 'Paralon Bstln STD P D 3"', 'Pipa PVC', '899202600093', true, 'Batang', 8, 5, 'Batang', 1, 76099, 76099),
('c0000000-0000-0000-0000-000000000094', 'B006', 'Paralon Bstln STD P D 4"', 'Pipa PVC', '899202600094', true, 'Batang', 15, 5, 'Batang', 1, 119730, 119730),
('c0000000-0000-0000-0000-000000000095', 'B007', 'Knie Trilliun Bc D Abu 3"/30', 'Pipa PVC', '899202600095', true, 'Pcs', 30, 10, 'Pcs', 1, 7117, 7117),
('c0000000-0000-0000-0000-000000000096', 'B008', 'Kran ONDA BC Atap 1/2"/12', 'Sanitair & Tandon', '899202600096', true, 'Pcs', 12, 5, 'Pcs', 1, 32883, 32883),
('c0000000-0000-0000-0000-000000000097', 'B009', 'Seal Tape ONDA 10m 12mm/72', 'Pipa PVC', '899202600097', true, 'Pcs', 72, 20, 'Pcs', 1, 4459, 4459),
('c0000000-0000-0000-0000-000000000098', 'B010', 'Lem FOX Isarplas Lem VPC 40gr', 'Pipa PVC', '899202600098', true, 'Pcs', 60, 15, 'Pcs', 1, 6081, 6081),
('c0000000-0000-0000-0000-000000000099', 'B011', 'Kape PVC 5"', 'Paku & Perlengkapan', '899202600099', true, 'Pcs', 12, 5, 'Pcs', 1, 1500, 1500),
('c0000000-0000-0000-0000-000000000100', 'B012', 'Kape PVC 7"', 'Paku & Perlengkapan', '899202600100', true, 'Pcs', 12, 5, 'Pcs', 1, 2500, 2500),
('c0000000-0000-0000-0000-000000000101', 'B013', 'Lakban Kertas 1"', 'Paku & Perlengkapan', '899202600101', true, 'Pcs', 12, 5, 'Pcs', 1, 3250, 3250),
('c0000000-0000-0000-0000-000000000102', 'B014', 'Meteran 5m Shisuka', 'Paku & Perlengkapan', '899202600102', true, 'Pcs', 12, 5, 'Pcs', 1, 10000, 10000),
('c0000000-0000-0000-0000-000000000103', 'B015', 'Bulu Roll Copot Daesung', 'Cat', '899202600103', true, 'Pcs', 24, 6, 'Pcs', 1, 10417, 10417),
('c0000000-0000-0000-0000-000000000104', 'B016', 'Palu Karet Kodai', 'Paku & Perlengkapan', '899202600104', true, 'Pcs', 6, 3, 'Pcs', 1, 26000, 26000),
('c0000000-0000-0000-0000-000000000105', 'B017', 'Kuas Roll Kapal Merah', 'Cat', '899202600105', true, 'Pcs', 12, 5, 'Pcs', 1, 9584, 9584),
('c0000000-0000-0000-0000-000000000106', 'B018', 'Kuas Roll Kapal Stamvick', 'Cat', '899202600106', true, 'Pcs', 12, 5, 'Pcs', 1, 22084, 22084),
('c0000000-0000-0000-0000-000000000107', 'B019', 'Lem G', 'Paku & Perlengkapan', '899202600107', true, 'Pcs', 50, 10, 'Pcs', 1, 4600, 4600),
('c0000000-0000-0000-0000-000000000108', 'B020', 'Bulu Roll Copot Eterna', 'Cat', '899202600108', true, 'Pcs', 12, 5, 'Pcs', 1, 14167, 14167),
('c0000000-0000-0000-0000-000000000109', 'B021', 'Kuas Roll Copot Daesung', 'Cat', '899202600109', true, 'Pcs', 12, 5, 'Pcs', 1, 15417, 15417),
('c0000000-0000-0000-0000-000000000110', 'B022', 'Kuas Roll Copot Eterna', 'Cat', '899202600110', true, 'Pcs', 24, 6, 'Pcs', 1, 20000, 20000),
('c0000000-0000-0000-0000-000000000111', 'B023', 'Selang Timbang', 'Paku & Perlengkapan', '899202600111', true, 'Meter', 100, 20, 'Meter', 1, 2000, 2000),
('c0000000-0000-0000-0000-000000000112', 'B024', 'Kuas 633 2"', 'Cat', '899202600112', true, 'Pcs', 24, 6, 'Pcs', 1, 2750, 2750),
('c0000000-0000-0000-0000-000000000113', 'B025', 'Kuas 633 2,5"', 'Cat', '899202600113', true, 'Pcs', 24, 6, 'Pcs', 1, 3438, 3438),
('c0000000-0000-0000-0000-000000000114', 'B026', 'Kuas 633 3"', 'Cat', '899202600114', true, 'Pcs', 24, 6, 'Pcs', 1, 4125, 4125),
('c0000000-0000-0000-0000-000000000115', 'B027', 'Kuas 633 4"', 'Cat', '899202600115', true, 'Pcs', 12, 5, 'Pcs', 1, 5417, 5417),
('c0000000-0000-0000-0000-000000000116', 'B028', 'Kuas Eterna 1,5"', 'Cat', '899202600116', true, 'Pcs', 12, 5, 'Pcs', 1, 5313, 5313),
('c0000000-0000-0000-0000-000000000117', 'B029', 'Kuas Eterna 2"', 'Cat', '899202600117', true, 'Pcs', 12, 5, 'Pcs', 1, 7084, 7084),
('c0000000-0000-0000-0000-000000000118', 'B030', 'Kuas Eterna 2,5"', 'Cat', '899202600118', true, 'Pcs', 12, 5, 'Pcs', 1, 8855, 8855),
('c0000000-0000-0000-0000-000000000119', 'B031', 'Kuas Eterna 4"', 'Cat', '899202600119', true, 'Pcs', 12, 5, 'Pcs', 1, 18084, 18084),
('c0000000-0000-0000-0000-000000000120', 'B032', 'Kawat Loket Hijau K', 'Besi & Baja', '899202600120', true, 'Meter', 20, 5, 'Meter', 1, 10000, 10000),
('c0000000-0000-0000-0000-000000000121', 'B033', 'Kawat Loket Hijau B', 'Besi & Baja', '899202600121', true, 'Meter', 20, 5, 'Meter', 1, 7500, 7500),
('c0000000-0000-0000-0000-000000000122', 'B034', 'Plastik Cor', 'Kayu & Bekisting', '899202600122', true, 'Kg', 13, 5, 'Kg', 1, 12500, 12500),
('c0000000-0000-0000-0000-000000000123', 'B035', 'Karpet 90cm', 'Atap & Rangka Atap', '899202600123', true, 'Meter', 50, 10, 'Meter', 1, 8500, 8500),
('c0000000-0000-0000-0000-000000000124', 'B036', 'Kawat Benrat', 'Besi & Baja', '899202600124', true, 'Kg', 50, 10, 'Kg', 1, 13500, 13500),
('c0000000-0000-0000-0000-000000000125', 'B037', 'Pengki Orange', 'Paku & Perlengkapan', '899202600125', true, 'Pcs', 24, 5, 'Pcs', 1, 12500, 12500),
('c0000000-0000-0000-0000-000000000126', 'B038', 'Bak Cat 89', 'Cat', '899202600126', true, 'Pcs', 24, 5, 'Pcs', 1, 6250, 6250),
('c0000000-0000-0000-0000-000000000127', 'B039', 'Skrup Gypsum 6x1"', 'Paku & Perlengkapan', '899202600127', true, 'Box', 10, 3, 'Box', 1, 35000, 35000),
('c0000000-0000-0000-0000-000000000128', 'B040', 'Roofing 5cm 350pcs/box', 'Paku & Perlengkapan', '899202600128', true, 'Box', 5, 2, 'Box', 1, 150500, 150500),
('c0000000-0000-0000-0000-000000000129', 'B041', 'Roofing 7cm 250pcs/box', 'Paku & Perlengkapan', '899202600129', true, 'Box', 5, 2, 'Box', 1, 137500, 137500),
('c0000000-0000-0000-0000-000000000130', 'B042', 'Glas Blok', 'Material Dasar', '899202600130', true, 'Dus', 54, 10, 'Dus', 1, 23000, 23000);

-- 5.5 Data SatuanBarang (Harga Jual Awal = Harga Modal + Margin 30%)
INSERT INTO satuan_barang (id_satuan_barang, barang_id, nama_satuan, jumlah_konversi, harga_modal, margin_persen, harga_jual_awal) VALUES
('cb000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Kubik', 1, 480000, 30.00, 624000),
('cb000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'Kubik', 1, 480000, 30.00, 624000),
('cb000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 'Truck', 1, 2600000, 30.00, 3380000),
('cb000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000004', 'Truck', 1, 3300000, 30.00, 4290000),
('cb000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000005', 'Truck', 1, 2000000, 30.00, 2600000),
('cb000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000006', 'Truck', 1, 3200000, 30.00, 4160000),
('cb000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000007', 'Pcs', 1, 600, 30.00, 780),
('cb000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000008', 'Meter', 1, 60000, 30.00, 78000),
('cb000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000009', 'Sak', 1, 49800, 30.00, 64740),
('cb000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000010', 'Sak', 1, 42000, 30.00, 54600),
('cb000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000011', 'Sak', 1, 59600, 30.00, 77480),
('cb000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000012', 'Sak', 1, 72600, 30.00, 94380),
('cb000000-0000-0000-0000-000000000013', 'c0000000-0000-0000-0000-000000000013', 'Pcs', 1, 50000, 30.00, 65000),
('cb000000-0000-0000-0000-000000000014', 'c0000000-0000-0000-0000-000000000014', 'Pcs', 1, 65000, 30.00, 84500),
('cb000000-0000-0000-0000-000000000015', 'c0000000-0000-0000-0000-000000000015', 'Pcs', 1, 42000, 30.00, 54600),
('cb000000-0000-0000-0000-000000000016', 'c0000000-0000-0000-0000-000000000016', 'Pcs', 1, 50000, 30.00, 65000),
('cb000000-0000-0000-0000-000000000017', 'c0000000-0000-0000-0000-000000000017', 'Pcs', 1, 39000, 30.00, 50700),
('cb000000-0000-0000-0000-000000000018', 'c0000000-0000-0000-0000-000000000018', 'Pcs', 1, 48000, 30.00, 62400),
('cb000000-0000-0000-0000-000000000019', 'c0000000-0000-0000-0000-000000000019', 'Lembar', 1, 475000, 30.00, 617500),
('cb000000-0000-0000-0000-000000000020', 'c0000000-0000-0000-0000-000000000020', 'Lembar', 1, 625000, 30.00, 812500),
('cb000000-0000-0000-0000-000000000021', 'c0000000-0000-0000-0000-000000000021', 'Batang', 1, 26000, 30.00, 33800),
('cb000000-0000-0000-0000-000000000022', 'c0000000-0000-0000-0000-000000000022', 'Batang', 1, 37000, 30.00, 48100),
('cb000000-0000-0000-0000-000000000023', 'c0000000-0000-0000-0000-000000000023', 'Batang', 1, 58000, 30.00, 75400),
('cb000000-0000-0000-0000-000000000024', 'c0000000-0000-0000-0000-000000000024', 'Batang', 1, 76000, 30.00, 98800),
('cb000000-0000-0000-0000-000000000025', 'c0000000-0000-0000-0000-000000000025', 'Meter', 1, 95000, 30.00, 123500),
('cb000000-0000-0000-0000-000000000026', 'c0000000-0000-0000-0000-000000000026', 'Pcs', 1, 33000, 30.00, 42900),
('cb000000-0000-0000-0000-000000000027', 'c0000000-0000-0000-0000-000000000027', 'Meter', 1, 85000, 30.00, 110500),
('cb000000-0000-0000-0000-000000000028', 'c0000000-0000-0000-0000-000000000028', 'Meter', 1, 75000, 30.00, 97500),
('cb000000-0000-0000-0000-000000000029', 'c0000000-0000-0000-0000-000000000029', 'Meter', 1, 90000, 30.00, 117000),
('cb000000-0000-0000-0000-000000000030', 'c0000000-0000-0000-0000-000000000030', 'Meter', 1, 48000, 30.00, 62400),
('cb000000-0000-0000-0000-000000000031', 'c0000000-0000-0000-0000-000000000031', 'Meter', 1, 46000, 30.00, 59800),
('cb000000-0000-0000-0000-000000000032', 'c0000000-0000-0000-0000-000000000032', 'Batang', 1, 33000, 30.00, 42900),
('cb000000-0000-0000-0000-000000000033', 'c0000000-0000-0000-0000-000000000033', 'Batang', 1, 64000, 30.00, 83200),
('cb000000-0000-0000-0000-000000000034', 'c0000000-0000-0000-0000-000000000034', 'Batang', 1, 82000, 30.00, 106600),
('cb000000-0000-0000-0000-000000000035', 'c0000000-0000-0000-0000-000000000035', 'Lembar', 1, 45000, 30.00, 58500),
('cb000000-0000-0000-0000-000000000036', 'c0000000-0000-0000-0000-000000000036', 'Lembar', 1, 54000, 30.00, 70200),
('cb000000-0000-0000-0000-000000000037', 'c0000000-0000-0000-0000-000000000037', 'Lembar', 1, 62000, 30.00, 80600),
('cb000000-0000-0000-0000-000000000038', 'c0000000-0000-0000-0000-000000000038', 'Lembar', 1, 70000, 30.00, 91000),
('cb000000-0000-0000-0000-000000000039', 'c0000000-0000-0000-0000-000000000039', 'Lembar', 1, 80000, 30.00, 104000),
('cb000000-0000-0000-0000-000000000040', 'c0000000-0000-0000-0000-000000000040', 'Lembar', 1, 95000, 30.00, 123500),
('cb000000-0000-0000-0000-000000000041', 'c0000000-0000-0000-0000-000000000041', 'Batang', 1, 25000, 30.00, 32500),
('cb000000-0000-0000-0000-000000000042', 'c0000000-0000-0000-0000-000000000042', 'Batang', 1, 20000, 30.00, 26000),
('cb000000-0000-0000-0000-000000000043', 'c0000000-0000-0000-0000-000000000043', 'Lembar', 1, 52000, 30.00, 67600),
('cb000000-0000-0000-0000-000000000044', 'c0000000-0000-0000-0000-000000000044', 'Lembar', 1, 63000, 30.00, 81900),
('cb000000-0000-0000-0000-000000000045', 'c0000000-0000-0000-0000-000000000045', 'Pcs', 1, 27000, 30.00, 35100),
('cb000000-0000-0000-0000-000000000046', 'c0000000-0000-0000-0000-000000000046', 'Pcs', 1, 41000, 30.00, 53300),
('cb000000-0000-0000-0000-000000000047', 'c0000000-0000-0000-0000-000000000047', 'Pcs', 1, 60000, 30.00, 78000),
('cb000000-0000-0000-0000-000000000048', 'c0000000-0000-0000-0000-000000000048', 'Batang', 1, 9000, 30.00, 11700),
('cb000000-0000-0000-0000-000000000049', 'c0000000-0000-0000-0000-000000000049', 'Pcs', 1, 10000, 30.00, 13000),
('cb000000-0000-0000-0000-000000000050', 'c0000000-0000-0000-0000-000000000050', 'Pcs', 1, 25000, 30.00, 32500),
('cb000000-0000-0000-0000-000000000051', 'c0000000-0000-0000-0000-000000000051', 'Batang', 1, 25000, 30.00, 32500),
('cb000000-0000-0000-0000-000000000052', 'c0000000-0000-0000-0000-000000000052', 'Batang', 1, 35000, 30.00, 45500),
('cb000000-0000-0000-0000-000000000053', 'c0000000-0000-0000-0000-000000000053', 'Lembar', 1, 59000, 30.00, 76700),
('cb000000-0000-0000-0000-000000000054', 'c0000000-0000-0000-0000-000000000054', 'Lembar', 1, 69000, 30.00, 89700),
('cb000000-0000-0000-0000-000000000055', 'c0000000-0000-0000-0000-000000000055', 'Lembar', 1, 76000, 30.00, 98800),
('cb000000-0000-0000-0000-000000000056', 'c0000000-0000-0000-0000-000000000056', 'Lembar', 1, 89000, 30.00, 115700),
('cb000000-0000-0000-0000-000000000057', 'c0000000-0000-0000-0000-000000000057', 'Lembar', 1, 125000, 30.00, 162500),
('cb000000-0000-0000-0000-000000000058', 'c0000000-0000-0000-0000-000000000058', 'Lembar', 1, 155000, 30.00, 201500),
('cb000000-0000-0000-0000-000000000059', 'c0000000-0000-0000-0000-000000000059', 'Batang', 1, 23000, 30.00, 29900),
('cb000000-0000-0000-0000-000000000060', 'c0000000-0000-0000-0000-000000000060', 'Batang', 1, 28000, 30.00, 36400),
('cb000000-0000-0000-0000-000000000061', 'c0000000-0000-0000-0000-000000000061', 'Batang', 1, 39000, 30.00, 50700),
('cb000000-0000-0000-0000-000000000062', 'c0000000-0000-0000-0000-000000000062', 'Batang', 1, 60000, 30.00, 78000),
('cb000000-0000-0000-0000-000000000063', 'c0000000-0000-0000-0000-000000000063', 'Batang', 1, 70000, 30.00, 91000),
('cb000000-0000-0000-0000-000000000064', 'c0000000-0000-0000-0000-000000000064', 'Batang', 1, 89000, 30.00, 115700),
('cb000000-0000-0000-0000-000000000065', 'c0000000-0000-0000-0000-000000000065', 'Batang', 1, 130000, 30.00, 169000),
('cb000000-0000-0000-0000-000000000066', 'c0000000-0000-0000-0000-000000000066', 'Batang', 1, 183000, 30.00, 237900),
('cb000000-0000-0000-0000-000000000067', 'c0000000-0000-0000-0000-000000000067', 'Batang', 1, 320000, 30.00, 416000),
('cb000000-0000-0000-0000-000000000068', 'c0000000-0000-0000-0000-000000000068', 'Batang', 1, 38000, 30.00, 49400),
('cb000000-0000-0000-0000-000000000069', 'c0000000-0000-0000-0000-000000000069', 'Batang', 1, 43000, 30.00, 55900),
('cb000000-0000-0000-0000-000000000070', 'c0000000-0000-0000-0000-000000000070', 'Batang', 1, 57000, 30.00, 74100),
('cb000000-0000-0000-0000-000000000071', 'c0000000-0000-0000-0000-000000000071', 'Batang', 1, 75000, 30.00, 97500),
('cb000000-0000-0000-0000-000000000072', 'c0000000-0000-0000-0000-000000000072', 'Batang', 1, 99000, 30.00, 128700),
('cb000000-0000-0000-0000-000000000073', 'c0000000-0000-0000-0000-000000000073', 'Batang', 1, 156000, 30.00, 202800),
('cb000000-0000-0000-0000-000000000074', 'c0000000-0000-0000-0000-000000000074', 'Pcs', 1, 115000, 30.00, 149500),
('cb000000-0000-0000-0000-000000000075', 'c0000000-0000-0000-0000-000000000075', 'Pcs', 1, 215000, 30.00, 279500),
('cb000000-0000-0000-0000-000000000076', 'c0000000-0000-0000-0000-000000000076', 'Pcs', 1, 775000, 30.00, 1007500),
('cb000000-0000-0000-0000-000000000077', 'c0000000-0000-0000-0000-000000000077', 'Pcs', 1, 1230000, 30.00, 1599000),
('cb000000-0000-0000-0000-000000000078', 'c0000000-0000-0000-0000-000000000078', 'Pcs', 1, 1400000, 30.00, 1820000),
('cb000000-0000-0000-0000-000000000079', 'c0000000-0000-0000-0000-000000000079', 'Pcs', 1, 2570000, 30.00, 3341000),
('cb000000-0000-0000-0000-000000000080', 'c0000000-0000-0000-0000-000000000080', 'Kg', 1, 15000, 30.00, 19500),
('cb000000-0000-0000-0000-000000000081', 'c0000000-0000-0000-0000-000000000081', 'Pack', 1, 35000, 30.00, 45500),
('cb000000-0000-0000-0000-000000000082', 'c0000000-0000-0000-0000-000000000082', 'Pail', 1, 163000, 30.00, 211900),
('cb000000-0000-0000-0000-000000000083', 'c0000000-0000-0000-0000-000000000083', 'Pail', 1, 790000, 30.00, 1027000),
('cb000000-0000-0000-0000-000000000084', 'c0000000-0000-0000-0000-000000000084', 'Pail', 1, 163000, 30.00, 211900),
('cb000000-0000-0000-0000-000000000085', 'c0000000-0000-0000-0000-000000000085', 'Pail', 1, 790000, 30.00, 1027000),
('cb000000-0000-0000-0000-000000000086', 'c0000000-0000-0000-0000-000000000086', 'Pail', 1, 61000, 30.00, 79300),
('cb000000-0000-0000-0000-000000000087', 'c0000000-0000-0000-0000-000000000087', 'Pail', 1, 235000, 30.00, 305500),
('cb000000-0000-0000-0000-000000000088', 'c0000000-0000-0000-0000-000000000088', 'Pail', 1, 980000, 30.00, 1274000),
('cb000000-0000-0000-0000-000000000089', 'c0000000-0000-0000-0000-000000000089', 'Sak', 1, 53000, 30.00, 68900),
('cb000000-0000-0000-0000-000000000090', 'c0000000-0000-0000-0000-000000000090', 'Sak', 1, 110000, 30.00, 143000),
('cb000000-0000-0000-0000-000000000091', 'c0000000-0000-0000-0000-000000000091', 'Batang', 1, 41838, 30.00, 54390),
('cb000000-0000-0000-0000-000000000092', 'c0000000-0000-0000-0000-000000000092', 'Batang', 1, 55135, 30.00, 71675),
('cb000000-0000-0000-0000-000000000093', 'c0000000-0000-0000-0000-000000000093', 'Batang', 1, 76099, 30.00, 98930),
('cb000000-0000-0000-0000-000000000094', 'c0000000-0000-0000-0000-000000000094', 'Batang', 1, 119730, 30.00, 155650),
('cb000000-0000-0000-0000-000000000095', 'c0000000-0000-0000-0000-000000000095', 'Pcs', 1, 7117, 30.00, 9250),
('cb000000-0000-0000-0000-000000000096', 'c0000000-0000-0000-0000-000000000096', 'Pcs', 1, 32883, 30.00, 42750),
('cb000000-0000-0000-0000-000000000097', 'c0000000-0000-0000-0000-000000000097', 'Pcs', 1, 4459, 30.00, 5800),
('cb000000-0000-0000-0000-000000000098', 'c0000000-0000-0000-0000-000000000098', 'Pcs', 1, 6081, 30.00, 7900),
('cb000000-0000-0000-0000-000000000099', 'c0000000-0000-0000-0000-000000000099', 'Pcs', 1, 1500, 30.00, 1950),
('cb000000-0000-0000-0000-000000000100', 'c0000000-0000-0000-0000-000000000100', 'Pcs', 1, 2500, 30.00, 3250),
('cb000000-0000-0000-0000-000000000101', 'c0000000-0000-0000-0000-000000000101', 'Pcs', 1, 3250, 30.00, 4225),
('cb000000-0000-0000-0000-000000000102', 'c0000000-0000-0000-0000-000000000102', 'Pcs', 1, 10000, 30.00, 13000),
('cb000000-0000-0000-0000-000000000103', 'c0000000-0000-0000-0000-000000000103', 'Pcs', 1, 10417, 30.00, 13550),
('cb000000-0000-0000-0000-000000000104', 'c0000000-0000-0000-0000-000000000104', 'Pcs', 1, 26000, 30.00, 33800),
('cb000000-0000-0000-0000-000000000105', 'c0000000-0000-0000-0000-000000000105', 'Pcs', 1, 9584, 30.00, 12460),
('cb000000-0000-0000-0000-000000000106', 'c0000000-0000-0000-0000-000000000106', 'Pcs', 1, 22084, 30.00, 28710),
('cb000000-0000-0000-0000-000000000107', 'c0000000-0000-0000-0000-000000000107', 'Pcs', 1, 4600, 30.00, 5980),
('cb000000-0000-0000-0000-000000000108', 'c0000000-0000-0000-0000-000000000108', 'Pcs', 1, 14167, 30.00, 18420),
('cb000000-0000-0000-0000-000000000109', 'c0000000-0000-0000-0000-000000000109', 'Pcs', 1, 15417, 30.00, 20050),
('cb000000-0000-0000-0000-000000000110', 'c0000000-0000-0000-0000-000000000110', 'Pcs', 1, 20000, 30.00, 26000),
('cb000000-0000-0000-0000-000000000111', 'c0000000-0000-0000-0000-000000000111', 'Meter', 1, 2000, 30.00, 2600),
('cb000000-0000-0000-0000-000000000112', 'c0000000-0000-0000-0000-000000000112', 'Pcs', 1, 2750, 30.00, 3575),
('cb000000-0000-0000-0000-000000000113', 'c0000000-0000-0000-0000-000000000113', 'Pcs', 1, 3438, 30.00, 4470),
('cb000000-0000-0000-0000-000000000114', 'c0000000-0000-0000-0000-000000000114', 'Pcs', 1, 4125, 30.00, 5365),
('cb000000-0000-0000-0000-000000000115', 'c0000000-0000-0000-0000-000000000115', 'Pcs', 1, 5417, 30.00, 7045),
('cb000000-0000-0000-0000-000000000116', 'c0000000-0000-0000-0000-000000000116', 'Pcs', 1, 5313, 30.00, 6910),
('cb000000-0000-0000-0000-000000000117', 'c0000000-0000-0000-0000-000000000117', 'Pcs', 1, 7084, 30.00, 9210),
('cb000000-0000-0000-0000-000000000118', 'c0000000-0000-0000-0000-000000000118', 'Pcs', 1, 8855, 30.00, 11510),
('cb000000-0000-0000-0000-000000000119', 'c0000000-0000-0000-0000-000000000119', 'Pcs', 1, 18084, 30.00, 23510),
('cb000000-0000-0000-0000-000000000120', 'c0000000-0000-0000-0000-000000000120', 'Meter', 1, 10000, 30.00, 13000),
('cb000000-0000-0000-0000-000000000121', 'c0000000-0000-0000-0000-000000000121', 'Meter', 1, 7500, 30.00, 9750),
('cb000000-0000-0000-0000-000000000122', 'c0000000-0000-0000-0000-000000000122', 'Kg', 1, 12500, 30.00, 16250),
('cb000000-0000-0000-0000-000000000123', 'c0000000-0000-0000-0000-000000000123', 'Meter', 1, 8500, 30.00, 11050),
('cb000000-0000-0000-0000-000000000124', 'c0000000-0000-0000-0000-000000000124', 'Kg', 1, 13500, 30.00, 17550),
('cb000000-0000-0000-0000-000000000125', 'c0000000-0000-0000-0000-000000000125', 'Pcs', 1, 12500, 30.00, 16250),
('cb000000-0000-0000-0000-000000000126', 'c0000000-0000-0000-0000-000000000126', 'Pcs', 1, 6250, 30.00, 8125),
('cb000000-0000-0000-0000-000000000127', 'c0000000-0000-0000-0000-000000000127', 'Box', 1, 35000, 30.00, 45500),
('cb000000-0000-0000-0000-000000000128', 'c0000000-0000-0000-0000-000000000128', 'Box', 1, 150500, 30.00, 195650),
('cb000000-0000-0000-0000-000000000129', 'c0000000-0000-0000-0000-000000000129', 'Box', 1, 137500, 30.00, 178750),
('cb000000-0000-0000-0000-000000000130', 'c0000000-0000-0000-0000-000000000130', 'Dus', 1, 23000, 30.00, 29900);

-- 5.6 Data Mutasi Barang & Detail Mutasi Barang
INSERT INTO mutasi_barang (id_mutasi, pengguna_id, pemasok_id, jenis, no_surat_jalan, jenis_bayar, tujuan, alasan, tanggal) VALUES
('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '90000000-0000-0000-0000-000000000001', 'masuk', 'SJ-20260123-01', 'tempo', 'Gudang Utama', 'Stok Masuk Pipa Paralon 23/01/2026', '2026-01-23T08:00:00+07:00'),
('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', '90000000-0000-0000-0000-000000000002', 'masuk', 'SJ-20260122-01', 'tunai', 'Gudang Utama', 'Stok Masuk Alat & Perlengkapan 22/01/2026', '2026-01-22T09:00:00+07:00'),
('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', '90000000-0000-0000-0000-000000000003', 'masuk', 'SJ-20260121-01', 'tunai', 'Gudang Utama', 'Barang Masuk Semen 3 Roda 21/01/2026', '2026-01-21T08:30:00+07:00'),
('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', NULL, 'keluar', 'OUT-20260121-01', NULL, 'Penjualan Toko', 'Barang Keluar Semen 3 Roda 15 sak (21/01/2026)', '2026-01-21T14:00:00+07:00');

INSERT INTO detail_mutasi_barang (id_detail_mutasi, mutasi_id, barang_id, satuan_pembelian, jumlah, harga_beli, subtotal, stok_sebelum, stok_sesudah) VALUES
('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000011', 'Sak', 10, 57000, 570000, 100, 110),
('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000011', 'Sak', 15, 63000, 945000, 110, 95),
('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000059', 'Batang', 25, 24144, 603600, 0, 25),
('f0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000061', 'Batang', 20, 44775, 895500, 0, 20),
('f0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000066', 'Batang', 5, 201351, 1006755, 0, 5),
('f0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000067', 'Batang', 5, 333604, 1668020, 0, 5),
('f0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000070', 'Batang', 10, 60811, 608110, 0, 10),
('f0000000-0000-0000-0000-000000000008', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000071', 'Batang', 10, 82162, 821620, 0, 10),
('f0000000-0000-0000-0000-000000000009', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000072', 'Batang', 15, 109009, 1635135, 0, 15),
('f0000000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000073', 'Batang', 5, 171441, 857205, 0, 5);

-- 5.7 Data Tagihan Pemasok & Pembayaran Pemasok
INSERT INTO tagihan_pemasok (id_tagihan, pemasok_id, mutasi_id, jumlah_tagihan, sisa_tagihan, tanggal_jatuh_tempo, status) VALUES
('91000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 8095945, 3095945, (CURRENT_DATE + INTERVAL '7 days')::date, 'belum_lunas');

INSERT INTO pembayaran_pemasok (id_pembayaran_pemasok, tagihan_id, nominal, keterangan) VALUES
('92000000-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000001', 5000000, 'Cicilan pertama tagihan pipa Rucika');

-- 5.8 Data Transaksi Penjualan
INSERT INTO transaksi (id_transaksi, no_nota, pengguna_id, pelanggan_id, jenis_pembayaran, total, jumlah_dibayar, sisa_tagihan, status_bayar, perlu_dikirim, tanggal) VALUES
('d0000000-0000-0000-0000-000000000001', 'INV-202610-0001', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'qris', 12500000, 12500000, 0, 'lunas', true, NOW() - INTERVAL '2 days'),
('d0000000-0000-0000-0000-000000000002', 'INV-202610-0002', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000004', 'tunai', 3500000, 3500000, 0, 'lunas', false, NOW() - INTERVAL '1 days'),
('d0000000-0000-0000-0000-000000000003', 'INV-202610-0003', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'kasbon', 8500000, 2000000, 6500000, 'sebagian', true, NOW() - INTERVAL '4 hours');

-- 5.9 Data Detail Transaksi (Mengacu pada satuan_barang_id)
INSERT INTO detail_transaksi (transaksi_id, satuan_barang_id, jumlah, harga_awal, harga_nego, harga_satuan, subtotal) VALUES
('d0000000-0000-0000-0000-000000000001', 'cb000000-0000-0000-0000-000000000001', 20, 624000, 624000, 624000, 12480000),
('d0000000-0000-0000-0000-000000000002', 'cb000000-0000-0000-0000-000000000003', 1, 3380000, NULL, 3380000, 3380000),
('d0000000-0000-0000-0000-000000000003', 'cb000000-0000-0000-0000-000000000006', 2, 4160000, NULL, 4160000, 8320000);

-- 5.10 Data Pembayaran
INSERT INTO pembayaran (transaksi_id, metode, nominal, referensi_gateway, status, tanggal) VALUES
('d0000000-0000-0000-0000-000000000001', 'qris', 12500000, 'MID-QRIS-992831', 'berhasil', NOW() - INTERVAL '2 days'),
('d0000000-0000-0000-0000-000000000002', 'tunai', 3500000, 'CASH-REC-1029', 'berhasil', NOW() - INTERVAL '1 days'),
('d0000000-0000-0000-0000-000000000003', 'va', 2000000, 'MID-VA-BCA-102948', 'berhasil', NOW() - INTERVAL '4 hours');

-- 5.11 Data Kasbon / Piutang
INSERT INTO kasbon (pelanggan_id, transaksi_id, jumlah_kasbon, status, tanggal_pengajuan, tanggal_keputusan) VALUES
('b0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000003', 6500000, 'disetujui', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours'),
('b0000000-0000-0000-0000-000000000003', NULL, 3150000, 'menunggu', NOW() - INTERVAL '1 days', NULL);

-- 5.12 Data Log Aktivitas Awal
INSERT INTO log_aktivitas (pengguna_id, modul, aktivitas, data_sebelum, data_sesudah) VALUES
('a0000000-0000-0000-0000-000000000001', 'Sistem', 'Inisialisasi Database CV Kurnia Mandiri', NULL, '{"status": "berhasil", "modul": "all"}'::jsonb);
