export type Role = "admin" | "kasir" | "pengirim";
export type JenisPembayaran = "tunai" | "kasbon" | "qris" | "va" | "transfer";
export type StatusTransaksi = "baru" | "menunggu" | "bayar" | "dibatalkan";
export type StatusKasbon = "aktif" | "menunggu" | "disetujui" | "ditolak" | "lunas" | "dibatalkan";
export type StatusPengiriman =
  | "belum_dikirim"
  | "sedang_dikirim"
  | "pengajuan_penukaran"
  | "diterima"
  | "terkirim"
  | "gagal";

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  admin: [
    "/dashboard",
    "/barang",
    "/transaksi",
    "/piutang",
    "/pengiriman",
    "/laporan",
    "/pengaturan",
  ],
  kasir: ["/dashboard", "/barang", "/transaksi", "/piutang", "/pengiriman"],
  pengirim: ["/dashboard", "/pengiriman", "/transaksi"],
};
