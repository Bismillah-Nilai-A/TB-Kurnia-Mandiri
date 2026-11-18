import { supabase, getCurrentUser, logAktivitas } from "@/lib/supabase";
import type { Database, JenisPembayaran, StatusBayar } from "@/lib/types";

export type BarangRow = Database["public"]["Tables"]["barang"]["Row"];
export type PelangganRow = Database["public"]["Tables"]["pelanggan"]["Row"];
export type TransaksiRow = Database["public"]["Tables"]["transaksi"]["Row"] & {
  pelanggan?: { nama: string; alamat?: string | null } | null;
  detail_transaksi?: Array<{
    id: string;
    jumlah: number;
    harga_modal?: number;
    harga_asli?: number;
    harga_nego?: number | null;
    harga_satuan: number;
    subtotal: number;
    barang?: { kode_barang: string; nama: string; satuan: string } | null;
  }>;
};

export interface CartItem {
  barang: BarangRow;
  jumlah: number;
  hargaNego: string; // Kosong jika pakai harga normal, terisi jika pembeli menawar harga
}

export interface SnapModalState {
  orderId: string;
  total: number;
  token: string;
  redirectUrl: string;
  metode: "qris" | "va";
}

export const STATUS_MAP: Record<StatusBayar, { label: string; style: string }> = {
  lunas: { label: "Lunas", style: "bg-emerald-50 text-emerald-700" },
  menunggu: { label: "Menunggu", style: "bg-amber-50 text-amber-700" },
  sebagian: { label: "Sebagian", style: "bg-blue-50 text-blue-700" },
  dibatalkan: { label: "Dibatalkan", style: "bg-red-50 text-red-700" },
};

export const FALLBACK_PRODUCTS: BarangRow[] = [];
export const FALLBACK_CUSTOMERS: PelangganRow[] = [];
export const FALLBACK_TRANSACTIONS: TransaksiRow[] = [];

export const getHargaModal = (b: BarangRow) =>
  Number(b.harga_beli) || Math.round(Number(b.harga) / 1.3);

export const getEffectivePrice = (c: CartItem) => {
  if (c.hargaNego.trim() !== "" && !isNaN(Number(c.hargaNego))) {
    return Number(c.hargaNego);
  }
  return Number(c.barang.harga);
};

export const isNegoInvalid = (c: CartItem) => {
  if (c.hargaNego.trim() === "") return false;
  const negoNum = Number(c.hargaNego);
  const modalNum = getHargaModal(c.barang);
  return isNaN(negoNum) || negoNum < modalNum;
};

export async function muatDataPos(): Promise<{
  transactions: TransaksiRow[];
  barangList: BarangRow[];
  pelangganList: PelangganRow[];
}> {
  const [trxRes, brgRes, plgRes] = await Promise.all([
    supabase
      .from("transaksi")
      .select(
        `
        *,
        pelanggan:pelanggan_id(nama, alamat),
        detail_transaksi(
          id, jumlah, harga_modal, harga_asli, harga_nego, harga_satuan, subtotal,
          barang:barang_id(kode_barang, nama, satuan)
        )
      `
      )
      .order("tanggal", { ascending: false })
      .limit(100),
    supabase
      .from("barang")
      .select("*")
      .order("kode_barang", { ascending: true }),
    supabase
      .from("pelanggan")
      .select("*")
      .order("nama", { ascending: true }),
  ]);

  if (trxRes.error) throw trxRes.error;
  if (brgRes.error) throw brgRes.error;
  if (plgRes.error) throw plgRes.error;

  return {
    transactions:
      (trxRes.data as unknown as TransaksiRow[]) || FALLBACK_TRANSACTIONS,
    barangList: (brgRes.data as BarangRow[]) || FALLBACK_PRODUCTS,
    pelangganList: (plgRes.data as PelangganRow[]) || FALLBACK_CUSTOMERS,
  };
}

export async function buatTransaksiMidtrans({
  noNota,
  cartTotal,
  selectedCustomer,
  cart,
}: {
  noNota: string;
  cartTotal: number;
  selectedCustomer?: PelangganRow;
  cart: CartItem[];
}): Promise<{ token: string; redirect_url: string }> {
  const res = await fetch("/api/payment/create-transaction", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      transaction_details: {
        order_id: noNota,
        gross_amount: Math.round(cartTotal),
      },
      customer_details: {
        first_name: selectedCustomer?.nama || "Pelanggan Umum",
        phone: selectedCustomer?.kontak || "08123456789",
      },
      item_details: cart.map((c) => ({
        id: c.barang.kode_barang,
        price: Math.round(getEffectivePrice(c)),
        quantity: c.jumlah,
        name: c.barang.nama.slice(0, 45),
      })),
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      data.error || "Gagal menghubungkan ke Midtrans Payment Gateway"
    );
  }

  return {
    token: data.token,
    redirect_url: data.redirect_url,
  };
}

export async function simpanTransaksiKeDatabase({
  noNota,
  statusBayar,
  jumlahDibayar,
  sisaTagihan,
  refGateway,
  selectedPelangganId,
  selectedCustomer,
  jenisPembayaran,
  cartTotal,
  perluDikirim,
  alamatKirim,
  cart,
}: {
  noNota: string;
  statusBayar: StatusBayar;
  jumlahDibayar: number;
  sisaTagihan: number;
  refGateway?: string;
  selectedPelangganId: string;
  selectedCustomer?: PelangganRow;
  jenisPembayaran: JenisPembayaran;
  cartTotal: number;
  perluDikirim: boolean;
  alamatKirim: string;
  cart: CartItem[];
}): Promise<TransaksiRow> {
  const user = await getCurrentUser();

  // 1. Insert header transaksi
  const { data: trxHeader, error: trxErr } = await supabase
    .from("transaksi")
    .insert({
      no_nota: noNota,
      pengguna_id: user?.id || null,
      pelanggan_id: selectedPelangganId || null,
      jenis_pembayaran: jenisPembayaran,
      total: cartTotal,
      jumlah_dibayar: jumlahDibayar,
      sisa_tagihan: sisaTagihan,
      status_bayar: statusBayar,
      perlu_dikirim: perluDikirim,
      tanggal: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (trxErr || !trxHeader)
    throw trxErr || new Error("Gagal menyimpan transaksi");

  // 2. Insert detail_transaksi (termasuk harga_modal, harga_asli, dan harga_nego)
  const detailPayloads = cart.map((c) => {
    const hargaModal = getHargaModal(c.barang);
    const hargaAsli = Number(c.barang.harga);
    const adaNego = c.hargaNego.trim() !== "";
    const hargaFinal = getEffectivePrice(c);
    return {
      transaksi_id: trxHeader.id,
      barang_id: c.barang.id,
      jumlah: c.jumlah,
      harga_modal: hargaModal,
      harga_asli: hargaAsli,
      harga_nego: adaNego ? hargaFinal : null,
      harga_satuan: hargaFinal,
      subtotal: hargaFinal * c.jumlah,
    };
  });

  const { error: detErr } = await supabase
    .from("detail_transaksi")
    .insert(detailPayloads);
  if (detErr) throw detErr;

  // 3. Jika pembayaran lunas (Tunai / QRIS / VA), kurangi stok & catat mutasi keluar + pembayaran
  if (statusBayar === "lunas") {
    await supabase.from("pembayaran").insert({
      transaksi_id: trxHeader.id,
      metode: jenisPembayaran,
      nominal: cartTotal,
      referensi_gateway: refGateway || null,
      status: "berhasil",
      tanggal: new Date().toISOString(),
    });

    const { data: mutHeader } = await supabase
      .from("mutasi_barang")
      .insert({
        pengguna_id: user?.id || null,
        jenis: "keluar",
        no_referensi: noNota,
        tujuan: selectedCustomer?.nama || "Pelanggan Umum",
        alasan: `Penjualan POS Nota ${noNota}`,
        tanggal: new Date().toISOString(),
      })
      .select("*")
      .single();

    for (const c of cart) {
      const stokSebelum = c.barang.stok;
      const stokSesudah = Math.max(0, stokSebelum - c.jumlah);

      await supabase
        .from("barang")
        .update({ stok: stokSesudah })
        .eq("id", c.barang.id);

      await supabase.from("stok").insert({
        barang_id: c.barang.id,
        stok_awal: stokSebelum,
        stok_akhir: stokSesudah,
        tipe: "keluar",
        tanggal: new Date().toISOString(),
      });

      if (mutHeader) {
        const hargaFinal = getEffectivePrice(c);
        await supabase.from("detail_mutasi_barang").insert({
          mutasi_id: mutHeader.id,
          barang_id: c.barang.id,
          jumlah: c.jumlah,
          stok_sebelum: stokSebelum,
          stok_sesudah: stokSesudah,
          harga_satuan: hargaFinal,
          total_harga: hargaFinal * c.jumlah,
          keterangan:
            c.hargaNego.trim() !== ""
              ? `Penjualan POS (${noNota}) [Harga Nego]`
              : `Penjualan POS (${noNota})`,
        });
      }
    }
  }

  // 4. Jika Kasbon, catat pengajuan kasbon (KSB-01..02)
  if (jenisPembayaran === "kasbon") {
    await supabase.from("kasbon").insert({
      pelanggan_id: selectedPelangganId,
      transaksi_id: trxHeader.id,
      jumlah_kasbon: cartTotal,
      status: "menunggu",
      tanggal_pengajuan: new Date().toISOString(),
    });
  }

  // 5. Jika perlu dikirim, buat penugasan pengiriman otomatis sesuai Class Diagram (Pengiriman: transaksi_id & pengirim_id)
  if (perluDikirim) {
    const { data: driverUser } = await supabase
      .from("pengguna")
      .select("id")
      .eq("role", "pengirim")
      .eq("status", "aktif")
      .limit(1)
      .maybeSingle();

    await supabase.from("pengiriman").insert({
      transaksi_id: trxHeader.id,
      pengirim_id: driverUser?.id || null,
      detail_penerima: `${selectedCustomer?.nama || "Pelanggan"} (Nota ${noNota})`,
      alamat_tujuan:
        alamatKirim.trim() ||
        selectedCustomer?.alamat ||
        "Alamat Pelanggan CV Kurnia Mandiri",
      status: "belum_dikirim",
      tanggal_penugasan: new Date().toISOString(),
    });
  }

  // 6. Catat Outbox Notifikasi Email & Log Aktivitas
  await supabase.from("notifikasi").insert({
    jenis: statusBayar === "lunas" ? "pembayaran_lunas" : "transaksi_selesai",
    penerima: "muhamadirfan.mi966@gmail.com",
    saluran: "email",
    pesan: `Transaksi POS Nota ${noNota} (${selectedCustomer?.nama || "Pelanggan Umum"}) sebesar Rp ${cartTotal.toLocaleString("id-ID")} via ${jenisPembayaran.toUpperCase()} berstatus ${statusBayar.toUpperCase()}.`,
    status_kirim: "pending",
    waktu: new Date().toISOString(),
  });
  fetch("/api/cron/notifikasi", { method: "POST" }).catch(() => {});

  await logAktivitas({
    modul: "Transaksi POS",
    aktivitas: `Transaksi baru ${noNota} (${jenisPembayaran.toUpperCase()}) sebesar Rp ${cartTotal.toLocaleString("id-ID")}`,
    dataSesudah: {
      no_nota: noNota,
      total: cartTotal,
      jenis_pembayaran: jenisPembayaran,
      item_count: cart.length,
    },
  });

  // Siapkan objek struk untuk dicetak
  const fullStruk: TransaksiRow = {
    ...trxHeader,
    pelanggan: {
      nama: selectedCustomer?.nama || "Pelanggan Umum",
      alamat: alamatKirim || selectedCustomer?.alamat || null,
    },
    detail_transaksi: cart.map((c, idx) => {
      const hargaFinal = getEffectivePrice(c);
      const hargaAsli = Number(c.barang.harga);
      const adaNego = c.hargaNego.trim() !== "";
      return {
        id: String(idx),
        jumlah: c.jumlah,
        harga_modal: getHargaModal(c.barang),
        harga_asli: hargaAsli,
        harga_nego: adaNego ? hargaFinal : null,
        harga_satuan: hargaFinal,
        subtotal: hargaFinal * c.jumlah,
        barang: {
          kode_barang: c.barang.kode_barang,
          nama: c.barang.nama,
          satuan: c.barang.satuan,
        },
      };
    }),
  };

  return fullStruk;
}
