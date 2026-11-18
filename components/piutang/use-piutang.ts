"use client";

import { useState, useEffect, useCallback } from "react";
import {
  type PelangganRow,
  type PiutangTransaksi,
  type KasbonJoined,
  type KwitansiBayarState,
  type PelangganFormState,
  DEFAULT_PELANGGAN_FORM,
  fetchAllPiutangData,
  prosesPembayaranPiutangDB,
  setujuiKasbonDB,
  tolakKasbonDB,
  simpanPelangganDB,
  hapusPelangganDB,
} from "./layanan-piutang";

export function usePiutang() {
  const [activeTab, setActiveTab] = useState<
    "tagihan" | "persetujuan" | "pelanggan"
  >("tagihan");
  const [search, setSearch] = useState("");
  const [pelangganList, setPelangganList] = useState<PelangganRow[]>([]);
  const [tagihanList, setTagihanList] = useState<PiutangTransaksi[]>([]);
  const [kasbonList, setKasbonList] = useState<KasbonJoined[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Modal Pembayaran Piutang (BYR-02..05)
  const [bayarModal, setBayarModal] = useState<PiutangTransaksi | null>(null);
  const [nominalBayar, setNominalBayar] = useState("");
  const [metodeBayar, setMetodeBayar] = useState<"tunai" | "transfer">("tunai");
  const [buktiTransferRef, setBuktiTransferRef] = useState("");
  const [kwitansiBayar, setKwitansiBayar] =
    useState<KwitansiBayarState | null>(null);

  // Modal Tolak Kasbon (KSB-04)
  const [tolakModal, setTolakModal] = useState<KasbonJoined | null>(null);
  const [alasanPenolakan, setAlasanPenolakan] = useState("");

  // Modal Tambah / Edit Pelanggan (PLG-02..04)
  const [showPelangganModal, setShowPelangganModal] = useState(false);
  const [editingPelanggan, setEditingPelanggan] =
    useState<PelangganRow | null>(null);
  const [pelangganForm, setPelangganForm] = useState<PelangganFormState>(
    DEFAULT_PELANGGAN_FORM
  );

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllPiutangData();
      setPelangganList(data.pelangganList);
      setTagihanList(data.tagihanList);
      setKasbonList(data.kasbonList);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat data piutang"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Proses Pembayaran Cicilan / Pelunasan Piutang (BYR-02..05)
  const handleProsesPembayaranPiutang = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bayarModal) return;

    const nominal = Number(nominalBayar) || 0;
    const sisaSaatIni = Number(bayarModal.sisa_tagihan);

    if (nominal <= 0 || nominal > sisaSaatIni) {
      setError(
        `Nominal pembayaran harus antara Rp 1 hingga Rp ${sisaSaatIni.toLocaleString("id-ID")}.`
      );
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const kwitansi = await prosesPembayaranPiutangDB({
        bayarModal,
        nominal,
        metodeBayar,
        buktiTransferRef,
      });

      setBayarModal(null);
      setNominalBayar("");
      setBuktiTransferRef("");
      await fetchAllData();

      setKwitansiBayar(kwitansi);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mencatat pembayaran piutang"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Setujui Kasbon oleh Admin (KSB-03)
  const handleSetujuiKasbon = async (ksb: KasbonJoined) => {
    setSubmitting(true);
    setError(null);
    try {
      await setujuiKasbonDB(ksb);
      await fetchAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyetujui kasbon");
    } finally {
      setSubmitting(false);
    }
  };

  // Tolak Kasbon oleh Admin (KSB-04)
  const handleTolakKasbon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tolakModal) return;
    if (!alasanPenolakan.trim()) {
      setError("Alasan penolakan wajib diisi.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await tolakKasbonDB(tolakModal, alasanPenolakan);
      setTolakModal(null);
      setAlasanPenolakan("");
      await fetchAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menolak kasbon");
    } finally {
      setSubmitting(false);
    }
  };

  // Simpan Pelanggan (Tambah / Edit)
  const handleSavePelanggan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await simpanPelangganDB(pelangganForm, editingPelanggan);
      setShowPelangganModal(false);
      await fetchAllData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menyimpan data pelanggan"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePelanggan = async (p: PelangganRow) => {
    if (!window.confirm(`Hapus pelanggan "${p.nama}"?`)) return;
    try {
      await hapusPelangganDB(p);
      await fetchAllData();
    } catch {
      setError(
        "Pelanggan tidak dapat dihapus karena masih memiliki riwayat transaksi/kasbon."
      );
    }
  };

  const openTambahPelangganModal = () => {
    setEditingPelanggan(null);
    setPelangganForm(DEFAULT_PELANGGAN_FORM);
    setShowPelangganModal(true);
  };

  const openEditPelangganModal = (p: PelangganRow) => {
    setEditingPelanggan(p);
    setPelangganForm({
      nama: p.nama,
      jenis: p.jenis,
      kontak: p.kontak || "",
      alamat: p.alamat || "",
      batas_kasbon: String(p.batas_kasbon),
      status_kasbon: p.status_kasbon,
    });
    setShowPelangganModal(true);
  };

  const totalPiutangAktif = tagihanList.reduce(
    (s, t) => s + Number(t.sisa_tagihan),
    0
  );
  const menungguCount = kasbonList.filter(
    (k) => k.status === "menunggu"
  ).length;

  return {
    activeTab,
    setActiveTab,
    search,
    setSearch,
    pelangganList,
    tagihanList,
    kasbonList,
    loading,
    error,
    setError,
    submitting,
    bayarModal,
    setBayarModal,
    nominalBayar,
    setNominalBayar,
    metodeBayar,
    setMetodeBayar,
    buktiTransferRef,
    setBuktiTransferRef,
    kwitansiBayar,
    setKwitansiBayar,
    tolakModal,
    setTolakModal,
    alasanPenolakan,
    setAlasanPenolakan,
    showPelangganModal,
    setShowPelangganModal,
    editingPelanggan,
    setEditingPelanggan,
    pelangganForm,
    setPelangganForm,
    totalPiutangAktif,
    menungguCount,
    fetchAllData,
    handleProsesPembayaranPiutang,
    handleSetujuiKasbon,
    handleTolakKasbon,
    handleSavePelanggan,
    handleDeletePelanggan,
    openTambahPelangganModal,
    openEditPelangganModal,
  };
}
