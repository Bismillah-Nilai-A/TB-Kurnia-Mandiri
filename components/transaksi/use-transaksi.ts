"use client";

import { useState, useEffect, useCallback } from "react";
import type { JenisPembayaran, StatusBayar } from "@/lib/types";
import {
  type BarangRow,
  type PelangganRow,
  type TransaksiRow,
  type CartItem,
  type SnapModalState,
  STATUS_MAP,
  FALLBACK_PRODUCTS,
  FALLBACK_CUSTOMERS,
  FALLBACK_TRANSACTIONS,
  getHargaModal,
  getEffectivePrice,
  isNegoInvalid,
  muatDataPos,
  buatTransaksiMidtrans,
  simpanTransaksiKeDatabase,
} from "./layanan-transaksi";

export function useTransaksi() {
  const [mode, setMode] = useState<"pos" | "riwayat">("pos");
  const [searchTrx, setSearchTrx] = useState("");
  const [activeTab, setActiveTab] = useState("Semua");

  const [transactions, setTransactions] = useState<TransaksiRow[]>(
    FALLBACK_TRANSACTIONS
  );
  const [barangList, setBarangList] = useState<BarangRow[]>(FALLBACK_PRODUCTS);
  const [pelangganList, setPelangganList] =
    useState<PelangganRow[]>(FALLBACK_CUSTOMERS);
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
  const [snapModal, setSnapModal] = useState<SnapModalState | null>(null);

  // State Cetak Struk Thermal (TRX-10)
  const [strukTrx, setStrukTrx] = useState<TransaksiRow | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await muatDataPos();
      setTransactions(data.transactions);
      setBarangList(data.barangList);
      setPelangganList(data.pelangganList);

      if (!selectedPelangganId && data.pelangganList.length > 0) {
        const umum =
          data.pelangganList.find((p) =>
            p.nama.toLowerCase().includes("umum")
          ) || data.pelangganList[0];
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
    const fullStruk = await simpanTransaksiKeDatabase({
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
    });

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

    const noNota = `INV-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${Math.floor(100 + Math.random() * 900)}`;

    setSubmitting(true);
    try {
      // Jika QRIS atau Virtual Account -> panggil Midtrans API terlebih dahulu (PGW-01)
      if (jenisPembayaran === "qris" || jenisPembayaran === "va") {
        const data = await buatTransaksiMidtrans({
          noNota,
          cartTotal,
          selectedCustomer,
          cart,
        });

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
      (b.barcode || "").toLowerCase().includes(q);
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

  return {
    mode,
    setMode,
    searchTrx,
    setSearchTrx,
    activeTab,
    setActiveTab,
    transactions,
    barangList,
    pelangganList,
    loading,
    error,
    setError,
    searchProduk,
    setSearchProduk,
    kategoriProduk,
    setKategoriProduk,
    cart,
    selectedPelangganId,
    setSelectedPelangganId,
    jenisPembayaran,
    setJenisPembayaran,
    uangDiterima,
    setUangDiterima,
    perluDikirim,
    setPerluDikirim,
    alamatKirim,
    setAlamatKirim,
    submitting,
    setSubmitting,
    snapModal,
    setSnapModal,
    strukTrx,
    setStrukTrx,
    addToCart,
    updateCartNego,
    updateCartQty,
    removeFromCart,
    hasAnyInvalidNego,
    cartTotal,
    kembalian,
    categories,
    filteredProducts,
    filteredTransactions,
    handleCheckoutPOS,
    finalizeTransactionToDB,
  };
}
