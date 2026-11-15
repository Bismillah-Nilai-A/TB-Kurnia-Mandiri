"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  SearchField,
  Tab,
  Input,
  Label,
} from "@/components/ui";
import { supabase, getCurrentUser, logAktivitas } from "@/lib/supabase";
import {
  Plus,
  Minus,
  Trash2,
  Printer,
  X,
  AlertCircle,
  ShoppingCart,
  QrCode,
  CreditCard,
  Banknote,
  Truck,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import type { Database, JenisPembayaran, StatusBayar } from "@/lib/types";

type BarangRow = Database["public"]["Tables"]["barang"]["Row"];
type PelangganRow = Database["public"]["Tables"]["pelanggan"]["Row"];
type TransaksiRow = Database["public"]["Tables"]["transaksi"]["Row"] & {
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

interface CartItem {
  barang: BarangRow;
  jumlah: number;
  hargaNego: string; // Kosong jika pakai harga normal, terisi jika pembeli menawar harga
}

const STATUS_MAP: Record<StatusBayar, { label: string; style: string }> = {
  lunas: { label: "Lunas", style: "bg-emerald-50 text-emerald-700" },
  menunggu: { label: "Menunggu", style: "bg-amber-50 text-amber-700" },
  sebagian: { label: "Sebagian", style: "bg-blue-50 text-blue-700" },
  dibatalkan: { label: "Dibatalkan", style: "bg-red-50 text-red-700" },
};

export default function TransaksiPage() {
  const [mode, setMode] = useState<"pos" | "riwayat">("pos");
  const [searchTrx, setSearchTrx] = useState("");
  const [activeTab, setActiveTab] = useState("Semua");

  const [transactions, setTransactions] = useState<TransaksiRow[]>([]);
  const [barangList, setBarangList] = useState<BarangRow[]>([]);
  const [pelangganList, setPelangganList] = useState<PelangganRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State Kasir POS
  const [searchProduk, setSearchProduk] = useState("");
  const [kategoriProduk, setKategoriProduk] = useState("SEMUA");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPelangganId, setSelectedPelangganId] = useState<string>("");
  const [jenisPembayaran, setJenisPembayaran] =
    useState<JenisPembayaran>("tunai");
  const [uangDiterima, setUangDiterima] = useState<string>("");
  const [perluDikirim, setPerluDikirim] = useState(false);
  const [alamatKirim, setAlamatKirim] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // State Midtrans Gateway Modal
  const [snapModal, setSnapModal] = useState<{
    orderId: string;
    total: number;
    token: string;
    redirectUrl: string;
    metode: "qris" | "va";
  } | null>(null);

  // State Cetak Struk Thermal (TRX-10)
  const [strukTrx, setStrukTrx] = useState<TransaksiRow | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
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

      setTransactions((trxRes.data as unknown as TransaksiRow[]) || []);
      setBarangList((brgRes.data as BarangRow[]) || []);
      const plgs = (plgRes.data as PelangganRow[]) || [];
      setPelangganList(plgs);

      if (!selectedPelangganId && plgs.length > 0) {
        const umum =
          plgs.find((p) => p.nama.toLowerCase().includes("umum")) || plgs[0];
        setSelectedPelangganId(umum.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data POS");
    } finally {
      setLoading(false);
    }
  }, [selectedPelangganId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Keranjang Belanja Helpers
  const addToCart = (item: BarangRow) => {
    if (item.stok <= 0) {
      setError(`Stok "${item.nama}" habis!`);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((c) => c.barang.id === item.id);
      if (existing) {
        if (existing.jumlah + 1 > item.stok) {
          setError(
            `Stok "${item.nama}" hanya tersedia ${item.stok} ${item.satuan}.`
          );
          return prev;
        }
        return prev.map((c) =>
          c.barang.id === item.id ? { ...c, jumlah: c.jumlah + 1 } : c
        );
      }
      return [...prev, { barang: item, jumlah: 1, hargaNego: "" }];
    });
  };

  const updateCartNego = (barangId: string, val: string) => {
    setError(null);
    setCart((prev) =>
      prev.map((c) =>
        c.barang.id === barangId ? { ...c, hargaNego: val } : c
      )
    );
  };

  const getHargaModal = (b: BarangRow) =>
    Number(b.harga_beli) || Math.round(Number(b.harga) / 1.3);

  const getEffectivePrice = (c: CartItem) => {
    if (c.hargaNego.trim() !== "" && !isNaN(Number(c.hargaNego))) {
      return Number(c.hargaNego);
    }
    return Number(c.barang.harga);
  };

  const isNegoInvalid = (c: CartItem) => {
    if (c.hargaNego.trim() === "") return false;
    const negoNum = Number(c.hargaNego);
    const modalNum = getHargaModal(c.barang);
    return isNaN(negoNum) || negoNum < modalNum;
  };

  const hasAnyInvalidNego = cart.some(isNegoInvalid);

  const updateCartQty = (barangId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.barang.id !== barangId) return c;
          const nextQty = c.jumlah + delta;
          if (nextQty > c.barang.stok) {
            setError(
              `Maksimal stok tersedia: ${c.barang.stok} ${c.barang.satuan}`
            );
            return c;
          }
          return { ...c, jumlah: nextQty };
        })
        .filter((c) => c.jumlah > 0)
    );
  };

  const removeFromCart = (barangId: string) => {
    setCart((prev) => prev.filter((c) => c.barang.id !== barangId));
  };

  const cartTotal = cart.reduce(
    (sum, c) => sum + getEffectivePrice(c) * c.jumlah,
    0
  );
  const uangTunaiNum = Number(uangDiterima) || cartTotal;
  const kembalian = Math.max(0, uangTunaiNum - cartTotal);

  const selectedCustomer = pelangganList.find(
    (p) => p.id === selectedPelangganId
  );

  // Eksekusi Simpan Transaksi ke Supabase + pengurangan stok + mutasi keluar + pengiriman
  const finalizeTransactionToDB = async ({
    noNota,
    statusBayar,
    jumlahDibayar,
    sisaTagihan,
    refGateway,
  }: {
    noNota: string;
    statusBayar: StatusBayar;
    jumlahDibayar: number;
    sisaTagihan: number;
    refGateway?: string;
  }) => {
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

    setCart([]);
    setUangDiterima("");
    setPerluDikirim(false);
    setAlamatKirim("");
    await fetchData();
    setStrukTrx(fullStruk);
  };

  const handleCheckoutPOS = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (cart.length === 0) {
      setError("Keranjang belanja masih kosong. Pilih barang terlebih dahulu.");
      return;
    }

    // Validasi Harga Nego tidak boleh lebih rendah dari Harga Modal
    const invalidItem = cart.find(isNegoInvalid);
    if (invalidItem) {
      const modal = getHargaModal(invalidItem.barang);
      setError(
        `Harga nego untuk "${invalidItem.barang.nama}" (Rp ${Number(invalidItem.hargaNego).toLocaleString("id-ID")}) tidak boleh lebih rendah dari Harga Modal (Rp ${modal.toLocaleString("id-ID")})!`
      );
      return;
    }

    // Validasi Kasbon (TRX-05c)
    if (jenisPembayaran === "kasbon") {
      if (
        !selectedCustomer ||
        selectedCustomer.nama.toLowerCase().includes("umum")
      ) {
        setError(
          "Transaksi Kasbon wajib memilih Pelanggan terdaftar (bukan Pelanggan Umum)."
        );
        return;
      }
      if (
        selectedCustomer.batas_kasbon > 0 &&
        cartTotal > Number(selectedCustomer.batas_kasbon)
      ) {
        setError(
          `Total belanja (Rp ${cartTotal.toLocaleString("id-ID")}) melebihi batas kasbon pelanggan (Rp ${Number(selectedCustomer.batas_kasbon).toLocaleString("id-ID")}).`
        );
        return;
      }
    }

    // Validasi Uang Tunai
    if (
      jenisPembayaran === "tunai" &&
      uangDiterima &&
      Number(uangDiterima) < cartTotal
    ) {
      setError("Nominal uang tunai yang diterima kurang dari total belanja.");
      return;
    }

    const noNota = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(100 + Math.random() * 900)}`;

    setSubmitting(true);
    try {
      // Jika QRIS atau Virtual Account -> panggil Midtrans API terlebih dahulu (PGW-01)
      if (jenisPembayaran === "qris" || jenisPembayaran === "va") {
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

        setSnapModal({
          orderId: noNota,
          total: cartTotal,
          token: data.token,
          redirectUrl: data.redirect_url,
          metode: jenisPembayaran,
        });
        setSubmitting(false);
        return;
      }

      // Jika Tunai atau Kasbon
      const isTunai = jenisPembayaran === "tunai";
      await finalizeTransactionToDB({
        noNota,
        statusBayar: isTunai ? "lunas" : "menunggu",
        jumlahDibayar: isTunai ? cartTotal : 0,
        sisaTagihan: isTunai ? 0 : cartTotal,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memproses checkout");
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    "SEMUA",
    ...Array.from(new Set(barangList.map((b) => b.kategori))).sort(),
  ];

  const filteredProducts = barangList.filter((b) => {
    const matchCat =
      kategoriProduk === "SEMUA" || b.kategori === kategoriProduk;
    const q = searchProduk.toLowerCase();
    const matchSearch =
      b.nama.toLowerCase().includes(q) ||
      b.kode_barang.toLowerCase().includes(q) ||
      (b.barcode || "").toLowerCase().includes(q) ||
      (b.merk || "").toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const filteredTransactions = transactions.filter((t) => {
    const statusInfo = STATUS_MAP[t.status_bayar] || STATUS_MAP.menunggu;
    const matchTab = activeTab === "Semua" || statusInfo.label === activeTab;
    const customerName = t.pelanggan?.nama || "Pelanggan Umum";
    const matchSearch =
      t.no_nota.toLowerCase().includes(searchTrx.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTrx.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Kasir Point of Sale (POS) & Riwayat Transaksi
          </h1>
          <p className="text-sm text-gray-500">
            Melayani penjualan Tunai, QRIS / Virtual Account (Midtrans), dan
            Kasbon Pelanggan
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-xs">
          <button
            onClick={() => setMode("pos")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              mode === "pos"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Kasir POS Baru</span>
          </button>
          <button
            onClick={() => setMode("riwayat")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              mode === "riwayat"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Riwayat Nota ({transactions.length})</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between text-sm text-red-700 print:hidden">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-xs underline font-semibold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* MODE 1: KASIR POS MULTI-ITEM */}
      {mode === "pos" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start pb-6 print:hidden">
          {/* Kolom Kiri: Pemilih Katalog Barang (7 Kolom) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Pilih Barang / Scan Barcode</CardTitle>
                <div className="flex flex-col gap-2.5 mt-2">
                  <SearchField
                    placeholder="Ketik nama barang, kode (A001), atau scan barcode lalu klik barang..."
                    value={searchProduk}
                    onChange={(e) => setSearchProduk(e.target.value)}
                  />
                  <div className="flex flex-wrap items-center gap-1.5">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setKategoriProduk(cat)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                          kategoriProduk === cat
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="max-h-[calc(100vh-290px)] min-h-[380px] overflow-y-auto pt-0">
                {loading ? (
                  <p className="text-sm text-gray-500 py-8 text-center">
                    Memuat katalog barang...
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {filteredProducts.slice(0, 60).map((item) => {
                      const inCart = cart.find((c) => c.barang.id === item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => addToCart(item)}
                          disabled={item.stok <= 0}
                          className={`text-left p-3 rounded-xl border transition flex flex-col justify-between gap-2 cursor-pointer ${
                            inCart
                              ? "border-blue-500 bg-blue-50/40"
                              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                          } ${item.stok <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-mono text-[11px] font-bold text-blue-600">
                                {item.kode_barang}
                              </span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                  item.stok <= item.stok_min
                                    ? "bg-red-50 text-red-600"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                Stok: {item.stok} {item.satuan}
                              </span>
                            </div>
                            <p className="font-semibold text-gray-900 text-xs mt-1 line-clamp-1">
                              {item.nama}
                            </p>
                            {item.merk && (
                              <p className="text-[11px] text-gray-400">
                                {item.merk}{" "}
                                {item.keterangan ? `• ${item.keterangan}` : ""}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                            <span className="text-xs font-bold text-gray-900">
                              Rp {Number(item.harga).toLocaleString("id-ID")}
                            </span>
                            {inCart ? (
                              <span className="text-[11px] font-bold text-blue-600">
                                Di Keranjang: {inCart.jumlah}
                              </span>
                            ) : (
                              <span className="text-[11px] text-blue-600 font-medium">
                                + Tambah
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Kolom Kanan: Keranjang & Pembayaran (5 Kolom) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <Card>
              <CardHeader className="border-b border-gray-100 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Keranjang Belanja POS</CardTitle>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                    {cart.reduce((s, c) => s + c.jumlah, 0)} Item
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-3">
                {/* Daftar Item di Keranjang */}
                {cart.length === 0 ? (
                  <div className="py-5 px-3 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-lg">
                    Belum ada barang dipilih. Klik barang di sebelah kiri untuk
                    menambahkan ke nota.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                    {cart.map((c) => {
                      const hargaNormal = Number(c.barang.harga);
                      const hargaModal = getHargaModal(c.barang);
                      const hargaFinal = getEffectivePrice(c);
                      const invalidNego = isNegoInvalid(c);
                      const adaNego = c.hargaNego.trim() !== "";

                      return (
                        <div
                          key={c.barang.id}
                          className={`flex flex-col gap-2 p-3 rounded-lg border ${
                            invalidNego
                              ? "bg-red-50/60 border-red-300"
                              : adaNego
                                ? "bg-emerald-50/40 border-emerald-300"
                                : "bg-gray-50 border-gray-200/80"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-900 truncate">
                                [{c.barang.kode_barang}] {c.barang.nama}
                              </p>
                              <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-gray-500">
                                <span>
                                  Normal: Rp{" "}
                                  {hargaNormal.toLocaleString("id-ID")}
                                </span>
                                <span>•</span>
                                <span className="text-amber-700 font-medium">
                                  Min (Modal): Rp{" "}
                                  {hargaModal.toLocaleString("id-ID")}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => updateCartQty(c.barang.id, -1)}
                                className="p-1 rounded bg-white border border-gray-200 hover:bg-gray-100 cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-7 text-center text-xs font-bold">
                                {c.jumlah}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateCartQty(c.barang.id, 1)}
                                className="p-1 rounded bg-white border border-gray-200 hover:bg-gray-100 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeFromCart(c.barang.id)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded ml-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Input Harga Nego / Tawar per Satuan */}
                          <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-gray-200/60">
                            <div className="flex items-center gap-1.5 flex-1">
                              <span className="text-[11px] font-medium text-gray-600 whitespace-nowrap">
                                Harga Nego/Tawar:
                              </span>
                              <input
                                type="number"
                                min={hargaModal}
                                placeholder={`Normal: ${hargaNormal}`}
                                value={c.hargaNego}
                                onChange={(e) =>
                                  updateCartNego(c.barang.id, e.target.value)
                                }
                                className={`h-7 px-2 rounded border text-xs w-32 bg-white font-semibold ${
                                  invalidNego
                                    ? "border-red-500 text-red-700 focus:outline-red-500"
                                    : "border-gray-300 text-gray-900"
                                }`}
                              />
                              {adaNego && (
                                <button
                                  type="button"
                                  onClick={() => updateCartNego(c.barang.id, "")}
                                  className="text-[10px] text-gray-500 hover:text-gray-800 underline cursor-pointer"
                                >
                                  Reset
                                </button>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-gray-900">
                                Rp{" "}
                                {(hargaFinal * c.jumlah).toLocaleString("id-ID")}
                              </span>
                            </div>
                          </div>

                          {invalidNego && (
                            <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>
                                Harga tawar tidak boleh di bawah Harga Modal (Rp{" "}
                                {hargaModal.toLocaleString("id-ID")})!
                              </span>
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Form Checkout */}
                <form
                  onSubmit={handleCheckoutPOS}
                  className="flex flex-col gap-3 pt-2 border-t border-gray-200"
                >
                  <div>
                    <Label>Pelanggan</Label>
                    <select
                      value={selectedPelangganId}
                      onChange={(e) => setSelectedPelangganId(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-gray-300 text-xs font-medium bg-white"
                    >
                      {pelangganList.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nama} ({p.jenis.toUpperCase()} • Limit Kasbon: Rp{" "}
                          {Number(p.batas_kasbon).toLocaleString("id-ID")})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Metode Pembayaran */}
                  <div>
                    <Label>Metode Pembayaran</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setJenisPembayaran("tunai")}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                          jenisPembayaran === "tunai"
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <Banknote className="w-4 h-4" />
                        <span>Tunai (Cash)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setJenisPembayaran("qris")}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                          jenisPembayaran === "qris"
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <QrCode className="w-4 h-4" />
                        <span>QRIS (Midtrans)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setJenisPembayaran("va")}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                          jenisPembayaran === "va"
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Virtual Account</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setJenisPembayaran("kasbon")}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                          jenisPembayaran === "kasbon"
                            ? "border-amber-600 bg-amber-50 text-amber-700"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Kasbon / Tempo</span>
                      </button>
                    </div>
                  </div>

                  {/* Input Uang Diterima (Khusus Tunai) */}
                  {jenisPembayaran === "tunai" && (
                    <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div>
                        <Label>Uang Diterima (Rp)</Label>
                        <Input
                          type="number"
                          placeholder={String(cartTotal)}
                          value={uangDiterima}
                          onChange={(e) => setUangDiterima(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col justify-end">
                        <span className="text-[11px] text-gray-500">
                          Uang Kembalian:
                        </span>
                        <span className="text-base font-bold text-emerald-600">
                          Rp {kembalian.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Opsi Pengiriman Barang */}
                  <div className="p-3 rounded-lg border border-gray-200 flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={perluDikirim}
                        onChange={(e) => setPerluDikirim(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span>Perlu Dikirim ke Alamat Proyek / Pelanggan</span>
                    </label>
                    {perluDikirim && (
                      <Input
                        placeholder="Alamat pengiriman lengkap..."
                        value={alamatKirim}
                        onChange={(e) => setAlamatKirim(e.target.value)}
                      />
                    )}
                  </div>

                  {/* Ringkasan Total */}
                  <div className="bg-blue-900 text-white p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs text-blue-200">Total Tagihan</p>
                      <p className="text-xl font-bold">
                        Rp {cartTotal.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={
                        submitting || cart.length === 0 || hasAnyInvalidNego
                      }
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
                    >
                      {submitting ? "Memproses..." : "Bayar & Cetak Struk"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* MODE 2: RIWAYAT NOTA & CETAK ULANG STRUK */}
      {mode === "riwayat" && (
        <div className="flex flex-col gap-4 print:hidden">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <SearchField
              placeholder="Cari nomor nota (INV-...) atau nama pelanggan..."
              value={searchTrx}
              onChange={(e) => setSearchTrx(e.target.value)}
              className="max-w-md flex-1"
            />
            <div className="flex items-center gap-1 bg-gray-200/70 p-1 rounded-lg">
              {["Semua", "Lunas", "Menunggu", "Sebagian", "Dibatalkan"].map(
                (t) => (
                  <Tab
                    key={t}
                    active={activeTab === t}
                    onClick={() => setActiveTab(t)}
                  >
                    {t}
                  </Tab>
                )
              )}
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                      <th className="py-3 px-4">No. Nota</th>
                      <th className="py-3 px-4">Pelanggan</th>
                      <th className="py-3 px-4">Metode</th>
                      <th className="py-3 px-4 text-right">Total</th>
                      <th className="py-3 px-4 text-right">Dibayar</th>
                      <th className="py-3 px-4 text-right">Sisa Tagihan</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4 text-center">Struk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-sm">
                    {filteredTransactions.map((t) => {
                      const st =
                        STATUS_MAP[t.status_bayar] || STATUS_MAP.menunggu;
                      return (
                        <tr key={t.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-mono text-xs font-bold text-blue-600">
                            {t.no_nota}
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-900">
                            {t.pelanggan?.nama || "Pelanggan Umum"}
                          </td>
                          <td className="py-3 px-4 text-gray-600 uppercase text-xs font-semibold">
                            {t.jenis_pembayaran}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-gray-900">
                            Rp {Number(t.total).toLocaleString("id-ID")}
                          </td>
                          <td className="py-3 px-4 text-right text-emerald-700 font-medium">
                            Rp{" "}
                            {Number(t.jumlah_dibayar).toLocaleString("id-ID")}
                          </td>
                          <td className="py-3 px-4 text-right text-red-600 font-medium">
                            Rp {Number(t.sisa_tagihan).toLocaleString("id-ID")}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${st.style}`}
                            >
                              {st.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-500 text-xs">
                            {new Date(t.tanggal).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setStrukTrx(t)}
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Struk</span>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL PEMBAYARAN MIDTRANS SNAP (QRIS / VIRTUAL ACCOUNT) */}
      {snapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-gray-900">
                  Pembayaran Non-Tunai Midtrans (
                  {snapModal.metode.toUpperCase()})
                </h3>
                <p className="text-xs text-gray-500">
                  Order ID: {snapModal.orderId}
                </p>
              </div>
              <button
                onClick={() => setSnapModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center flex flex-col items-center gap-2">
              <QrCode className="w-12 h-12 text-blue-600" />
              <p className="text-xs text-gray-600">Total Pembayaran</p>
              <p className="text-2xl font-bold text-blue-900">
                Rp {snapModal.total.toLocaleString("id-ID")}
              </p>
              <span className="text-[11px] font-mono bg-white px-2.5 py-1 rounded border border-blue-200 text-blue-700">
                Snap Token: {snapModal.token}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <a
                href={snapModal.redirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Buka Halaman Pembayaran Midtrans Sandbox</span>
              </a>

              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={submitting}
                onClick={async () => {
                  setSubmitting(true);
                  try {
                    await finalizeTransactionToDB({
                      noNota: snapModal.orderId,
                      statusBayar: "lunas",
                      jumlahDibayar: snapModal.total,
                      sisaTagihan: 0,
                      refGateway: snapModal.token,
                    });
                    setSnapModal(null);
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Konfirmasi Pembayaran Berhasil & Cetak Struk</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL STRUK THERMAL 80MM (TRX-10 - @media print) */}
      {strukTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:static print:bg-white print:p-0">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl flex flex-col gap-4 print:shadow-none print:max-w-none print:w-[80mm] print:p-2">
            {/* Tombol Tutup (Disembunyikan saat print) */}
            <div className="flex items-center justify-between border-b pb-2 print:hidden">
              <h3 className="font-bold text-gray-900 text-sm">
                Pratinjau Struk Thermal POS
              </h3>
              <button
                onClick={() => setStrukTrx(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Isi Struk Thermal */}
            <div className="font-mono text-xs text-gray-900 flex flex-col gap-2 border border-dashed border-gray-300 p-4 rounded print:border-none print:p-0">
              <div className="text-center border-b border-dashed border-gray-400 pb-2">
                <p className="font-bold text-sm">CV KURNIA MANDIRI</p>
                <p className="text-[10px] text-gray-600">
                  Toko Bahan & Material Bangunan
                </p>
                <p className="text-[10px] text-gray-500">
                  Jl. Raya Kurnia Mandiri No. 18
                </p>
              </div>

              <div className="flex flex-col gap-0.5 text-[11px] border-b border-dashed border-gray-400 pb-2">
                <div className="flex justify-between">
                  <span>No. Nota:</span>
                  <span className="font-bold">{strukTrx.no_nota}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal:</span>
                  <span>
                    {new Date(strukTrx.tanggal).toLocaleString("id-ID", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Pelanggan:</span>
                  <span>{strukTrx.pelanggan?.nama || "Pelanggan Umum"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Metode:</span>
                  <span className="uppercase">{strukTrx.jenis_pembayaran}</span>
                </div>
              </div>

              {/* Daftar Item */}
              <div className="flex flex-col gap-1.5 border-b border-dashed border-gray-400 pb-2">
                {(strukTrx.detail_transaksi || []).map((d) => (
                  <div key={d.id} className="flex flex-col">
                    <span className="font-semibold">
                      {d.barang?.nama || "Item Barang"}
                    </span>
                    {d.harga_nego &&
                      d.harga_asli &&
                      Number(d.harga_nego) !== Number(d.harga_asli) && (
                        <span className="text-[10px] text-gray-500">
                          Harga Normal: Rp{" "}
                          {Number(d.harga_asli).toLocaleString("id-ID")} → Nego
                        </span>
                      )}
                    <div className="flex justify-between text-[11px] text-gray-700">
                      <span>
                        {d.jumlah} {d.barang?.satuan || "pcs"} x Rp{" "}
                        {Number(d.harga_satuan).toLocaleString("id-ID")}
                      </span>
                      <span>Rp {Number(d.subtotal).toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total & Status */}
              <div className="flex flex-col gap-1 text-xs">
                <div className="flex justify-between font-bold text-sm">
                  <span>TOTAL:</span>
                  <span>
                    Rp {Number(strukTrx.total).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Dibayar:</span>
                  <span>
                    Rp {Number(strukTrx.jumlah_dibayar).toLocaleString("id-ID")}
                  </span>
                </div>
                {Number(strukTrx.sisa_tagihan) > 0 && (
                  <div className="flex justify-between text-[11px] font-bold">
                    <span>Sisa Tagihan (Kasbon):</span>
                    <span>
                      Rp {Number(strukTrx.sisa_tagihan).toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-[11px]">
                  <span>Status:</span>
                  <span className="uppercase font-bold">
                    {strukTrx.status_bayar}
                  </span>
                </div>
              </div>

              <div className="text-center pt-2 border-t border-dashed border-gray-400 text-[10px] text-gray-500">
                <p>Terima kasih atas kepercayaan Anda</p>
                <p>Barang yang sudah dibeli tidak dapat ditukar</p>
              </div>
            </div>

            <div className="flex items-center gap-2 print:hidden">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setStrukTrx(null)}
              >
                Tutup
              </Button>
              <Button className="flex-1" onClick={() => window.print()}>
                <Printer className="w-4 h-4" />
                <span>Cetak Struk</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
