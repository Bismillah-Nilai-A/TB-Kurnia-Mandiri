import { supabase, getCurrentUser, logAktivitas } from "@/lib/supabase";
import type { Database, JenisPembayaran, StatusBayar } from "@/lib/types";
import {
  type BarangRow as MappedBarangRow,
  mapBarangWithSatuan,
} from "@/components/barang/layanan-barang";

export type BarangRow = MappedBarangRow;
export type PelangganRow = Database["public"]["Tables"]["pelanggan"]["Row"] & {
  id: string;
};
export type TransaksiRow = Database["public"]["Tables"]["transaksi"]["Row"] & {
  id: string;
  pelanggan?: { nama: string; alamat?: string | null } | null;
  detail_transaksi?: Array<{
    id: string;
    id_detail_transaksi?: string;
    satuan_barang_id?: string;
    jumlah: number;
    harga_awal?: number;
    harga_modal?: number;
    harga_asli?: number;
    harga_nego?: number | null;
    harga_satuan: number;
    subtotal: number;
    satuan_barang?: {
      id_satuan_barang?: string;
      id: string;
      nama_satuan: string;
      harga_modal: number;
      harga_jual_awal: number;
      barang?: {
        kode_barang: string;
        nama: string;
        satuan_dasar: string;
      } | null;
    } | null;
    barang?: { kode_barang: string; nama: string; satuan: string } | null;
  }>;
};

export interface CartItem {
  barang: BarangRow;
  jumlah: number;
  hargaNego: string; // Kosong jika pakai harga jual awal, terisi jika pembeli menawar harga
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
  Number(b.harga_modal) ||
  Number(b.harga_beli) ||
  Math.round(Number(b.harga) / 1.3);

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
          id_detail_transaksi, satuan_barang_id, jumlah, harga_awal, harga_nego, harga_satuan, subtotal,
          satuan_barang:satuan_barang_id(
            id_satuan_barang, nama_satuan, harga_modal, harga_jual_awal,
            barang:barang_id(kode_barang, nama, satuan_dasar)
          )
        )
      `
      )
      .order("tanggal", { ascending: false })
      .limit(100),
    supabase
      .from("barang")
      .select("*, satuan_barang(*)")
      .order("kode_barang", { ascending: true }),
    supabase
      .from("pelanggan")
      .select("*")
      .order("nama", { ascending: true }),
  ]);

  if (trxRes.error) throw trxRes.error;
  if (brgRes.error) throw brgRes.error;
  if (plgRes.error) throw plgRes.error;

  const barangList = (
    (brgRes.data || []) as Array<Record<string, unknown>>
  ).map(mapBarangWithSatuan);

  const transactions: TransaksiRow[] = (
    (trxRes.data || []) as Array<Record<string, unknown>>
  ).map((t) => {
    const rawDet = Array.isArray(t.detail_transaksi)
      ? (t.detail_transaksi as Array<Record<string, unknown>>)
      : [];
    const idTrx = String(t.id_transaksi || t.id);
    return {
      ...(t as unknown as TransaksiRow),
      id_transaksi: idTrx,
      id: idTrx,
      detail_transaksi: rawDet.map((d) => {
        const sb = (d.satuan_barang as Record<string, unknown>) || null;
        const brg = (sb?.barang as Record<string, unknown>) || null;
        const hargaAwal = Number(d.harga_awal ?? d.harga_satuan ?? 0);
        const idDet = String(d.id_detail_transaksi || d.id);
        return {
          id: idDet,
          id_detail_transaksi: idDet,
          satuan_barang_id: d.satuan_barang_id
            ? String(d.satuan_barang_id)
            : undefined,
          jumlah: Number(d.jumlah ?? 0),
          harga_awal: hargaAwal,
          harga_asli: hargaAwal,
          harga_modal: Number(sb?.harga_modal ?? 0),
          harga_nego: d.harga_nego !== null ? Number(d.harga_nego) : null,
          harga_satuan: Number(d.harga_satuan ?? 0),
          subtotal: Number(d.subtotal ?? 0),
          barang: brg
            ? {
                kode_barang: String(brg.kode_barang),
                nama: String(brg.nama),
                satuan: String(sb?.nama_satuan || brg.satuan_dasar || "Pcs"),
              }
            : null,
        };
      }),
    };
  });

  const pelangganList: PelangganRow[] = (
    (plgRes.data || []) as Array<Record<string, unknown>>
  ).map((p) => ({
    ...(p as unknown as PelangganRow),
    id_pelanggan: String(p.id_pelanggan || p.id),
    id: String(p.id_pelanggan || p.id),
  }));

  return {
    transactions,
    barangList,
    pelangganList: pelangganList.length > 0 ? pelangganList : FALLBACK_CUSTOMERS,
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
      no_nota: noNota.slice(0, 20),
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
  const trxHeaderId = String(trxHeader.id_transaksi || trxHeader.id);

  // 2. Pastikan setiap item di keranjang memiliki satuan_barang_id sesuai Class Diagram (DetailTransaksi -> SatuanBarang)
  const detailPayloads = [];
  for (const c of cart) {
    let satuanBarangId =
      c.barang.satuan_utama_id ||
      c.barang.satuan_barang?.[0]?.id_satuan_barang ||
      c.barang.satuan_barang?.[0]?.id;

    if (!satuanBarangId) {
      const { data: newSb } = await supabase
        .from("satuan_barang")
        .insert({
          barang_id: c.barang.id_barang || c.barang.id,
          nama_satuan: c.barang.satuan_dasar || "Pcs",
          jumlah_konversi: 1,
          harga_modal: getHargaModal(c.barang),
          margin_persen: 30,
          harga_jual_awal: Number(c.barang.harga),
        })
        .select("id_satuan_barang")
        .single();
      satuanBarangId = newSb?.id_satuan_barang;
    }

    const hargaAwal = Number(c.barang.harga);
    const adaNego = c.hargaNego.trim() !== "";
    const hargaFinal = getEffectivePrice(c);

    detailPayloads.push({
      transaksi_id: trxHeaderId,
      satuan_barang_id: satuanBarangId!,
      jumlah: c.jumlah,
      harga_awal: hargaAwal,
      harga_nego: adaNego ? hargaFinal : null,
      harga_satuan: hargaFinal,
      subtotal: hargaFinal * c.jumlah,
    });
  }

  const { error: detErr } = await supabase
    .from("detail_transaksi")
    .insert(detailPayloads);
  if (detErr) throw detErr;

  // 3. Jika pembayaran lunas (Tunai / QRIS / VA), kurangi stok & catat mutasi keluar + pembayaran
  if (statusBayar === "lunas") {
    await supabase.from("pembayaran").insert({
      transaksi_id: trxHeaderId,
      metode: jenisPembayaran,
      nominal: cartTotal,
      referensi_gateway: refGateway ? refGateway.slice(0, 50) : null,
      status: "berhasil",
      tanggal: new Date().toISOString(),
    });

    const { data: mutHeader } = await supabase
      .from("mutasi_barang")
      .insert({
        pengguna_id: user?.id || null,
        jenis: "keluar",
        no_surat_jalan: noNota.slice(0, 30),
        tujuan: (selectedCustomer?.nama || "Pelanggan Umum").slice(0, 50),
        alasan: `Penjualan POS Nota ${noNota}`,
        tanggal: new Date().toISOString(),
      })
      .select("*")
      .single();

    for (const c of cart) {
      const stokSebelum = Number(c.barang.stok);
      const stokSesudah = Math.max(0, stokSebelum - c.jumlah);
      const barangId = c.barang.id_barang || c.barang.id;

      await supabase
        .from("barang")
        .update({ stok: stokSesudah })
        .eq("id_barang", barangId);

      if (mutHeader) {
        const hargaFinal = getEffectivePrice(c);
        await supabase.from("detail_mutasi_barang").insert({
          mutasi_id: mutHeader.id_mutasi || mutHeader.id,
          barang_id: barangId,
          satuan_pembelian: c.barang.satuan_dasar || "Pcs",
          jumlah: c.jumlah,
          harga_beli: hargaFinal,
          subtotal: hargaFinal * c.jumlah,
          stok_sebelum: stokSebelum,
          stok_sesudah: stokSesudah,
        });
      }

      if (stokSesudah <= Number(c.barang.stok_minimum)) {
        await supabase.from("notifikasi").insert({
          jenis: "stok_hampir_habis",
          penerima: "muhamadirfan.mi966@gmail.com",
          saluran: "email",
          pesan: `Stok ${c.barang.kode_barang} - ${c.barang.nama} mencapai batas minimum (Sisa: ${stokSesudah} ${c.barang.satuan_dasar}).`,
          status_kirim: "pending",
          waktu: new Date().toISOString(),
        });
      }
    }
  }

  // 4. Jika Kasbon, catat pengajuan kasbon
  if (jenisPembayaran === "kasbon") {
    await supabase.from("kasbon").insert({
      pelanggan_id: selectedPelangganId,
      transaksi_id: trxHeaderId,
      jumlah_kasbon: cartTotal,
      status: "menunggu",
      tanggal_pengajuan: new Date().toISOString(),
    });
  }

  // 5. Jika perlu dikirim, buat penugasan pengiriman otomatis sesuai Class Diagram (Pengiriman)
  if (perluDikirim) {
    const { data: driverUser } = await supabase
      .from("pengguna")
      .select("id_pengguna")
      .eq("role", "pengirim")
      .eq("status", "aktif")
      .limit(1)
      .maybeSingle();

    await supabase.from("pengiriman").insert({
      transaksi_id: trxHeaderId,
      pengirim_id: driverUser?.id_pengguna || null,
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
    aktivitas: `Transaksi ${noNota} (${jenisPembayaran.toUpperCase()})`.slice(
      0,
      50
    ),
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
    id_transaksi: trxHeaderId,
    id: trxHeaderId,
    pelanggan: {
      nama: selectedCustomer?.nama || "Pelanggan Umum",
      alamat: alamatKirim || selectedCustomer?.alamat || null,
    },
    detail_transaksi: cart.map((c, idx) => {
      const hargaFinal = getEffectivePrice(c);
      const hargaAwal = Number(c.barang.harga);
      const adaNego = c.hargaNego.trim() !== "";
      return {
        id: String(idx),
        jumlah: c.jumlah,
        harga_awal: hargaAwal,
        harga_modal: getHargaModal(c.barang),
        harga_asli: hargaAwal,
        harga_nego: adaNego ? hargaFinal : null,
        harga_satuan: hargaFinal,
        subtotal: hargaFinal * c.jumlah,
        barang: {
          kode_barang: c.barang.kode_barang,
          nama: c.barang.nama,
          satuan: c.barang.satuan_dasar,
        },
      };
    }),
  };

  return fullStruk;
}
