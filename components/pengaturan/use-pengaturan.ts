"use client";

import { useState, useEffect, useCallback } from "react";
import type { Role, StatusAkun } from "@/lib/types";
import {
  DEFAULT_USERS,
  DEFAULT_LOGS,
  DEFAULT_NOTIFS,
  muatSemuaPengaturan,
  simpanPengaturanSistemSupabase,
  tambahPenggunaBaruSupabase,
  ubahRolePenggunaSupabase,
  resetPasswordPenggunaSupabase,
  ubahStatusPenggunaSupabase,
  unduhCsvLogAktivitas,
  picuCronNotifikasiApi,
  type UserRow,
  type LogRow,
  type NotifRow,
  type TabPengaturan,
} from "./layanan-pengaturan";

export function usePengaturan() {
  const [activeTab, setActiveTab] = useState<TabPengaturan>("sistem");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [notifEnabled, setNotifEnabled] = useState(true);
  const [saluranNotif, setSaluranNotif] = useState<"email" | "whatsapp">(
    "email"
  );
  const [penerimaNotif, setPenerimaNotif] = useState(
    "muhamadirfan.mi966@gmail.com"
  );
  const [notifDetail, setNotifDetail] = useState(
    "Email Resend (onboarding@resend.dev) + Outbox pg_cron"
  );
  const [penyediaGateway, setPenyediaGateway] = useState("midtrans");
  const [kunciApi, setKunciApi] = useState("SB-Mid-server-****-7O5s");
  const [gatewayName, setGatewayName] = useState("Midtrans Snap Sandbox");
  const [gatewayDetail, setGatewayDetail] = useState(
    "QRIS & Virtual Account (Server Key: ****-7O5s | Client Key: ****-M41f)"
  );

  const [users, setUsers] = useState<UserRow[]>(DEFAULT_USERS);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({
    nama: "",
    username: "",
    password: "",
    role: "kasir" as Role,
  });

  const [logs, setLogs] = useState<LogRow[]>(DEFAULT_LOGS);
  const [filterModul, setFilterModul] = useState("SEMUA");
  const [notifs, setNotifs] = useState<NotifRow[]>(DEFAULT_NOTIFS);

  const fetchAllSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await muatSemuaPengaturan();
      if (data.settings) {
        setNotifEnabled(data.settings.notifikasi);
        setSaluranNotif(
          (data.settings.saluran_notifikasi as "email" | "whatsapp") || "email"
        );
        setPenerimaNotif(
          data.settings.penerima_notifikasi || "muhamadirfan.mi966@gmail.com"
        );
        setNotifDetail(data.settings.notifikasi_detail || "");
        setPenyediaGateway(data.settings.penyedia_gateway || "midtrans");
        setKunciApi(data.settings.kunci_api || "SB-Mid-server-****-7O5s");
        setGatewayName(data.settings.gateway || "Midtrans");
        setGatewayDetail(data.settings.gateway_detail || "");
      }
      setUsers(data.users);
      setLogs(data.logs);
      setNotifs(data.notifs);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllSettings();
  }, [fetchAllSettings]);

  const handleSaveSystemSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      await simpanPengaturanSistemSupabase({
        notifEnabled,
        saluranNotif,
        penerimaNotif,
        notifDetail,
        penyediaGateway,
        kunciApi,
        gatewayName,
        gatewayDetail,
      });
      setMessage("Konfigurasi sistem berhasil disimpan ke database.");
      await fetchAllSettings();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menyimpan pengaturan"
      );
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const cleanUsername = await tambahPenggunaBaruSupabase(userForm);
      setShowUserModal(false);
      setUserForm({ nama: "", username: "", password: "", role: "kasir" });
      setMessage(`Akun @${cleanUsername} berhasil dibuat.`);
      await fetchAllSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat akun");
    }
  };

  const handleChangeUserRole = async (u: UserRow, newRole: Role) => {
    setError(null);
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

    const err = await ubahRolePenggunaSupabase(u, newRole);
    if (!err) {
      await fetchAllSettings();
    }
  };

  const handleResetPassword = async (u: UserRow) => {
    const newPass = window.prompt(
      `Masukkan password baru untuk akun @${u.username}:`,
      `${u.username}123`
    );
    if (!newPass) return;

    const err = await resetPasswordPenggunaSupabase(u, newPass);
    if (!err) {
      setMessage(`Password untuk @${u.username} berhasil direset.`);
    }
  };

  const handleToggleUserStatus = async (u: UserRow) => {
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

    const err = await ubahStatusPenggunaSupabase(u, nextStatus);
    if (!err) {
      await fetchAllSettings();
    }
  };

  const handleDownloadLogsCSV = () => {
    unduhCsvLogAktivitas(logs);
  };

  const handleTriggerCronNotif = async () => {
    setMessage(null);
    try {
      const data = await picuCronNotifikasiApi();
      setMessage(
        `Outbox diproses: ${data.processed || 0} antrean diperiksa (${data.sent || 0} terkirim).`
      );
      await fetchAllSettings();
    } catch {
      setError("Gagal memicu cron notifikasi");
    }
  };

  const modulList = [
    "SEMUA",
    ...Array.from(new Set(logs.map((l) => l.modul))),
  ];

  return {
    activeTab,
    setActiveTab,
    loading,
    message,
    error,
    notifEnabled,
    setNotifEnabled,
    saluranNotif,
    setSaluranNotif,
    penerimaNotif,
    setPenerimaNotif,
    notifDetail,
    setNotifDetail,
    penyediaGateway,
    setPenyediaGateway,
    kunciApi,
    setKunciApi,
    gatewayName,
    setGatewayName,
    gatewayDetail,
    setGatewayDetail,
    users,
    showUserModal,
    setShowUserModal,
    userForm,
    setUserForm,
    logs,
    filterModul,
    setFilterModul,
    modulList,
    notifs,
    fetchAllSettings,
    handleSaveSystemSettings,
    handleCreateUser,
    handleChangeUserRole,
    handleToggleUserStatus,
    handleResetPassword,
    handleDownloadLogsCSV,
    handleTriggerCronNotif,
  };
}
