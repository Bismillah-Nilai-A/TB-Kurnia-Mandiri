"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  SearchField,
  Input,
  Label,
} from "@/components/ui";
import { supabase, logAktivitas } from "@/lib/supabase";
import {
  Plus,
  X,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Banknote,
  Users,
  Clock,
  Edit3,
  Trash2,
  Printer,
} from "lucide-react";
import type { Database, JenisPelanggan, StatusKasbon } from "@/lib/types";

type PelangganRow = Database["public"]["Tables"]["pelanggan"]["Row"];

interface PiutangTransaksi {
  id: string;
  no_nota: string;
  pelanggan_id: string | null;
  total: number;
  jumlah_dibayar: number;
  sisa_tagihan: number;
  status_bayar: string;
  tanggal: string;
  pelanggan?: {
    nama: string;
    jenis: string;
    kontak: string | null;
    batas_kasbon: number;
  } | null;
}

interface KasbonJoined {
  id: string;
  pelanggan_id: string;
  transaksi_id: string | null;
  jumlah_kasbon: number;
  status: StatusKasbon;
  alasan_penolakan: string | null;
  tanggal_pengajuan: string;
  tanggal_keputusan: string | null;
  pelanggan?: { nama: string; batas_kasbon: number } | null;
  transaksi?: { no_nota: string; total: number; sisa_tagihan: number } | null;
}

export default function PiutangPage() {
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
  const [kwitansiBayar, setKwitansiBayar] = useState<{
    noNota: string;
    pelanggan: string;
    nominal: number;
    sisaBaru: number;
    metode: string;
    tanggal: string;
  } | null>(null);

  // Modal Tolak Kasbon (KSB-04)
  const [tolakModal, setTolakModal] = useState<KasbonJoined | null>(null);
  const [alasanPenolakan, setAlasanPenolakan] = useState("");

  // Modal Tambah / Edit Pelanggan (PLG-02..04)
  const [showPelangganModal, setShowPelangganModal] = useState(false);
  const [editingPelanggan, setEditingPelanggan] =
    useState<PelangganRow | null>(null);
  const [pelangganForm, setPelangganForm] = useState({
    nama: "",
    jenis: "proyek" as JenisPelanggan,
    kontak: "",
    alamat: "",
    batas_kasbon: "25000000",
    status_kasbon: "aktif" as StatusKasbon,
  });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [plgRes, trxRes, ksbRes] = await Promise.all([
        supabase
          .from("pelanggan")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("transaksi")
          .select(
            `
            id, no_nota, pelanggan_id, total, jumlah_dibayar, sisa_tagihan, status_bayar, tanggal,
            pelanggan:pelanggan_id(nama, jenis, kontak, batas_kasbon)
          `
          )
          .gt("sisa_tagihan", 0)
          .order("tanggal", { ascending: false }),
        supabase
          .from("kasbon")
          .select(
            `
            *,
            pelanggan:pelanggan_id(nama, batas_kasbon),
            transaksi:transaksi_id(no_nota, total, sisa_tagihan)
          `
          )
          .order("tanggal_pengajuan", { ascending: false }),
      ]);

      if (plgRes.error) throw plgRes.error;
      setPelangganList((plgRes.data as PelangganRow[]) || []);
      setTagihanList((trxRes.data as unknown as PiutangTransaksi[]) || []);
      setKasbonList((ksbRes.data as unknown as KasbonJoined[]) || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat data piutang"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

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
      const dibayarBaru = Number(bayarModal.jumlah_dibayar) + nominal;
      const sisaBaru = Math.max(0, sisaSaatIni - nominal);
      const statusBaru = sisaBaru === 0 ? "lunas" : "sebagian";

      // 1. Insert ke tabel pembayaran
      const { error: payErr } = await supabase.from("pembayaran").insert({
        transaksi_id: bayarModal.id,
        metode: metodeBayar,
        nominal,
        bukti_transfer_url:
          metodeBayar === "transfer" ? buktiTransferRef || "TF-VERIFIED" : null,
        status: "berhasil",
        tanggal: new Date().toISOString(),
      });
      if (payErr) throw payErr;

      // 2. Update transaksi
      const { error: trxErr } = await supabase
        .from("transaksi")
        .update({
          jumlah_dibayar: dibayarBaru,
          sisa_tagihan: sisaBaru,
          status_bayar: statusBaru,
        })
        .eq("id", bayarModal.id);
      if (trxErr) throw trxErr;

      // 3. Jika lunas, update status kasbon terkait menjadi lunas
      if (sisaBaru === 0) {
        await supabase
          .from("kasbon")
          .update({ status: "lunas" })
          .eq("transaksi_id", bayarModal.id);
      }

      await logAktivitas({
        modul: "Pembayaran Piutang",
        aktivitas: `Menerima pembayaran piutang nota ${bayarModal.no_nota} sebesar Rp ${nominal.toLocaleString("id-ID")} (Sisa: Rp ${sisaBaru.toLocaleString("id-ID")})`,
        dataSebelum: { sisa_tagihan: sisaSaatIni },
        dataSesudah: {
          nominal_bayar: nominal,
          sisa_tagihan: sisaBaru,
          status_bayar: statusBaru,
        },
      });

      const pelangganNama = bayarModal.pelanggan?.nama || "Pelanggan";
      setBayarModal(null);
      setNominalBayar("");
      setBuktiTransferRef("");
      await fetchAll();

      setKwitansiBayar({
        noNota: bayarModal.no_nota,
        pelanggan: pelangganNama,
        nominal,
        sisaBaru,
        metode: metodeBayar.toUpperCase(),
        tanggal: new Date().toLocaleString("id-ID"),
      });
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
      const { error: updErr } = await supabase
        .from("kasbon")
        .update({
          status: "disetujui",
          tanggal_keputusan: new Date().toISOString(),
        })
        .eq("id", ksb.id);
      if (updErr) throw updErr;

      // Catat notifikasi outbox & kirim ke muhamadirfan.mi966@gmail.com
      await supabase.from("notifikasi").insert({
        jenis: "kasbon_disetujui",
        penerima: "muhamadirfan.mi966@gmail.com",
        saluran: "email",
        pesan: `Pengajuan kasbon (${ksb.pelanggan?.nama || "Pelanggan"}) sebesar Rp ${Number(ksb.jumlah_kasbon).toLocaleString("id-ID")} untuk nota ${ksb.transaksi?.no_nota || "-"} telah DISETUJUI oleh Admin.`,
        status_kirim: "pending",
        waktu: new Date().toISOString(),
      });
      fetch("/api/cron/notifikasi", { method: "POST" }).catch(() => {});

      await logAktivitas({
        modul: "Kasbon",
        aktivitas: `Menyetujui kasbon ${ksb.pelanggan?.nama || ""} sebesar Rp ${Number(ksb.jumlah_kasbon).toLocaleString("id-ID")}`,
        dataSebelum: { status: ksb.status },
        dataSesudah: { status: "disetujui" },
      });

      await fetchAll();
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
      const { error: updErr } = await supabase
        .from("kasbon")
        .update({
          status: "ditolak",
          alasan_penolakan: alasanPenolakan.trim(),
          tanggal_keputusan: new Date().toISOString(),
        })
        .eq("id", tolakModal.id);
      if (updErr) throw updErr;

      if (tolakModal.transaksi_id) {
        await supabase
          .from("transaksi")
          .update({
            status_bayar: "dibatalkan",
            sisa_tagihan: 0,
          })
          .eq("id", tolakModal.transaksi_id);
      }

      await logAktivitas({
        modul: "Kasbon",
        aktivitas: `Menolak kasbon ${tolakModal.pelanggan?.nama || ""}: ${alasanPenolakan}`,
        dataSebelum: { status: tolakModal.status },
        dataSesudah: { status: "ditolak", alasan_penolakan: alasanPenolakan },
      });

      setTolakModal(null);
      setAlasanPenolakan("");
      await fetchAll();
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
      const payload = {
        nama: pelangganForm.nama.trim(),
        jenis: pelangganForm.jenis,
        kontak: pelangganForm.kontak.trim() || null,
        alamat: pelangganForm.alamat.trim() || null,
        batas_kasbon: Number(pelangganForm.batas_kasbon) || 0,
        status_kasbon: pelangganForm.status_kasbon,
      };

      if (editingPelanggan) {
        const { error: updErr } = await supabase
          .from("pelanggan")
          .update(payload)
          .eq("id", editingPelanggan.id);
        if (updErr) throw updErr;

        await logAktivitas({
          modul: "Pelanggan",
          aktivitas: `Mengubah data pelanggan ${payload.nama}`,
          dataSesudah: payload,
        });
      } else {
        const { error: insErr } = await supabase
          .from("pelanggan")
          .insert(payload);
        if (insErr) throw insErr;

        await logAktivitas({
          modul: "Pelanggan",
          aktivitas: `Menambah pelanggan baru ${payload.nama}`,
          dataSesudah: payload,
        });
      }

      setShowPelangganModal(false);
      await fetchAll();
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
      const { error: delErr } = await supabase
        .from("pelanggan")
        .delete()
        .eq("id", p.id);
      if (delErr) throw delErr;
      await logAktivitas({
        modul: "Pelanggan",
        aktivitas: `Menghapus pelanggan ${p.nama}`,
      });
      await fetchAll();
    } catch {
      setError(
        "Pelanggan tidak dapat dihapus karena masih memiliki riwayat transaksi/kasbon."
      );
    }
  };

  const totalPiutangAktif = tagihanList.reduce(
    (s, t) => s + Number(t.sisa_tagihan),
    0
  );
  const menungguCount = kasbonList.filter(
    (k) => k.status === "menunggu"
  ).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Piutang (Kasbon), Pembayaran Cicilan & Data Pelanggan
          </h1>
          <p className="text-sm text-gray-500">
            Persetujuan kasbon pelanggan, pencatatan pelunasan/cicilan piutang,
            dan batas kredit pelanggan
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingPelanggan(null);
            setPelangganForm({
              nama: "",
              jenis: "proyek",
              kontak: "",
              alamat: "",
              batas_kasbon: "25000000",
              status_kasbon: "aktif",
            });
            setShowPelangganModal(true);
          }}
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pelanggan</span>
        </Button>
      </div>

      {/* Ringkasan Kartu Piutang */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500">Total Sisa Piutang Aktif</p>
          <p className="text-xl font-bold text-red-600">
            Rp {totalPiutangAktif.toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Dari {tagihanList.length} nota belum lunas
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500">
            Pengajuan Kasbon Menunggu Persetujuan
          </p>
          <p className="text-xl font-bold text-amber-600">
            {menungguCount} Pengajuan
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Total {kasbonList.length} riwayat kasbon tercatat
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500">Total Pelanggan Terdaftar</p>
          <p className="text-xl font-bold text-blue-600">
            {pelangganList.length} Pelanggan
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Kontraktor proyek & perorangan
          </p>
        </div>
      </div>

      {/* Tab Navigasi */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 print:hidden">
        <button
          onClick={() => setActiveTab("tagihan")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === "tagihan"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          <Banknote className="w-4 h-4" />
          <span>Tagihan & Pembayaran Piutang ({tagihanList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("persetujuan")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === "persetujuan"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>
            Persetujuan Kasbon ({menungguCount} Menunggu)
          </span>
        </button>
        <button
          onClick={() => setActiveTab("pelanggan")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === "pelanggan"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Master Data Pelanggan ({pelangganList.length})</span>
        </button>
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

      {/* TAB 1: TAGIHAN & PEMBAYARAN PIUTANG (BYR-01..06) */}
      {activeTab === "tagihan" && (
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle>
              Daftar Nota Piutang Belum Lunas (Cicilan / Pelunasan)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-sm text-gray-500">
                Memuat daftar tagihan piutang...
              </div>
            ) : tagihanList.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">
                Tidak ada nota piutang yang belum lunas saat ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                      <th className="py-3 px-4">No. Nota</th>
                      <th className="py-3 px-4">Pelanggan</th>
                      <th className="py-3 px-4 text-right">Total Nota</th>
                      <th className="py-3 px-4 text-right">Sudah Dibayar</th>
                      <th className="py-3 px-4 text-right">Sisa Tagihan</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Tanggal Nota</th>
                      <th className="py-3 px-4 text-center">Aksi Pembayaran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-sm">
                    {tagihanList.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-xs font-bold text-blue-600">
                          {t.no_nota}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {t.pelanggan?.nama || "Pelanggan"}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-700">
                          Rp {Number(t.total).toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-4 text-right text-emerald-700 font-medium">
                          Rp {Number(t.jumlah_dibayar).toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-red-600">
                          Rp {Number(t.sisa_tagihan).toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-amber-50 text-amber-700 uppercase">
                            {t.status_bayar}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500">
                          {new Date(t.tanggal).toLocaleDateString("id-ID")}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            size="sm"
                            onClick={() => {
                              setBayarModal(t);
                              setNominalBayar(String(t.sisa_tagihan));
                              setMetodeBayar("tunai");
                            }}
                          >
                            <Banknote className="w-3.5 h-3.5" />
                            <span>Bayar Cicilan / Lunas</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 2: PERSETUJUAN KASBON (KSB-01..05) */}
      {activeTab === "persetujuan" && (
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle>
              Daftar Pengajuan & Riwayat Persetujuan Kasbon Pelanggan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                    <th className="py-3 px-4">Tanggal Pengajuan</th>
                    <th className="py-3 px-4">Pelanggan</th>
                    <th className="py-3 px-4">No. Nota</th>
                    <th className="py-3 px-4 text-right">Nominal Kasbon</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Keterangan / Alasan</th>
                    <th className="py-3 px-4 text-center">Keputusan Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {kasbonList.map((k) => (
                    <tr key={k.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-xs text-gray-500">
                        {new Date(k.tanggal_pengajuan).toLocaleDateString(
                          "id-ID"
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {k.pelanggan?.nama || "—"}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-blue-600">
                        {k.transaksi?.no_nota || "—"}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-gray-900">
                        Rp {Number(k.jumlah_kasbon).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase ${
                            k.status === "disetujui" || k.status === "lunas"
                              ? "bg-emerald-50 text-emerald-700"
                              : k.status === "ditolak"
                                ? "bg-red-50 text-red-700"
                                : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {k.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500">
                        {k.alasan_penolakan ||
                          (k.tanggal_keputusan
                            ? `Diputuskan ${new Date(k.tanggal_keputusan).toLocaleDateString("id-ID")}`
                            : "Menunggu verifikasi Admin")}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {k.status === "menunggu" ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              size="sm"
                              onClick={() => handleSetujuiKasbon(k)}
                              disabled={submitting}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Setujui</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setTolakModal(k);
                                setAlasanPenolakan("");
                              }}
                              disabled={submitting}
                            >
                              <XCircle className="w-3.5 h-3.5 text-red-600" />
                              <span>Tolak</span>
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Selesai</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: MASTER DATA PELANGGAN (PLG-01..06) */}
      {activeTab === "pelanggan" && (
        <div className="flex flex-col gap-4 print:hidden">
          <SearchField
            placeholder="Cari nama pelanggan, kontak, atau alamat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                      <th className="py-3 px-4">Nama Pelanggan</th>
                      <th className="py-3 px-4">Jenis</th>
                      <th className="py-3 px-4">Kontak</th>
                      <th className="py-3 px-4">Alamat</th>
                      <th className="py-3 px-4 text-right">Batas Kasbon</th>
                      <th className="py-3 px-4">Status Kasbon</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-sm">
                    {pelangganList
                      .filter(
                        (p) =>
                          p.nama.toLowerCase().includes(search.toLowerCase()) ||
                          (p.kontak || "")
                            .toLowerCase()
                            .includes(search.toLowerCase())
                      )
                      .map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-semibold text-gray-900">
                            {p.nama}
                          </td>
                          <td className="py-3 px-4 uppercase text-xs text-gray-600">
                            {p.jenis}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {p.kontak || "—"}
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-xs">
                            {p.alamat || "—"}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-gray-900">
                            Rp {Number(p.batas_kasbon).toLocaleString("id-ID")}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-50 text-emerald-700 font-medium">
                              {p.status_kasbon}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => {
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
                                }}
                                className="p-1.5 text-gray-500 hover:text-blue-600 rounded cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePelanggan(p)}
                                className="p-1.5 text-gray-500 hover:text-red-600 rounded cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL CATAT PEMBAYARAN PIUTANG (BYR-02..05) */}
      {bayarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900">
                Catat Pembayaran Piutang ({bayarModal.no_nota})
              </h3>
              <button
                onClick={() => setBayarModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={handleProsesPembayaranPiutang}
              className="flex flex-col gap-3"
            >
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Pelanggan:</span>
                  <span className="font-bold text-gray-900">
                    {bayarModal.pelanggan?.nama}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Tagihan Awal:</span>
                  <span>Rp {Number(bayarModal.total).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sisa Tagihan Saat Ini:</span>
                  <span className="font-bold text-red-600">
                    Rp {Number(bayarModal.sisa_tagihan).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div>
                <Label>Metode Pembayaran</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setMetodeBayar("tunai")}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold cursor-pointer ${
                      metodeBayar === "tunai"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-200"
                    }`}
                  >
                    Tunai (Kasir)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetodeBayar("transfer")}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold cursor-pointer ${
                      metodeBayar === "transfer"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-200"
                    }`}
                  >
                    Transfer Bank
                  </button>
                </div>
              </div>

              <div>
                <Label>Nominal Pembayaran (Rp)</Label>
                <Input
                  type="number"
                  min={1}
                  max={Number(bayarModal.sisa_tagihan)}
                  value={nominalBayar}
                  onChange={(e) => setNominalBayar(e.target.value)}
                  required
                />
              </div>

              {metodeBayar === "transfer" && (
                <div>
                  <Label>Nomor Referensi / Bukti Transfer</Label>
                  <Input
                    placeholder="Contoh: TF-BCA-998123"
                    value={buktiTransferRef}
                    onChange={(e) => setBuktiTransferRef(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setBayarModal(null)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Menyimpan..." : "Simpan & Cetak Bukti"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TOLAK KASBON (KSB-04) */}
      {tolakModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900">
                Tolak Pengajuan Kasbon
              </h3>
              <button
                onClick={() => setTolakModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleTolakKasbon} className="flex flex-col gap-3">
              <div>
                <Label>Alasan Penolakan (Wajib Diisi)</Label>
                <Input
                  placeholder="Contoh: Melebihi plafon kredit / tagihan sebelumnya belum lunas"
                  value={alasanPenolakan}
                  onChange={(e) => setAlasanPenolakan(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setTolakModal(null)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={submitting}>
                  Tolak Kasbon
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH / EDIT PELANGGAN */}
      {showPelangganModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900">
                {editingPelanggan
                  ? "Ubah Data Pelanggan"
                  : "Tambah Pelanggan Baru"}
              </h3>
              <button
                onClick={() => setShowPelangganModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={handleSavePelanggan}
              className="flex flex-col gap-3"
            >
              <div>
                <Label>Nama Pelanggan / Perusahaan</Label>
                <Input
                  placeholder="Contoh: PT Maju Jaya Konstruksi"
                  value={pelangganForm.nama}
                  onChange={(e) =>
                    setPelangganForm({ ...pelangganForm, nama: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Jenis Pelanggan</Label>
                  <select
                    value={pelangganForm.jenis}
                    onChange={(e) =>
                      setPelangganForm({
                        ...pelangganForm,
                        jenis: e.target.value as JenisPelanggan,
                      })
                    }
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm bg-white"
                  >
                    <option value="proyek">Proyek / Kontraktor</option>
                    <option value="perorangan">Perorangan</option>
                  </select>
                </div>
                <div>
                  <Label>No. Telepon / WA</Label>
                  <Input
                    placeholder="0812..."
                    value={pelangganForm.kontak}
                    onChange={(e) =>
                      setPelangganForm({
                        ...pelangganForm,
                        kontak: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Alamat Lengkap</Label>
                <Input
                  placeholder="Alamat proyek / rumah..."
                  value={pelangganForm.alamat}
                  onChange={(e) =>
                    setPelangganForm({
                      ...pelangganForm,
                      alamat: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Batas Maksimal Kasbon (Rp)</Label>
                <Input
                  type="number"
                  value={pelangganForm.batas_kasbon}
                  onChange={(e) =>
                    setPelangganForm({
                      ...pelangganForm,
                      batas_kasbon: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowPelangganModal(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={submitting}>
                  Simpan Pelanggan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CETAK BUKTI PEMBAYARAN PIUTANG (BYR-05) */}
      {kwitansiBayar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:static print:bg-white print:p-0">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl flex flex-col gap-4 print:shadow-none">
            <div className="font-mono text-xs border border-dashed border-gray-400 p-4 rounded flex flex-col gap-2">
              <div className="text-center border-b border-dashed pb-2">
                <p className="font-bold text-sm">CV KURNIA MANDIRI</p>
                <p className="text-[10px] text-gray-500">
                  BUKTI PEMBAYARAN PIUTANG / KASBON
                </p>
              </div>
              <div className="flex justify-between">
                <span>No. Nota:</span>
                <span className="font-bold">{kwitansiBayar.noNota}</span>
              </div>
              <div className="flex justify-between">
                <span>Pelanggan:</span>
                <span>{kwitansiBayar.pelanggan}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal Bayar:</span>
                <span>{kwitansiBayar.tanggal}</span>
              </div>
              <div className="flex justify-between">
                <span>Metode:</span>
                <span>{kwitansiBayar.metode}</span>
              </div>
              <div className="border-t border-dashed pt-2 flex justify-between font-bold text-sm">
                <span>DIBAYAR:</span>
                <span>Rp {kwitansiBayar.nominal.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Sisa Tagihan:</span>
                <span>Rp {kwitansiBayar.sisaBaru.toLocaleString("id-ID")}</span>
              </div>
            </div>
            <div className="flex gap-2 print:hidden">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setKwitansiBayar(null)}
              >
                Tutup
              </Button>
              <Button className="flex-1" onClick={() => window.print()}>
                <Printer className="w-4 h-4" />
                <span>Cetak Bukti</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
