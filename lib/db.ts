export type Role = "admin" | "kasir" | "pengelola" | "pengirim" | "pelanggan";
export type StatusBarang = "aktif" | "rusak" | "habis" | "diusulkan";
export type JenisPembayaran = "tunai" | "kasbon" | "qris" | "va" | "transfer";
export type StatusTransaksi = "baru" | "menunggu" | "bayar" | "dibatalkan";
export type StatusKasbon = "aktif" | "menunggu" | "disetujui" | "ditolak" | "lunas" | "dibatalkan";
export type StatusPengiriman = "belum_dikirim" | "sedang_dikirim" | "dikirim" | "diterima" | "gagal";

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
  pengelola: [
    "/dashboard",
    "/barang",
    "/transaksi",
    "/piutang",
    "/pengiriman",
    "/laporan",
  ],
  kasir: ["/dashboard", "/barang", "/transaksi", "/piutang", "/pengiriman"],
  pengirim: ["/dashboard", "/pengiriman", "/transaksi"],
  pelanggan: [],
};
