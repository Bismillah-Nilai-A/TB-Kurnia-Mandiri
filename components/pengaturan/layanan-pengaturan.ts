import {
  supabase,
  logAktivitas,
  usernameToSyntheticEmail,
} from "@/lib/supabase";
import type { Database, Role, StatusAkun } from "@/lib/types";

export type UserRow = Database["public"]["Tables"]["pengguna"]["Row"];
export type PenggunaRow = UserRow;
export type NotifRow = Database["public"]["Tables"]["notifikasi"]["Row"];
export type NotifikasiRow = NotifRow;

export interface LogRow {
  id: string;
  id_log?: string;
  pengguna_id: string | null;
  modul: string;
  aktivitas: string;
  data_sebelum: unknown;
  data_sesudah: unknown;
  waktu: string;
  pengguna?: { nama: string; username: string; role: string } | null;
}
export type LogJoined = LogRow;

export type TabPengaturan = "sistem" | "pengguna" | "log" | "notifikasi";

export interface LocalSystemConfig {
  id: number;
  notifikasi: boolean;
  saluran_notifikasi: "email" | "whatsapp";
  penerima_notifikasi: string;
  notifikasi_detail: string;
  penyedia_gateway: string;
  kunci_api: string;
  gateway: string;
  gateway_detail: string;
  updated_at: string;
}

const SYSTEM_SETTINGS_STORAGE_KEY = "cvkm_pos_system_config_v1";

export const DEFAULT_SYSTEM_CONFIG: LocalSystemConfig = {
  id: 1,
  notifikasi: true,
  saluran_notifikasi: "email",
  penerima_notifikasi: "muhamadirfan.mi966@gmail.com",
  notifikasi_detail: "Email Resend (onboarding@resend.dev) + Outbox pg_cron",
  penyedia_gateway: "midtrans",
  kunci_api: "SB-Mid-server-****-7O5s",
  gateway: "Midtrans Snap Sandbox",
  gateway_detail:
    "QRIS & Virtual Account (Server Key: ****-7O5s | Client Key: ****-M41f)",
  updated_at: new Date().toISOString(),
};

export const DEFAULT_USERS: UserRow[] = [];
export const DEFAULT_LOGS: LogRow[] = [];
export const DEFAULT_NOTIFS: NotifRow[] = [];

export async function muatSemuaPengaturan() {
  const [usrRes, logRes, ntfRes] = await Promise.all([
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

  let settings: LocalSystemConfig = DEFAULT_SYSTEM_CONFIG;
  if (typeof window !== "undefined") {
    try {
      const saved = window.localStorage.getItem(SYSTEM_SETTINGS_STORAGE_KEY);
      if (saved) {
        settings = { ...DEFAULT_SYSTEM_CONFIG, ...JSON.parse(saved) };
      }
    } catch {
      // Gunakan default
    }
  }

  const users: UserRow[] = ((usrRes.data || []) as Array<Record<string, unknown>>).map((u) => ({
    ...(u as unknown as UserRow),
    id_pengguna: String(u.id_pengguna || u.id),
    id: String(u.id_pengguna || u.id),
  }));

  const logs: LogRow[] = ((logRes.data || []) as Array<Record<string, unknown>>).map((l) => ({
    ...(l as unknown as LogRow),
    id_log: String(l.id_log || l.id),
    id: String(l.id_log || l.id),
  }));

  const notifs: NotifRow[] = ((ntfRes.data || []) as Array<Record<string, unknown>>).map((n) => ({
    ...(n as unknown as NotifRow),
    id_notifikasi: String(n.id_notifikasi || n.id),
    id: String(n.id_notifikasi || n.id),
  }));

  return {
    settings,
    users,
    logs,
    notifs,
  };
}

export async function simpanPengaturanSistemSupabase(params: {
  notifEnabled: boolean;
  saluranNotif: "email" | "whatsapp";
  penerimaNotif: string;
  notifDetail: string;
  penyediaGateway: string;
  kunciApi: string;
  gatewayName: string;
  gatewayDetail: string;
}) {
  const payload: LocalSystemConfig = {
    id: 1,
    notifikasi: params.notifEnabled,
    saluran_notifikasi: params.saluranNotif,
    penerima_notifikasi: params.penerimaNotif.trim(),
    notifikasi_detail: params.notifDetail,
    penyedia_gateway: params.penyediaGateway,
    kunci_api: params.kunciApi,
    gateway: params.gatewayName,
    gateway_detail: params.gatewayDetail,
    updated_at: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(
        SYSTEM_SETTINGS_STORAGE_KEY,
        JSON.stringify(payload)
      );
    } catch {
      // Ignore storage error
    }
  }

  await logAktivitas({
    modul: "Pengaturan",
    aktivitas: "Simpan konfigurasi notifikasi & gateway".slice(0, 50),
    dataSesudah: payload as unknown as Database["public"]["Tables"]["log_aktivitas"]["Row"]["data_sesudah"],
  });
}

export async function tambahPenggunaBaruSupabase(userForm: {
  nama: string;
  username: string;
  password: string;
  role: Role;
}) {
  const cleanUsername = userForm.username.trim().toLowerCase().slice(0, 20);
  const payload = {
    nama: userForm.nama.trim().slice(0, 50),
    username: cleanUsername,
    password: userForm.password,
    role: userForm.role,
    status: "aktif" as StatusAkun,
  };
  const { error } = await supabase.from("pengguna").insert(payload);
  if (error) throw error;

  await logAktivitas({
    modul: "Pengguna",
    aktivitas: `Tambah akun @${cleanUsername} (${userForm.role})`.slice(0, 50),
    dataSesudah: {
      nama: payload.nama,
      username: cleanUsername,
      role: payload.role,
      email_sintetis: usernameToSyntheticEmail(cleanUsername),
    },
  });

  return cleanUsername;
}

export async function ubahRolePenggunaSupabase(u: UserRow, newRole: Role) {
  const { error } = await supabase
    .from("pengguna")
    .update({ role: newRole })
    .eq("id_pengguna", u.id_pengguna || u.id);
  if (!error) {
    await logAktivitas({
      modul: "Pengguna",
      aktivitas: `Ubah peran @${u.username} -> ${newRole}`.slice(0, 50),
      dataSebelum: { role: u.role },
      dataSesudah: { role: newRole },
    });
  }
  return error;
}

export async function resetPasswordPenggunaSupabase(
  u: UserRow,
  newPass: string
) {
  const { error } = await supabase
    .from("pengguna")
    .update({ password: newPass })
    .eq("id_pengguna", u.id_pengguna || u.id);
  if (!error) {
    await logAktivitas({
      modul: "Pengguna",
      aktivitas: `Reset password @${u.username}`.slice(0, 50),
    });
  }
  return error;
}

export async function ubahStatusPenggunaSupabase(
  u: UserRow,
  nextStatus: StatusAkun
) {
  const { error } = await supabase
    .from("pengguna")
    .update({ status: nextStatus })
    .eq("id_pengguna", u.id_pengguna || u.id);
  if (!error) {
    await logAktivitas({
      modul: "Pengguna",
      aktivitas: `Status akun @${u.username} -> ${nextStatus}`.slice(0, 50),
      dataSebelum: { status: u.status },
      dataSesudah: { status: nextStatus },
    });
  }
  return error;
}

export function unduhCsvLogAktivitas(logs: LogRow[]) {
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
}

export async function picuCronNotifikasiApi() {
  const res = await fetch("/api/cron/notifikasi", { method: "POST" });
  return res.json();
}
