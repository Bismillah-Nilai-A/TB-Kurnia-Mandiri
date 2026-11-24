// Database types untuk Supabase (PostgreSQL) - CV Kurnia Mandiri
// Sinkron penuh dengan Revisi_CV_Kurnia_mandiri.drawio (Class Diagram, Use Case, Activity Diagram To-Be)

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export type Role = "admin" | "kasir" | "pengirim";
export type StatusAkun = "aktif" | "nonaktif";
export type JenisPelanggan = "proyek" | "perorangan";
export type StatusKasbon = "aktif" | "menunggu" | "disetujui" | "ditolak" | "lunas" | "dibatalkan";
export type JenisPembayaran = "tunai" | "kasbon" | "qris" | "va" | "transfer";
export type StatusBayar = "lunas" | "menunggu" | "sebagian" | "dibatalkan";
export type StatusPengiriman =
  | "belum_dikirim"
  | "sedang_dikirim"
  | "pengajuan_penukaran"
  | "diterima"
  | "terkirim"
  | "gagal";
export type StatusRestok = "direncanakan" | "dipesan" | "selesai" | "batal";
export type StatusTagihanPemasok = "belum_lunas" | "sebagian" | "lunas";
export type StatusPenukaran = "menunggu" | "disetujui" | "ditolak" | "selesai";
export type KondisiBarangKembali = "layak_jual" | "rusak";
export type JenisKendalaPengiriman =
  | "barang_tidak_lengkap"
  | "alamat_tidak_ditemukan"
  | "kendaraan_bermasalah"
  | "pelanggan_menolak"
  | "cuaca_ekstrem"
  | "lainnya";
export type NotificationChannel = "email" | "whatsapp";
export type NotificationType =
  | "stok_hampir_habis"
  | "transaksi_selesai"
  | "pembayaran_lunas"
  | "piutang_lunas"
  | "kasbon_disetujui"
  | "notifikasi_other";

export interface NotificationPayload {
  channel: NotificationChannel;
  penerima: string;
  jenis: NotificationType;
  pesan: string;
}

export interface NotificationConfig {
  email_enabled: boolean;
  email_from: string;
  whatsapp_enabled: boolean;
  whatsapp_phone: string;
  default_channel: NotificationChannel;
}

export interface MidtransSnap {
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };
  customer_details?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    billing_address?: {
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: string;
      address?: string;
      city?: string;
      postal_code?: string;
      country_code?: string;
    };
  };
  item_details?: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
}

export interface SnapResponse {
  token: string;
  redirect_url: string;
}

export interface TransactionStatusResponse {
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: string;
  fraud_status?: string;
  status_code: string;
  status_message: string;
}

export type Database = {
  public: {
    Tables: {
      pengguna: {
        Row: {
          id_pengguna: string;
          id?: string;
          nama: string;
          username: string;
          password: string;
          role: Role;
          status: StatusAkun;
          created_at: string;
        };
        Insert: {
          id_pengguna?: string;
          nama: string;
          username: string;
          password: string;
          role: Role;
          status?: StatusAkun;
          created_at?: string;
        };
        Update: {
          id_pengguna?: string;
          nama?: string;
          username?: string;
          password?: string;
          role?: Role;
          status?: StatusAkun;
          created_at?: string;
        };
      };
      log_aktivitas: {
        Row: {
          id_log: string;
          id?: string;
          pengguna_id: string | null;
          modul: string;
          aktivitas: string;
          data_sebelum: Json | null;
          data_sesudah: Json | null;
          waktu: string;
        };
        Insert: {
          id_log?: string;
          pengguna_id?: string | null;
          modul: string;
          aktivitas: string;
          data_sebelum?: Json | null;
          data_sesudah?: Json | null;
          waktu?: string;
        };
        Update: {
          id_log?: string;
          pengguna_id?: string | null;
          modul?: string;
          aktivitas?: string;
          data_sebelum?: Json | null;
          data_sesudah?: Json | null;
          waktu?: string;
        };
      };
      notifikasi: {
        Row: {
          id_notifikasi: string;
          id?: string;
          jenis: string;
          penerima: string;
          saluran: NotificationChannel;
          pesan: string;
          status_kirim: "pending" | "terkirim" | "gagal" | "antri";
          waktu: string;
        };
        Insert: {
          id_notifikasi?: string;
          jenis: string;
          penerima: string;
          saluran?: NotificationChannel;
          pesan: string;
          status_kirim?: "pending" | "terkirim" | "gagal" | "antri";
          waktu?: string;
        };
        Update: {
          id_notifikasi?: string;
          jenis?: string;
          penerima?: string;
          saluran?: NotificationChannel;
          pesan?: string;
          status_kirim?: "pending" | "terkirim" | "gagal" | "antri";
          waktu?: string;
        };
      };
      pelanggan: {
        Row: {
          id_pelanggan: string;
          id?: string;
          nama: string;
          jenis: JenisPelanggan;
          kontak: string | null;
          alamat: string | null;
          batas_kasbon: number;
          status_kasbon: StatusKasbon;
          created_at: string;
        };
        Insert: {
          id_pelanggan?: string;
          nama: string;
          jenis?: JenisPelanggan;
          kontak?: string | null;
          alamat?: string | null;
          batas_kasbon?: number;
          status_kasbon?: StatusKasbon;
          created_at?: string;
        };
        Update: {
          id_pelanggan?: string;
          nama?: string;
          jenis?: JenisPelanggan;
          kontak?: string | null;
          alamat?: string | null;
          batas_kasbon?: number;
          status_kasbon?: StatusKasbon;
          created_at?: string;
        };
      };
      kasbon: {
        Row: {
          id_kasbon: string;
          id?: string;
          pelanggan_id: string;
          transaksi_id: string | null;
          jumlah_kasbon: number;
          status: StatusKasbon;
          alasan_penolakan: string | null;
          tanggal_pengajuan: string;
          tanggal_keputusan: string | null;
        };
        Insert: {
          id_kasbon?: string;
          pelanggan_id: string;
          transaksi_id?: string | null;
          jumlah_kasbon: number;
          status?: StatusKasbon;
          alasan_penolakan?: string | null;
          tanggal_pengajuan?: string;
          tanggal_keputusan?: string | null;
        };
        Update: {
          id_kasbon?: string;
          pelanggan_id?: string;
          transaksi_id?: string | null;
          jumlah_kasbon?: number;
          status?: StatusKasbon;
          alasan_penolakan?: string | null;
          tanggal_pengajuan?: string;
          tanggal_keputusan?: string | null;
        };
      };
      transaksi: {
        Row: {
          id_transaksi: string;
          id?: string;
          no_nota: string;
          pengguna_id: string | null;
          pelanggan_id: string | null;
          jenis_pembayaran: JenisPembayaran;
          total: number;
          jumlah_dibayar: number;
          sisa_tagihan: number;
          status_bayar: StatusBayar;
          perlu_dikirim: boolean;
          tanggal: string;
        };
        Insert: {
          id_transaksi?: string;
          no_nota: string;
          pengguna_id?: string | null;
          pelanggan_id?: string | null;
          jenis_pembayaran: JenisPembayaran;
          total: number;
          jumlah_dibayar: number;
          sisa_tagihan?: number;
          status_bayar?: StatusBayar;
          perlu_dikirim?: boolean;
          tanggal?: string;
        };
        Update: {
          id_transaksi?: string;
          no_nota?: string;
          pengguna_id?: string | null;
          pelanggan_id?: string | null;
          jenis_pembayaran?: JenisPembayaran;
          total?: number;
          jumlah_dibayar?: number;
          sisa_tagihan?: number;
          status_bayar?: StatusBayar;
          perlu_dikirim?: boolean;
          tanggal?: string;
        };
      };
      detail_transaksi: {
        Row: {
          id_detail_transaksi: string;
          id?: string;
          transaksi_id: string;
          satuan_barang_id: string;
          jumlah: number;
          harga_awal: number;
          harga_nego: number | null;
          harga_satuan: number;
          subtotal: number;
        };
        Insert: {
          id_detail_transaksi?: string;
          transaksi_id: string;
          satuan_barang_id: string;
          jumlah: number;
          harga_awal: number;
          harga_nego?: number | null;
          harga_satuan: number;
          subtotal: number;
        };
        Update: {
          id_detail_transaksi?: string;
          transaksi_id?: string;
          satuan_barang_id?: string;
          jumlah?: number;
          harga_awal?: number;
          harga_nego?: number | null;
          harga_satuan?: number;
          subtotal?: number;
        };
      };
      pembayaran: {
        Row: {
          id_pembayaran: string;
          id?: string;
          transaksi_id: string;
          metode: JenisPembayaran;
          nominal: number;
          bukti_transfer_url: string | null;
          referensi_gateway: string | null;
          status: "berhasil" | "menunggu" | "gagal";
          tanggal: string;
        };
        Insert: {
          id_pembayaran?: string;
          transaksi_id: string;
          metode: JenisPembayaran;
          nominal: number;
          bukti_transfer_url?: string | null;
          referensi_gateway?: string | null;
          status?: "berhasil" | "menunggu" | "gagal";
          tanggal?: string;
        };
        Update: {
          id_pembayaran?: string;
          transaksi_id?: string;
          metode?: JenisPembayaran;
          nominal?: number;
          bukti_transfer_url?: string | null;
          referensi_gateway?: string | null;
          status?: "berhasil" | "menunggu" | "gagal";
          tanggal?: string;
        };
      };
      barang: {
        Row: {
          id_barang: string;
          id?: string;
          kode_barang: string;
          nama: string;
          kategori: string;
          barcode: string | null;
          barcode_fisik: boolean;
          satuan_dasar: string;
          stok: number;
          stok_minimum: number;
          satuan_pembelian: string;
          isi_per_satuan_beli: number;
          harga_beli: number;
          harga_modal: number;
          created_at: string;
        };
        Insert: {
          id_barang?: string;
          kode_barang: string;
          nama: string;
          kategori: string;
          barcode?: string | null;
          barcode_fisik?: boolean;
          satuan_dasar?: string;
          stok?: number;
          stok_minimum?: number;
          satuan_pembelian?: string;
          isi_per_satuan_beli?: number;
          harga_beli?: number;
          harga_modal?: number;
          created_at?: string;
        };
        Update: {
          id_barang?: string;
          kode_barang?: string;
          nama?: string;
          kategori?: string;
          barcode?: string | null;
          barcode_fisik?: boolean;
          satuan_dasar?: string;
          stok?: number;
          stok_minimum?: number;
          satuan_pembelian?: string;
          isi_per_satuan_beli?: number;
          harga_beli?: number;
          harga_modal?: number;
          created_at?: string;
        };
      };
      satuan_barang: {
        Row: {
          id_satuan_barang: string;
          id?: string;
          barang_id: string;
          nama_satuan: string;
          jumlah_konversi: number;
          harga_modal: number;
          margin_persen: number;
          harga_jual_awal: number;
        };
        Insert: {
          id_satuan_barang?: string;
          barang_id: string;
          nama_satuan: string;
          jumlah_konversi?: number;
          harga_modal?: number;
          margin_persen?: number;
          harga_jual_awal?: number;
        };
        Update: {
          id_satuan_barang?: string;
          barang_id?: string;
          nama_satuan?: string;
          jumlah_konversi?: number;
          harga_modal?: number;
          margin_persen?: number;
          harga_jual_awal?: number;
        };
      };
      rencana_restok: {
        Row: {
          id_restok: string;
          id?: string;
          barang_id: string;
          jumlah_restok: number;
          status: StatusRestok | string;
          tanggal: string;
        };
        Insert: {
          id_restok?: string;
          barang_id: string;
          jumlah_restok: number;
          status?: StatusRestok | string;
          tanggal?: string;
        };
        Update: {
          id_restok?: string;
          barang_id?: string;
          jumlah_restok?: number;
          status?: StatusRestok | string;
          tanggal?: string;
        };
      };
      pemasok: {
        Row: {
          id_pemasok: string;
          id?: string;
          nama: string;
          kontak: string | null;
          alamat: string | null;
          created_at: string;
        };
        Insert: {
          id_pemasok?: string;
          nama: string;
          kontak?: string | null;
          alamat?: string | null;
          created_at?: string;
        };
        Update: {
          id_pemasok?: string;
          nama?: string;
          kontak?: string | null;
          alamat?: string | null;
          created_at?: string;
        };
      };
      mutasi_barang: {
        Row: {
          id_mutasi: string;
          id?: string;
          pengguna_id: string | null;
          pemasok_id: string | null;
          jenis: "masuk" | "keluar";
          no_surat_jalan: string | null;
          jenis_bayar: "tunai" | "tempo" | null;
          tujuan: string | null;
          alasan: string | null;
          tanggal: string;
        };
        Insert: {
          id_mutasi?: string;
          pengguna_id?: string | null;
          pemasok_id?: string | null;
          jenis: "masuk" | "keluar";
          no_surat_jalan?: string | null;
          jenis_bayar?: "tunai" | "tempo" | null;
          tujuan?: string | null;
          alasan?: string | null;
          tanggal?: string;
        };
        Update: {
          id_mutasi?: string;
          pengguna_id?: string | null;
          pemasok_id?: string | null;
          jenis?: "masuk" | "keluar";
          no_surat_jalan?: string | null;
          jenis_bayar?: "tunai" | "tempo" | null;
          tujuan?: string | null;
          alasan?: string | null;
          tanggal?: string;
        };
      };
      detail_mutasi_barang: {
        Row: {
          id_detail_mutasi: string;
          id?: string;
          mutasi_id: string;
          barang_id: string;
          satuan_pembelian: string;
          jumlah: number;
          harga_beli: number;
          subtotal: number;
          stok_sebelum: number;
          stok_sesudah: number;
        };
        Insert: {
          id_detail_mutasi?: string;
          mutasi_id: string;
          barang_id: string;
          satuan_pembelian: string;
          jumlah: number;
          harga_beli?: number;
          subtotal?: number;
          stok_sebelum?: number;
          stok_sesudah?: number;
        };
        Update: {
          id_detail_mutasi?: string;
          mutasi_id?: string;
          barang_id?: string;
          satuan_pembelian?: string;
          jumlah?: number;
          harga_beli?: number;
          subtotal?: number;
          stok_sebelum?: number;
          stok_sesudah?: number;
        };
      };
      tagihan_pemasok: {
        Row: {
          id_tagihan: string;
          id?: string;
          pemasok_id: string;
          mutasi_id: string | null;
          jumlah_tagihan: number;
          sisa_tagihan: number;
          tanggal_jatuh_tempo: string;
          status: StatusTagihanPemasok | string;
          created_at: string;
        };
        Insert: {
          id_tagihan?: string;
          pemasok_id: string;
          mutasi_id?: string | null;
          jumlah_tagihan: number;
          sisa_tagihan: number;
          tanggal_jatuh_tempo: string;
          status?: StatusTagihanPemasok | string;
          created_at?: string;
        };
        Update: {
          id_tagihan?: string;
          pemasok_id?: string;
          mutasi_id?: string | null;
          jumlah_tagihan?: number;
          sisa_tagihan?: number;
          tanggal_jatuh_tempo?: string;
          status?: StatusTagihanPemasok | string;
          created_at?: string;
        };
      };
      pembayaran_pemasok: {
        Row: {
          id_pembayaran_pemasok: string;
          id?: string;
          tagihan_id: string;
          nominal: number;
          tanggal_bayar: string;
          keterangan: string | null;
        };
        Insert: {
          id_pembayaran_pemasok?: string;
          tagihan_id: string;
          nominal: number;
          tanggal_bayar?: string;
          keterangan?: string | null;
        };
        Update: {
          id_pembayaran_pemasok?: string;
          tagihan_id?: string;
          nominal?: number;
          tanggal_bayar?: string;
          keterangan?: string | null;
        };
      };
      pengiriman: {
        Row: {
          id_pengiriman: string;
          id?: string;
          transaksi_id: string | null;
          pengirim_id: string | null;
          alamat_tujuan: string;
          status: StatusPengiriman;
          foto_bukti_url: string | null;
          alasan_penukaran: string | null;
          tanggal_penugasan: string;
          tanggal_terima: string | null;
        };
        Insert: {
          id_pengiriman?: string;
          transaksi_id?: string | null;
          pengirim_id?: string | null;
          alamat_tujuan: string;
          status?: StatusPengiriman;
          foto_bukti_url?: string | null;
          alasan_penukaran?: string | null;
          tanggal_penugasan?: string;
          tanggal_terima?: string | null;
        };
        Update: {
          id_pengiriman?: string;
          transaksi_id?: string | null;
          pengirim_id?: string | null;
          alamat_tujuan?: string;
          status?: StatusPengiriman;
          foto_bukti_url?: string | null;
          alasan_penukaran?: string | null;
          tanggal_penugasan?: string;
          tanggal_terima?: string | null;
        };
      };
      laporan_kendala: {
        Row: {
          id_laporan: string;
          id?: string;
          pengiriman_id: string;
          jenis_kendala: JenisKendalaPengiriman | string;
          deskripsi: string;
          created_at: string;
        };
        Insert: {
          id_laporan?: string;
          pengiriman_id: string;
          jenis_kendala: JenisKendalaPengiriman | string;
          deskripsi: string;
          created_at?: string;
        };
        Update: {
          id_laporan?: string;
          pengiriman_id?: string;
          jenis_kendala?: JenisKendalaPengiriman | string;
          deskripsi?: string;
          created_at?: string;
        };
      };
      penukaran: {
        Row: {
          id_penukaran: string;
          id?: string;
          transaksi_id: string;
          status: StatusPenukaran | string;
          alasan_penukaran: string | null;
          alasan_penolakan: string | null;
          selisih_harga: number;
          tanggal_pengajuan: string;
          tanggal_selesai: string | null;
        };
        Insert: {
          id_penukaran?: string;
          transaksi_id: string;
          status?: StatusPenukaran | string;
          alasan_penukaran?: string | null;
          alasan_penolakan?: string | null;
          selisih_harga?: number;
          tanggal_pengajuan?: string;
          tanggal_selesai?: string | null;
        };
        Update: {
          id_penukaran?: string;
          transaksi_id?: string;
          status?: StatusPenukaran | string;
          alasan_penukaran?: string | null;
          alasan_penolakan?: string | null;
          selisih_harga?: number;
          tanggal_pengajuan?: string;
          tanggal_selesai?: string | null;
        };
      };
      detail_penukaran: {
        Row: {
          id_detail_penukaran: string;
          id?: string;
          penukaran_id: string;
          satuan_asal_id: string;
          satuan_pengganti_id: string;
          jumlah_kembali: number;
          kondisi_barang: KondisiBarangKembali | string;
          jumlah_pengganti: number;
          harga_pengganti: number;
        };
        Insert: {
          id_detail_penukaran?: string;
          penukaran_id: string;
          satuan_asal_id: string;
          satuan_pengganti_id: string;
          jumlah_kembali: number;
          kondisi_barang?: KondisiBarangKembali | string;
          jumlah_pengganti: number;
          harga_pengganti: number;
        };
        Update: {
          id_detail_penukaran?: string;
          penukaran_id?: string;
          satuan_asal_id?: string;
          satuan_pengganti_id?: string;
          jumlah_kembali?: number;
          kondisi_barang?: KondisiBarangKembali | string;
          jumlah_pengganti?: number;
          harga_pengganti?: number;
        };
      };
    };
    Functions: Record<string, never>;
  };
};
