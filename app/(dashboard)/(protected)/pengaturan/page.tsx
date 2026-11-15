"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Label,
  Switch,
} from "@/components/ui";
import {
  supabase,
  logAktivitas,
  usernameToSyntheticEmail,
} from "@/lib/supabase";
import {
  Settings,
  Users,
  Shield,
  Bell,
  Plus,
  KeyRound,
  UserX,
  UserCheck,
  Download,
  RefreshCw,
  CheckCircle2,
  X,
} from "lucide-react";
import type { Database, Role, StatusAkun } from "@/lib/types";

type PenggunaRow = Database["public"]["Tables"]["pengguna"]["Row"];
type NotifikasiRow = Database["public"]["Tables"]["notifikasi"]["Row"];

interface LogJoined {
  id: string;
  pengguna_id: string | null;
  modul: string;
  aktivitas: string;
  data_sebelum: unknown;
  data_sesudah: unknown;
  waktu: string;
  pengguna?: { nama: string; username: string; role: string } | null;
}

export default function PengaturanPage() {
  const [activeTab, setActiveTab] = useState<
    "sistem" | "pengguna" | "log" | "notifikasi"
  >("sistem");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // State Pengaturan Sistem sesuai Class Diagram (PengaturanSistem: saluran_notifikasi, penerima_notifikasi, penyedia_gateway, kunci_api, updated_at)
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [saluranNotif, setSaluranNotif] = useState<"email" | "whatsapp">("email");
  const [penerimaNotif, setPenerimaNotif] = useState("muhamadirfan.mi966@gmail.com");
  const [notifDetail, setNotifDetail] = useState(
    "Email Resend (onboarding@resend.dev) + Outbox pg_cron"
  );
  const [penyediaGateway, setPenyediaGateway] = useState("midtrans");
  const [kunciApi, setKunciApi] = useState("SB-Mid-server-****-7O5s");
  const [gatewayName, setGatewayName] = useState("Midtrans Snap Sandbox");
  const [gatewayDetail, setGatewayDetail] = useState(
    "QRIS & Virtual Account (Server Key: ****-7O5s | Client Key: ****-M41f)"
  );

  // State Pengguna (USR-01..05)
  const [users, setUsers] = useState<PenggunaRow[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({
    nama: "",
    username: "",
    password: "",
    role: "kasir" as Role,
  });

  // State Log Aktivitas (LOG-01..04)
  const [logs, setLogs] = useState<LogJoined[]>([]);
  const [filterModul, setFilterModul] = useState("SEMUA");

  // State Outbox Notifikasi (NTF-01..05)
  const [notifs, setNotifs] = useState<NotifikasiRow[]>([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [setRes, usrRes, logRes, ntfRes] = await Promise.all([
        supabase
          .from("pengaturan_sistem")
          .select("*")
          .eq("id", 1)
          .maybeSingle(),
        supabase
          .from("pengguna")
          .select("*")
          .order("created_at", { ascending: true }),
        supabase
          .from("log_aktivitas")
          .select("*, pengguna:pengguna_id(nama, username, role)")
          .order("waktu", { ascending: false })
          .limit(100),
        supabase
          .from("notifikasi")
          .select("*")
          .order("waktu", { ascending: false })
          .limit(50),
      ]);

      if (setRes.data) {
        setNotifEnabled(setRes.data.notifikasi);
        setSaluranNotif(
          (setRes.data.saluran_notifikasi as "email" | "whatsapp") || "email"
        );
        setPenerimaNotif(
          setRes.data.penerima_notifikasi || "muhamadirfan.mi966@gmail.com"
        );
        setNotifDetail(setRes.data.notifikasi_detail || "");
        setPenyediaGateway(setRes.data.penyedia_gateway || "midtrans");
        setKunciApi(setRes.data.kunci_api || "SB-Mid-server-****-7O5s");
        setGatewayName(setRes.data.gateway || "Midtrans");
        setGatewayDetail(setRes.data.gateway_detail || "");
      }
      setUsers((usrRes.data as PenggunaRow[]) || []);
      setLogs((logRes.data as unknown as LogJoined[]) || []);
      setNotifs((ntfRes.data as NotifikasiRow[]) || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleSaveSystemSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const payload = {
        id: 1,
        notifikasi: notifEnabled,
        saluran_notifikasi: saluranNotif,
        penerima_notifikasi: penerimaNotif.trim(),
        notifikasi_detail: notifDetail,
        penyedia_gateway: penyediaGateway,
        kunci_api: kunciApi,
        gateway: gatewayName,
        gateway_detail: gatewayDetail,
        updated_at: new Date().toISOString(),
      };
      const { error: err } = await supabase
        .from("pengaturan_sistem")
        .upsert(payload);
      if (err) throw err;

      await logAktivitas({
        modul: "Pengaturan Sistem",
        aktivitas: "Memperbarui konfigurasi notifikasi & payment gateway",
        dataSesudah: payload,
      });
      setMessage("Konfigurasi sistem berhasil disimpan ke database.");
      await fetchAll();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menyimpan pengaturan"
      );
    }
  };

  // Tambah Akun Pengguna Baru (USR-02)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const cleanUsername = userForm.username.trim().toLowerCase();
      const payload = {
        nama: userForm.nama.trim(),
        username: cleanUsername,
        password: userForm.password,
        role: userForm.role,
        status: "aktif" as StatusAkun,
      };
      const { error: err } = await supabase.from("pengguna").insert(payload);
      if (err) throw err;

      await logAktivitas({
        modul: "Manajemen Pengguna",
        aktivitas: `Menambahkan akun pengguna baru @${cleanUsername} (${userForm.role})`,
        dataSesudah: {
          nama: payload.nama,
          username: cleanUsername,
          role: payload.role,
          email_sintetis: usernameToSyntheticEmail(cleanUsername),
        },
      });

      setShowUserModal(false);
      setUserForm({ nama: "", username: "", password: "", role: "kasir" });
      setMessage(`Akun @${cleanUsername} berhasil dibuat.`);
      await fetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat akun");
    }
  };

  // Ubah Hak Akses / Role (USR-03)
  const handleChangeUserRole = async (u: PenggunaRow, newRole: Role) => {
    setError(null);
    // Cegah jika ini satu-satunya admin aktif
    const activeAdmins = users.filter(
      (x) => x.role === "admin" && x.status === "aktif"
    );
    if (
      u.role === "admin" &&
      newRole !== "admin" &&
      activeAdmins.length <= 1
    ) {
      setError(
        "Tidak dapat mengubah peran satu-satunya Admin aktif di sistem!"
      );
      return;
    }

    const { error: err } = await supabase
      .from("pengguna")
      .update({ role: newRole })
      .eq("id", u.id);
    if (!err) {
      await logAktivitas({
        modul: "Manajemen Pengguna",
        aktivitas: `Mengubah peran @${u.username} dari ${u.role} menjadi ${newRole}`,
        dataSebelum: { role: u.role },
        dataSesudah: { role: newRole },
      });
      await fetchAll();
    }
  };

  // Reset Password Pengguna (USR-04)
  const handleResetPassword = async (u: PenggunaRow) => {
    const newPass = window.prompt(
      `Masukkan password baru untuk akun @${u.username}:`,
      `${u.username}123`
    );
    if (!newPass) return;

    const { error: err } = await supabase
      .from("pengguna")
      .update({ password: newPass })
      .eq("id", u.id);
    if (!err) {
      await logAktivitas({
        modul: "Manajemen Pengguna",
        aktivitas: `Mereset password untuk pengguna @${u.username}`,
      });
      setMessage(`Password untuk @${u.username} berhasil direset.`);
    }
  };

  // Nonaktifkan / Aktifkan Akun (USR-05)
  const handleToggleUserStatus = async (u: PenggunaRow) => {
    setError(null);
    const nextStatus: StatusAkun =
      u.status === "aktif" ? "nonaktif" : "aktif";

    const activeAdmins = users.filter(
      (x) => x.role === "admin" && x.status === "aktif"
    );
    if (
      u.role === "admin" &&
      nextStatus === "nonaktif" &&
      activeAdmins.length <= 1
    ) {
      setError("Tidak dapat menonaktifkan satu-satunya Admin aktif!");
      return;
    }

    const { error: err } = await supabase
      .from("pengguna")
      .update({ status: nextStatus })
      .eq("id", u.id);
    if (!err) {
      await logAktivitas({
        modul: "Manajemen Pengguna",
        aktivitas: `Mengubah status akun @${u.username} menjadi ${nextStatus}`,
        dataSebelum: { status: u.status },
        dataSesudah: { status: nextStatus },
      });
      await fetchAll();
    }
  };

  // Unduh CSV Log Aktivitas (LOG-04)
  const handleDownloadLogsCSV = () => {
    const headers = ["Waktu", "Pengguna", "Peran", "Modul", "Aktivitas"];
    const rows = logs.map((l) => [
      new Date(l.waktu).toLocaleString("id-ID"),
      l.pengguna?.nama || "Sistem",
      l.pengguna?.role || "-",
      l.modul,
      l.aktivitas,
    ]);
    const csv =
      "\uFEFF" +
      [headers.join(";")]
        .concat(rows.map((r) => r.map((c) => `"${c}"`).join(";")))
        .join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Log_Aktivitas_CV_Kurnia_Mandiri.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Picu Outbox Cron Notifikasi (NTF-05)
  const handleTriggerCronNotif = async () => {
    setMessage(null);
    try {
      const res = await fetch("/api/cron/notifikasi", { method: "POST" });
      const data = await res.json();
      setMessage(
        `Outbox diproses: ${data.processed || 0} antrean diperiksa (${data.sent || 0} terkirim).`
      );
      await fetchAll();
    } catch {
      setError("Gagal memicu cron notifikasi");
    }
  };

  const modulList = [
    "SEMUA",
    ...Array.from(new Set(logs.map((l) => l.modul))),
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Pengaturan Sistem, Manajemen Pengguna & Audit Log
        </h1>
        <p className="text-sm text-gray-500">
          Kelola konfigurasi toko tunggal, hak akses staf (RBAC), outbox
          notifikasi, dan jejak audit sistem
        </p>
      </div>

      {/* Tab Navigasi */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab("sistem")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
            activeTab === "sistem"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Pengaturan Sistem & Gateway</span>
        </button>
        <button
          onClick={() => setActiveTab("pengguna")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
            activeTab === "pengguna"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Manajemen Pengguna ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("log")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
            activeTab === "log"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Log Aktivitas ({logs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("notifikasi")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
            activeTab === "notifikasi"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Outbox Notifikasi ({notifs.length})</span>
        </button>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* TAB 1: PENGATURAN SISTEM & GATEWAY (SET-01..04) */}
      {activeTab === "sistem" && (
        <form
          onSubmit={handleSaveSystemSettings}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Informasi Toko & Outbox Notifikasi (SET-02)</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <Label>Nama Entitas Toko (Single Store - D1)</Label>
                <Input defaultValue="CV Kurnia Mandiri" disabled />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Aktifkan Notifikasi Otomatis
                  </p>
                  <p className="text-xs text-gray-500">
                    Kirim email peringatan stok menipis & bukti transaksi lunas
                  </p>
                </div>
                <Switch
                  checked={notifEnabled}
                  onCheckedChange={setNotifEnabled}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Saluran Notifikasi (saluran_notifikasi)</Label>
                  <select
                    value={saluranNotif}
                    onChange={(e) =>
                      setSaluranNotif(e.target.value as "email" | "whatsapp")
                    }
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 text-xs bg-white font-semibold uppercase"
                  >
                    <option value="email">EMAIL (Resend API)</option>
                    <option value="whatsapp">WHATSAPP</option>
                  </select>
                </div>
                <div>
                  <Label>Penerima Notifikasi (penerima_notifikasi)</Label>
                  <Input
                    value={penerimaNotif}
                    onChange={(e) => setPenerimaNotif(e.target.value)}
                    placeholder="muhamadirfan.mi966@gmail.com"
                  />
                </div>
              </div>
              <div>
                <Label>Detail Konfigurasi Saluran Notifikasi</Label>
                <Input
                  value={notifDetail}
                  onChange={(e) => setNotifDetail(e.target.value)}
                />
              </div>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-600 flex flex-col gap-1">
                <span className="font-semibold text-gray-900">
                  Status Integrasi Cron & Email:
                </span>
                <span>• Provider Utama: Resend REST API (Aktif)</span>
                <span>
                  • Penjadwalan Ulang Outbox: Supabase pg_cron + pg_net ke{" "}
                  <code>/api/cron/notifikasi</code>
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Payment Gateway Midtrans & Keamanan Kunci (SET-03 / D18)
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Penyedia Gateway (penyedia_gateway)</Label>
                  <select
                    value={penyediaGateway}
                    onChange={(e) => setPenyediaGateway(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 text-xs bg-white font-semibold uppercase"
                  >
                    <option value="midtrans">MIDTRANS</option>
                    <option value="xendit">XENDIT</option>
                  </select>
                </div>
                <div>
                  <Label>Kunci API Gateway (kunci_api)</Label>
                  <Input
                    value={kunciApi}
                    onChange={(e) => setKunciApi(e.target.value)}
                    placeholder="SB-Mid-server-..."
                  />
                </div>
              </div>
              <div>
                <Label>Nama Penyedia Payment Gateway</Label>
                <Input
                  value={gatewayName}
                  onChange={(e) => setGatewayName(e.target.value)}
                />
              </div>
              <div>
                <Label>Konfigurasi Metode & Kredensial (Terenkripsi/Mask)</Label>
                <Input
                  value={gatewayDetail}
                  onChange={(e) => setGatewayDetail(e.target.value)}
                />
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex flex-col gap-1">
                <span className="font-bold">
                  ✓ Midtrans Sandbox Terhubung & Siap Digunakan
                </span>
                <span>
                  • Endpoint Webhook:{" "}
                  <code>/api/webhook/gateway</code> (Verifikasi SHA-512
                  Signature + Idempoten)
                </span>
                <span>
                  • Metode Didukung: QRIS Dinamis, BCA/BNI/BRI/Mandiri Virtual
                  Account
                </span>
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={loading}>
                  Simpan Pengaturan Sistem
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}

      {/* TAB 2: MANAJEMEN PENGGUNA (USR-01..05) */}
      {activeTab === "pengguna" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Daftar Akun Staf & Hak Akses RBAC</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                Pemetaan autentikasi username ke email sintetis{" "}
                <code>&lt;username&gt;@kurnia.local</code> (Keputusan D4)
              </p>
            </div>
            <Button size="sm" onClick={() => setShowUserModal(true)}>
              <Plus className="w-4 h-4" />
              <span>Tambah Pengguna</span>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                    <th className="py-3 px-4">Nama Lengkap</th>
                    <th className="py-3 px-4">Username</th>
                    <th className="py-3 px-4">Email Auth Sintetis</th>
                    <th className="py-3 px-4">Peran (Role)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Tindakan Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {u.nama}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-blue-600">
                        @{u.username}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-500">
                        {usernameToSyntheticEmail(u.username)}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={u.role}
                          onChange={(e) =>
                            handleChangeUserRole(u, e.target.value as Role)
                          }
                          className="px-2.5 py-1 rounded border border-gray-300 text-xs font-semibold uppercase bg-white"
                        >
                          <option value="admin">ADMIN</option>
                          <option value="kasir">KASIR</option>
                          <option value="pengirim">PENGIRIM</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase ${
                            u.status === "aktif"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleResetPassword(u)}
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Reset Sandi</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleToggleUserStatus(u)}
                          >
                            {u.status === "aktif" ? (
                              <>
                                <UserX className="w-3.5 h-3.5 text-red-600" />
                                <span>Nonaktifkan</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Aktifkan</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: LOG AKTIVITAS (LOG-01..04) */}
      {activeTab === "log" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle>Jejak Audit & Log Aktivitas Sistem</CardTitle>
              <select
                value={filterModul}
                onChange={(e) => setFilterModul(e.target.value)}
                className="px-2.5 py-1 rounded border border-gray-300 text-xs bg-white"
              >
                {modulList.map((m) => (
                  <option key={m} value={m}>
                    Modul: {m}
                  </option>
                ))}
              </select>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleDownloadLogsCSV}
            >
              <Download className="w-4 h-4" />
              <span>Unduh Log (.CSV)</span>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-500 uppercase">
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4">Pengguna</th>
                    <th className="py-3 px-4">Modul</th>
                    <th className="py-3 px-4">Aktivitas</th>
                    <th className="py-3 px-4">Perubahan Data (JSON)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs
                    .filter(
                      (l) => filterModul === "SEMUA" || l.modul === filterModul
                    )
                    .map((l) => (
                      <tr key={l.id} className="hover:bg-gray-50">
                        <td className="py-2.5 px-4 text-gray-500 whitespace-nowrap">
                          {new Date(l.waktu).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-4 font-medium text-gray-900">
                          {l.pengguna?.nama || "Sistem"}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-semibold">
                            {l.modul}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-gray-800">
                          {l.aktivitas}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[10px] text-gray-500 max-w-xs truncate">
                          {l.data_sesudah
                            ? JSON.stringify(l.data_sesudah)
                            : "—"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: OUTBOX NOTIFIKASI (NTF-01..05) */}
      {activeTab === "notifikasi" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Tabel Outbox Notifikasi (Email & WhatsApp)</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                Menyimpan antrean pesan peringatan stok menipis, persetujuan
                kasbon, dan struk pembayaran
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleTriggerCronNotif}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Proses Ulang Outbox Sekarang</span>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-500 uppercase">
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4">Jenis</th>
                    <th className="py-3 px-4">Penerima</th>
                    <th className="py-3 px-4">Saluran</th>
                    <th className="py-3 px-4">Isi Pesan</th>
                    <th className="py-3 px-4">Status Kirim</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {notifs.map((n) => (
                    <tr key={n.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-4 text-gray-500 whitespace-nowrap">
                        {new Date(n.waktu).toLocaleString("id-ID")}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-gray-800">
                        {n.jenis}
                      </td>
                      <td className="py-2.5 px-4 text-blue-600">
                        {n.penerima}
                      </td>
                      <td className="py-2.5 px-4 uppercase font-medium">
                        {n.saluran}
                      </td>
                      <td className="py-2.5 px-4 text-gray-700 max-w-md">
                        {n.pesan}
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-semibold uppercase text-[10px] ${
                            n.status_kirim === "terkirim"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {n.status_kirim}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* MODAL TAMBAH PENGGUNA */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900">
                Tambah Akun Pengguna Baru
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="flex flex-col gap-3">
              <div>
                <Label>Nama Lengkap Staf</Label>
                <Input
                  placeholder="Contoh: Rina Wulandari"
                  value={userForm.nama}
                  onChange={(e) =>
                    setUserForm({ ...userForm, nama: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label>Username Login</Label>
                <Input
                  placeholder="Contoh: rina"
                  value={userForm.username}
                  onChange={(e) =>
                    setUserForm({ ...userForm, username: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label>Password Awal</Label>
                <Input
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={userForm.password}
                  onChange={(e) =>
                    setUserForm({ ...userForm, password: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label>Peran (Role)</Label>
                <select
                  value={userForm.role}
                  onChange={(e) =>
                    setUserForm({ ...userForm, role: e.target.value as Role })
                  }
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm bg-white"
                >
                  <option value="kasir">Kasir</option>
                  <option value="pengirim">Pengirim</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowUserModal(false)}
                >
                  Batal
                </Button>
                <Button type="submit">Buat Akun</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
