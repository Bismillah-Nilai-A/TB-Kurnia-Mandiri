// Database types untuk Supabase (PostgreSQL) - CV Kurnia Mandiri (Updated v1.4 - Class Diagram Sync)

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export type Role = "admin" | "kasir" | "pengelola" | "pengirim" | "pelanggan";
export type StatusAkun = "aktif" | "nonaktif";
export type JenisPelanggan = "proyek" | "perorangan";
export type StatusKasbon = "aktif" | "menunggu" | "disetujui" | "ditolak" | "lunas" | "dibatalkan";
export type StatusBarang = "aktif" | "rusak" | "habis" | "diusulkan";
export type JenisPembayaran = "tunai" | "kasbon" | "qris" | "va" | "transfer";
export type StatusBayar = "lunas" | "menunggu" | "sebagian" | "dibatalkan";
export type StatusPengiriman = "belum_dikirim" | "sedang_dikirim" | "dikirim" | "diterima" | "gagal" | "ditugaskan" | "terkirim" | "retur";
export type StatusRestok = "direncanakan" | "dipesan" | "selesai" | "batal";
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
          id: string;
          nama: string;
          username: string;
          password: string;
          role: Role;
          status: StatusAkun;
          created_at: string;
        };
        Insert: {
          id?: string;
          nama: string;
          username: string;
          password: string;
          role: Role;
          status?: StatusAkun;
          created_at?: string;
        };
        Update: {
          id?: string;
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
          id: string;
          pengguna_id: string | null;
          modul: string;
          aktivitas: string;
          data_sebelum: Json | null;
          data_sesudah: Json | null;
          waktu: string;
        };
        Insert: {
          id?: string;
          pengguna_id?: string | null;
          modul: string;
          aktivitas: string;
          data_sebelum?: Json | null;
          data_sesudah?: Json | null;
          waktu?: string;
        };
        Update: {
          id?: string;
          pengguna_id?: string | null;
          modul?: string;
          aktivitas?: string;
          data_sebelum?: Json | null;
          data_sesudah?: Json | null;
          waktu?: string;
        };
      };
      pelanggan: {
        Row: {
          id: string;
          nama: string;
          jenis: JenisPelanggan;
          kontak: string | null;
          alamat: string | null;
          batas_kasbon: number;
          status_kasbon: StatusKasbon;
          created_at: string;
        };
        Insert: {
          id?: string;
          nama: string;
          jenis?: JenisPelanggan;
          kontak?: string | null;
          alamat?: string | null;
          batas_kasbon?: number;
          status_kasbon?: StatusKasbon;
          created_at?: string;
        };
        Update: {
          id?: string;
          nama?: string;
          jenis?: JenisPelanggan;
          kontak?: string | null;
          alamat?: string | null;
          batas_kasbon?: number;
          status_kasbon?: StatusKasbon;
          created_at?: string;
        };
      };
      barang: {
        Row: {
          id: string;
          kode_barang: string;
          nama: string;
          kategori: string;
          merk: string | null;
          barcode: string | null;
          harga_beli: number;
          harga: number;
          stok_awal: number;
          stok: number;
          stok_min: number;
          stok_minimum: number;
          satuan: string;
          keterangan: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          kode_barang: string;
          nama: string;
          kategori: string;
          merk?: string | null;
          barcode?: string | null;
          harga_beli?: number;
          harga?: number;
          stok_awal?: number;
          stok?: number;
          stok_min?: number;
          stok_minimum?: number;
          satuan?: string;
          keterangan?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          kode_barang?: string;
          nama?: string;
          kategori?: string;
          merk?: string | null;
          barcode?: string | null;
          harga_beli?: number;
          harga?: number;
          stok_awal?: number;
          stok?: number;
          stok_min?: number;
          stok_minimum?: number;
          satuan?: string;
          keterangan?: string | null;
          created_at?: string;
        };
      };
      stok: {
        Row: {
          id: string;
          barang_id: string;
          stok_awal: number;
          stok_akhir: number;
          tipe: "masuk" | "keluar" | "penyesuaian";
          tanggal: string;
        };
        Insert: {
          id?: string;
          barang_id: string;
          stok_awal: number;
          stok_akhir: number;
          tipe: "masuk" | "keluar" | "penyesuaian";
          tanggal?: string;
        };
        Update: {
          id?: string;
          barang_id?: string;
          stok_awal?: number;
          stok_akhir?: number;
          tipe?: "masuk" | "keluar" | "penyesuaian";
          tanggal?: string;
        };
      };
      mutasi_barang: {
        Row: {
          id: string;
          pengguna_id: string | null;
          jenis: "masuk" | "keluar" | "retur";
          supplier: string | null;
          no_referensi: string | null;
          tujuan: string | null;
          alasan: string | null;
          tanggal: string;
        };
        Insert: {
          id?: string;
          pengguna_id?: string | null;
          jenis: "masuk" | "keluar" | "retur";
          supplier?: string | null;
          no_referensi?: string | null;
          tujuan?: string | null;
          alasan?: string | null;
          tanggal?: string;
        };
        Update: {
          id?: string;
          pengguna_id?: string | null;
          jenis?: "masuk" | "keluar" | "retur";
          supplier?: string | null;
          no_referensi?: string | null;
          tujuan?: string | null;
          alasan?: string | null;
          tanggal?: string;
        };
      };
      detail_mutasi_barang: {
        Row: {
          id: string;
          mutasi_id: string;
          barang_id: string;
          jumlah: number;
          stok_sebelum: number;
          stok_sesudah: number;
          harga_satuan: number;
          total_harga: number;
          keterangan: string | null;
        };
        Insert: {
          id?: string;
          mutasi_id: string;
          barang_id: string;
          jumlah: number;
          stok_sebelum?: number;
          stok_sesudah?: number;
          harga_satuan?: number;
          total_harga?: number;
          keterangan?: string | null;
        };
        Update: {
          id?: string;
          mutasi_id?: string;
          barang_id?: string;
          jumlah?: number;
          stok_sebelum?: number;
          stok_sesudah?: number;
          harga_satuan?: number;
          total_harga?: number;
          keterangan?: string | null;
        };
      };
      transaksi: {
        Row: {
          id: string;
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
          id?: string;
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
          id?: string;
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
          id: string;
          transaksi_id: string;
          barang_id: string;
          jumlah: number;
          harga_modal: number;
          harga_asli: number;
          harga_nego: number | null;
          harga_satuan: number;
          subtotal: number;
        };
        Insert: {
          id?: string;
          transaksi_id: string;
          barang_id: string;
          jumlah: number;
          harga_modal?: number;
          harga_asli?: number;
          harga_nego?: number | null;
          harga_satuan: number;
          subtotal?: number;
        };
        Update: {
          id?: string;
          transaksi_id?: string;
          barang_id?: string;
          jumlah?: number;
          harga_modal?: number;
          harga_asli?: number;
          harga_nego?: number | null;
          harga_satuan?: number;
          subtotal?: number;
        };
      };
      pembayaran: {
        Row: {
          id: string;
          transaksi_id: string;
          metode: JenisPembayaran;
          nominal: number;
          bukti_transfer_url: string | null;
          referensi_gateway: string | null;
          status: "berhasil" | "menunggu" | "gagal";
          tanggal: string;
        };
        Insert: {
          id?: string;
          transaksi_id: string;
          metode: JenisPembayaran;
          nominal: number;
          bukti_transfer_url?: string | null;
          referensi_gateway?: string | null;
          status?: "berhasil" | "menunggu" | "gagal";
          tanggal?: string;
        };
        Update: {
          id?: string;
          transaksi_id?: string;
          metode?: JenisPembayaran;
          nominal?: number;
          bukti_transfer_url?: string | null;
          referensi_gateway?: string | null;
          status?: "berhasil" | "menunggu" | "gagal";
          tanggal?: string;
        };
      };
      kasbon: {
        Row: {
          id: string;
          pelanggan_id: string;
          transaksi_id: string | null;
          jumlah_kasbon: number;
          status: StatusKasbon;
          alasan_penolakan: string | null;
          tanggal_pengajuan: string;
          tanggal_keputusan: string | null;
        };
        Insert: {
          id?: string;
          pelanggan_id: string;
          transaksi_id?: string | null;
          jumlah_kasbon: number;
          status?: StatusKasbon;
          alasan_penolakan?: string | null;
          tanggal_pengajuan?: string;
          tanggal_keputusan?: string | null;
        };
        Update: {
          id?: string;
          pelanggan_id?: string;
          transaksi_id?: string | null;
          jumlah_kasbon?: number;
          status?: StatusKasbon;
          alasan_penolakan?: string | null;
          tanggal_pengajuan?: string;
          tanggal_keputusan?: string | null;
        };
      };
      rencana_restok: {
        Row: {
          id: string;
          barang_id: string;
          jumlah_restok: number;
          restok: number;
          status: StatusRestok | string;
          target: string | null;
          tanggal: string;
        };
        Insert: {
          id?: string;
          barang_id: string;
          jumlah_restok?: number;
          restok?: number;
          status?: StatusRestok | string;
          target?: string | null;
          tanggal?: string;
        };
        Update: {
          id?: string;
          barang_id?: string;
          jumlah_restok?: number;
          restok?: number;
          status?: StatusRestok | string;
          target?: string | null;
          tanggal?: string;
        };
      };
      pengiriman: {
        Row: {
          id: string;
          transaksi_id: string | null;
          pengirim_id: string | null;
          detail_penerima: string | null;
          nama_penerima_aktual: string | null;
          alamat_tujuan: string;
          status: StatusPengiriman;
          foto_bukti_url: string | null;
          foto_bukti_nama: string | null;
          foto_bukti_mime: string | null;
          alasan_retur: string | null;
          tanggal_penugasan: string;
          tanggal_terima: string | null;
        };
        Insert: {
          id?: string;
          transaksi_id?: string | null;
          pengirim_id?: string | null;
          detail_penerima?: string | null;
          nama_penerima_aktual?: string | null;
          alamat_tujuan: string;
          status?: StatusPengiriman;
          foto_bukti_url?: string | null;
          foto_bukti_nama?: string | null;
          foto_bukti_mime?: string | null;
          alasan_retur?: string | null;
          tanggal_penugasan?: string;
          tanggal_terima?: string | null;
        };
        Update: {
          id?: string;
          transaksi_id?: string | null;
          pengirim_id?: string | null;
          detail_penerima?: string | null;
          nama_penerima_aktual?: string | null;
          alamat_tujuan?: string;
          status?: StatusPengiriman;
          foto_bukti_url?: string | null;
          foto_bukti_nama?: string | null;
          foto_bukti_mime?: string | null;
          alasan_retur?: string | null;
          tanggal_penugasan?: string;
          tanggal_terima?: string | null;
        };
      };
      laporan_kendala: {
        Row: {
          id: string;
          pengiriman_id: string;
          jenis_kendala: JenisKendalaPengiriman | string;
          deskripsi: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          pengiriman_id: string;
          jenis_kendala: JenisKendalaPengiriman | string;
          deskripsi: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          pengiriman_id?: string;
          jenis_kendala?: JenisKendalaPengiriman | string;
          deskripsi?: string;
          created_at?: string;
        };
      };
      notifikasi: {
        Row: {
          id: string;
          jenis: string;
          penerima: string;
          saluran: NotificationChannel;
          pesan: string;
          status_kirim: "pending" | "terkirim" | "gagal" | "antri";
          waktu: string;
        };
        Insert: {
          id?: string;
          jenis: string;
          penerima: string;
          saluran?: NotificationChannel;
          pesan: string;
          status_kirim?: "pending" | "terkirim" | "gagal" | "antri";
          waktu?: string;
        };
        Update: {
          id?: string;
          jenis?: string;
          penerima?: string;
          saluran?: NotificationChannel;
          pesan?: string;
          status_kirim?: "pending" | "terkirim" | "gagal" | "antri";
          waktu?: string;
        };
      };
      pengaturan_sistem: {
        Row: {
          id: number;
          saluran_notifikasi: NotificationChannel | string;
          penerima_notifikasi: string;
          penyedia_gateway: string;
          kunci_api: string | null;
          updated_at: string;
          notifikasi: boolean;
          notifikasi_detail: string | null;
          gateway: string;
          gateway_detail: string | null;
        };
        Insert: {
          id?: number;
          saluran_notifikasi?: NotificationChannel | string;
          penerima_notifikasi?: string;
          penyedia_gateway?: string;
          kunci_api?: string | null;
          updated_at?: string;
          notifikasi?: boolean;
          notifikasi_detail?: string | null;
          gateway?: string;
          gateway_detail?: string | null;
        };
        Update: {
          id?: number;
          saluran_notifikasi?: NotificationChannel | string;
          penerima_notifikasi?: string;
          penyedia_gateway?: string;
          kunci_api?: string | null;
          updated_at?: string;
          notifikasi?: boolean;
          notifikasi_detail?: string | null;
          gateway?: string;
          gateway_detail?: string | null;
        };
      };
    };
    Functions: Record<string, never>;
  };
};
